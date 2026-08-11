// js/model.js
//
// All functions here mutate a Store in place (they assume they are being
// called from inside store.change(...), which is what gives us undo/redo
// and re-render for free). Nothing in this file touches the DOM.

const PERSON_SPACING_X = 180;
const GENERATION_GAP_Y = 240;
const NODE_CLEARANCE = 70; // minimum center-to-center distance we try to keep

export function blankPerson(id, x, y, overrides = {}) {
  return {
    id,
    firstName: "",
    middleName: "",
    lastName: "",
    notes: [],
    x,
    y,
    category: "unset",
    isPlaceholder: false,
    locked: false,
    ...overrides,
  };
}

export function fullName(person) {
  if (!person) return "";
  if (person.isPlaceholder) return "";
  const parts = [person.firstName, person.middleName, person.lastName].filter(
    (s) => s && s.trim().length > 0
  );
  return parts.join(" ");
}

/** Nudge (x,y) away from existing people until it clears a minimum distance. */
export function findClearSpot(store, x, y) {
  const people = store.allPeople();
  const isClear = (px, py) =>
    people.every((p) => Math.hypot(p.x - px, p.y - py) >= NODE_CLEARANCE);

  if (isClear(x, y)) return { x, y };

  // Expanding ring search in fixed steps - good enough for a "best effort"
  // default placement; the user can always drag the result afterward.
  const step = 50;
  for (let radius = step; radius <= step * 20; radius += step) {
    const steps = Math.max(8, Math.floor((2 * Math.PI * radius) / step));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const cx = x + Math.cos(angle) * radius;
      const cy = y + Math.sin(angle) * radius;
      if (isClear(cx, cy)) return { x: cx, y: cy };
    }
  }
  return { x, y };
}

// ---- standalone person -----------------------------------------------

export function addStandalonePerson(store, x, y) {
  const spot = findClearSpot(store, x, y);
  const id = store.newId("p");
  const person = blankPerson(id, spot.x, spot.y);
  store.people.set(id, person);
  store.selectedPersonId = id;
  return person;
}

// ---- editing ------------------------------------------------------------

export function updatePerson(store, personId, fields) {
  const person = store.getPerson(personId);
  if (!person) return;
  Object.assign(person, fields);
  if (fullName(person).trim().length > 0) person.isPlaceholder = false;
}

export function toggleLock(store, personId) {
  const person = store.getPerson(personId);
  if (!person) return;
  person.locked = !person.locked;
}

export function movePersonTo(store, personId, x, y) {
  const person = store.getPerson(personId);
  if (!person || person.locked) return;
  person.x = x;
  person.y = y;
}

/**
 * Soft delete: turn a person into a blank grey placeholder so every
 * relationship line they're part of keeps its shape. Their id, position,
 * and all union memberships are left untouched.
 */
export function deletePerson(store, personId) {
  const person = store.getPerson(personId);
  if (!person) return;
  person.firstName = "";
  person.middleName = "";
  person.lastName = "";
  person.notes = [];
  person.category = "unset";
  person.isPlaceholder = true;
  person.locked = false;
  if (store.selectedPersonId === personId) store.selectedPersonId = null;
}

// ---- connector defaults ------------------------------------------------

