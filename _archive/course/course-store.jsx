/* global React */
// Versioned progress store — mastery + SRS state + completion
// Exports: CourseStoreProvider, useCourseStore → window

const { createContext: createCS, useContext: useCS, useState: useCSState, useEffect: useCSEffect, useCallback: useCSCb } = React;

const StoreCtx2 = createCS(null);
const STORE_KEY2 = 'pyrev-v3';
const SCHEMA_V = 2;

// ── SM-2 scheduler ────────────────────────────────────────────
function sm2(card, grade) {
  const ease = Math.max(1.3, ((card && card.ease) || 2.5) + (0.1 - (5 - grade) * 0.08));
  let interval = (card && card.interval) || 1;
  let reps = (card && card.reps) || 0;
  if (grade === 0) { interval = 1; reps = 0; }
  else if (grade === 3) { interval = Math.max(1, Math.round(interval * 1.2)); reps += 1; }
  else { interval = reps === 0 ? 1 : reps === 1 ? 6 : Math.round(interval * ease); reps += 1; }
  const due = new Date(); due.setDate(due.getDate() + interval);
  return { interval, ease, reps, dueDate: due.toDateString() };
}

// ── Card generation ───────────────────────────────────────────
function buildCards() {
  const cards = [];
  const all = window.getAllSubsections ? window.getAllSubsections() : [];
  for (const { subsection } of all) {
    const exs = (subsection.exercises || []).filter(e => !e.isLab);
    exs.forEach((ex, i) => {
      cards.push({
        id: subsection.id + '-' + i,
        subsectionId: subsection.id,
        subsectionTitle: subsection.title,
        question: ex.question,
        answer: ex.answer,
      });
    });
  }
  return cards;
}

function isDue(state) {
  if (!state) return true;
  return new Date(state.dueDate) <= new Date();
}

// ── Persistence ───────────────────────────────────────────────
const INITIAL = { v: SCHEMA_V, completed: [], srsStates: {}, history: [] };

function load2() {
  try {
    const raw = localStorage.getItem(STORE_KEY2);
    if (!raw) {
      // Try migrating from old key
      const old = localStorage.getItem('pyrev-completed-v2');
      if (old) {
        const completed = JSON.parse(old);
        return { ...INITIAL, completed };
      }
      return INITIAL;
    }
    const parsed = JSON.parse(raw);
    if (parsed.v !== SCHEMA_V) return INITIAL; // future migration point
    return parsed;
  } catch { return INITIAL; }
}

function save2(state) {
  try { localStorage.setItem(STORE_KEY2, JSON.stringify(state)); } catch {}
}

// ── Provider ──────────────────────────────────────────────────
function CourseStoreProvider({ children }) {
  const [state, setState] = useCSState(load2);
  const allCards = window._courseCards || (window._courseCards = buildCards());

  useCSEffect(() => { save2(state); }, [state]);

  const dueCards = allCards.filter(c => isDue((state && state.srsStates) ? state.srsStates[c.id] : null));

  // Mastery per module: weighted completion + SRS
  const moduleMastery = (window.COURSE_DATA || []).map(mod => {
    const subs = mod.sections.flatMap(s => s.subsections);
    const done = subs.filter(s => state.completed.includes(s.id)).length;
    return {
      id: mod.id, total: subs.length, done,
      pct: subs.length ? Math.round(done / subs.length * 100) : 0,
    };
  });

  const totalSubs = (window.COURSE_DATA || []).reduce((s, m) => s + m.sections.flatMap(sec => sec.subsections).length, 0);
  const overallPct = totalSubs ? Math.round(state.completed.length / totalSubs * 100) : 0;

  const actions = {
    markComplete(id) {
      setState(s => ({
        ...s,
        completed: s.completed.includes(id) ? s.completed.filter(x => x !== id) : [...s.completed, id],
      }));
    },
    gradeCard(cardId, grade) {
      setState(s => ({
        ...s,
        srsStates: { ...s.srsStates, [cardId]: sm2(s.srsStates[cardId], grade) },
        history: [{ cardId, grade, ts: Date.now() }, ...s.history.slice(0, 49)],
      }));
    },
    resetAll() { setState(INITIAL); },
  };

  const value = {
    state,
    actions,
    derived: { dueCards, moduleMastery, overallPct, allCards },
  };

  return React.createElement(StoreCtx2.Provider, { value }, children);
}

function useCourseStore() { return useCS(StoreCtx2); }

Object.assign(window, { CourseStoreProvider, useCourseStore });
