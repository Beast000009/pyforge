// lab-helpers.js — lab catalog is owned by the lab-server.
// We fetch /labs once on boot and cache the public metadata here.
// Cases listed here NEVER include hiddenCases — those run only on the server.

window.LAB_STARTERS = {};        // populated by loadLabs()
window.LAB_STARTERS_READY = false;

async function loadLabs() {
  try {
    const r = await fetch(window.LabServerClient.baseUrl + "/labs");
    if (!r.ok) throw new Error("HTTP " + r.status);
    const body = await r.json();
    const map = {};
    for (const lab of body.labs) map[lab.subsectionId] = lab;
    window.LAB_STARTERS = map;
    window.LAB_STARTERS_READY = true;
    window.dispatchEvent(new CustomEvent("labs-ready"));
  } catch (e) {
    console.warn("[lab-helpers] failed to load lab catalog:", e.message);
    window.LAB_STARTERS = {};
    window.LAB_STARTERS_READY = false;
    window.dispatchEvent(new CustomEvent("labs-unavailable", { detail: e.message }));
  }
}

// Defer one tick so LabServerClient is ready
setTimeout(loadLabs, 0);

// ── Flatten helpers ─────────────────────────────────────────
function getAllSubs() {
  const out = [];
  for (const m of window.COURSE_DATA)
    for (const s of m.sections)
      for (const sub of (s.subsections || []))
        out.push({ mod: m, sec: s, sub });
  return out;
}

function findSubById(id) {
  for (const m of window.COURSE_DATA)
    for (const s of m.sections)
      for (const sub of (s.subsections || []))
        if (sub.id === id) return { mod: m, sec: s, sub };
  return null;
}

Object.assign(window, { getAllSubs, findSubById, loadLabs });
