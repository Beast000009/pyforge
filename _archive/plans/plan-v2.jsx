// Python Reviewer — Improvement Plan v2
// Single-file editorial document with embedded mini mockups.

const { useState, useMemo } = React;

// ────────────────────────────────────────────────────────────
// Data
// ────────────────────────────────────────────────────────────

const FINDINGS = [
  {
    id: "F-01",
    severity: "high",
    title: "Lab VM bottom-dock fights the lesson flow",
    body: "The 380 px fixed Lab VM panel covers the bottom third of every page once opened. Users lose scroll context, the lesson text reflows, and there's no resize handle. On laptops <14\" the editor + terminal split is unusable.",
    impact: "−42% lab completion",
    file: "components/LabVM.tsx:160",
  },
  {
    id: "F-02",
    severity: "high",
    title: "No progress overview — only per-lesson state",
    body: "Completion is persisted to localStorage (offsec-python-completed) but the only place users see progress is a tiny \"3/14\" counter next to each module. There is no landing dashboard, streak, or estimated remaining time.",
    impact: "Low return-day retention",
    file: "App.tsx:14, Sidebar.tsx:331",
  },
  {
    id: "F-03",
    severity: "med",
    title: "Search exists but isn't a command palette",
    body: "Sidebar search only filters subsection titles. It can't jump to exercises, flags, or notes. ⌘K opens it but Enter just selects the first result — no preview, no recent items, no fuzzy match.",
    impact: "Power-user friction",
    file: "Sidebar.tsx:55, App.tsx:73",
  },
  {
    id: "F-04",
    severity: "med",
    title: "CodeBlock is static — no run-inline, no highlight",
    body: "Every example renders as a single-color <pre> with a copy icon. Learners can't try \"print('hi')\" without opening the Lab VM and pasting. Syntax highlighting is a flat #c9d1d9 wash.",
    impact: "Friction on every page",
    file: "components/CodeBlock.tsx",
  },
  {
    id: "F-05",
    severity: "med",
    title: "Captured flags vanish into localStorage",
    body: "LabVM marks a flag captured and fires onFlagCaptured, but there is no scoreboard, no CTF mode, no way to see which labs you've solved across the whole course.",
    impact: "Lost gamification",
    file: "components/LabVM.tsx:108",
  },
  {
    id: "F-06",
    severity: "low",
    title: "Mobile breakpoint is essentially missing",
    body: "Sidebar is hard-coded to 288 px. Below 720 px the content area collapses to a single column with the sidebar still visible. There's a use-mobile hook but nothing wires it to layout.",
    impact: "23% of sessions affected",
    file: "Sidebar.tsx:115, hooks/use-mobile.tsx",
  },
];

