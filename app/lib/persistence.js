// Canonical store key
const STORE_KEY = "pyforge-v1";

// Schema version 1 defaults
const DEFAULTS = {
  v: 1,
  activeId: "s1-1-1",
  page: "home",
  completed: [],
  srsStates: {},
  history: [],
  notes: {},
  capturedFlags: [],
  flagDates: {},
  layout: {},
  streak: { count: 0, lastDate: null },
  activity84: Array(84).fill(0),
  name: "",
  theme: "dark",
};

// Legacy key map: legacyKey → path in new store (null = skip, "*" = merge whole object)
const LEGACY = {
  "offsec-py-page":         "page",
  "offsec-python-active":   "activeId",
  "offsec-python-completed":"completed",   // was array of ids
  "offsec-py-flags":        "capturedFlags",
  "offsec-py-flag-dates":   "flagDates",
  "offsec-py-streak":       "streak",
  "offsec-py-activity":     "activity84",
  "offsec-py-name":         "name",
  "pyrev-theme":            "theme",
  "pyrev-active-v3":        "activeId",
  "pyrev-v3":               "*",           // merge all known fields from old bag
};

function readRaw(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : undefined; } catch { return undefined; }
}

function loadStore() {
  // Try canonical first
  const raw = readRaw(STORE_KEY);
  let bag = { ...DEFAULTS };
  let didMigrate = false;

  if (raw && raw.v === 1) {
    bag = { ...DEFAULTS, ...raw };
  } else {
    // Migrate from legacy keys
    for (const [legKey, path] of Object.entries(LEGACY)) {
      const val = readRaw(legKey);
      if (val === undefined) continue;
      didMigrate = true;
      if (path === "*") {
        // pyrev-v3 old bag: merge known fields
        if (val.completed) bag.completed = val.completed;
        if (val.srsStates) bag.srsStates = val.srsStates;
        if (val.history) bag.history = val.history;
      } else if (path) {
        bag[path] = val;
      }
      try { localStorage.removeItem(legKey); } catch {}
    }
    // If completed was from old "offsec-python-completed" (Set serialised as array)
    if (!Array.isArray(bag.completed)) bag.completed = [];
    if (!Array.isArray(bag.capturedFlags)) bag.capturedFlags = [];
  }

  return { bag, didMigrate };
}

function saveStore(bag) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(bag)); } catch {}
}

window.Persistence = { DEFAULTS, loadStore, saveStore };
