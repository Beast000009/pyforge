# PyForge — Unified Platform Merge Plan

Two prototypes ship the same Python course content but split the feature surface. This plan reconciles them into **one** learning platform.

- **Bundle A** — `course/` ([Python Reviewer Web.html](course/index.html)) — content-rich; SRS, REPL, theme, mastery, notes.
- **Bundle B** — `pyforge/` ([Python Reviewer.html](pyforge/index.html)) — shell-rich; workspace, dashboard, command palette, flag tracker, mobile.

The branding lands on **PyForge** (Bundle B) — already validated in chat. Content data comes from the 75-lesson dataset both bundles already carry.

---

## 1. TL;DR

Ship **PyForge's workspace shell** as the chassis. Drop **Bundle A's pedagogy features** (SRS, REPL, theme, notes, mastery) into it as first-class destinations. Keep Bundle B's mobile + command palette + flag tracker exactly as-is. Replace Bundle B's *simulated* run with Bundle A's *real* Pyodide REPL throughout.

**Tech**: stay in the HTML + Babel-in-browser prototype format for one more iteration (fast iteration, no build), then graduate to the `src/` Vite + React + TS skeleton once the unified design is stable.

**Effort**: 6 phases, each independently shippable, ~3 days of focused work per phase.

---

## 2. Feature audit (the merge matrix)

| Feature | Bundle A (course/) | Bundle B (pyforge/) | Verdict |
|---|---|---|---|
| **Layout — sidebar** | 2-pane, fixed 288px | 2-pane, fixed 240px | Keep B's 240px. |
| **Layout — main + lab** | Single content column | 3-pane: content + resizable lab | **Adopt B.** Resizable, collapsible. |
| **Home / Dashboard** | none (lands on first lesson) | `/home`: greeting, continue card, 4× rings, 12-week heatmap, streak, stats | **Adopt B**, augment with Bundle A's *due-cards* count + "Practice now" CTA. |
| **Sidebar tree** | Module → section → subsection; numbered; search; **mastery % per module** | Module → section → subsection; numbered; search | **Merge** — B's tree + A's mastery % per module ([course-sidebar.jsx:~80](course/course-sidebar.jsx)). |
| **Sidebar quick actions** | Practice / Progress / Theme / Help | Home / Flags only | **Merge** — both bars: Home · Lessons · Practice (N due) · Progress · Flags · Theme · ? |
| **Lesson content blocks** | text / heading / code / note / objectives | text / heading / code / note / objectives | Identical schema — keep as-is. |
| **Code blocks** | Plain `<pre>` + copy | **Syntax highlight + ▶ Run + ↗ Lab + Copy** | **Adopt B's enhanced block**, wire its Run through A's Pyodide instead of simulated exec. |
| **Quick Check** | Single Q reveal above exercises | none | **Adopt A.** |
| **Exercises (Q&A)** | List, per-item reveal | List, per-item reveal | Identical — keep. |
| **Lab exercises (flags)** | Inline flag form below exercise | Routed to the side **Lab VM** | **Adopt B's pane**. Inline link → "Open in Lab ↗" opens VM. |
| **Lesson notes** | Per-lesson textarea, persisted | none | **Adopt A.** Collapsible at the bottom of every lesson. |
| **Mark complete + prev/next** | both | both | Identical — keep. |
| **Practice (SRS)** | SM-2 deck; Again/Hard/Easy; session screen | none | **Adopt A** as `/practice`. |
| **Progress insights** | Heatmap mastery map, module bars, topic strength, "where to focus" | basic stats only on home | **Adopt A** as `/progress`. Home keeps Bundle B's rings + heatmap. |
| **Flag Tracker** | none | `/flags`: scoreboard, difficulty tags, locked silhouettes, replay | **Adopt B.** |
| **Lab VM** | Inline editor + Pyodide REPL, symbol toolbar, ⌘↵ run | Multi-tab editor, drag-resize, simulated exec | **Merge** — B's tabs/resize/keyboard + A's Pyodide for real execution. |
| **Command palette (⌘K)** | Search-focus only | Full fuzzy search: lessons, actions, flags | **Adopt B**, extend actions: `Practice`, `Progress`, `Toggle theme`, `Reset progress`. |
| **Mobile** | Drawer + responsive content | Drawer + bottom nav (Home/Learn/Flags/Menu) | **Adopt B.** Add Practice/Progress entries to the menu drawer. |
| **Theme (light/dark)** | toggle + full light-mode CSS | dark only | **Adopt A.** Port `body.light` rules from [course-styles.css:859](course/course-styles.css) into pr-styles. |
| **Keyboard shortcuts** | j/k, m, p, g, t, ?, ⌘K (search) | j/k, m, ⌘K (palette), ⌘\ (lab), ⌘⇧↵ (run) | **Merge map** — see §6. |
| **Persistence** | `pyrev-v3` versioned store, schema migration | scattered `offsec-py-*` keys | **Adopt A's versioned single store.** See §5. |
| **Streak / activity** | none | daily streak + 12-week heatmap | **Adopt B.** |
| **Editable greeting** | none | "Welcome back, **<name>**" click-to-edit | **Adopt B.** |
| **Branding** | "OffSec Get Good at Python" | "PyForge — Get Good at Python" | **PyForge** wins. |

