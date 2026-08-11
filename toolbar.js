// js/panel.js
//
// The left-hand side panel that opens when a person is selected: name
// fields, a free-text notes box, relationship actions (add parents /
// spouse / child / sibling), and per-person actions (focus, lock,
// delete). Rebuilt in full only when the *selected person changes*, so
// that typing in a field doesn't lose focus every time the canvas
// re-renders from some unrelated live-edit elsewhere.

import * as model from "./model.js";

const CATEGORY_OPTIONS = [
  { value: "unset", label: "(none set)" },
  { value: "paternal", label: "Paternal line" },
  { value: "maternal", label: "Maternal line" },
  { value: "merge", label: "Where lines meet" },
  { value: "collateral", label: "Married in / adopted" },
];

export function initPanel(store, panelEl, ctx) {
  let lastPersonId = undefined;
  let relationshipsEl = null;
  let fieldEditSnapshot = null;

  function beginFieldEdit() {
    if (!fieldEditSnapshot) fieldEditSnapshot = store.beginLiveEdit();
  }

  function commitFieldEdit() {
    if (fieldEditSnapshot) {
      store.commitLiveEdit(fieldEditSnapshot);
      fieldEditSnapshot = null;
    }
  }

  function render() {
    const personId = store.selectedPersonId;

    if (!personId || !store.getPerson(personId)) {
      panelEl.classList.remove("open");
      lastPersonId = null;
      return;
    }

    panelEl.classList.add("open");

    if (personId === lastPersonId) {
      renderRelationships(store, personId, relationshipsEl, ctx);
      return;
    }
    lastPersonId = personId;
    commitFieldEdit();

    const person = store.getPerson(personId);
    panelEl.replaceChildren();

    panelEl.appendChild(buildHeader(person, store, ctx));

    if (person.isPlaceholder) {
      const hint = document.createElement("p");
      hint.className = "panel-hint";
      hint.textContent =
        "This slot is empty. Type a name below to fill it back in - all of its connections are still there.";
      panelEl.appendChild(hint);
    }

    panelEl.appendChild(buildNameFields(store, person, beginFieldEdit, commitFieldEdit));
    panelEl.appendChild(buildCategoryField(store, person));
    panelEl.appendChild(buildNotesField(store, person, beginFieldEdit, commitFieldEdit));

    relationshipsEl = document.createElement("div");
    relationshipsEl.className = "panel-section panel-relationships";
    panelEl.appendChild(relationshipsEl);
    renderRelationships(store, personId, relationshipsEl, ctx);

    panelEl.appendChild(buildActionRow(store, person, ctx));
  }

  store.subscribe(render);
  render();

  return { render };
}

// ---- section builders ---------------------------------------------------

function buildHeader(person, store, ctx) {
  const header = document.createElement("div");
  header.className = "panel-header";

  const title = document.createElement("h2");
  title.textContent = "Edit person";
  header.appendChild(title);

  const closeBtn = document.createElement("button");
  closeBtn.className = "icon-btn panel-close";
  closeBtn.setAttribute("aria-label", "Close panel");
  closeBtn.textContent = "\u2715";
  closeBtn.onclick = () => store.clearSelection();
  header.appendChild(closeBtn);

  return header;
}

function labeledInput(labelText, value, onInput, onFocus, onBlur, placeholder = "") {
  const wrap = document.createElement("label");
  wrap.className = "panel-field";
  const span = document.createElement("span");
  span.className = "panel-field-label";
  span.textContent = labelText;
  wrap.appendChild(span);

  const input = document.createElement("input");
  input.type = "text";
  input.value = value || "";
  input.placeholder = placeholder;
  input.addEventListener("focus", onFocus);
  input.addEventListener("blur", onBlur);
  input.addEventListener("input", () => onInput(input.value));
  wrap.appendChild(input);
  return wrap;
}

function buildNameFields(store, person, beginEdit, commitEdit) {
  const wrap = document.createElement("div");
  wrap.className = "panel-section";

  const update = (field) => (value) => {
    beginEdit();
    model.updatePerson(store, person.id, { [field]: value });
    store.notify();
  };

  wrap.appendChild(
    labeledInput("First name", person.firstName, update("firstName"), beginEdit, commitEdit)
  );
  wrap.appendChild(
    labeledInput(
      "Middle name (optional)",
      person.middleName,
      update("middleName"),
      beginEdit,
      commitEdit
    )
  );
  wrap.appendChild(
    labeledInput("Last name", person.lastName, update("lastName"), beginEdit, commitEdit)
  );

  return wrap;
}

function buildCategoryField(store, person) {
  const wrap = document.createElement("label");
  wrap.className = "panel-field panel-section";
  const span = document.createElement("span");
  span.className = "panel-field-label";
  span.textContent = "Color category";
  wrap.appendChild(span);

  const select = document.createElement("select");
  for (const opt of CATEGORY_OPTIONS) {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    if (person.category === opt.value) o.selected = true;
    select.appendChild(o);
  }
  select.onchange = () => {
    store.change((s) => model.updatePerson(s, person.id, { category: select.value }));
  };
  wrap.appendChild(select);
  return wrap;
}

