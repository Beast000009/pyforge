# PyForge — Unified Platform · Execution Plan

> Single-source build plan for merging the two prototypes in this repo into one Python learning platform.
> Status: **draft v1** · 2026-05-15 · Supersedes [MERGE_PLAN.md](MERGE_PLAN.md).

---

## 0. Executive summary

We have two functional prototypes that ship the same 75-lesson Python curriculum from different angles:

- **`course/`** — content-and-pedagogy heavy: SRS, Pyodide REPL, mastery, lesson notes, light/dark theme.
- **`pyforge/`** — shell-and-UX heavy: 3-pane workspace, dashboard, ⌘K command palette, flag tracker, mobile.

The merged product is **PyForge** — PyForge's shell with course/'s pedagogy and real Python execution everywhere. It ships in 7 phases, each independently demo-able, totalling ~2 weeks of focused work plus an optional Vite/TypeScript migration.

The output lives in a new `app/` directory inside this project. Existing `pyforge/` and `course/` stay around as reference until Phase 6 ships, then become read-only archive folders.

---

## 1. Vision & non-goals

### In scope

- Single-page web app, dark by default, light theme available.
- Full 75-lesson curriculum (3 modules, real OffSec-derived content, 7 capture-the-flag labs).
- Real in-browser Python execution via Pyodide (no server).
- SRS practice (SM-2), mastery tracking, lesson notes, streak, activity heatmap.
- Resizable lab workspace, command palette, flag tracker, responsive mobile.
- Pure-localStorage persistence, schema-versioned with one-time migration.
- Zero build tooling for Phases 1–6 (Babel-in-browser). Optional Vite/TS migration in Phase 7.

### Non-goals

- No backend, no auth, no multi-device sync.
- No content authoring UI (curriculum stays in `course-data.js`).
- No PWA / offline install in initial release (could follow Phase 7 with a service worker).
- No analytics, no telemetry, no error reporting service.
- No code-grading beyond exact stdout match for flag verification.

---

## 2. Decisions log

