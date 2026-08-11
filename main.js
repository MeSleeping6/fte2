// js/main.js
//
// Wires everything together: loads data (saved tree, or the default
// starting tree), sets up the SVG canvas + pan/zoom transform, and
// initializes interactions, the side panel, the toolbar, and the
// minimap, all sharing the one `store`.

import { store } from "./state.js";
import * as render from "./render.js";
import { initInteractions } from "./interactions.js";
import { initPanel } from "./panel.js";
import { initToolbar } from "./toolbar.js";
import { initMinimap } from "./minimap.js";
import { loadFromLocalStorage, saveToLocalStorage } from "./persistence.js";
import { boundingBoxOfPeople, clamp } from "./geometry.js";
import { defaultPeople, defaultUnions } from "../data/default-tree.js";

function boot() {
  const svg = document.getElementById("canvas-svg");
  const viewportGroup = document.getElementById("viewport-group");
  const connectorLayer = document.getElementById("layer-connectors");
  const peopleLayer = document.getElementById("layer-people");
  const draftLayer = document.getElementById("layer-draft");
  const panelEl = document.getElementById("side-panel");
  const toolbarEl = document.getElementById("toolbar");
  const substripEl = document.getElementById("toolbar-substrip");
  const minimapEl = document.getElementById("minimap");

  const saved = loadFromLocalStorage();
  if (saved) {
    store.load(saved.people, saved.unions);
  } else {
    store.load(defaultPeople, defaultUnions);
  }

  const interactionCtx = initInteractions(store, svg, () => saveToLocalStorage(store));

  function getViewportCenterWorld() {
    const rect = svg.getBoundingClientRect();
    return {
      x: (rect.width / 2 - store.viewport.x) / store.viewport.zoom,
      y: (rect.height / 2 - store.viewport.y) / store.viewport.zoom,
    };
  }

  function zoomToFit() {
    const rect = svg.getBoundingClientRect();
    const box = boundingBoxOfPeople(store.allPeople());
    const w = Math.max(1, box.maxX - box.minX);
    const h = Math.max(1, box.maxY - box.minY);
    const zoom = clamp(
      Math.min(rect.width / w, rect.height / h),
      interactionCtx.MIN_ZOOM,
      interactionCtx.MAX_ZOOM
    );
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;
    store.viewport = {
      zoom,
      x: rect.width / 2 - cx * zoom,
      y: rect.height / 2 - cy * zoom,
    };
    store.notify();
  }

  const ctx = { ...interactionCtx, getViewportCenterWorld, zoomToFit };

  initPanel(store, panelEl, ctx);
  initToolbar(store, toolbarEl, substripEl, ctx);
  initMinimap(store, minimapEl, svg, ctx);

  function paint() {
    const v = store.viewport;
    viewportGroup.setAttribute("transform", `translate(${v.x}, ${v.y}) scale(${v.zoom})`);
    render.renderAll(store, { connectorLayer, peopleLayer, draftLayer });
    svg.classList.toggle("mode-manual-line", store.mode === "manual-line");
  }

  store.subscribe(paint);
  paint();
  zoomToFit();

  // Exposed for debugging/testing from the browser console. Not required
  // for normal use of the app.
  window.__familyTree = { ...(window.__familyTree || {}), store, ctx };

  window.addEventListener("resize", () => store.notify());

  // Small safety net: if something throws inside an event handler, don't
  // let the whole page go dark/unresponsive - surface it once.
  window.addEventListener("error", (evt) => {
    console.error("Family tree app error:", evt.error || evt.message);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