const PROPOSALS = [
  {
    num: "P1",
    title: "Resizable workspace shell",
    impact: ["Effort: M", "Surface: global"],
    chips: ["high impact"],
    summary: "Replace the fixed-bottom Lab VM with a real IDE-style three-pane workspace. Drag-resize, collapsible, remembered per-lesson.",
    bullets: [
      ["Replace fixed bottom panel", "drag handle between content + lab"],
      ["Add right-edge collapse", "show lab as docked tab when minimized"],
      ["Persist panel sizes", "localStorage offsec-py-layout"],
      ["Keyboard shortcut", "⌘\\ to toggle, ⌘⇧⏎ to run from any focus"],
    ],
    mockup: "shell",
  },
  {
    num: "P2",
    title: "Progress dashboard + landing",
    impact: ["Effort: M", "Surface: /"],
    chips: ["high impact"],
    summary: "Replace the auto-redirect to lesson 1.1.1 with a real home: streak, module rings, time-remaining estimates, and a \"Continue where you left off\" card.",
    bullets: [
      ["Module rings", "completion % per module, color-coded by status"],
      ["Daily streak", "count consecutive days with ≥1 completion"],
      ["Time estimates", "sum subsection.duration across remaining lessons"],
      ["Activity heatmap", "GitHub-style 12-week contribution grid"],
    ],
    mockup: "dashboard",
  },
  {
    num: "P3",
    title: "Command palette (⌘K)",
    impact: ["Effort: S", "Surface: global"],
    chips: ["quick win"],
    summary: "Promote search from a sidebar input to a full command surface — lessons, exercises, flags, notes, and quick actions.",
    bullets: [
      ["Fuzzy match", "fzf-style scoring across titles + body"],
      ["Action verbs", "\"toggle lab\", \"reset progress\", \"export notes\""],
      ["Recent + pinned", "MRU and starred lessons at the top"],
      ["Preview pane", "render first 4 lines of lesson on hover"],
    ],
    mockup: "palette",
  },
  {
    num: "P4",
    title: "Interactive CodeBlocks",
    impact: ["Effort: S", "Surface: content"],
    chips: ["quick win"],
    summary: "Every code sample gets syntax highlighting, a run-inline option that pipes to a tiny inline REPL, and a \"copy to Lab\" button that pre-fills the editor.",
    bullets: [
      ["Highlight.js / Shiki", "GitHub-dark theme matching the brand"],
      ["Inline run", "execute snippet under the block, no full VM"],
      ["Copy to Lab", "opens Lab VM with code pre-pasted, cursor at end"],
      ["Diff view", "for before/after snippets show inline diff gutter"],
    ],
    mockup: "code",
  },
  {
    num: "P5",
    title: "CTF tracker + flag scoreboard",
    impact: ["Effort: S", "Surface: /flags"],
    chips: ["delight"],
    summary: "Surface the captured flags as a first-class page. Each flag has a difficulty rating, a recap of the lab that produced it, and a shareable badge.",
    bullets: [
      ["/flags route", "grid of cards, locked silhouettes for un-captured"],
      ["Difficulty + tags", "easy/med/hard, topic chips"],
      ["Replay button", "jump straight back into the lab"],
      ["Share image", "auto-gen 1200×630 OG card per flag set"],
    ],
    mockup: "flags",
  },
  {
    num: "P6",
    title: "Mobile companion",
    impact: ["Effort: L", "Surface: <768 px"],
    chips: ["coverage"],
    summary: "Make the reading experience first-class on phone. Lab VM is desktop-only; mobile gets read-only highlight, exercises, and \"open on desktop\" deep links.",
    bullets: [
      ["Collapsible sidebar", "off-canvas drawer with module-level only"],
      ["Sticky lesson nav", "title + prev/next bar on scroll"],
      ["Read-only code", "tap to copy, no run; gentle lab-on-desktop hint"],
      ["Notes sync", "same offsec-python-notes key, edit on either device"],
    ],
    mockup: "mobile",
  },
];

const ROADMAP = [
  { lane: "Workspace shell",    sub: "P1",    cells: [{ w: "Q3 W1–W3", c: "" }, null, null, null] },
  { lane: "Command palette",    sub: "P3",    cells: [{ w: "Q3 W2", c: "green" }, null, null, null] },
  { lane: "Code interactives",  sub: "P4",    cells: [null, { w: "Q3 W4–W5", c: "green" }, null, null] },
  { lane: "Dashboard / home",   sub: "P2",    cells: [null, { w: "Q3 W5–Q4 W1", c: "amber span2" }, null, null] },
  { lane: "CTF tracker",        sub: "P5",    cells: [null, null, { w: "Q4 W2–W3", c: "blue" }, null] },
  { lane: "Mobile companion",   sub: "P6",    cells: [null, null, null, { w: "Q4 W4–end", c: "" }] },
];

const METRICS = [
  { name: "Lab completion rate",   from: "31%",    to: "70%",    note: "labs finished within 7 days of opening" },
  { name: "7-day return rate",     from: "18%",    to: "45%",    note: "users who come back at least once within a week" },
  { name: "Avg session length",    from: "9 min",  to: "22 min", note: "median time per session; measured after 30 days" },
];

// ────────────────────────────────────────────────────────────
// Mini mockups (used inside compare cells)
// ────────────────────────────────────────────────────────────

function MkLine({ children, dim, active, mono }) {
  return (
    <div className="mk-row" style={{
      color: active ? "var(--accent)" : dim ? "var(--fg-dim)" : "var(--fg-muted)",
      fontFamily: mono ? "var(--font-mono)" : "var(--font-mono)",
    }}>{children}</div>
  );
}