function averageX(store, ids) {
  const xs = ids.map((id) => store.getPerson(id).x);
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function makeConnector(store, partnerIds, childIds, partnerY, childY) {
  const dropY = childIds.length ? Math.round((partnerY + childY) / 2) : partnerY + 60;
  const parentAnchorX = averageX(store, partnerIds);
  const childAnchors = {};
  for (const cid of childIds) childAnchors[cid] = store.getPerson(cid).x;
  return { dropY, parentAnchorX, childAnchors };
}

function rebuildConnectorForNewChild(store, union, childId) {
  const partnerY = Math.min(...union.partnerIds.map((id) => store.getPerson(id).y));
  const child = store.getPerson(childId);
  union.connector.childAnchors[childId] = child.x;
  if (union.childIds.length === 1) {
    // first child on this union - recompute a sane dropY too
    union.connector.dropY = Math.round((partnerY + child.y) / 2);
  }
}

// ---- relationships: parents --------------------------------------------

/**
 * Give `personId` two new blank parents. Does nothing (returns false) if
 * the person already has a recorded parent union - a person has at most
 * one set of parents in this version of the app.
 */
export function addParents(store, personId) {
  const person = store.getPerson(personId);
  if (!person) return false;
  if (store.unionAsChild(personId)) return false;

  const y = person.y - GENERATION_GAP_Y;
  const leftSpot = findClearSpot(store, person.x - PERSON_SPACING_X / 2, y);
  const parentAId = store.newId("p");
  store.people.set(parentAId, blankPerson(parentAId, leftSpot.x, leftSpot.y));

  const rightSpot = findClearSpot(store, person.x + PERSON_SPACING_X / 2, y);
  const parentBId = store.newId("p");
  store.people.set(parentBId, blankPerson(parentBId, rightSpot.x, rightSpot.y));

  const unionId = store.newId("u");
  const connector = makeConnector(store, [parentAId, parentBId], [personId], y, person.y);
  store.unions.set(unionId, {
    id: unionId,
    partnerIds: [parentAId, parentBId],
    childIds: [personId],
    connector,
  });

  store.selectedPersonId = parentAId;
  return true;
}

// ---- relationships: spouse ----------------------------------------------

export function addSpouse(store, personId) {
  const person = store.getPerson(personId);
  if (!person) return false;

  const spot = findClearSpot(store, person.x + PERSON_SPACING_X, person.y);
  const spouseId = store.newId("p");
  store.people.set(spouseId, blankPerson(spouseId, spot.x, spot.y));

  const unionId = store.newId("u");
  const connector = makeConnector(store, [personId, spouseId], [], person.y, person.y);
  store.unions.set(unionId, {
    id: unionId,
    partnerIds: [personId, spouseId],
    childIds: [],
    connector,
  });

  store.selectedPersonId = spouseId;
  return true;
}

// ---- relationships: child ------------------------------------------------

/**
 * Add a new child under `personId`. Uses their first existing
 * partner-union if they have one; otherwise creates a new union with
 * `personId` as a sole (single) parent.
 */
export function addChild(store, personId) {
  const person = store.getPerson(personId);
  if (!person) return false;

  let union = store.unionsAsPartner(personId)[0];
  const existingChildCount = union ? union.childIds.length : 0;
  const y = person.y + GENERATION_GAP_Y;
  const x = person.x + existingChildCount * PERSON_SPACING_X;
  const spot = findClearSpot(store, x, y);

  const childId = store.newId("p");
  store.people.set(childId, blankPerson(childId, spot.x, spot.y));

  if (!union) {
    const unionId = store.newId("u");
    const connector = makeConnector(store, [personId], [childId], person.y, spot.y);
    union = { id: unionId, partnerIds: [personId], childIds: [childId], connector };
    store.unions.set(unionId, union);
  } else {
    union.childIds.push(childId);
    rebuildConnectorForNewChild(store, union, childId);
  }

  store.selectedPersonId = childId;
  return true;
}

// ---- relationships: sibling -----------------------------------------------

/**
 * Add a new sibling to `personId`: another child in the same parent
 * union. If `personId` has no recorded parents yet, a new (blank) parent
 * union is created first, exactly like addParents, and both the existing
 * person and the new sibling become its children.
 */
export function addSibling(store, personId) {
  const person = store.getPerson(personId);
  if (!person) return false;

  let union = store.unionAsChild(personId);
  const spot = findClearSpot(
    store,
    person.x + PERSON_SPACING_X * (union ? union.childIds.length : 1),
    person.y
  );
  const siblingId = store.newId("p");
  store.people.set(siblingId, blankPerson(siblingId, spot.x, spot.y));

  if (!union) {
    const y = person.y - GENERATION_GAP_Y;
    const leftSpot = findClearSpot(store, person.x - PERSON_SPACING_X, y);
    const parentAId = store.newId("p");
    store.people.set(parentAId, blankPerson(parentAId, leftSpot.x, leftSpot.y));
    const rightSpot = findClearSpot(store, person.x, y);
    const parentBId = store.newId("p");
    store.people.set(parentBId, blankPerson(parentBId, rightSpot.x, rightSpot.y));

    const unionId = store.newId("u");
    const connector = makeConnector(
      store,
      [parentAId, parentBId],
      [personId, siblingId],
      y,
      person.y
    );
    union = { id: unionId, partnerIds: [parentAId, parentBId], childIds: [personId, siblingId], connector };
    store.unions.set(unionId, union);
  } else {
    union.childIds.push(siblingId);
    rebuildConnectorForNewChild(store, union, siblingId);
  }

  store.selectedPersonId = siblingId;
  return true;
}

// ---- connector editing (dragging bars / stubs) --------------------------

export function setConnectorDropY(store, unionId, dropY) {
  const union = store.getUnion(unionId);
  if (!union) return;
  union.connector.dropY = dropY;
}

export function setConnectorParentAnchorX(store, unionId, x) {
  const union = store.getUnion(unionId);
  if (!union) return;
  union.connector.parentAnchorX = x;
}

export function setConnectorChildAnchorX(store, unionId, childId, x) {
  const union = store.getUnion(unionId);
  if (!union) return;
  union.connector.childAnchors[childId] = x;
}

// ---- manual (hand-drawn) line overrides ---------------------------------

export function setCustomRoute(store, unionId, childId, points) {
  const union = store.getUnion(unionId);
  if (!union) return;
  if (!union.customRoutes) union.customRoutes = {};
  union.customRoutes[childId] = points;
}

export function clearCustomRoute(store, unionId, childId) {
  const union = store.getUnion(unionId);
  if (!union || !union.customRoutes) return;
  delete union.customRoutes[childId];
}