Every open question from the merge plan, resolved.

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| D1 | Tech stack for Phases 1–6 | HTML + Babel-in-browser + React 18 UMD | Both prototypes already work this way; zero build means a coding agent can run + iterate without setup. |
| D2 | Tech stack for Phase 7+ | Vite + React 18 + TypeScript + `wouter` + plain context store (no zustand needed) | `src/` skeleton already lays this out; keeps deps minimal. |
| D3 | Course data dedup | A's `course/course-data.js` (plain JS, 2906 LOC) is canonical | Faster parse (no Babel cost), already complete with 75 lessons. |
| D4 | Pyodide cost (~6 MB) | Accept it. Lazy-load on first run anywhere. Cache via `IndexedDB` via Pyodide's built-in. Add service-worker pre-cache in Phase 7. | A already accepted this; no realistic alternative for real Python. |
| D5 | Flag difficulty | Manually tag 7 flags inline in `labStarters` with `level: "easy" \| "med" \| "hard"`. Default = "med". | Bundle B's Flag page expects difficulty; we have only 7 labs so manual tagging is cheap. |
| D6 | Light theme rollout | Ship dark-only through Phase 3. Full light coverage = Phase 4. | Keeps early phases scoped; theme is essentially cosmetic. |
| D7 | Notes on mobile | Collapsed by default below 768px; expand on tap. | Mobile screen budget. |
| D8 | Phase 7 (Vite migration) | In scope but optional. Treat as separate epic gated on user signal. | Phase 6 ships a complete product. |
| D9 | State store implementation | Tiny custom context store, A's `course-store.jsx` pattern. No zustand in prototype. | One dependency we don't need to load via UMD. |
| D10 | Routing | Single `page` enum in root state for prototype. `wouter` only after Phase 7. | Five routes; client-side enum is fine. |
| D11 | Command palette fuzzy matching | Keep B's hand-rolled `fuzzyScore` (works fine for ≤500 items) | No `fuse.js` dep needed. |
| D12 | Streak rollover | At local midnight. Missed-day = streak resets to 1 on next completion. | Matches B's existing semantics. |
| D13 | Activity heatmap shape | 12 weeks × 7 days = 84 cells, sliding window updated on completion | B's existing model. |
| D14 | Migration of legacy keys | One-shot on first store load, then delete legacy keys | Avoid double-write maintenance. |
| D15 | Greeting name | Editable `name` in store, default "you", click-to-edit in Home masthead | B's pattern. |
| D16 | Branding | PyForge orange (#e84b22) / dark navy (#0a0d14). Geist + Instrument Serif + JetBrains Mono. No OffSec references in UI. | Already validated in chat. |

---

## 3. Tech stack & directory layout

### Phases 1–6 (prototype)

```
React 18 (UMD)            via unpkg
react-dom 18 (UMD)        via unpkg
@babel/standalone 7.29    via unpkg, type="text/babel" scripts
Pyodide 0.26.x            via cdn.jsdelivr.net, lazy-loaded
Google Fonts              Geist, Instrument Serif, JetBrains Mono
```

No `package.json`, no node_modules, no bundler.

### Phase 7 (optional)

```
vite 5 + @vitejs/plugin-react
react 18 + react-dom 18
typescript 5
wouter             ~2 KB router
pyodide            6 MB lazy chunk
shiki              syntax highlighter (replaces hand-rolled tokenizer)
vitest             unit tests for store + SM-2 + fuzzy
@types/*
```

### Final directory layout

```
~/Projects/python-reviewer-web/
├── index.html              # landing page — links to app, plans, archives
├── README.md
├── PLAN.md                 # this file
├── IMPLEMENTATION_GUIDE.md # legacy reference for proposals P1–P6
│
├── app/                    # ⬅ unified product (Phase 1+)
│   ├── index.html
│   ├── styles.css
│   ├── data/
│   │   ├── course-data.js        # canonical curriculum (from course/)
│   │   └── lab-starters.js       # 7 labs, with difficulty tags
│   ├── lib/
│   │   ├── store.js              # versioned context store + SM-2
│   │   ├── pyodide-runner.js     # shared Python engine
│   │   ├── keyboard.js           # root listener + map
│   │   ├── persistence.js        # versioned localStorage + migration
│   │   └── command-registry.js   # palette actions
│   ├── components/
│   │   ├── App.jsx
│   │   ├── Sidebar.jsx
│   │   ├── TopBar.jsx
│   │   ├── HomeScreen.jsx
│   │   ├── LessonView.jsx
│   │   ├── CodeBlock.jsx
│   │   ├── QuickCheck.jsx
│   │   ├── ExerciseList.jsx
│   │   ├── LessonNotes.jsx
│   │   ├── LessonFooter.jsx
│   │   ├── LabPane.jsx
│   │   ├── PracticePanel.jsx
│   │   ├── ProgressPanel.jsx
│   │   ├── FlagsPage.jsx
│   │   ├── CommandPalette.jsx
│   │   ├── KeyboardHelp.jsx
│   │   ├── MobileNav.jsx
│   │   └── Toasts.jsx
│   └── icons.jsx                 # inline SVG icon set
│
├── pyforge/                # archive (Phase 6 → read-only)
├── course/                 # archive (Phase 6 → read-only)
├── plans/                  # improvement plan docs
└── src/                    # Vite/TS skeleton — used in Phase 7
```

---

## 4. Data contracts

### 4.1 Curriculum (from `course-data.js`)

```ts
type Course = Module[];

interface Module {
  id: string;            // "1", "2", "3"
  number: string;        // "1"
  title: string;
  sections: Section[];
}

interface Section {
  id: string;            // "1.1", "1.2"
  number: string;        // "1.1"
  title: string;
  subsections: Subsection[];
}

interface Subsection {
  id: string;            // "s1-1-1"
  number: string;        // "1.1.1"
  title: string;
  content: ContentBlock[];
  exercises?: Exercise[];
  lab?: string;          // → labStarters key
}

type ContentBlock =
  | { type: "text"; content: string }
  | { type: "heading"; content: string }
  | { type: "code"; codeBlock: { language: string; code: string; caption?: string } }
  | { type: "note"; content: string }
  | { type: "objectives"; items: string[] };

interface Exercise {
  question: string;
  answer: string;
  isLab?: boolean;       // labs are excluded from SRS card generation
}
```

### 4.2 Lab starter (`lab-starters.js`)

```ts
interface LabStarter {
  filename: string;      // e.g. "firstscript.py"
  instructions: string;
  code: string;          // starter source
  expectedOutput: string;
  flag: string;          // e.g. "PYTHON(FIRST_Script_Executed!)"
  hint?: string;
  level: "easy" | "med" | "hard";   // 🆕 manually tagged in Phase 5
  subsectionId: string;  // back-reference (e.g. "s1-1-2")
}
```

### 4.3 Store schema v1

```ts
interface StoreV1 {
  v: 1;
  // navigation
  activeId: string;       // current subsection id
  page: "home" | "lesson" | "practice" | "progress" | "flags";
  // progress
  completed: string[];    // subsection ids
  // SRS (SM-2)
  srsStates: Record<string, SrsState>;  // keyed by card id
  history:   SrsHistoryEntry[];          // capped 50
  // lesson notes
  notes: Record<string, string>;        // keyed by subsection id
  // flags
  capturedFlags: string[];               // flag strings
  flagDates:     Record<string, string>; // flag → ISO date
  // workspace
  layout: Record<string, LessonLayout>; // keyed by lesson id
  // engagement
  streak:    { count: number; lastDate: string | null };
  activity84: number[];                  // 84 cells, sliding window
  // identity & prefs
  name:  string;                         // greeting
  theme: "dark" | "light";
}

interface SrsState   { interval: number; ease: number; reps: number; dueDate: string }
interface SrsHistoryEntry { cardId: string; grade: 0 | 3 | 5; ts: number }
interface LessonLayout    { labOpen: boolean; labWidth: number; tabs?: string[] }
```

### 4.4 Migration (legacy → v1)

`lib/persistence.js` boot reads these legacy keys and folds them into `pyforge-v1`, then deletes them:

```js
const LEGACY_MAP = {
  "offsec-python-active":   "activeId",
  "offsec-python-completed":"completed",
  "offsec-py-flags":        "capturedFlags",
  "offsec-py-flag-dates":   "flagDates",
  "offsec-py-streak":       "streak",
  "offsec-py-activity":     "activity84",
  "offsec-py-layout":       "layout",
  "offsec-py-page":         "page",
  "offsec-py-lab-open":     null,    // folded into layout[*].labOpen
  "offsec-py-lab-w":        null,    // folded into layout[*].labWidth
  "pyrev-v3":               "*",     // merge whole bag
  "pyrev-completed-v2":     "completed",
  "pyrev-active-v3":        "activeId",
  "pyrev-theme":            "theme",
};
```

The migration emits a single toast: *"Restored progress from a previous session."*

---

## 5. Information architecture

### 5.1 Route table

| Route | Renders | Sidebar visible? | Lab pane available? |
|-------|---------|------------------|----------------------|
| `/` (page=home) | `HomeScreen` | yes | no |
| `/lesson/:id` (page=lesson) | `LessonView` + optional `LabPane` | yes | **yes** if lesson has `lab` field |
| `/practice` (page=practice) | `PracticePanel` | yes | no |
| `/progress` (page=progress) | `ProgressPanel` | yes | no |
| `/flags` (page=flags) | `FlagsPage` | yes | no |

In prototype, route is a `page` enum in the App component. URL is not changed (no hashbang games). Phase 7 adopts `wouter` and real URLs.

### 5.2 Page wireframes

#### Home (`/`)

```
┌────────────────────────────────────────────────────────────────────┐
│ TopBar: ⎕PyForge · breadcrumb (Home) · ⌘K · ☀/🌙 · ?           │
├──────────┬─────────────────────────────────────────────────────────┤
│          │                                                         │
│ Sidebar  │   Welcome back, [you ✎]               🔥 streak: 12d   │
│          │   ─────────────────────────────────────────────────    │
│          │                                                         │
│ search   │   ┌─Continue where you left off────────────────────┐  │
│          │   │ 1.2.3 · Lists                       ▶ Resume   │  │
│ Modules  │   └────────────────────────────────────────────────┘  │
│ • 1 …    │                                                         │
│ • 2 …    │   ┌─Modules────────────┐ ┌─Activity (12 weeks)────────┐│
│ • 3 …    │   │ ◯ Core      12/29 │ │ ▢▢▢▣▣▢▢                  ││
│          │   │ ◯ Scripting  3/17 │ │ … (84-cell heatmap)         ││
│ ─────    │   │ ◯ Security   0/29 │ │                              ││
│ Home     │   │ ◯ Overall   15/75 │ └──────────────────────────────┘│
│ Lessons  │   └────────────────────┘                                 │
│ Practice │                                                         │
│ Progress │   ┌─Practice queue──────────────────────────────────┐ │
│ Flags    │   │ 8 cards due now  →                  ▶ Practice │ │
│ Theme    │   └────────────────────────────────────────────────┘ │
│ Help     │                                                         │
└──────────┴─────────────────────────────────────────────────────────┘
```

#### Lesson (`/lesson/:id`)

```
┌────────────────────────────────────────────────────────────────────┐
│ TopBar: ⎕ · Module 1 › Section 1.1 › 1.1.3 Variables · ⌘K · ⚡ ☀ ? │
├──────────┬─────────────────────────────────┬─────────────────────┤
│ Sidebar  │ Content (max 780px)             │ Lab VM (drag-resize)│
│          │                                 │ ─ tabs ─            │
│ search   │ 1.1.3 Variables                 │ ✕ firstscript.py    │
│ ─────    │ Module 1 · Section 1.1          │ ─ editor ─          │
│ tree …   │                                 │ #!/usr/bin/python   │
│ mastery% │ Variables let you store …       │ print("…")          │
│          │                                 │ ─ output ─          │
│          │ [Objectives]                    │ Scripting is fun!   │
│          │ [code block ▶ Run ↗ Lab ⧉]    │ ─ flag form ─       │
│          │ [Note]                          │ PYTHON(...)  Submit │
│          │ Quick Check ▼                   │                     │
│          │ Exercises (3)                   │ 280–720px           │
│          │ Lesson notes ▼                  │ ⌘\ collapse         │
│          │ ────── Mark complete  ◀ ▶ ──── │                     │
└──────────┴─────────────────────────────────┴─────────────────────┘
```

#### Practice (`/practice`)

```
┌────────────────────────────────────────────────────────────────────┐
│ TopBar: ⎕ · Practice · 8 cards due · ⌘K · ☀ · ?                  │
├──────────┬─────────────────────────────────────────────────────────┤
│ Sidebar  │             Card 3 of 8                                 │
│          │   ┌────────────────────────────────────────────────┐   │
│          │   │ Q: What does len() return for a list?          │   │
│          │   │                                                │   │
│          │   │            (tap to reveal)                     │   │
│          │   │                                                │   │
│          │   │ A: The number of items in the list.            │   │
│          │   │                                                │   │
│          │   │ [ Again 1d ] [ Hard 3d ] [ Easy 6d ]          │   │
│          │   └────────────────────────────────────────────────┘   │
│          │   from lesson 1.1.7 · Lists                            │
└──────────┴─────────────────────────────────────────────────────────┘
```

#### Progress (`/progress`)

```
┌────────────────────────────────────────────────────────────────────┐
│ TopBar: ⎕ · Progress · ⌘K · ☀ · ?                                │
├──────────┬─────────────────────────────────────────────────────────┤
│          │ ──Mastery map──────────────────────                     │
│          │  ▣▣▣ ▢▢▢ … (per-section heat grid)                    │
│ Sidebar  │                                                         │
│          │ ──Module bars──────────────────────                     │
│          │  Core         ███████░░░  72%                          │
│          │  Scripting    ███░░░░░░░  29%                          │
│          │  Security     ░░░░░░░░░░   0%                          │
│          │                                                         │
│          │ ──Topic strength──────────────────                      │
│          │  strings ████  loops █████  classes ▒                  │
│          │                                                         │
│          │ ──Where to focus──────────────────                      │
│          │  • Loops      → drill 5 cards   ▶                     │
│          │  • Functions  → re-read 1.4.2   ▶                     │
└──────────┴─────────────────────────────────────────────────────────┘
```

#### Flags (`/flags`)

```
┌────────────────────────────────────────────────────────────────────┐
│ TopBar: ⎕ · Flags · 4 / 7 captured · ⌘K · ☀ · ?                  │
├──────────┬─────────────────────────────────────────────────────────┤
│ Sidebar  │ ┌─── easy ───┐ ┌─── easy ───┐ ┌─── med ────┐           │
│          │ │ ✔ 1.1.2    │ │ ✔ 1.1.5    │ │ ✔ 1.1.8    │           │
│          │ │ FIRST_…    │ │ Slicing_…  │ │ It_is_V…  │           │
│          │ │ 2026-05-10 │ │ 2026-05-12 │ │ 2026-05-12 │           │
│          │ │ ▶ Replay   │ │ ▶ Replay   │ │ ▶ Replay   │           │
│          │ └────────────┘ └────────────┘ └────────────┘           │
│          │ ┌─── med ────┐ ┌─── hard ───┐ …                         │
│          │ │ ⊘ 1.1.9    │ │ ⊘ 1.7.4    │                          │
│          │ │ locked     │ │ locked     │                          │
│          │ └────────────┘ └────────────┘                           │
└──────────┴─────────────────────────────────────────────────────────┘
```

### 5.3 Mobile breakpoints

| Width | Behavior |
|-------|----------|
| ≤ 768px | Sidebar becomes off-canvas drawer (☰). Top bar collapses to brand + ⌘K + ☰. Lab pane hidden — code blocks show "Open on desktop" CTA in place of inline Run. Bottom nav (Home · Learn · Practice · Flags · ⋯). Content padding tightens to 20px. |
| ≤ 500px | Breadcrumb truncates to last segment. Quick-check & notes collapsed by default. |

---

## 6. Component inventory

Numbered for cross-reference. Each row lists: source files (existing prototype to lift from), props, and the merged behavior.

| # | Component | Source | Props | Behavior |
|---|-----------|--------|-------|----------|
| C1 | `App` | rewrite (basis: [pr-app.jsx](pyforge/pr-app.jsx)) | — | Root. Owns `page` enum, mounts store provider, mounts root keyboard listener, renders `<TopBar>`, `<Sidebar>`, page, `<CommandPalette>`, `<KeyboardHelp>`, `<Toasts>`. |
| C2 | `Sidebar` | merge of [pr-sidebar.jsx](pyforge/pr-sidebar.jsx) + [course-sidebar.jsx](course/course-sidebar.jsx) | `activeId, onSelect, completed, dueCount, masteryByModule, isOpen, onClose` | Search input (focuses on ⌘K when palette is off / falls through to palette when on). Module tree with mastery % badge. Action rail: Home · Practice (N due) · Progress · Flags · Theme · Help. Off-canvas under 768px. |
| C3 | `TopBar` | merge of `WorkspaceTopBar` (B) + course top bar | `mod, sec, sub, page, onPaletteOpen, onLabToggle, onThemeToggle, onHelp` | Breadcrumb (or page name), action buttons. Hamburger ☰ under 768px. |
| C4 | `HomeScreen` | basis [pr-home.jsx](pyforge/pr-home.jsx) | `onNavigate, name, onRename` | Greeting (editable), streak badge, continue card, module rings, activity heatmap, due-cards CTA card. |
| C5 | `LessonView` | merge of [pr-lesson.jsx](pyforge/pr-lesson.jsx) + [course-content.jsx](course/course-content.jsx) | `module, section, subsection, completed, onMarkComplete, onNavigate, onOpenLab, onCopyToLab` | Title + meta. Render content blocks. Optional QuickCheck. ExerciseList. LessonNotes. LessonFooter. |
| C6 | `CodeBlock` | basis: PyForge's enhanced block | `language, code, caption` | Hand-rolled tokenizer (keep B's). Buttons: ▶ Run (inline output via shared Pyodide runner), ↗ Lab (copy into LabPane), ⧉ Copy. |
| C7 | `QuickCheck` | extract from [course-content.jsx](course/course-content.jsx) | `question, answer` | Single-question reveal box, blue accent. Rendered only if `subsection.exercises[0]` exists and isn't a lab. |
| C8 | `ExerciseList` | merge from both lesson views | `exercises, onOpenLab` | Numbered list. For each: question + "Show answer" reveal. If `isLab`, render "Open in Lab ↗" button instead of inline flag form. |
| C9 | `LessonNotes` | extract from [course-content.jsx](course/course-content.jsx) | `subsectionId` | Collapsible textarea, persisted via store. Auto-saves on debounce. |
| C10 | `LessonFooter` | both | `done, onToggle, onPrev, onNext` | Mark complete button (toggles `done` state styling), prev/next nav. |
| C11 | `LabPane` | merge of [pr-lab.jsx](pyforge/pr-lab.jsx) + [course-repl.jsx](course/course-repl.jsx) | `starter, onFlagCaptured, onClose, width, onResizeStart` | Right pane. Multi-tab editor (B). Symbol toolbar (both). Run button uses shared runner (A). Output panel. Flag form: submit checks `expectedOutput` match → marks captured. ⌘⇧↵ runs. Resizable handle on left edge (B). |
| C12 | `PracticePanel` | lift [course-practice.jsx](course/course-practice.jsx) | `onBack` | SRS deck driven by `derived.dueCards`. Per-card: tap-to-reveal answer, Again/Hard/Easy buttons (grade 0/3/5). Session complete screen. |
| C13 | `ProgressPanel` | lift [course-progress.jsx](course/course-progress.jsx) | `onBack, onNavigate` | Mastery heatmap, module bars, topic strength grid, "where to focus" picks (computed from low-mastery sections × high-due-cards). |
| C14 | `FlagsPage` | basis [pr-flags.jsx](pyforge/pr-flags.jsx) | `capturedFlags, flagDates, onReplay` | Card grid grouped by difficulty. Locked silhouettes for un-captured. Replay opens the corresponding lab. |
| C15 | `CommandPalette` | basis [pr-palette.jsx](pyforge/pr-palette.jsx) | `onClose, onNavigate, onAction` | Fuzzy search across lessons + registered commands (see §7.4). ↑↓↵ nav, Esc close. |
| C16 | `KeyboardHelp` | lift from [course-app.jsx](course/course-app.jsx) | `onClose` | Modal listing merged shortcut map. |
| C17 | `MobileNav` | basis from PyForge | `page, onNavigate` | Bottom nav under 768px: Home · Learn · Practice · Flags · ⋯ (drawer toggle). |
| C18 | `Toasts` | new | `messages` | Stacked bottom-left toast bin. Used for migration notice, "Flag captured!", "Notes saved", etc. |