---

## 3. Unified information architecture

```
/                  Home dashboard (continue + rings + heatmap + streak + due-cards CTA)
/lesson/:id        Workspace: sidebar | content (+ notes) | Lab VM (resizable, optional)
/practice          SRS deck (SM-2)
/progress          Mastery insights (heatmap, module bars, topic strength, focus picks)
/flags             Flag tracker scoreboard
```

Routing stays client-side (no real router needed in the prototype phase — use a single `page` state in the root component). Move to `wouter` when graduating to Vite.

### Workspace shell (lesson view)

```
┌──────────────────────────────────────────────────────────────────┐
│ ⎕ brand · breadcrumb (mod › sec › sub) · ⌘K · ⚡ Lab · ☀/🌙 · ?  │
├────────┬───────────────────────────────┬────────────────────────┤
│        │                               │  Lab VM                │
│ Sidebar│  Content                       │  (tabs · editor ·       │
│ 240px  │  (max-width 780px)            │   stdout · flag form)  │
│        │  · lesson · quick-check       │  280–720px resizable    │
│        │  · exercises · notes          │  ⌘\ to collapse         │
│        │  · prev / next                │                        │
└────────┴───────────────────────────────┴────────────────────────┘
mobile (≤768px): sidebar off-canvas, lab hidden, bottom nav surfaces Practice/Flags
```

---

## 4. Component inventory

| Component | Source | Action |
|---|---|---|
| `App` | [pyforge/pr-app.jsx](pyforge/pr-app.jsx) | Rewrite — add `practice`/`progress` pages, merge keyboard maps, use unified store. |
| `Sidebar` | B's [pr-sidebar.jsx](pyforge/pr-sidebar.jsx) | Extend — add mastery % rows from A, add Practice/Progress/Theme/Help action bar at footer. |
| `HomeScreen` | B's [pr-home.jsx](pyforge/pr-home.jsx) | Extend — replace simulated stats with `derived.dueCards.length`, link "Practice" CTA. |
| `LessonView` | B's [pr-lesson.jsx](pyforge/pr-lesson.jsx) | Merge — insert A's `QuickCheck` and `LessonNotes`; keep B's enhanced code blocks; switch flag form to "Open in Lab". |
| `CodeBlock` | B's pr-lesson code block | Keep — but rewire `onRun` to the unified `pyodideRunner` from A's [course-repl.jsx](course/course-repl.jsx). |
| `LabVM` | B's [pr-lab.jsx](pyforge/pr-lab.jsx) | Merge — keep tabs/resize/symbol toolbar; replace `checkSolution()` with real Pyodide; preserve flag verification. |
| `CommandPalette` | B's [pr-palette.jsx](pyforge/pr-palette.jsx) | Extend — add `goto-practice`, `goto-progress`, `toggle-theme`, `reset-progress`. |
| `FlagsPage` | B's [pr-flags.jsx](pyforge/pr-flags.jsx) | Keep — possibly grade flags by lab difficulty (already tagged in `LAB_STARTERS`). |
| `PracticePanel` | A's [course-practice.jsx](course/course-practice.jsx) | **New mount** in unified app. |
| `ProgressPanel` | A's [course-progress.jsx](course/course-progress.jsx) | **New mount.** Drop the redundant streak (Home shows it). |
| `LessonNotes` | A's [course-content.jsx](course/course-content.jsx) | Extract into its own component, mount in `LessonView`. |
| `QuickCheck` | A's `course-content.jsx` | Extract; render above `Exercises` block in `LessonView`. |
| `PyodideRunner` | A's [course-repl.jsx](course/course-repl.jsx) | Promote to a shared service used by **both** inline run buttons **and** the Lab VM. |
| `KeyboardHelp` | A's modal | Keep; update key list to merged map. |
| `ThemeToggle` | A's pattern | Apply `body.light` class on root; persist. |
| `Store` | A's [course-store.jsx](course/course-store.jsx) | **Adopt this** as the canonical store. Extend with B's `labOpen`, `labWidth`, `capturedFlags`, `flagDates`, `streak`, `activity84`, `name`. |

