// js/minimap.js
//
// A small fixed-position overview of the whole tree, with a rectangle
// showing what's currently visible in the main canvas. Click or drag
// inside it to jump the main view there.

import { boundingBoxOfPeople, eventPointInElement, screenToWorld } from "./geometry.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const MM_WIDTH = 240;
const MM_HEIGHT = 170;

export function initMinimap(store, containerEl, mainSvg, ctx) {
  containerEl.classList.add("minimap");
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", MM_WIDTH);
  svg.setAttribute("height", MM_HEIGHT);
  svg.setAttribute("viewBox", `0 0 ${MM_WIDTH} ${MM_HEIGHT}`);
  containerEl.appendChild(svg);

  const dotsLayer = document.createElementNS(SVG_NS, "g");
  const viewportRect = document.createElementNS(SVG_NS, "rect");
  viewportRect.setAttribute("class", "minimap-viewport-rect");
  svg.appendChild(dotsLayer);
  svg.appendChild(viewportRect);

  function transform() {
    const box = boundingBoxOfPeople(store.allPeople());
    const worldW = Math.max(1, box.maxX - box.minX);
    const worldH = Math.max(1, box.maxY - box.minY);
    const scale = Math.min(MM_WIDTH / worldW, MM_HEIGHT / worldH);
    const offsetX = (MM_WIDTH - worldW * scale) / 2 - box.minX * scale;
    const offsetY = (MM_HEIGHT - worldH * scale) / 2 - box.minY * scale;
    return { scale, offsetX, offsetY, box };
  }

  function worldToMinimap(t, x, y) {
    return { x: x * t.scale + t.offsetX, y: y * t.scale + t.offsetY };
  }

  function minimapToWorld(t, x, y) {
    return { x: (x - t.offsetX) / t.scale, y: (y - t.offsetY) / t.scale };
  }

  function render() {
    containerEl.style.display = store.showMinimap ? "block" : "none";
    if (!store.showMinimap) return;

    const t = transform();
    dotsLayer.replaceChildren();
    for (const p of store.allPeople()) {
      const pos = worldToMinimap(t, p.x, p.y);
      const dot = document.createElementNS(SVG_NS, "circle");
      dot.setAttribute("cx", pos.x);
      dot.setAttribute("cy", pos.y);
      dot.setAttribute("r", store.selectedPersonId === p.id ? 3.5 : 2.2);
      dot.setAttribute(
        "class",
        "minimap-dot" + (store.selectedPersonId === p.id ? " minimap-dot-selected" : "")
      );
      dotsLayer.appendChild(dot);
    }

    const rect = mainSvg.getBoundingClientRect();
    const topLeft = screenToWorld(store.viewport, 0, 0);
    const bottomRight = screenToWorld(store.viewport, rect.width, rect.height);
    const p1 = worldToMinimap(t, topLeft.x, topLeft.y);
    const p2 = worldToMinimap(t, bottomRight.x, bottomRight.y);
    viewportRect.setAttribute("x", Math.min(p1.x, p2.x));
    viewportRect.setAttribute("y", Math.min(p1.y, p2.y));
    viewportRect.setAttribute("width", Math.max(2, Math.abs(p2.x - p1.x)));
    viewportRect.setAttribute("height", Math.max(2, Math.abs(p2.y - p1.y)));
  }

  function jumpTo(evt) {
    const p = eventPointInElement(evt, svg);
    const t = transform();
    const world = minimapToWorld(t, p.x, p.y);
    ctx.focusOn(world.x, world.y);
  }

  let dragging = false;
  svg.addEventListener("pointerdown", (evt) => {
    dragging = true;
    svg.setPointerCapture(evt.pointerId);
    jumpTo(evt);
  });
  svg.addEventListener("pointermove", (evt) => {
    if (dragging) jumpTo(evt);
  });
  svg.addEventListener("pointerup", (evt) => {
    dragging = false;
    svg.releasePointerCapture?.(evt.pointerId);
  });

  store.subscribe(render);
  render();

  return { render };
}