---

## 7. Cross-cutting systems

### 7.1 Theme tokens (`styles.css`)

```css
:root {
  /* surfaces */
  --bg:         #0a0d14;
  --bg-2:       #10161e;
  --sidebar-bg: #0b0f15;
  --card:       #141a24;
  --card-2:     #1a2030;
  --border:     #1e2837;
  --border-2:   #253040;

  /* text */
  --text:       #dde4ed;
  --text-2:     #8b98a9;
  --text-3:     #5a6677;

  /* brand */
  --primary:        #e84b22;
  --primary-dim:    rgba(232,75,34,0.12);
  --primary-border: rgba(232,75,34,0.35);

  /* semantic */
  --ok:   #4ade80;
  --warn: #fbbf24;
  --err:  #f87171;
  --blue: #60a5fa;

  /* code */
  --code-bg:     #0d1117;
  --code-border: #1e293b;

  /* type */
  --font:  'Geist', ui-sans-serif, system-ui, sans-serif;
  --mono:  'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --serif: 'Instrument Serif', ui-serif, serif;

  /* layout */
  --sidebar-w: 240px;
  --header-h:  48px;
  --lab-min:   280px;
  --lab-max:   720px;
}

body.light { /* full overrides, Phase 4 */ }
```

### 7.2 Keyboard system (`lib/keyboard.js`)