---

## 5. Unified store (schema v3)

Single versioned key `pyforge-v1`:

```js
{
  v: 1,
  completed: ["s1-1-1", ...],        // from A
  srsStates: { [cardId]: { interval, ease, reps, dueDate } },  // from A
  history:   [{ cardId, grade, ts }, ...],                     // from A (capped 50)
  notes:     { [subsectionId]: "..." },                        // from A (lesson notes)
  capturedFlags: ["PYTHON(...)", ...],                         // from B
  flagDates: { [flag]: "M/D/YYYY" },                           // from B
  layout:    { [lessonId]: { labOpen, labWidth, tabs } },      // from B (per-lesson)
  streak:    { count, lastDate },                              // from B
  activity84: [0, 0, ..., 0],                                  // from B (12 wks × 7 days)
  theme:     "dark" | "light",                                 // from A
  name:      "you",                                            // from B (editable greeting)
  activeId:  "s1-1-1",                                         // from both
  page:      "home" | "lesson" | "practice" | "progress" | "flags"
}
```

One persistence layer, one migration entry point. Drop **all** `offsec-py-*` legacy keys after a one-time migration in `loadStore()`.

---

## 6. Keyboard shortcuts (merged)

| Key | Action | Scope |
|-----|--------|-------|
| ⌘K | Command palette | Global |
| ⌘\\ | Toggle Lab pane | Lesson |
| ⌘⇧↵ | Run lab code | Lab focused |
| j / → | Next lesson | Global (not in inputs) |
| k / ← | Previous lesson | Global |
| m | Toggle complete | Lesson |
| p | Practice deck | Global |
| g | Progress view | Global |
| t | Toggle theme | Global |
| ? | Shortcuts modal | Global |
| Esc | Close palette / drawer / modal | Global |

`⌘K`'s old "focus sidebar search" in A is replaced by the proper palette from B (palette includes lesson search).

---

## 7. Phased delivery

Each phase ends with a working, demo-able app. No long-lived broken branches.

### Phase 1 — Foundation (workspace shell + unified store) — *day 1–2*
- Fork `pyforge/` to a new `app/` directory.
- Replace its store helpers with A's versioned store (port `course-store.jsx`).
- Extend the store with B's layout/streak/flags/activity fields.
- One-time migration from legacy keys.
- **Acceptance**: load `app/`, see PyForge as today, but state lives in `pyforge-v1`.

### Phase 2 — Pedagogy drop-in (Practice + Progress + Notes + QuickCheck) — *day 3–4*
- Mount A's `PracticePanel`, `ProgressPanel`, `LessonNotes`, `QuickCheck` into PyForge shell.
- Add `practice` and `progress` pages to router; expose in sidebar bottom action bar.
- **Acceptance**: P opens Practice, G opens Progress, every lesson has a notes box that persists, quick-check renders above exercises.

