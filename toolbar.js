// js/persistence.js
//
// GitHub Pages has no backend, so "saving" means two things working
// together: (1) autosave into the browser's localStorage, so your edits
// survive a reload on the same device/browser, and (2) explicit
// Export/Import of a JSON file, which is how you actually keep your
// data long-term (download it, commit it into your repo, or just keep
// the file somewhere safe) and how you move it to a different browser.

const STORAGE_KEY = "family-tree-app:v1";

export function saveToLocalStorage(store) {
  try {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      people: store.allPeople(),
      unions: store.allUnions(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn("Autosave failed:", err);
    return false;
  }
}

export function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!validateTreeShape(parsed)) return null;
    return parsed;
  } catch (err) {
    console.warn("Could not read saved tree:", err);
    return null;
  }
}

export function clearLocalStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function validateTreeShape(payload) {
  if (!payload || typeof payload !== "object") return false;
  if (!Array.isArray(payload.people) || !Array.isArray(payload.unions)) return false;
  return payload.people.every((p) => typeof p.id === "string" && "x" in p && "y" in p);
}

export function exportJSON(store, filename = "family-tree.json") {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    people: store.allPeople(),
    unions: store.allUnions(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Reads a File (from an <input type="file">) and resolves to {people, unions}. */
export function importJSONFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!validateTreeShape(parsed)) {
          reject(new Error("That file doesn't look like a family tree export."));
          return;
        }
        resolve(parsed);
      } catch (err) {
        reject(new Error("That file isn't valid JSON."));
      }
    };
    reader.readAsText(file);
  });
}