Single root `keydown` listener. Routes by:
- `isTyping(e)` guard (skip when target is INPUT/TEXTAREA/contentEditable, except for ⌘-prefix shortcuts).
- Modifier key first (⌘/Ctrl), then plain keys.
- Map declared once; consumed by `App` and rendered by `KeyboardHelp`.

```js
const SHORTCUTS = [
  { key: "Meta+k",       global: true,             action: "palette.toggle" },
  { key: "Meta+\\",      global: true,             action: "lab.toggle" },
  { key: "Meta+Shift+Enter", scope: "lab",          action: "lab.run" },
  { key: "j",            global: true,             action: "lesson.next" },
  { key: "ArrowRight",   global: true,             action: "lesson.next" },
  { key: "k",            global: true,             action: "lesson.prev" },
  { key: "ArrowLeft",    global: true,             action: "lesson.prev" },
  { key: "m",            global: true,             action: "lesson.toggle-complete" },
  { key: "p",            global: true,             action: "page.practice" },
  { key: "g",            global: true,             action: "page.progress" },
  { key: "t",            global: true,             action: "theme.toggle" },
  { key: "?",            global: true,             action: "help.toggle" },
  { key: "Escape",       global: true,             action: "modal.close" },
];
```

### 7.3 Pyodide runner (`lib/pyodide-runner.js`)