### Phase 3 — Real Python execution everywhere — *day 5*
- Extract A's Pyodide runner into a shared service.
- Wire it into B's inline code-block ▶ Run (replace the regex-based simulator).
- Wire it into B's Lab VM (replace `checkSolution()` simulator; keep flag verification).
- **Acceptance**: `print(2+2)` in any code block prints `4`; the Lab tab runs the same engine.

### Phase 4 — Theme + sidebar polish — *day 6*
- Port `body.light` rules from `course-styles.css` into `pr-styles.css`.
- Add `T` toggle and ☀/🌙 button in top bar.
- Add mastery % to sidebar module rows.
- **Acceptance**: theme persists across reloads; every module shows live mastery %.

### Phase 5 — Command palette extensions — *day 7*
- Add palette actions: `goto-practice`, `goto-progress`, `toggle-theme`, `reset-progress`, `show-shortcuts`.
- Show "N due" badge next to the Practice palette entry.
- **Acceptance**: `⌘K → "due"` jumps to Practice; `⌘K → "theme"` toggles.

### Phase 6 — Mobile + final polish — *day 8*
- Extend mobile bottom nav to include Practice and Progress (replace overflow Menu).
- Hide Lab VM on `≤768px` (read-only code blocks, "Open on desktop" CTA).
- Verify drawer closes after navigation everywhere.
- **Acceptance**: full feature parity on a 375×667 viewport except code execution (which CTAs to desktop).

### Phase 7 (optional) — Vite + TS migration
- Use the existing [`src/`](src/) skeleton; port components 1:1.
- Add `wouter` router, `zustand` store, `shiki` highlighter, `pyodide` package.
- Vitest suites for store, SM-2 scheduler, fuzzy search.
- **Acceptance**: `npm run dev` boots a typed app with the same UX.

---

## 8. Open questions

1. **REPL footprint** — Pyodide is ~6 MB on first load (A already accepts this). Confirm okay to keep this trade-off for inline run buttons.
2. **Difficulty grading on flags** — Bundle B shows easy/med/hard; the real `labStarters.ts` doesn't have a difficulty field. Infer from `level`? Or add manually for the 7 flags?
3. **Notes on mobile** — keep collapsed by default? Probably yes given screen budget.
4. **Light theme polish** — A's light theme is rough on the workspace components from B. Worth a dedicated pass or ship dark-only first?
5. **Vite migration** — do we want Phase 7 right after Phase 6, or treat it as a separate epic?
6. **Course data dedup** — A's `course-data.js` (2906 LOC, plain JS) and B's `pr-data.jsx` (3290 LOC, JSX-prefixed) hold the same content. Confirm A's plain-JS version as the canonical (faster parse, no Babel cost).

---

## 9. Risks

- **State migration bugs** — users who already played with either prototype have legacy localStorage. Mitigation: one-shot migration on first load with a "Imported your progress" toast.
- **Pyodide load time** — first run can stall the UI for 4–8s on slow networks. Mitigation: lazy-load on first Run click, show a one-time spinner, then cache in IndexedDB via service worker (post-Phase 3 polish).
- **Light theme for the workspace** — B's workspace shell uses color tokens the A light theme doesn't fully cover. May need ~30 extra rules.
- **Mobile lab UX** — code editing on mobile is fundamentally bad; the "open on desktop" CTA is intentional.

---

## 10. Acceptance smoke test (post-Phase 6)

1. Fresh visit → Home renders with empty rings, 0-streak, 0/75 done.
2. ⌘K → "Variables" → arrow-↵ → lesson opens with breadcrumb correct.
3. Read lesson → click ▶ on a code block → real Python output appears.
4. Hit `m` → "Mark complete" toggles → home ring fills 1/29.
5. Open a lab lesson → ⌘\ → Lab VM slides in → enter flag → captured in `/flags`.
6. Press `p` → Practice opens, due cards from completed lessons → grade Easy → due-date updates.
7. Press `g` → Progress page shows mastery heatmap.
8. Press `t` → theme flips; reload → theme persists.
9. Resize browser to 375px → bottom nav appears, sidebar drawer works, lab hidden.
10. Reset progress from palette → all local state clears, Home blank again.

---

*Plan written 2026-05-15. See [README.md](README.md) for how to run the current prototypes side-by-side.*
