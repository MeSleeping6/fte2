// js/toolbar.js
//
// The top bar. Everything here is a plain button/input wired directly to
// either the store, the interactions controller (zoom/focus), or
// persistence (export/import) - no keyboard shortcuts, per spec; every
// action has a visible control.

import * as model from "./model.js";
import { exportJSON, importJSONFile, saveToLocalStorage } from "./persistence.js";

export function initToolbar(store, toolbarEl, substripEl, ctx) {
  toolbarEl.replaceChildren();
  substripEl.replaceChildren();

  const left = group();
  const mid = group();
  const right = group();
  toolbarEl.appendChild(left);
  toolbarEl.appendChild(mid);
  toolbarEl.appendChild(right);

  // ---- left: structural actions ----------------------------------------

  left.appendChild(
    button("\u2795 Add person", "Drop a new, unconnected person onto the canvas", () => {
      const center = ctx.getViewportCenterWorld();
      store.change((s) => model.addStandalonePerson(s, center.x, center.y));
    })
  );

  const undoBtn = button("\u21b6 Undo", "Undo the last change", () => store.undo());
  const redoBtn = button("\u21b7 Redo", "Redo", () => store.redo());
  left.appendChild(undoBtn);
  left.appendChild(redoBtn);

  left.appendChild(divider());

  const drawLineBtn = button("\u270e Draw line", "Replace one connector with a hand-drawn line", () => {
    if (store.mode === "manual-line") {
      ctx.cancelManualDraft();
      store.mode = "normal";
    } else {
      store.mode = "manual-line";
    }
    store.notify();
  });
  left.appendChild(drawLineBtn);

  // ---- middle: zoom ------------------------------------------------------

  mid.appendChild(button("\u2212", "Zoom out", () => ctx.zoomBy(1 / 1.25)));
  const zoomLabel = document.createElement("span");
  zoomLabel.className = "zoom-label";
  mid.appendChild(zoomLabel);
  mid.appendChild(button("+", "Zoom in", () => ctx.zoomBy(1.25)));
  mid.appendChild(
    button("\u2318 Fit", "Zoom to fit the whole tree", () => ctx.zoomToFit())
  );

  // ---- right: search / minimap / save / io -------------------------------

  const searchWrap = document.createElement("div");
  searchWrap.className = "toolbar-search";
  const searchInput = document.createElement("input");
  searchInput.type = "search";
  searchInput.placeholder = "Search name\u2026";
  searchWrap.appendChild(searchInput);
  right.appendChild(searchWrap);

  let searchMatches = [];
  let searchIndex = -1;
  function runSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      searchMatches = [];
      searchIndex = -1;
      return;
    }
    searchMatches = store
      .allPeople()
      .filter((p) => model.fullName(p).toLowerCase().includes(q))
      .map((p) => p.id);
    searchIndex = searchMatches.length ? 0 : -1;
    jumpToSearchResult();
  }
  function jumpToSearchResult() {
    if (searchIndex < 0 || searchIndex >= searchMatches.length) return;
    const person = store.getPerson(searchMatches[searchIndex]);
    if (!person) return;
    store.select(person.id);
    ctx.focusOn(person.x, person.y);
  }
  searchInput.addEventListener("keydown", (evt) => {
    if (evt.key === "Enter") {
      if (searchMatches.length && evt.target.value.trim()) {
        searchIndex = (searchIndex + 1) % searchMatches.length;
        jumpToSearchResult();
      } else {
        runSearch();
      }
    }
  });
  searchInput.addEventListener("input", () => {
    if (!searchInput.value.trim()) {
      searchMatches = [];
      searchIndex = -1;
    }
  });

  right.appendChild(
    button("\u2637 Map", "Show/hide the minimap", () => {
      store.showMinimap = !store.showMinimap;
      store.notify();
    })
  );

  right.appendChild(divider());

  right.appendChild(
    button("\u2913 Export", "Download your tree as a JSON file", () => exportJSON(store))
  );

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = "application/json";
  importInput.className = "visually-hidden";
  importInput.addEventListener("change", async () => {
    const file = importInput.files[0];
    if (!file) return;
    try {
      const data = await importJSONFile(file);
      const ok = confirm(
        `Load "${file.name}"? This replaces everything currently on the canvas (your current tree stays in Undo history until you reload the page).`
      );
      if (ok) store.load(data.people, data.unions);
    } catch (err) {
      alert(err.message);
    } finally {
      importInput.value = "";
    }
  });
  right.appendChild(importInput);
  right.appendChild(
    button("\u2911 Import", "Load a previously exported JSON file", () => importInput.click())
  );

  const saveStatus = document.createElement("span");
  saveStatus.className = "save-status";
  saveStatus.textContent = "Saved";
  right.appendChild(saveStatus);

  // ---- manual-line mode sub-strip -----------------------------------------

  const instructions = document.createElement("span");
  instructions.className = "substrip-instructions";
  substripEl.appendChild(instructions);

  const snapLabel = document.createElement("label");
  snapLabel.className = "substrip-snap";
  const snapCheckbox = document.createElement("input");
  snapCheckbox.type = "checkbox";
  snapCheckbox.checked = store.manualLineSnap;
  snapCheckbox.onchange = () => (store.manualLineSnap = snapCheckbox.checked);
  snapLabel.appendChild(snapCheckbox);
  snapLabel.appendChild(document.createTextNode(" Snap to straight lines"));
  substripEl.appendChild(snapLabel);

  substripEl.appendChild(
    button("\u21b6 Undo point", "Remove the last point you placed", () =>
      ctx.undoLastDraftPoint()
    )
  );
  substripEl.appendChild(
    button("Cancel", "Cancel this line and keep the automatic one", () => {
      ctx.cancelManualDraft();
      store.mode = "normal";
      store.notify();
    })
  );

  // ---- reactive bits -----------------------------------------------------

  function syncSaveStatus() {
    saveStatus.textContent = "Saving\u2026";
    clearTimeout(syncSaveStatus._t);
    syncSaveStatus._t = setTimeout(() => {
      saveToLocalStorage(store);
      saveStatus.textContent = "Saved";
    }, 400);
  }

  store.subscribe(() => {
    undoBtn.disabled = !store.canUndo();
    redoBtn.disabled = !store.canRedo();
    zoomLabel.textContent = `${Math.round(store.viewport.zoom * 100)}%`;
    drawLineBtn.classList.toggle("active", store.mode === "manual-line");
    substripEl.classList.toggle("visible", store.mode === "manual-line");
    instructions.textContent = store.manualLineDraft
      ? "Click points to route the line, then click the child again to finish."
      : "Click the child whose connection you want to redraw.";
    syncSaveStatus();
  });

  // initial paint
  undoBtn.disabled = !store.canUndo();
  redoBtn.disabled = !store.canRedo();
  zoomLabel.textContent = `${Math.round(store.viewport.zoom * 100)}%`;
}

function group() {
  const d = document.createElement("div");
  d.className = "toolbar-group";
  return d;
}

function divider() {
  const d = document.createElement("div");
  d.className = "toolbar-divider";
  return d;
}

function button(label, title, onClick) {
  const b = document.createElement("button");
  b.className = "toolbar-btn";
  b.textContent = label;
  b.title = title;
  b.onclick = onClick;
  return b;
}
