/* css/styles.css
 * Visual language matches the original tree: cream background, Fraunces
 * for names, Inter for everything else, muted category colors.
 */

:root {
  --bg: #faf6ec;
  --ink: #2b2620;
  --ink-soft: #6b6254;
  --line: #b7ac94;
  --panel-bg: #fffdf8;
  --panel-border: #e1d7c3;

  --pat: #2f5a73;
  --mat: #8c3a34;
  --merge: #2f7358;
  --collateral: #9c8659;
  --unset: #9a9284;
  --placeholder-fill: #ded6c4;

  --accent: #b5541f;
  --danger: #a13d2f;

  --toolbar-h: 52px;
  --substrip-h: 40px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  background: var(--bg);
  color: var(--ink);
  font-family: "Inter", system-ui, sans-serif;
}

#app {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
}

/* ---------------------------------------------------------------- toolbar */

#toolbar {
  height: var(--toolbar-h);
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  background: var(--panel-bg);
  border-bottom: 1px solid var(--panel-border);
  z-index: 30;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-group:nth-child(2) { margin: 0 auto; }

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--panel-border);
  margin: 0 4px;
}

.toolbar-btn {
  font-family: inherit;
  font-size: 13px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 7px 10px;
  color: var(--ink);
  cursor: pointer;
  white-space: nowrap;
}
.toolbar-btn:hover { background: var(--bg); border-color: var(--panel-border); }
.toolbar-btn:disabled { color: var(--ink-soft); opacity: 0.4; cursor: default; }
.toolbar-btn:disabled:hover { background: transparent; border-color: transparent; }
.toolbar-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

.zoom-label {
  font-size: 12.5px;
  color: var(--ink-soft);
  min-width: 42px;
  text-align: center;
}

.toolbar-search input {
  font-family: inherit;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  background: var(--bg);
  color: var(--ink);
  width: 160px;
}

.save-status {
  font-size: 12px;
  color: var(--ink-soft);
  min-width: 52px;
}

.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

/* ---------------------------------------------------------- manual-line substrip */

.toolbar-substrip {
  height: 0;
  overflow: hidden;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 14px;
  background: #f2ead6;
  border-bottom: 1px solid var(--panel-border);
  transition: height 0.12s ease;
  z-index: 29;
}
.toolbar-substrip.visible { height: var(--substrip-h); }

.substrip-instructions {
  font-size: 12.5px;
  color: var(--ink-soft);
}
.substrip-snap {
  font-size: 12.5px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* -------------------------------------------------------------------- canvas */

#canvas-wrap {
  position: relative;
  flex: 1 1 auto;
  overflow: hidden;
}

#canvas-svg {
  width: 100%;
  height: 100%;
  display: block;
  background: var(--bg);
  cursor: grab;
  touch-action: none;
}
#canvas-svg:active { cursor: grabbing; }
#canvas-svg.mode-manual-line { cursor: crosshair; }

/* connectors */
.conn { stroke: var(--line); stroke-width: 1.6; fill: none; }
.conn-marriage { stroke-width: 1.8; }
.conn-custom { stroke: var(--accent); stroke-width: 1.8; }
.conn-active { stroke: var(--accent); stroke-width: 2.4; }

.conn-hit {
  stroke: transparent;
  stroke-width: 14;
  fill: none;
  pointer-events: stroke;
}
.conn-hit-bar { cursor: ns-resize; }
.conn-hit-parentDrop, .conn-hit-childStub { cursor: ew-resize; }
.conn-hit:hover { stroke: rgba(181, 84, 31, 0.18); }
.conn-hit-custom { cursor: pointer; }

.conn-draft { stroke: var(--accent); stroke-width: 2; stroke-dasharray: 5 4; fill: none; pointer-events: none; }
.conn-draft-preview { stroke: var(--accent); stroke-width: 1.4; stroke-dasharray: 3 3; opacity: 0.7; pointer-events: none; }
.draft-point { fill: var(--accent); pointer-events: none; }

/* people */
.person { cursor: grab; }
.person.person-locked { cursor: default; }

.person-circle { stroke: rgba(0,0,0,0.12); stroke-width: 1; }
.person-circle.cat-paternal { fill: var(--pat); }
.person-circle.cat-maternal { fill: var(--mat); }
.person-circle.cat-merge { fill: var(--merge); }
.person-circle.cat-collateral { fill: var(--collateral); }
.person-circle.cat-unset { fill: var(--unset); }
.person-circle.cat-placeholder { fill: var(--placeholder-fill); stroke: var(--ink-soft); stroke-dasharray: 3 3; }

