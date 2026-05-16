// store.js — React context store with SM-2 SRS algorithm
// Requires React 18 UMD on window and window.Persistence loaded first.

(function () {
  const { createContext, useContext, useState, useEffect, useMemo, useCallback } = React;

  // ─── SM-2 helpers ────────────────────────────────────────────────────────────

  function todayStr() {
    return new Date().toDateString();
  }

  function addDays(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toDateString();
  }

  /**
   * Apply an SM-2 grade to an existing srsState (or fresh defaults).
   * grade: 0 = Again, 3 = Hard, 5 = Easy
   * Returns new srsState object.
   */
  function applyGrade(state, grade) {
    let { interval = 1, reps = 0, ease = 2.5 } = state || {};

    if (grade === 0) {
      // Again
      interval = 1;
      reps = 0;
    } else if (grade === 3) {
      // Hard
      interval = Math.max(1, Math.round(interval * 1.2));
      reps = reps + 1;
    } else if (grade === 5) {
      // Easy
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ease);
      }
      reps = reps + 1;
    }

    ease = Math.max(1.3, ease + 0.1 - (5 - grade) * 0.08);
    const dueDate = addDays(interval);

    return { interval, reps, ease, dueDate };
  }

  // ─── Card building ────────────────────────────────────────────────────────────

  function buildCards() {
    if (window._courseCards) return window._courseCards;
    const cards = [];
    const courseData = window.COURSE_DATA || [];
    for (const mod of courseData) {
      for (const sec of (mod.sections || [])) {
        for (const sub of (sec.subsections || sec.subs || [])) {
          const exercises = sub.exercises || [];
          exercises.forEach(function (ex, i) {
            if (ex.isLab) return;
            cards.push({
              id: sub.id + "-" + i,
              subsectionId: sub.id,
              subsectionTitle: sub.title,
              question: ex.question || ex.q,
              answer: ex.answer || ex.a,
            });
          });
        }
      }
    }
    window._courseCards = cards;
    return cards;
  }

  function isDue(srsState) {
    if (!srsState || !srsState.dueDate) return true;
    return new Date(srsState.dueDate) <= new Date();
  }

  // ─── Streak helper ────────────────────────────────────────────────────────────

  function computeStreak(streak, activity84) {
    const today = todayStr();
    const yesterday = (function () {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toDateString();
    })();

    let newStreak = { ...streak };
    let newActivity = activity84.slice();

    if (newStreak.lastDate === today) {
      // Already counted today — just increment activity
      newActivity[83] = newActivity[83] + 1;
    } else if (newStreak.lastDate === yesterday) {
      newStreak.count = newStreak.count + 1;
      newStreak.lastDate = today;
      newActivity[83] = newActivity[83] + 1;
    } else {
      // Streak broken or first time
      newStreak.count = 1;
      newStreak.lastDate = today;
      newActivity[83] = newActivity[83] + 1;
    }

    return { streak: newStreak, activity84: newActivity };
  }

  // ─── Context & Provider ───────────────────────────────────────────────────────

  var StoreCtx = createContext(null);

  function StoreProvider(props) {
    var children = props.children;

    // Initialise from persistence
    var initialLoad = window.Persistence.loadStore();
    var [state, setState] = useState(initialLoad.bag);

    // Persist on every state change
    useEffect(function () {
      window.Persistence.saveStore(state);
    }, [state]);

    // ── Actions ────────────────────────────────────────────────────────────────

    var markComplete = useCallback(function (id) {
      setState(function (prev) {
        var already = prev.completed.includes(id);
        var completed = already
          ? prev.completed.filter(function (x) { return x !== id; })
          : prev.completed.concat(id);

        var nextState = { ...prev, completed: completed };

        if (!already) {
          // Adding — update streak
          var streakResult = computeStreak(prev.streak, prev.activity84);
          nextState.streak = streakResult.streak;
          nextState.activity84 = streakResult.activity84;
        }

        return nextState;
      });
    }, []);

    var gradeCard = useCallback(function (cardId, grade) {
      setState(function (prev) {
        var existing = prev.srsStates[cardId] || {};
        var newSrs = applyGrade(existing, grade);
        var historyEntry = {
          cardId: cardId,
          grade: grade,
          date: new Date().toISOString(),
        };
        return {
          ...prev,
          srsStates: { ...prev.srsStates, [cardId]: newSrs },
          history: prev.history.concat(historyEntry),
        };
      });
    }, []);

    var captureFlag = useCallback(function (flag) {
      setState(function (prev) {
        if (prev.capturedFlags.includes(flag)) return prev;
        var now = new Date().toISOString();
        return {
          ...prev,
          capturedFlags: prev.capturedFlags.concat(flag),
          flagDates: { ...prev.flagDates, [flag]: now },
        };
      });
    }, []);

    var setLayout = useCallback(function (updates) {
      setState(function (prev) {
        return { ...prev, layout: { ...prev.layout, ...updates } };
      });
    }, []);

    var setNotes = useCallback(function (id, text) {
      setState(function (prev) {
        return { ...prev, notes: { ...prev.notes, [id]: text } };
      });
    }, []);

    var setName = useCallback(function (name) {
      setState(function (prev) {
        return { ...prev, name: name };
      });
    }, []);

    var setTheme = useCallback(function (theme) {
      setState(function (prev) {
        return { ...prev, theme: theme };
      });
    }, []);

    var setPage = useCallback(function (page) {
      setState(function (prev) {
        return { ...prev, page: page };
      });
    }, []);

    var setActiveId = useCallback(function (id) {
      setState(function (prev) {
        return { ...prev, activeId: id };
      });
    }, []);

    var resetAll = useCallback(function () {
      var fresh = { ...window.Persistence.DEFAULTS };
      window._courseCards = null;
      setState(fresh);
    }, []);

    var updateStreak = useCallback(function () {
      setState(function (prev) {
        var result = computeStreak(prev.streak, prev.activity84);
        return { ...prev, streak: result.streak, activity84: result.activity84 };
      });
    }, []);

    // ── Derived ────────────────────────────────────────────────────────────────

    var derived = useMemo(function () {
      var allCards = buildCards();

      var dueCards = allCards.filter(function (card) {
        return isDue(state.srsStates[card.id]);
      });

      // Per-module mastery
      var courseData = window.COURSE_DATA || [];
      var moduleMastery = courseData.map(function (mod) {
        var allSubs = (mod.sections || []).flatMap(function(sec) { return sec.subsections || sec.subs || []; });
        var subsIds = allSubs.map(function (s) { return s.id; });
        var total = subsIds.length;
        var done = subsIds.filter(function (sid) {
          return state.completed.includes(sid);
        }).length;
        var pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return { id: mod.id, done: done, total: total, pct: pct };
      });

      var totalSubs = moduleMastery.reduce(function (acc, m) { return acc + m.total; }, 0);
      var doneSubs = moduleMastery.reduce(function (acc, m) { return acc + m.done; }, 0);
      var overallPct = totalSubs > 0 ? Math.round((doneSubs / totalSubs) * 100) : 0;

      return { dueCards: dueCards, moduleMastery: moduleMastery, overallPct: overallPct, allCards: allCards };
    }, [state.srsStates, state.completed]);

    var actions = {
      markComplete: markComplete,
      gradeCard: gradeCard,
      captureFlag: captureFlag,
      setLayout: setLayout,
      setNotes: setNotes,
      setName: setName,
      setTheme: setTheme,
      setPage: setPage,
      setActiveId: setActiveId,
      resetAll: resetAll,
      updateStreak: updateStreak,
    };

    return React.createElement(
      StoreCtx.Provider,
      { value: { state: state, actions: actions, derived: derived } },
      children
    );
  }

  function useStore() {
    return useContext(StoreCtx);
  }

  window.StoreProvider = StoreProvider;
  window.useStore = useStore;
})();
