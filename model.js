// js/interactions.js
//
// All pointer-event handling for the canvas: panning, zooming, dragging
// people, dragging connector segments (bars/drops/stubs constrained to
// their own axis), and the manual line-drawing mode. One pointerdown
// listener on the SVG root does hit-testing by walking up from
// event.target looking for data-person-id / data-kind attributes, then
// a small state machine drives pointermove/pointerup for whichever kind
// of drag is in progress.

import {
  screenToWorld,
  eventPointInElement,
  distance,
  snapToAxis,
  zoomAround,
  clamp,
} from "./geometry.js";
import * as model from "./model.js";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const CLICK_THRESHOLD_PX = 5;

export function initInteractions(store, svg, onAfterChange) {
  let drag = null; // see the shapes described inline below

  function worldPoint(evt) {
    const p = eventPointInElement(evt, svg);
    return screenToWorld(store.viewport, p.x, p.y);
  }

  function screenPoint(evt) {
    return eventPointInElement(evt, svg);
  }

  function findPersonEl(target) {
    return target.closest?.("[data-person-id]") || null;
  }

  function findConnectorHit(target) {
    const t = target.closest?.("[data-union-id][data-kind]");
    if (!t) return null;
    return {
      unionId: t.dataset.unionId,
      kind: t.dataset.kind,
      childId: t.dataset.childId || null,
      axis: t.dataset.axis || null,
    };
  }

  // ---- manual line mode ---------------------------------------------------

  function startManualDraft(childId) {
    const union = store.unionAsChild(childId);
    if (!union) return false;
    const child = store.getPerson(childId);
    const partners = union.partnerIds.map((id) => store.getPerson(id)).filter(Boolean);
    const originX =
      union.connector?.parentAnchorX ??
      partners.reduce((sum, p) => sum + p.x, 0) / partners.length;
    const originY = partners.reduce((sum, p) => sum + p.y, 0) / partners.length;
    store.manualLineDraft = {
      unionId: union.id,
      childId,
      points: [[originX, originY]],
      cursor: null,
    };
    store.notify();
    return true;
  }

  function addDraftPoint(pt) {
    const draft = store.manualLineDraft;
    if (!draft) return;
    const last = draft.points[draft.points.length - 1];
    const p = store.manualLineSnap ? snapToAxis({ x: last[0], y: last[1] }, pt) : pt;
    draft.points.push([p.x, p.y]);
    store.notify();
  }

  function finishManualDraft(childId) {
    const draft = store.manualLineDraft;
    if (!draft || draft.childId !== childId) return;
    const child = store.getPerson(childId);
    const last = draft.points[draft.points.length - 1];
    const finalPt = store.manualLineSnap
      ? snapToAxis({ x: last[0], y: last[1] }, { x: child.x, y: child.y })
      : { x: child.x, y: child.y };
    const points = [...draft.points, [finalPt.x, finalPt.y]];
    store.manualLineDraft = null;
    store.change((s) => model.setCustomRoute(s, draft.unionId, draft.childId, points));
  }

  function cancelManualDraft() {
    store.manualLineDraft = null;
    store.notify();
  }

  function undoLastDraftPoint() {
    const draft = store.manualLineDraft;
    if (!draft || draft.points.length <= 1) return;
    draft.points.pop();
    store.notify();
  }

  // exposed for toolbar.js
  window.__familyTree = window.__familyTree || {};
  window.__familyTree.cancelManualDraft = cancelManualDraft;
  window.__familyTree.undoLastDraftPoint = undoLastDraftPoint;

  function handleManualModePointerDown(evt) {
    const wp = worldPoint(evt);
    const personEl = findPersonEl(evt.target);
    const personId = personEl?.dataset.personId || null;

    if (!store.manualLineDraft) {
      if (personId && startManualDraft(personId)) {
        evt.preventDefault();
      }
      return;
    }

    if (personId === store.manualLineDraft.childId) {
      finishManualDraft(personId);
      evt.preventDefault();
      return;
    }

    addDraftPoint(wp);
    evt.preventDefault();
  }

  // ---- pointer down: figure out what kind of drag (if any) is starting --

  svg.addEventListener("pointerdown", (evt) => {
    if (evt.button !== 0) return; // left button / primary touch only

    if (store.mode === "manual-line") {
      handleManualModePointerDown(evt);
      return;
    }

    const personEl = findPersonEl(evt.target);
    const connHit = !personEl ? findConnectorHit(evt.target) : null;
    const screen = screenPoint(evt);

    if (personEl) {
      const person = store.getPerson(personEl.dataset.personId);
      if (!person) return;
      store.select(person.id);
      if (person.locked) return; // selectable, but not draggable
      drag = {
        type: "person",
        personId: person.id,
        startScreen: screen,
        startWorld: { x: person.x, y: person.y },
        moved: false,
        before: null,
      };
      svg.setPointerCapture(evt.pointerId);
      return;
    }

    if (connHit) {
      const union = store.getUnion(connHit.unionId);
      if (!union) return;
      drag = {
        type: "connector",
        ...connHit,
        startScreen: screen,
        startValue:
          connHit.kind === "bar"
            ? union.connector.dropY
            : connHit.kind === "parentDrop"
            ? union.connector.parentAnchorX
            : union.connector.childAnchors[connHit.childId],
        moved: false,
        before: null,
      };
      svg.setPointerCapture(evt.pointerId);
      return;
    }

    // empty canvas - start a pan
    drag = {
      type: "pan",
      startScreen: screen,
      startViewport: { x: store.viewport.x, y: store.viewport.y },
      moved: false,
    };
    svg.setPointerCapture(evt.pointerId);
  });

  // ---- pointer move -------------------------------------------------------

  svg.addEventListener("pointermove", (evt) => {
    if (store.mode === "manual-line" && store.manualLineDraft) {
      const wp = worldPoint(evt);
      store.manualLineDraft.cursor = [wp.x, wp.y];
      store.notify();
      return;
    }

    if (!drag) return;
    const screen = screenPoint(evt);
    const moved = distance(screen.x, screen.y, drag.startScreen.x, drag.startScreen.y) > CLICK_THRESHOLD_PX;

    if (drag.type === "pan") {
      if (moved) drag.moved = true;
      store.viewport.x = drag.startViewport.x + (screen.x - drag.startScreen.x);
      store.viewport.y = drag.startViewport.y + (screen.y - drag.startScreen.y);
      store.notify();
      return;
    }

    if (drag.type === "person") {
      if (!moved) return;
      if (!drag.moved) drag.before = store.beginLiveEdit();
      drag.moved = true;
      const worldNow = worldPoint(evt);
      const worldStart = screenToWorld(store.viewport, drag.startScreen.x, drag.startScreen.y);
      const dx = worldNow.x - worldStart.x;
      const dy = worldNow.y - worldStart.y;
      model.movePersonTo(store, drag.personId, drag.startWorld.x + dx, drag.startWorld.y + dy);
      store.notify();
      return;
    }

    if (drag.type === "connector") {
      if (!moved) return;
      if (!drag.moved) drag.before = store.beginLiveEdit();
      drag.moved = true;
      const worldNow = worldPoint(evt);
      const worldStart = screenToWorld(store.viewport, drag.startScreen.x, drag.startScreen.y);

      if (drag.axis === "horizontal") {
        // a horizontal bar is only free to move vertically
        const dy = worldNow.y - worldStart.y;
        model.setConnectorDropY(store, drag.unionId, drag.startValue + dy);
      } else {
        // vertical segments (parent drop / child stub) move horizontally
        const dx = worldNow.x - worldStart.x;
        const newX = drag.startValue + dx;
        if (drag.kind === "parentDrop") {
          model.setConnectorParentAnchorX(store, drag.unionId, newX);
        } else if (drag.kind === "childStub") {
          model.setConnectorChildAnchorX(store, drag.unionId, drag.childId, newX);
        }
      }
      store.notify();
      return;
    }
  });

  // ---- pointer up -----------------------------------------------------

  function endDrag(evt) {
    if (!drag) return;
    svg.releasePointerCapture?.(evt.pointerId);

    if (drag.type === "person" && drag.moved && drag.before) {
      store.commitLiveEdit(drag.before);
    } else if (drag.type === "connector" && drag.moved && drag.before) {
      store.commitLiveEdit(drag.before);
    } else if (drag.type === "pan" && !drag.moved) {
      store.clearSelection();
    }

    drag = null;
    onAfterChange?.();
  }

  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointercancel", endDrag);

  // ---- zoom -------------------------------------------------------------

  svg.addEventListener(
    "wheel",
    (evt) => {
      evt.preventDefault();
      const screen = screenPoint(evt);
      const factor = evt.deltaY < 0 ? 1.1 : 1 / 1.1;
      store.viewport = zoomAround(store.viewport, screen.x, screen.y, factor, MIN_ZOOM, MAX_ZOOM);
      store.notify();
    },
    { passive: false }
  );

  return {
    zoomBy(factor) {
      const rect = svg.getBoundingClientRect();
      store.viewport = zoomAround(
        store.viewport,
        rect.width / 2,
        rect.height / 2,
        factor,
        MIN_ZOOM,
        MAX_ZOOM
      );
      store.notify();
    },
    setZoom(z) {
      const rect = svg.getBoundingClientRect();
      const centerWorldBefore = screenToWorld(store.viewport, rect.width / 2, rect.height / 2);
      store.viewport.zoom = clamp(z, MIN_ZOOM, MAX_ZOOM);
      store.viewport.x = rect.width / 2 - centerWorldBefore.x * store.viewport.zoom;
      store.viewport.y = rect.height / 2 - centerWorldBefore.y * store.viewport.zoom;
      store.notify();
    },
    focusOn(worldX, worldY, zoom) {
      const rect = svg.getBoundingClientRect();
      const z = zoom ?? clamp(store.viewport.zoom, MIN_ZOOM, MAX_ZOOM);
      store.viewport = {
        zoom: z,
        x: rect.width / 2 - worldX * z,
        y: rect.height / 2 - worldY * z,
      };
      store.notify();
    },
    cancelManualDraft,
    undoLastDraftPoint,
    MIN_ZOOM,
    MAX_ZOOM,
  };
}