Singleton, lazy-loaded on first call. One source of truth for all Python execution.

```js
let _pyo = null, _loading = null;

export async function getPyodide() {
  if (_pyo) return _pyo;
  if (_loading) return _loading;
  _loading = (async () => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    document.head.appendChild(script);
    await new Promise(r => script.onload = r);
    _pyo = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
    });
    return _pyo;
  })();
  return _loading;
}

export async function runPython(code) {
  const py = await getPyodide();
  let stdout = "", stderr = "";
  py.setStdout({ batched: (s) => stdout += s });
  py.setStderr({ batched: (s) => stderr += s });
  try {
    await py.runPythonAsync(code);
    return { ok: true, stdout, stderr };
  } catch (e) {
    return { ok: false, stdout, stderr: stderr + String(e) };
  }
}
```

Used by:
- `CodeBlock.onRun` (inline ▶ Run).
- `LabPane.onRun` (replaces simulator).
- Future programmatic checks (out of scope).

### 7.4 Command palette registry (`lib/command-registry.js`)

Static list of commands; lesson navigation is appended dynamically.

```js
export const COMMANDS = [
  { id: "nav.home",      title: "Go to Home",        kind: "nav",   action: "page.home" },
  { id: "nav.practice",  title: "Open Practice",     kind: "nav",   action: "page.practice", badge: () => dueCount() },
  { id: "nav.progress",  title: "Open Progress",     kind: "nav",   action: "page.progress" },
  { id: "nav.flags",     title: "Open Flags",        kind: "nav",   action: "page.flags" },
  { id: "lab.toggle",    title: "Toggle Lab pane",   kind: "action",action: "lab.toggle" },
  { id: "theme.toggle",  title: "Toggle dark/light", kind: "action",action: "theme.toggle" },
  { id: "lesson.mark",   title: "Mark complete",     kind: "action",action: "lesson.toggle-complete" },
  { id: "help.show",     title: "Keyboard shortcuts",kind: "action",action: "help.toggle" },
  { id: "data.reset",    title: "Reset all progress",kind: "danger",action: "store.reset" },
];
```

### 7.5 Persistence layer (`lib/persistence.js`)

- One read on boot → migrate legacy keys → write back v1 bag → delete legacy keys.
- All writes throttled (200ms debounce per key).
- Reads are synchronous from in-memory cache once boot is done.

### 7.6 Toast system (`components/Toasts.jsx`)

```js
window.dispatchEvent(new CustomEvent("toast", { detail: { msg: "...", kind: "ok"|"warn"|"err" } }));
```

`<Toasts>` subscribes, renders, auto-dismisses after 3s.

### 7.7 Streak & activity

On every `markComplete(id)` that **adds** (not removes) an id:
1. `today = new Date().toDateString()`
2. If `streak.lastDate === today` → no streak change.
3. Else if `streak.lastDate === yesterday` → `count + 1`. Else → `count = 1`.
4. `activity84[83] += 1`.
5. On a date rollover the activity buffer slides left by `daysSince(lastBucketDate)` (computed lazily on render to avoid drift).

---

## 8. Feature merge matrix (unchanged from §2 of [MERGE_PLAN.md](MERGE_PLAN.md) — kept here for self-containment)