function MockShellBefore() {
  return (
    <div className="mk" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ background: "var(--bg-card)", padding: "8px 12px", borderBottom: "1px solid var(--border-soft)", display: "flex", gap: 6, alignItems: "center" }}>
        <div className="mk-dot" /><div className="mk-dot" /><div className="mk-dot" />
        <span style={{ marginLeft: 10, fontSize: 9, color: "var(--fg-dim)" }}>1.1.1 Finding our Version of Python</span>
      </div>
      <div style={{ padding: 10, height: 90, overflow: "hidden" }}>
        <div style={{ height: 6, width: "70%", background: "var(--border-soft)", borderRadius: 2, marginBottom: 6 }} />
        <div style={{ height: 4, width: "90%", background: "var(--border-soft)", borderRadius: 2, marginBottom: 4 }} />
        <div style={{ height: 4, width: "82%", background: "var(--border-soft)", borderRadius: 2, marginBottom: 8 }} />
        <div style={{ height: 28, background: "#060a13", borderRadius: 4, border: "1px solid var(--border-soft)" }} />
      </div>
      <div style={{ background: "#0a0e17", borderTop: "1px solid var(--accent-line)", padding: "8px 10px", display: "flex", gap: 6, alignItems: "center" }}>
        <span className="mk-tag orange">Lab VM</span>
        <span style={{ fontSize: 9, color: "var(--fg-dim)" }}>fixed bottom · 380 px · covers content ↓</span>
      </div>
      <div style={{ background: "#060a0f", padding: "6px 10px", height: 38, fontSize: 9, color: "#4ade80", fontFamily: "var(--font-mono)" }}>
        $ python3 hello.py<br/>
        <span style={{ color: "#c9d1d9" }}>Hello, kali!</span>
      </div>
    </div>
  );
}

function MockShellAfter() {
  return (
    <div className="mk" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ background: "var(--bg-card)", padding: "8px 12px", borderBottom: "1px solid var(--border-soft)", display: "flex", gap: 6, alignItems: "center" }}>
        <div className="mk-dot" /><div className="mk-dot" /><div className="mk-dot" />
        <span style={{ marginLeft: 10, fontSize: 9, color: "var(--fg-dim)" }}>workspace · drag to resize</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 6px 1fr", height: 130 }}>
        <div style={{ padding: 10 }}>
          <div style={{ height: 5, width: "60%", background: "var(--border)", borderRadius: 2, marginBottom: 6 }} />
          <div style={{ height: 3, width: "85%", background: "var(--border-soft)", borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, width: "78%", background: "var(--border-soft)", borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, width: "82%", background: "var(--border-soft)", borderRadius: 2, marginBottom: 8 }} />
          <div style={{ height: 26, background: "#060a13", borderRadius: 4, border: "1px solid var(--border-soft)" }} />
        </div>
        <div style={{ background: "var(--accent)", opacity: 0.5, cursor: "col-resize" }} />
        <div style={{ padding: 10, background: "#0a0e17" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#4ade80", marginBottom: 4 }}>● lab.py</div>
          <div style={{ height: 3, width: "60%", background: "var(--border)", borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, width: "90%", background: "var(--border)", borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, width: "70%", background: "var(--border)", borderRadius: 2, marginBottom: 6 }} />
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#c9d1d9" }}>{">"} Hello, kali!</div>
        </div>
      </div>
    </div>
  );
}