function buildNotesField(store, person, beginEdit, commitEdit) {
  const wrap = document.createElement("label");
  wrap.className = "panel-field panel-section";
  const span = document.createElement("span");
  span.className = "panel-field-label";
  span.textContent = "Notes (one line each - birth/death dates, etc.)";
  wrap.appendChild(span);

  const textarea = document.createElement("textarea");
  textarea.rows = 4;
  textarea.value = (person.notes || []).join("\n");
  textarea.placeholder = "e.g. 6/26/1928\nd. 2/23/1979";
  textarea.addEventListener("focus", beginEdit);
  textarea.addEventListener("blur", commitEdit);
  textarea.addEventListener("input", () => {
    beginEdit();
    model.updatePerson(store, person.id, { notes: textarea.value.split("\n") });
    store.notify();
  });
  wrap.appendChild(textarea);
  return wrap;
}

function personLabel(person) {
  if (!person) return "(unknown)";
  const name = model.fullName(person);
  return name || "(empty placeholder)";
}

function jumpLink(store, ctx, person) {
  const a = document.createElement("button");
  a.className = "link-btn";
  a.textContent = personLabel(person);
  a.onclick = () => {
    store.select(person.id);
    ctx.focusOn(person.x, person.y);
  };
  return a;
}

function renderRelationships(store, personId, container, ctx) {
  if (!container) return;
  container.replaceChildren();
  const person = store.getPerson(personId);
  if (!person) return;

  const parentUnion = store.unionAsChild(personId);
  const partnerUnions = store.unionsAsPartner(personId);
  const siblingIds = store.siblingsOf(personId);

  container.appendChild(
    relationRow(
      "Parents",
      parentUnion
        ? parentUnion.partnerIds.map((id) => jumpLink(store, ctx, store.getPerson(id)))
        : [emptyNote("none recorded")]
    )
  );

  const spouseButtons = [];
  for (const u of partnerUnions) {
    for (const pid of u.partnerIds) {
      if (pid !== personId) spouseButtons.push(jumpLink(store, ctx, store.getPerson(pid)));
    }
  }
  container.appendChild(relationRow("Spouse(s)", spouseButtons.length ? spouseButtons : [emptyNote("none recorded")]));

  const childButtons = [];
  for (const u of partnerUnions) {
    for (const cid of u.childIds) childButtons.push(jumpLink(store, ctx, store.getPerson(cid)));
  }
  container.appendChild(relationRow("Children", childButtons.length ? childButtons : [emptyNote("none recorded")]));

  container.appendChild(
    relationRow(
      "Siblings",
      siblingIds.length
        ? siblingIds.map((id) => jumpLink(store, ctx, store.getPerson(id)))
        : [emptyNote("none recorded")]
    )
  );

  const actions = document.createElement("div");
  actions.className = "panel-relationship-actions";

  actions.appendChild(
    actionButton("+ Add parents", !parentUnion, () =>
      store.change((s) => model.addParents(s, personId))
    )
  );
  actions.appendChild(
    actionButton("+ Add spouse", true, () => store.change((s) => model.addSpouse(s, personId)))
  );
  actions.appendChild(
    actionButton("+ Add child", true, () => store.change((s) => model.addChild(s, personId)))
  );
  actions.appendChild(
    actionButton("+ Add sibling", true, () => store.change((s) => model.addSibling(s, personId)))
  );
  container.appendChild(actions);
}

function relationRow(label, buttonEls) {
  const row = document.createElement("div");
  row.className = "relation-row";
  const l = document.createElement("span");
  l.className = "relation-label";
  l.textContent = label;
  row.appendChild(l);
  const list = document.createElement("span");
  list.className = "relation-list";
  for (const b of buttonEls) list.appendChild(b);
  row.appendChild(list);
  return row;
}

function emptyNote(txt) {
  const span = document.createElement("span");
  span.className = "relation-empty";
  span.textContent = txt;
  return span;
}

function actionButton(label, enabled, onClick) {
  const btn = document.createElement("button");
  btn.className = "panel-action-btn";
  btn.textContent = label;
  btn.disabled = !enabled;
  btn.onclick = onClick;
  return btn;
}

function buildActionRow(store, person, ctx) {
  const row = document.createElement("div");
  row.className = "panel-section panel-footer-actions";

  const focusBtn = document.createElement("button");
  focusBtn.className = "panel-action-btn";
  focusBtn.textContent = "\u25ce Focus";
  focusBtn.onclick = () => ctx.focusOn(person.x, person.y);
  row.appendChild(focusBtn);

  const lockBtn = document.createElement("button");
  lockBtn.className = "panel-action-btn";
  lockBtn.textContent = person.locked ? "\ud83d\udd13 Unlock" : "\ud83d\udd12 Lock";
  lockBtn.onclick = () => store.change((s) => model.toggleLock(s, person.id));
  row.appendChild(lockBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "panel-action-btn panel-action-danger";
  deleteBtn.textContent = "\u2716 Delete";
  deleteBtn.onclick = () => {
    const ok = confirm(
      `Remove ${personLabel(person)}? Their spot in the tree stays as a blank placeholder so nothing else breaks - you can always type a name back in later.`
    );
    if (ok) store.change((s) => model.deletePerson(s, person.id));
  };
  row.appendChild(deleteBtn);

  return row;
}