.person-select-ring {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2.5;
  stroke-dasharray: 4 3;
}

.person-plus {
  font-family: "Inter", sans-serif;
  font-size: 20px;
  fill: var(--ink-soft);
  pointer-events: none;
  user-select: none;
}

.person-name {
  font-family: "Fraunces", serif;
  font-size: 12.5px;
  font-weight: 600;
  fill: var(--ink);
  pointer-events: none;
  user-select: none;
}
.person-note {
  font-family: "Inter", sans-serif;
  font-size: 10.5px;
  fill: var(--ink-soft);
  pointer-events: none;
  user-select: none;
}

.lock-shackle, .lock-body { fill: var(--ink-soft); }

/* --------------------------------------------------------------- side panel */

#side-panel {
  position: absolute;
  top: calc(var(--toolbar-h) + 12px);
  left: -360px;
  width: 320px;
  max-height: calc(100vh - var(--toolbar-h) - 24px);
  overflow-y: auto;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(43, 38, 32, 0.12);
  padding: 16px;
  transition: left 0.16s ease;
  z-index: 25;
}
#side-panel.open { left: 12px; }

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.panel-header h2 {
  font-family: "Fraunces", serif;
  font-size: 17px;
  margin: 0;
}
.icon-btn {
  background: transparent;
  border: none;
  font-size: 14px;
  color: var(--ink-soft);
  cursor: pointer;
  padding: 4px 8px;
}
.icon-btn:hover { color: var(--ink); }

.panel-hint {
  font-size: 12.5px;
  color: var(--ink-soft);
  background: #f2ead6;
  border-radius: 8px;
  padding: 8px 10px;
  margin: 6px 0 12px;
}

.panel-section { margin-bottom: 14px; }

.panel-field { display: block; margin-bottom: 8px; }
.panel-field-label {
  display: block;
  font-size: 11.5px;
  color: var(--ink-soft);
  margin-bottom: 4px;
}
.panel-field input,
.panel-field select,
.panel-field textarea {
  width: 100%;
  font-family: inherit;
  font-size: 13.5px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  background: #fff;
  color: var(--ink);
}
.panel-field textarea { resize: vertical; font-family: inherit; }

.relation-row {
  display: flex;
  gap: 8px;
  font-size: 12.5px;
  padding: 4px 0;
  align-items: baseline;
}
.relation-label {
  color: var(--ink-soft);
  flex: 0 0 68px;
}
.relation-list { display: flex; flex-wrap: wrap; gap: 6px; }
.relation-empty { color: var(--ink-soft); font-style: italic; }

.link-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-family: inherit;
  font-size: 12.5px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.panel-relationship-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.panel-action-btn {
  font-family: inherit;
  font-size: 12.5px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--panel-border);
  background: #fff;
  color: var(--ink);
  cursor: pointer;
}
.panel-action-btn:hover { border-color: var(--accent); }
.panel-action-btn:disabled { opacity: 0.4; cursor: default; }
.panel-action-btn:disabled:hover { border-color: var(--panel-border); }

.panel-footer-actions {
  display: flex;
  gap: 8px;
  border-top: 1px solid var(--panel-border);
  padding-top: 12px;
}
.panel-footer-actions .panel-action-btn { flex: 1; }
.panel-action-danger { color: var(--danger); border-color: rgba(161, 61, 47, 0.3); }
.panel-action-danger:hover { border-color: var(--danger); background: #fbeeec; }

/* ------------------------------------------------------------------ minimap */

.minimap {
  position: absolute;
  right: 14px;
  bottom: 14px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(43, 38, 32, 0.14);
  padding: 6px;
  z-index: 20;
}
.minimap svg { display: block; cursor: pointer; }
.minimap-dot { fill: var(--ink-soft); }
.minimap-dot-selected { fill: var(--accent); }
.minimap-viewport-rect {
  fill: rgba(181, 84, 31, 0.08);
  stroke: var(--accent);
  stroke-width: 1.2;
}

@media (max-width: 720px) {
  #side-panel { width: calc(100vw - 24px); }
  .toolbar-search input { width: 110px; }
}