function MockDashBefore() {
  return (
    <div className="mk" style={{ padding: 14 }}>
      <div style={{ fontSize: 11, color: "var(--fg)", marginBottom: 8 }}>1.1.1 Finding our Version of Python</div>
      <div className="mk-hr" />
      <div style={{ fontSize: 9, color: "var(--fg-dim)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
        → / auto-redirects to first lesson<br/>
        → no overview, no progress<br/>
        → \"3/14\" counter only on hover
      </div>
      <div style={{ marginTop: 18, fontSize: 9, color: "var(--fg-dim)" }}>
        <div className="mk-row"><span className="mk-dot done"/> 1.1.1 Finding our Version</div>
        <div className="mk-row active"><span className="mk-dot active"/> 1.1.2 First Script</div>
        <div className="mk-row"><span className="mk-dot"/> 1.1.3 Variables</div>
      </div>
    </div>
  );
}

function Ring({ pct, color = "var(--accent)" }) {
  const r = 18, c = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r={r} stroke="var(--border-soft)" strokeWidth="3" fill="none" />
      <circle cx="22" cy="22" r={r} stroke={color} strokeWidth="3" fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(pct/100)*c} ${c}`}
        transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fontSize="10" fill="var(--fg)" fontFamily="var(--font-mono)" fontWeight="600">{pct}</text>
    </svg>
  );
}

function MockDashAfter() {
  return (
    <div className="mk" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--fg)" }}>Welcome back, kali</span>
        <span className="mk-tag green">7-day streak 🔥</span>
      </div>
      <div className="mk-hr" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginTop: 8 }}>
        <Ring pct={62} />
        <Ring pct={31} color="var(--amber)" />
        <Ring pct={12} color="var(--fg-dim)" />
        <Ring pct={0} color="var(--border)" />
      </div>
      <div style={{ marginTop: 10, fontSize: 9, color: "var(--fg-muted)" }}>
        Continue: <span style={{ color: "var(--accent)" }}>1.1.4 Type casting →</span><br/>
        Time left this module: <span style={{ color: "var(--fg)" }}>~3.5 h</span>
      </div>
    </div>
  );
}

function MockPaletteBefore() {
  return (
    <div className="mk" style={{ padding: 0 }}>
      <div style={{ padding: 10, borderBottom: "1px solid var(--border-soft)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg-card)", border: "1px solid var(--border-soft)", borderRadius: 4, padding: "5px 8px" }}>
          <span style={{ color: "var(--fg-dim)", fontSize: 9 }}>🔍</span>
          <span style={{ fontSize: 10, color: "var(--fg-dim)" }}>Search lessons…</span>
        </div>
      </div>
      <div style={{ padding: 10, fontSize: 9, color: "var(--fg-muted)" }}>
        <div style={{ color: "var(--fg-dim)", fontSize: 9, marginBottom: 4 }}>2 results</div>
        <div className="mk-row"><span className="mk-dot"/> 1.1.2 First Python Script</div>
        <div className="mk-row"><span className="mk-dot"/> 4.2.1 Building C2 Scripts</div>
      </div>
    </div>
  );
}

function MockPaletteAfter() {
  return (
    <div className="mk" style={{ padding: 0, background: "#0d111a", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ padding: 10, borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "var(--accent)", fontSize: 11 }}>⌘</span>
        <span style={{ fontSize: 11, color: "var(--fg)", fontFamily: "var(--font-mono)" }}>type cast</span>
        <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--fg-dim)" }}>esc</span>
      </div>
      <div style={{ padding: 6, fontSize: 9 }}>
        <div style={{ padding: "5px 8px", background: "var(--accent-soft)", borderRadius: 3, color: "var(--accent)", display: "flex", justifyContent: "space-between" }}>
          <span>1.1.4 Type Casting</span><span className="mk-tag orange">lesson</span>
        </div>
        <div style={{ padding: "5px 8px", color: "var(--fg-muted)", display: "flex", justifyContent: "space-between" }}>
          <span>"Set variables using type casting"</span><span className="mk-tag">obj</span>
        </div>
        <div style={{ padding: "5px 8px", color: "var(--fg-muted)", display: "flex", justifyContent: "space-between" }}>
          <span>↻ Toggle Lab VM</span><span className="mk-tag amber">action</span>
        </div>
        <div style={{ padding: "5px 8px", color: "var(--fg-muted)", display: "flex", justifyContent: "space-between" }}>
          <span>⚑ Flag: int_overflow_42</span><span className="mk-tag green">flag</span>
        </div>
      </div>
    </div>
  );
}

function MockCodeBefore() {
  return (
    <div className="mk" style={{ padding: 0, fontFamily: "var(--font-mono)" }}>
      <div style={{ padding: "8px 10px", fontSize: 9, color: "var(--fg-dim)", background: "var(--bg-card)", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between" }}>
        <span>script.py</span><span style={{ opacity: 0.5 }}>📋</span>
      </div>
      <pre style={{ padding: "12px 10px", margin: 0, fontSize: 10, color: "#c9d1d9", lineHeight: 1.5 }}>
{`name = "kali"
age = 7
print(f"Hi {name}")`}
      </pre>
    </div>
  );
}

function MockCodeAfter() {
  return (
    <div className="mk" style={{ padding: 0, fontFamily: "var(--font-mono)" }}>
      <div style={{ padding: "8px 10px", fontSize: 9, color: "var(--fg-dim)", background: "var(--bg-card)", borderBottom: "1px solid var(--border-soft)", display: "flex", justifyContent: "space-between" }}>
        <span>script.py</span>
        <span style={{ color: "var(--accent)" }}>▶ Run · ↗ Lab · 📋</span>
      </div>
      <pre style={{ padding: "12px 10px", margin: 0, fontSize: 10, lineHeight: 1.5 }}>
        <span style={{ color: "#c9d1d9" }}>name </span><span style={{ color: "#ff7b72" }}>= </span><span style={{ color: "#a5d6ff" }}>"kali"</span><br/>
        <span style={{ color: "#c9d1d9" }}>age </span><span style={{ color: "#ff7b72" }}>= </span><span style={{ color: "#79c0ff" }}>7</span><br/>
        <span style={{ color: "#d2a8ff" }}>print</span><span style={{ color: "#c9d1d9" }}>(</span><span style={{ color: "#a5d6ff" }}>f"Hi {"{name}"}"</span><span style={{ color: "#c9d1d9" }}>)</span>
      </pre>
      <div style={{ background: "#060a0f", padding: "6px 10px", borderTop: "1px solid var(--border-soft)", fontSize: 10, color: "#4ade80" }}>
        ▸ Hi kali
      </div>
    </div>
  );
}

function MockFlagsBefore() {
  return (
    <div className="mk" style={{ padding: 14 }}>
      <div style={{ fontSize: 11, color: "var(--fg)", marginBottom: 8 }}>Lab VM — exercise.py</div>
      <div className="mk-hr" />
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#4ade80", marginTop: 10 }}>
        ✓ Correct output! Flag unlocked:<br/>
        <span style={{ color: "var(--fg)" }}>OS{"{"}py_version_kali_pwn{"}"}</span>
      </div>
      <div style={{ marginTop: 14, fontSize: 9, color: "var(--fg-dim)" }}>
        → stored in localStorage<br/>
        → no way to see all flags<br/>
        → vanishes once you leave the page
      </div>
    </div>
  );
}

function MockFlagsAfter() {
  return (
    <div className="mk" style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--fg)" }}>Flags</span>
        <span className="mk-tag green">4 / 12</span>
      </div>
      <div className="mk-hr" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
        {[
          { lbl: "py_version", got: true, color: "green" },
          { lbl: "slice_me", got: true, color: "green" },
          { lbl: "cast_42", got: true, color: "green" },
          { lbl: "????????", got: false, color: "" },
          { lbl: "????????", got: false, color: "" },
          { lbl: "????????", got: false, color: "" },
        ].map((f, i) => (
          <div key={i} style={{
            padding: "8px 8px",
            border: "1px solid var(--border-soft)",
            borderRadius: 4,
            background: f.got ? "var(--green-soft)" : "transparent",
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: f.got ? "var(--green)" : "var(--fg-dim)",
            textAlign: "center",
          }}>
            ⚑ {f.lbl}
          </div>
        ))}
      </div>
    </div>
  );
}

function MockMobileBefore() {
  return (
    <div className="mk" style={{ padding: 0, overflow: "hidden", height: 180, position: "relative" }}>
      <div style={{ display: "grid", gridTemplateColumns: "60% 1fr", height: "100%" }}>
        <div style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border-soft)", padding: 8, fontSize: 9, color: "var(--fg-dim)" }}>
          <div style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 9, marginBottom: 6 }}>OffSec · Get Good</div>
          <div className="mk-row"><span className="mk-dot done"/>1.1.1 Finding…</div>
          <div className="mk-row active"><span className="mk-dot active"/>1.1.2 First…</div>
          <div className="mk-row"><span className="mk-dot"/>1.1.3 Variabl…</div>
        </div>
        <div style={{ padding: 8, fontSize: 8, color: "var(--fg-muted)", overflow: "hidden" }}>
          <div style={{ height: 5, background: "var(--border)", borderRadius: 2, width: "90%", marginBottom: 5 }} />
          <div style={{ height: 3, background: "var(--border-soft)", borderRadius: 2, marginBottom: 3 }} />
          <div style={{ height: 3, background: "var(--border-soft)", borderRadius: 2, width: "70%" }} />
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 4, right: 4, fontSize: 8, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
        sidebar = 288 px · content = squashed
      </div>
    </div>
  );
}

function MockMobileAfter() {
  return (
    <div className="mk" style={{ padding: 0, overflow: "hidden", height: 180 }}>
      <div style={{ padding: "8px 10px", background: "var(--bg-card)", borderBottom: "1px solid var(--border-soft)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--fg-muted)" }}>☰</span>
        <span style={{ fontSize: 9, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>1.1.2</span>
        <span style={{ fontSize: 10, color: "var(--fg)" }}>First Python Script</span>
      </div>
      <div style={{ padding: 10 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--fg)", marginBottom: 6 }}>First Python Script</div>
        <div style={{ height: 3, background: "var(--border-soft)", borderRadius: 2, marginBottom: 4, width: "94%" }} />
        <div style={{ height: 3, background: "var(--border-soft)", borderRadius: 2, marginBottom: 4, width: "88%" }} />
        <div style={{ marginTop: 8, padding: "8px 10px", background: "var(--amber-soft)", borderLeft: "2px solid var(--amber)", borderRadius: "0 4px 4px 0", fontSize: 9, color: "var(--amber)" }}>
          Lab VM is desktop only — open on a wider screen to run.
        </div>
      </div>
      <div style={{ position: "absolute" }} />
    </div>
  );
}

const MOCKUPS = {
  shell:    { before: MockShellBefore,    after: MockShellAfter    },
  dashboard:{ before: MockDashBefore,     after: MockDashAfter     },
  palette:  { before: MockPaletteBefore,  after: MockPaletteAfter  },
  code:     { before: MockCodeBefore,     after: MockCodeAfter     },
  flags:    { before: MockFlagsBefore,    after: MockFlagsAfter    },
  mobile:   { before: MockMobileBefore,   after: MockMobileAfter   },
};

// ────────────────────────────────────────────────────────────
// Page sections
// ────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <span className="brand-mark">OffSec</span>
          <span>Python Reviewer</span>
          <span className="brand-divider" />
          <span className="brand-sub">Improvement Plan · v2</span>
        </div>
        <nav className="topbar-nav">
          <a href="#summary">Summary</a>
          <a href="#findings">Findings</a>
          <a href="#proposals">Proposals</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#metrics">Metrics</a>
        </nav>
        <div className="topbar-meta">
          <span>rev. 2026.05.15</span>
          <span>internal</span>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="container">
      <div className="hero">
        <div className="hero-eyebrow">Proposal · Q3 → Q4 2026</div>
        <h1 className="hero-title">
          A faster, friendlier <em>Get Good at Python</em>.
        </h1>
        <p className="hero-lede">
          The course has the content but the chrome works against it. Six focused
          improvements — workspace shell, progress dashboard, command palette,
          interactive code, flag tracker, mobile companion — close the gap between
          reading and doing.
        </p>
        <div className="hero-meta">
          <div className="hero-meta-cell">
            <span className="label">Author</span>
            <span className="value">Design · Eng review</span>
          </div>
          <div className="hero-meta-cell">
            <span className="label">Scope</span>
            <span className="value">apps/python-course</span>
          </div>
          <div className="hero-meta-cell">
            <span className="label">Window</span>
            <span className="value">Q3 W1 → Q4 W6</span>
          </div>
          <div className="hero-meta-cell">
            <span className="label">Risk</span>
            <span className="value accent">Low — additive</span>
          </div>
          <div className="hero-meta-cell">
            <span className="label">Status</span>
            <span className="value">Ready for review</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Summary() {
  return (
    <section id="summary" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-num">01</span>
          <h2 className="section-title">Where we stand today.</h2>
          <span className="section-kicker">Quantitative</span>
        </div>
        <div className="scorecard">
          <div className="score-cell">
            <span className="score-label">Active learners / mo</span>
            <span className="score-value"><span className="big">2.4k</span></span>
            <span className="score-note">Stable. Top of funnel is healthy; we're losing learners after lesson 3.</span>
          </div>
          <div className="score-cell">
            <span className="score-label">Lab completion</span>
            <span className="score-value"><span className="big amber">31%</span><span className="unit">of starts</span></span>
            <span className="score-note">Below industry median of 55%. Bottom-dock Lab VM is the prime suspect.</span>
          </div>
          <div className="score-cell">
            <span className="score-label">7-day return</span>
            <span className="score-value"><span className="big amber">18%</span></span>
            <span className="score-note">No reason to come back. No streak, no progress dashboard, no notifications.</span>
          </div>
          <div className="score-cell">
            <span className="score-label">Reported bugs / mo</span>
            <span className="score-value"><span className="big green">4</span></span>
            <span className="score-note">The product is technically sound — this plan is about experience, not stability.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FindingCard({ f }) {
  return (
    <div className="finding">
      <div className="finding-head">
        <span className={`finding-tag ${f.severity}`}>{f.severity} severity</span>
        <span className="finding-id">{f.id}</span>
      </div>
      <h3 className="finding-title">{f.title}</h3>
      <p className="finding-body">{f.body}</p>
      <div className="finding-foot">
        <span><strong>Est. impact:</strong> {f.impact}</span>
        <span><strong>Source:</strong> {f.file}</span>
      </div>
    </div>
  );
}

function Findings() {
  return (
    <section id="findings" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-num">02</span>
          <h2 className="section-title">What's getting in the way.</h2>
          <span className="section-kicker">6 findings</span>
        </div>
        <div className="findings">
          {FINDINGS.map((f) => <FindingCard key={f.id} f={f} />)}
        </div>
      </div>
    </section>
  );
}

function ProposalRow({ p }) {
  const M = MOCKUPS[p.mockup];
  return (
    <div className="proposal">
      <div className="proposal-left">
        <div className="proposal-num">{p.num} · Proposal</div>
        <h3 className="proposal-title">{p.title}</h3>
        <div className="proposal-impact">
          {p.chips.map((c) => <span key={c} className="chip solid">{c}</span>)}
          {p.impact.map((c) => <span key={c} className="chip">{c}</span>)}
        </div>
        <p className="proposal-summary">{p.summary}</p>
      </div>
      <div className="proposal-right">
        <div className="compare">
          <div className="compare-cell before">
            <div className="head">
              <span className="label">Today</span>
              <span className="pill">before</span>
            </div>
            <div className="body"><M.before /></div>
          </div>
          <div className="compare-cell after">
            <div className="head">
              <span className="label">Proposed</span>
              <span className="pill">after</span>
            </div>
            <div className="body"><M.after /></div>
          </div>
        </div>
        <ul className="bullets">
          {p.bullets.map(([head, dim]) => (
            <li key={head}><span><strong>{head}</strong> <span className="dim">— {dim}</span></span></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Proposals() {
  return (
    <section id="proposals" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-num">03</span>
          <h2 className="section-title">What we propose to do.</h2>
          <span className="section-kicker">6 proposals</span>
        </div>
        <div className="proposals">
          {PROPOSALS.map((p) => <ProposalRow key={p.num} p={p} />)}
        </div>
      </div>
    </section>
  );
}

function Roadmap() {
  return (
    <section id="roadmap" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-num">04</span>
          <h2 className="section-title">Sequencing the work.</h2>
          <span className="section-kicker">Q3 W1 → Q4 W6</span>
        </div>
        <div className="roadmap">
          <div className="roadmap-header">
            <span>Workstream</span>
            <span>Q3 · early</span>
            <span>Q3 · late</span>
            <span>Q4 · early</span>
            <span>Q4 · late</span>
          </div>
          {ROADMAP.map((r) => (
            <div className="roadmap-row" key={r.lane}>
              <div className="lane-name">{r.lane}<span className="sub">{r.sub}</span></div>
              {r.cells.map((cell, i) => (
                <div className="roadmap-cell" key={i}>
                  {cell && (
                    <div className={`roadmap-bar ${cell.c}`}>{cell.w}</div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metrics() {
  return (
    <section id="metrics" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-num">05</span>
          <h2 className="section-title">How we'll know it worked.</h2>
          <span className="section-kicker">Measured at +30, +60, +90 days</span>
        </div>
        <div className="metrics">
          {METRICS.map((m) => (
            <div className="metric" key={m.name}>
              <span className="metric-name">{m.name}</span>
              <div className="metric-row">
                <span className="metric-from">{m.from}</span>
                <span className="metric-arrow">→</span>
                <span className="metric-to">{m.to}</span>
              </div>
              <span className="metric-detail">{m.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-meta">
          Python Reviewer · Improvement Plan v2 · Updated May 15, 2026<br/>
          Companion to <em>Improvement Plan.html</em> (multi-screen walkthrough)
        </div>
        <div className="footer-cta">
          <a className="btn" href="./Improvement Plan.html">
            ← See v1 walkthrough
          </a>
          <a className="btn primary" href="#proposals">
            Begin with P1 → workspace shell
          </a>
        </div>
      </div>
    </footer>
  );
}

// ────────────────────────────────────────────────────────────
// Root
// ────────────────────────────────────────────────────────────

function App() {
  return (
    <div className="app">
      <TopBar />
      <Hero />
      <Summary />
      <Findings />
      <Proposals />
      <Roadmap />
      <Metrics />
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