See [MERGE_PLAN.md#2-feature-audit-the-merge-matrix](MERGE_PLAN.md) for the full table. No edits needed — the decisions still stand.

---

## 9. Phased delivery

Every phase ships in `app/` and is independently demo-able. The branch convention is `phase-N` for each.

---

### Phase 1 — Foundation: shell + unified store · **~1.5 days**

**Goal**: A working `app/` directory that visually matches `pyforge/` exactly, but is powered by the new versioned store with legacy migration.

**Tasks**

1. `mkdir -p app/{components,lib,data}`; copy `course/course-data.js` → `app/data/course-data.js`.
2. Convert `pyforge/pr-data.jsx`'s `LAB_STARTERS` block into `app/data/lab-starters.js` (plain JS, ES2017). Strip duplicate course data — only labStarters survive.
3. Create `app/lib/persistence.js` with the migration table from §4.4.
4. Create `app/lib/store.js`. Port `course/course-store.jsx`'s SM-2 + provider; extend the bag with B's fields (D14). Add `actions.captureFlag`, `actions.setLayout`, `actions.setName`, `actions.setTheme`, `actions.resetAll`.
5. Create `app/index.html` mirroring `pyforge/index.html`, but pointing at `app/styles.css` and the new file paths.
6. Copy & rename: `pyforge/pr-styles.css` → `app/styles.css`; do a global rename of class names (drop `pr-` prefix).
7. Port each `pyforge/pr-*.jsx` into `app/components/*.jsx`, replacing `window.LS` and `OLD_KEYS` with `useStore()` from the new store.
8. Wire root keyboard listener using `app/lib/keyboard.js`.
9. Write `app/index.html` + smoke-load it via `python3 -m http.server 5174`.

**Acceptance**
- `app/index.html` renders identically to `pyforge/index.html`.
- DevTools localStorage shows only `pyforge-v1` after first load. Legacy keys gone.
- Reload preserves active lesson, completed set, captured flags.

**Risks**
- The lab-starter strip from `pr-data.jsx` is the only data work — verify all 7 entries survived.

---

### Phase 2 — Pedagogy drop-in: Practice + Progress + Notes + QuickCheck · **~2 days**

**Goal**: Mount A's pedagogy features into the PyForge shell.

**Tasks**

1. Port `course/course-practice.jsx` → `app/components/PracticePanel.jsx`. Replace its `useCourseStore` calls with the new store. Drop the back-button (route via store/page state).
2. Port `course/course-progress.jsx` → `app/components/ProgressPanel.jsx`. Drop redundant streak block (Home already shows it).
3. Extract `LessonNotes` from `course/course-content.jsx` (lines defining textarea + persistence) → `app/components/LessonNotes.jsx`. Wire to `state.notes[subsectionId]`.
4. Extract `QuickCheck` similarly → `app/components/QuickCheck.jsx`. Renders only when `subsection.exercises[0]` exists and isn't a lab.
5. Modify `app/components/LessonView.jsx`:
   - After content blocks, before `ExerciseList`: render `<QuickCheck>`.
   - After `ExerciseList`: render `<LessonNotes>`.
6. Modify `app/components/Sidebar.jsx`: add bottom action rail (Home · Practice (N due) · Progress · Flags · Theme · Help). Wire to store actions/page setter.
7. Add `p`, `g` to keyboard map (already in `lib/keyboard.js`, just hook handlers).
8. Add palette entries `nav.practice`, `nav.progress` (already declared, just verify dispatch).

**Acceptance**
- `p` opens Practice. `g` opens Progress.
- Practice deck reflects `derived.dueCards` from real exercise data.
- Lesson notes textarea persists per subsection.
- Quick Check shows above exercises on lessons that have any.

**Risks**
- ProgressPanel's "where to focus" needs `moduleMastery` × `dueCards` cross-ref — verify in store derived getters.

---

### Phase 3 — Real Python everywhere · **~1 day**

**Goal**: Replace every simulated execution with the shared Pyodide runner.

**Tasks**

1. Create `app/lib/pyodide-runner.js` from §7.3.
2. Modify `app/components/CodeBlock.jsx`:
   - Add ▶ Run button (state: idle/loading/output).
   - On click → `runPython(props.code)` → show inline output panel below the block.
   - First-run shows a spinner ~4–8s while Pyodide loads.
3. Modify `app/components/LabPane.jsx`:
   - Replace `simulateRun()` (`pr-lab.jsx:7-44`) with `runPython(editorCode)`.
   - Keep the flag verification: `result.stdout.trimEnd() === starter.expectedOutput.trimEnd()` → call `onFlagCaptured`.
   - Keep symbol toolbar, tabs, resize handle.
   - Wire ⌘⇧↵ to `runPython`.

**Acceptance**
- `print(2+2)` in any inline code block prints `4`.
- The Lab's "Run" button runs the same engine; flag verification still works.
- Pyodide loads exactly once per session (singleton check).

**Risks**
- Pyodide CDN 0.26.4 must support `setStdout({batched})`. Verified via Pyodide docs.

---

### Phase 4 — Theme + sidebar polish · **~1 day**

**Goal**: Full light-theme parity + mastery % in sidebar tree.

**Tasks**

1. Port `body.light` rules from `course/course-styles.css:859-877` into `app/styles.css`. Extend to cover B-specific components (workspace, lab pane, palette, flags page, mobile nav).
2. Add ☀/🌙 button in TopBar; persist via `state.theme`; toggle `body.light` class on root.
3. Modify `app/components/Sidebar.jsx`:
   - Each module row: append a mastery chip (`% color-coded`: green >70, amber 30–70, yellow <30).
   - Compute via `derived.moduleMastery`.
4. Add `t` key handler (already in map).

**Acceptance**
- `t` toggles theme. Reload preserves choice.
- Every UI surface (workspace, palette, flags, mobile nav) renders correctly in both themes.
- Sidebar shows live mastery % per module.

**Risks**
- Light theme for the lab pane (dark editor) is the trickiest — likely keep editor area dark in both themes.

---

### Phase 5 — Command palette extensions + flag difficulty · **~0.5 day**

**Goal**: Palette becomes the universal navigation. Flag Tracker shows difficulty.

**Tasks**

1. Modify `app/lib/command-registry.js`: ensure all entries from §7.4 dispatch correctly.
2. Modify `app/components/CommandPalette.jsx`:
   - Render `badge` field for `nav.practice` (due count).
   - Style `kind: "danger"` rows in red.
3. Modify `app/data/lab-starters.js`: add `level: "easy"|"med"|"hard"` to each of the 7 entries (manual judgment).
4. Modify `app/components/FlagsPage.jsx`: group cards by difficulty; show difficulty chip on each card.

**Acceptance**
- `⌘K → "due"` → highlights Practice with the badge `(N due)`; Enter goes there.
- `⌘K → "reset"` → confirms then wipes the store.
- `/flags` shows three difficulty buckets with correctly-tagged cards.

**Risks**
- Difficulty tagging is subjective — keep it simple (easy=print/slicing, med=type-cast/loop, hard=spider/server).

---

### Phase 6 — Mobile + final polish · **~1 day**

**Goal**: Full responsive parity through 375px.

**Tasks**

1. Verify `≤768px` rules in `app/styles.css` cover every new surface (Practice, Progress, Flags).
2. Modify `app/components/MobileNav.jsx`: 5 entries — Home · Learn · Practice · Flags · ⋯ (drawer toggle).
3. Modify `app/components/CodeBlock.jsx`: under 768px, hide ▶ Run, show "Open on desktop to run" hint.
4. Modify `app/components/LessonView.jsx`: collapse Notes by default under 768px.
5. Polish pass: verify drawer closes after each navigation, palette closes on selection, toasts position correctly.
6. Move `pyforge/` and `course/` into a top-level `archive/` directory; update `index.html` landing page.
7. Update [README.md](README.md) to point at `app/` as the canonical product.

**Acceptance**
- Full acceptance smoke test (§10) passes at 375×667.
- Landing page shows `app/` as primary; old prototypes as "archive".

---

### Phase 7 — Vite + TypeScript migration · *optional* · **~3–4 days**

**Goal**: Move from Babel-in-browser to a real build for production.

**Tasks**

1. `npm create vite@latest app-ts -- --template react-ts` in the project root.
2. Move `app/components/*.jsx` → `app-ts/src/components/*.tsx`. Add types from §4.
3. Move `app/data/course-data.js` → `app-ts/src/data/courseData.ts` (use the existing skeleton at [`src/data/courseData.ts`](src/data/courseData.ts) as a starting point — it's already typed).
4. Move `app/lib/*.js` → `app-ts/src/lib/*.ts`.
5. Replace `page` enum with `wouter` routes (`/`, `/lesson/:id`, `/practice`, `/progress`, `/flags`).
6. Replace hand-rolled code-block tokenizer with `shiki`.
7. Add Vitest suites for `store`, `sm2`, `fuzzyScore`, `migration`.
8. Add a service worker that pre-caches Pyodide so the first run isn't a cold load.

**Acceptance**
- `npm run dev` boots in <2s.
- `npm run build` produces a `<400KB` JS bundle (excluding Pyodide).
- All 75 lessons + 7 flags work as before.
- Vitest: 100% pass.

---

## 10. Acceptance smoke test (run end-of-Phase 6)

1. Fresh visit (cleared localStorage) → Home renders: empty rings, 0-streak, 0/75 done, "0 cards due".
2. Click "Continue" → first lesson loads → breadcrumb correct.
3. ⌘K → type "variab" → Enter on "1.1.3 Variables" → lesson opens.
4. Click ▶ on a code block → spinner → real Python output appears.
5. Hit `m` → "Mark complete" toggles → home shows 1/29 in Core ring.
6. Open a lab lesson (1.1.2) → click "Open in Lab" or ⌘\ → Lab pane slides in → tab shows `firstscript.py`.
7. Edit code to match expected → ⌘⇧↵ → output `Python is fun!` → flag form auto-fills → submit → captured.
8. `/flags` → shows captured chip with today's date.
9. Press `p` → Practice opens → grade a card Easy → due date increments.
10. Press `g` → Progress page shows mastery heatmap reflecting the completed lesson.
11. Press `t` → theme flips light → reload → still light.
12. Resize to 375×667 → bottom nav appears, drawer toggles, lab hidden, code blocks show CTA.
13. ⌘K → "reset all progress" → confirm → reload → back to fresh state.

---

## 11. Performance budget

| Budget | Target | Why |
|--------|--------|-----|
| First paint (cold cache) | < 1.5s on cable broadband | React + Babel UMD ~250KB gzip; CSS small. |
| Pyodide first-run latency | < 8s on broadband; cached after | Acceptable for a learning tool. |
| Time-to-interactive | < 2s after first paint | App is mostly static rendering. |
| Bundle size (Phase 7) | < 400KB main chunk | Vite + tree-shake + no UMD. |
| localStorage size | < 100KB typical | 75 lessons × small SRS state + notes is well under. |

---

## 12. Accessibility checklist

- [ ] All interactive elements keyboard reachable; visible focus rings.
- [ ] Sidebar tree is `role="tree"` with `aria-expanded` on toggles.
- [ ] Modals trap focus and restore on close (palette, help, kbd).
- [ ] Color contrast ≥ 4.5:1 for text in both themes.
- [ ] Lab pane editor announces line/column on `aria-live`.
- [ ] Flag form labeled; success/error have `role="status"`/`role="alert"`.
- [ ] Run buttons announce loading state via `aria-busy`.

---

## 13. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Legacy localStorage shapes vary across users | Med | Med | Migration is read-only on legacy; defensive parsing; wrapped in try/catch with toast on failure. |
| Pyodide CDN downtime | Low | High | Pyodide-dependent UI degrades gracefully ("Python engine unavailable"). Phase 7 SW pre-cache fixes. |
| Light-theme regressions on workspace | High | Low | Phase 4 gated on a manual sweep of every page in both themes. |
| Mobile editor UX is bad | Cert. | Low | Intentional non-goal; CTA to desktop. |
| Babel-in-browser performance on huge `course-data.js` (2906 LOC) | Low | Med | Already vetted in both prototypes. Phase 7 builds it away. |
| Drift between `app/` and `pyforge/`/`course/` during phases 1–5 | Med | Low | Archive originals into `archive/` at Phase 6; don't try to backport. |

---

## 14. Appendix A — File inventory delta

### New files (created in `app/`)

```
app/index.html
app/styles.css
app/data/course-data.js
app/data/lab-starters.js
app/lib/store.js
app/lib/persistence.js
app/lib/pyodide-runner.js
app/lib/keyboard.js
app/lib/command-registry.js
app/components/App.jsx
app/components/Sidebar.jsx
app/components/TopBar.jsx
app/components/HomeScreen.jsx
app/components/LessonView.jsx
app/components/CodeBlock.jsx
app/components/QuickCheck.jsx
app/components/ExerciseList.jsx
app/components/LessonNotes.jsx
app/components/LessonFooter.jsx
app/components/LabPane.jsx
app/components/PracticePanel.jsx
app/components/ProgressPanel.jsx
app/components/FlagsPage.jsx
app/components/CommandPalette.jsx
app/components/KeyboardHelp.jsx
app/components/MobileNav.jsx
app/components/Toasts.jsx
app/components/icons.jsx
```

### Moved at end of Phase 6

```
pyforge/   →  archive/pyforge/
course/    →  archive/course/
```

### Untouched

```
plans/
src/                 # used in Phase 7 only
IMPLEMENTATION_GUIDE.md
README.md            # updated only to repoint landing page
PLAN.md              # this file
MERGE_PLAN.md        # kept for historical reference
```

---

## 15. Glossary

- **SM-2** — SuperMemo 2, the spaced repetition algorithm A implements. Grade 0=Again, 3=Hard, 5=Easy. Each card carries `interval`, `ease`, `reps`, `dueDate`.
- **Mastery %** — completed-subsections / total-subsections, per module. Phase 4 surfaces this in the sidebar.
- **Workspace shell** — the lesson-view layout with the resizable lab pane.
- **Lab VM** — the right-pane editor + Pyodide runner + flag form.
- **Streak** — consecutive days with at least one lesson completion. Resets after a missed day.
- **Activity heatmap** — 12-week × 7-day grid of completion counts.
- **Command palette** — modal launched by ⌘K; fuzzy search across lessons + registered commands.
- **Capture flag** — submitting the correct expected output for a lab unlocks the flag string and records the date.

---

*End of plan. Next action: confirm scope or amend §2 (decisions log), then begin Phase 1.*

---

## 16. Phase 8 (future) — Docker-backed lab environment

Pyodide handles 5 of 7 labs cleanly. Two labs need a real environment:

| # | Lab | Why Pyodide doesn't cut it |
|---|-----|----------------------------|
| 6 | `server_test.py` (TCP server on :8080) | Needs `socket.bind()` + a client to connect — currently uses `MockSocket` |
| 7 | `spider.py` (crawl 192.168.58.101) | Needs `requests.get()` + reachable HTTP target — currently uses inline HTML fixture |

For an OffSec-PG-Practice-grade experience, route the lab pane to per-user Docker containers. **Inline code blocks in lessons stay on Pyodide** — they need to be instant and don't require networking.

### Architecture

```
Browser ──WebSocket──▶ lab-server (Node + Express + ws + dockerode)
                              │
                              └──docker.sock──▶ pyforge-lab:python3-kali (user shell)
                                              ▶ pyforge-target-www (mock 192.168.58.101)
                                              ▶ pyforge-target-tcp  (client for lab 6 verify)
                                              Network: pyforge-net
```

### File layout

```
lab-server/
  package.json          # express, ws, dockerode, node-pty
  server.js             # API + WS terminal
  check_flag.js         # diff stdout against expected, return flag
  images/
    lab.Dockerfile      # python:3.12-slim + requests, bs4, vim, nmap, curl, /workdir
    target-www.Dockerfile  # nginx + fixture HTML at /
  docker-compose.yml    # base network + target containers
  .env.example          # PORT, LAB_IMAGE_TAG, IDLE_TIMEOUT_MIN
```

### API surface

| Method | Path | Body | Returns |
|--------|------|------|---------|
| POST | `/labs/:id/session` | — | `{ sessionId, wsUrl }` |
| DELETE | `/labs/:id/session/:sid` | — | `204` |
| WS | `/labs/:id/term/:sid` | binary frames | pty stdin/stdout |
| GET | `/labs/:id/files/:path` | — | file contents |
| POST | `/labs/:id/files/:path` | `{ content }` | `204` |
| POST | `/labs/:id/verify` | `{ filename }` | `{ ok, stdout, flag? }` |

### Lifecycle

1. **Start** — client `POST /labs/s1-1-2/session`. Server spawns `pyforge-lab` with `--memory=256m --cpus=0.5 --network=pyforge-net`, mounts a tmpfs `/workdir`. Returns `sessionId`. Lab 7 also spawns `pyforge-target-www` if not running.
2. **Edit** — client `POST /labs/.../files/spider.py` saves edits.
3. **Run** — WS terminal streams a real bash session. Client types `python3 spider.py`.
4. **Verify** — client `POST /labs/.../verify`. Server runs the script in the container, diffs stdout vs `expectedOutput`, returns flag on match.
5. **Idle GC** — sessions with no WS frames for 30 min are killed and reclaimed.

### Frontend changes

- `LabPane.jsx` gets two backends behind a flag: `pyodide` (current) and `docker` (new). Per-lab override in `LAB_STARTERS[id].backend = 'docker'`.
- Add **xterm.js** (CDN) for the terminal in docker mode; current `<div>` terminal stays for pyodide mode.
- Replace `MockSocket` block in lab 6 starter with real `socket.socket()` code; lab 7 starter uses `requests.get(BASE)` against the container target.
- Status pill shows container state (starting · ready · idle · stopped).

### Security posture

- Local-only by default: `lab-server` binds `127.0.0.1`. No auth needed.
- Containers run as non-root, no `--privileged`, no docker socket mount inside.
- Network is a single bridge `pyforge-net` — user container can reach targets but not host or internet (unless `--network=bridge` whitelist).
- Filesystem: tmpfs `/workdir`, no host mounts.

### Effort

~10–12 hrs total. Each step shippable independently:

| Step | Hrs | What ships |
|------|-----|-----------|
| 1. Scaffold `lab-server/` + image | 2 | `curl localhost:3000/health` works |
| 2. Session API + dockerode lifecycle | 2 | `POST /session` spawns, idle GC kills |
| 3. WS + node-pty + xterm.js wiring | 2 | Real bash terminal in browser |
| 4. Files API + verify endpoint | 1.5 | Save + run + flag check round-trip |
| 5. Target container for lab 7 | 1 | `curl 192.168.58.101` from user ctr |
| 6. LabPane backend switch + per-lab routing | 2 | Labs 6/7 route to docker, 1–5 stay on pyodide |
| 7. Polish: status pill, resume from saved state, error handling | 1.5 | Production-feel UX |

### Open questions to resolve before starting

1. **Single-user or shared?** If shared, add JWT auth + rate limits + per-user resource quotas.
2. **Lab persistence** — should `/workdir` snapshot to disk so users can resume across days? Adds ~30 min to step 7.
3. **Inline code in lessons** — keep on Pyodide (recommended), or also offer "Run in lab" button that opens the docker session? The latter is more authentic but adds latency.

Defer this phase until pyodide-mode labs are validated by real users. The simulations are functionally correct — Docker buys authenticity and network primitives, not correctness.
