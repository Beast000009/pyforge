# Python Reviewer — Implementation Guide

## Overview
Full implementation of 6 proposals from the Improvement Plan. This guide outlines the architecture changes and deliverables for each phase.

### Project Structure
- **Source**: `artifacts/python-course/src/`
- **Target**: Modifications to the existing codebase
- **Brand**: OffSec orange (#e84b22), dark navy (#0a0d14), Geist/Fira Code/Instrument Serif

---

## Phase 1: Foundation (P1 — Workspace Shell)

### What changes
- App layout becomes a 3-pane resizable workspace instead of 2-pane with fixed Lab panel
- ContentArea + LabVM merge into a unified workspace with draggable resize handle
- Layout (widths, visibility) persists to localStorage per lesson

### Files to modify
1. **App.tsx** — Add layout state, keyboard shortcuts (⌘\, ⌘⇧⏎)
2. **LabVM.tsx** — Convert from fixed bottom panel to dockable pane; remove container styles
3. **ContentArea.tsx** — Adjust to flex-column within the main content pane
4. **New: hooks/useWorkspaceLayout.ts** — Persist + read layout per lesson
5. **index.css** — Add workspace grid styles, resizer styles

### Key implementation details
- Sidebar stays fixed left (240px)
- Workspace container: `display: grid; grid-template-columns: 1fr 5px labWidth`
- Resizer: 5px wide, `cursor: col-resize`, with onMouseDown drag logic
- Lab tabs: show multiple .py files open; ⌘W to close, ⌘T to new
- Status pill: always visible in lab header (runtime version, flag chip)

---

## Phase 2: Home + Dashboard (P2)

### What changes
- / route no longer auto-redirects to first lesson
- New Home page with progress dashboard
- Module completion rings (% per module)
- 12-week activity heatmap
- "Continue where you left off" card
- Daily streak counter

### Files to create/modify
1. **New: pages/Home.tsx** — Dashboard layout
2. **App.tsx** — Add /home route, change / redirect logic
3. **New: hooks/useProgress.ts** — Calculate streak, completion stats
4. **New: components/ProgressRing.tsx** — SVG ring chart
5. **New: components/ActivityHeatmap.tsx** — 12-week grid

---

## Phase 3: Command Palette (P3)

### What changes
- Global ⌘K opens a modal command palette
- Fuzzy-search across lessons, objectives, flags, actions
- Keyboard navigation (↑↓, ↵ to select)
- Recent + pinned items at top

### Files to create/modify
1. **New: components/CommandPalette.tsx** — Modal + search logic
2. **App.tsx** — Register ⌘K listener, render portal
3. **New: hooks/useFuzzySearch.ts** — fzf-style scoring

---

## Phase 4: Interactive Code (P4)

### What changes
- CodeBlock gains syntax highlighting, inline run, copy-to-lab buttons
- New code execution pipeline (no full Lab VM)
- Tokenizer: Shiki or highlight.js

### Files to modify
1. **components/CodeBlock.tsx** — Add syntax highlighting, action buttons, inline output
2. **New: hooks/useInlineRun.ts** — Execute snippet via Pyodide
3. **index.css** — Add code block styles

---

## Phase 5: Flag Tracker (P5)

### What changes
- New /flags route with scoreboard
- Cards for each flag (locked/unlocked, difficulty, source lab)
- Stats: total, easy/med/hard counts
- Replay button links back to lab

### Files to create/modify
1. **New: pages/Flags.tsx** — Scoreboard layout
2. **App.tsx** — Add /flags route
3. **data/labStarters.ts** — Add difficulty + tag fields
4. **New: hooks/useCapturedFlags.ts** — Read localStorage, compute stats

---

## Phase 6: Mobile Companion (P6)

### What changes
- Responsive breakpoint: ≤768px switches to mobile layout
- Off-canvas sidebar drawer
- Read-only code blocks (no inline run)
- "Resume on desktop" deep-link button
- Mobile nav bar (home, learn, flags, notes tabs)

### Files to modify
1. **App.tsx** — Detect mobile, swap layouts
2. **Sidebar.tsx** — Add drawer toggle
3. **ContentArea.tsx** — Hide Lab VM on mobile
4. **components/CodeBlock.tsx** — Conditional run button
5. **index.css** — Mobile breakpoint styles

---

## Storage Schema

### Existing (keep)
- `offsec-python-completed`: Set<string> of completed subsection IDs
- `offsec-python-active`: Current subsection ID

### New
- `offsec-python-layout`: `{ lessonId: { contentWidth, labWidth, labOpen } }`
- `offsec-python-flags`: `{ flagId: captureDate }` (localStorage already used; sync with onFlagCaptured)
- `offsec-python-notes`: `{ subsectionId: text }` (for notes feature, P6+)
- `offsec-python-streak`: `{ lastDate, count }` (updated on any lesson completion)

---

## Keyboard Shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| ⌘K | Open command palette | Global |
| ⌘\\ | Toggle Lab VM visibility | Lesson page |
| ⌘⇧⏎ | Run Lab code | Lab focused |
| ↑ / ↓ | Previous/next lesson | Lesson + search mode |
| j / k | Navigate (vim-style) | Global |
| ↵ | Select palette item | Palette open |
| Esc | Close palette | Palette open |

---

## Testing Checklist

- [ ] Resize workspace; reload; widths persist
- [ ] Open multiple lab files; close tabs; ⌘T creates new
- [ ] Dashboard loads on /; module rings update as you complete lessons
- [ ] ⌘K opens palette; fuzzy search finds lessons; select navigates
- [ ] Code blocks have syntax highlight; run button appears; output shows
- [ ] /flags shows all flags; locked silhouettes for un-captured
- [ ] Mobile: sidebar off-canvas; code read-only; resume button works
- [ ] Streak resets at midnight; heatmap updates on activity

---

## Dependencies (already in package.json)
- `lucide-react` — icons
- `framer-motion` — animations (if needed)
- `@tanstack/react-query` — data fetching
- `wouter` — routing
- `zod` — validation (if needed)

**May need to add**:
- `shiki` or `highlight.js` — code syntax highlighting
- `fuse.js` — fuzzy search (optional; can hand-roll)

---

## Effort Estimate
- P1: 3 weeks (foundation, extensive testing)
- P2: 2 weeks (dashboard, progress calculation)
- P3: 1 week (command palette)
- P4: 1 week (code blocks, syntax highlight)
- P5: 1 week (flags route, stats)
- P6: 1–2 weeks (responsive, mobile flows)

**Total: 4–5 weeks of focused work**

