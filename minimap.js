// js/geometry.js
//
// Pure math helpers: screen <-> world coordinate conversion for the
// pan/zoom viewport, bounding boxes, distances, and the snap-to-axis
// logic used by manual line drawing.

export const PERSON_RADIUS = 24;

export function screenToWorld(viewport, sx, sy) {
  return {
    x: (sx - viewport.x) / viewport.zoom,
    y: (sy - viewport.y) / viewport.zoom,
  };
}

export function worldToScreen(viewport, wx, wy) {
  return {
    x: wx * viewport.zoom + viewport.x,
    y: wy * viewport.zoom + viewport.y,
  };
}

/** Mouse/touch event position relative to an element's bounding box. */
export function eventPointInElement(evt, el) {
  const rect = el.getBoundingClientRect();
  const point = "touches" in evt && evt.touches.length ? evt.touches[0] : evt;
  return { x: point.clientX - rect.left, y: point.clientY - rect.top };
}

export function distance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function boundingBoxOfPeople(people, padding = 150) {
  if (!people.length) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of people) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
  };
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Given a fixed previous point and a free-moving next point, snap the
 * next point onto a horizontal or vertical line through the previous
 * point, whichever axis is closer. Returns the (possibly) adjusted point.
 */
export function snapToAxis(prev, next) {
  const dx = Math.abs(next.x - prev.x);
  const dy = Math.abs(next.y - prev.y);
  if (dx === 0 && dy === 0) return { x: next.x, y: next.y };
  if (dx > dy) return { x: next.x, y: prev.y }; // horizontal segment
  return { x: prev.x, y: next.y }; // vertical segment
}

/** Builds an SVG path "d" string from an ordered list of [x,y] points. */
export function pointsToPath(points) {
  if (!points.length) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
    .join(" ");
}

export function zoomAround(viewport, screenX, screenY, factor, minZoom, maxZoom) {
  const worldBefore = screenToWorld(viewport, screenX, screenY);
  const newZoom = clamp(viewport.zoom * factor, minZoom, maxZoom);
  const newViewport = { ...viewport, zoom: newZoom };
  const screenAfter = worldToScreen(newViewport, worldBefore.x, worldBefore.y);
  newViewport.x += screenX - screenAfter.x;
  newViewport.y += screenY - screenAfter.y;
  return newViewport;
}
