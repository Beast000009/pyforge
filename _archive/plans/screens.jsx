// Scene components — one per proposal in the improvement plan.
// Each scene fills the canvas viewport with a hi-fi mock of the proposed UI.

const { useState: useSceneState } = React;

// ════════════════════════════════════════════════════════════
// Reusable: course sidebar mock
// ════════════════════════════════════════════════════════════
function MockSidebar({ activeId = "s1-1-3", compact = false }) {
  return (
    <div className="app-sidebar">
      <div className="app-sidebar-head">
        <span style={{
          background: "#e84b22", color: "white", padding: "2px 6px",
          borderRadius: 4, fontWeight: 700, fontSize: 9,
          letterSpacing: "0.14em", textTransform: "uppercase",
        }}>OffSec</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--fg)" }}>Get Good at Python</span>
      </div>
      <div className="app-sidebar-search">
        <span>🔍</span>
        <span>Search lessons…</span>
        <span className="kbd">⌘K</span>
      </div>

      <div className="app-mod">
        <span>▾</span>
        <span>1. Python Scripting Basics</span>
        <span className="count">5/14</span>
      </div>
      <div className="app-sec">▾ 1.1 Variables, Slicing, Type Casting</div>
      <div className={"app-sub done"}><span className="dot"/>1.1.1 Finding our Version</div>
      <div className={"app-sub done"}><span className="dot"/>1.1.2 First Python Script</div>
      <div className={"app-sub " + (activeId === "s1-1-3" ? "active" : "")}>
        <span className="dot"/>1.1.3 Slicing Strings
      </div>
      <div className="app-sub"><span className="dot"/>1.1.4 Type Casting</div>
      {!compact && (
        <>
          <div className="app-sec">▸ 1.2 Loops and Conditions</div>
          <div className="app-sec">▸ 1.3 Working with Files</div>
          <div className="app-mod" style={{ marginTop: 6 }}>
            <span>▸</span><span>2. Functions and Classes</span><span className="count">0/9</span>
          </div>
          <div className="app-mod">
            <span>▸</span><span>3. Networking with Sockets</span><span className="count">0/11</span>
          </div>
          <div className="app-mod">
            <span>▸</span><span>4. Building C2 Tools</span><span className="count">0/8</span>
          </div>
        </>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Reusable: lesson body mock (with interactive code blocks)
// ════════════════════════════════════════════════════════════
function MockLesson({ withRun = true, compact = false }) {
  return (
    <div className="lesson">
      <div className="lesson-crumbs">
        1. Python Basics <span style={{ color: "var(--border)" }}>/</span> 1.1 Variables <span style={{ color: "var(--border)" }}>/</span> <span className="now">1.1.3 Slicing Strings</span>
      </div>
      <h1>Slicing Strings</h1>
      <div className="lesson-meta">1.1.3 — Variables, Slicing, and Type Casting · ~12 min</div>

      <div className="lesson-callout">
        <div className="lesson-callout-lbl">Learning objectives</div>
        <ol>
          <li>Extract substrings using index slicing</li>
          <li>Use negative indices to count from the end</li>
          <li>Step through a string with [start:stop:step]</li>
        </ol>
      </div>

      <p>
        Strings in Python are <em>sequences</em>, which means we can extract individual
        characters or sub-strings using square-bracket notation. Let's set a variable
        and try slicing it.
      </p>

      {/* Interactive code block */}
      <div className="cblock">
        <div className="cblock-head">
          <span className="name"><span className="lang">py</span>slice_demo.py</span>
          <span className="cblock-actions">
            {withRun && <button className="run">▶ Run</button>}
            <button>↗ Lab</button>
            <button>📋</button>
          </span>
        </div>
        <div className="cblock-body">
<span className="kw">name</span> = <span className="str">"kali"</span>
{"\n"}<span className="fn">print</span>(<span className="kw">name</span>[:<span className="num">2</span>])    <span className="com"># first two chars</span>
{"\n"}<span className="fn">print</span>(<span className="kw">name</span>[-<span className="num">1</span>:])   <span className="com"># last char</span>
{"\n"}<span className="fn">print</span>(<span className="kw">name</span>[::<span className="num">-1</span>])  <span className="com"># reversed</span>
        </div>
        {withRun && (
          <div className="cblock-output">
            <span className="arrow">▸</span>ka{"\n"}
            <span className="arrow">▸</span>i{"\n"}
            <span className="arrow">▸</span>ilak
          </div>
        )}
      </div>

      {!compact && (
        <p>
          Notice how slice <code style={{ color: "#e84b22", fontFamily: "var(--font-mono)", fontSize: 13 }}>[::-1]</code> walks
          the string in reverse — useful when working with byte payloads.
        </p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// Browser frame wrapper
// ════════════════════════════════════════════════════════════
function Browser({ url = "python-reviewer.local/lesson/1.1.3", path = "/lesson/1.1.3", children, height = 580 }) {
  // url is split into host + path for color emphasis
  const host = url.split("/")[0];
  return (
    <div className="viewport" style={{ minHeight: height }}>
      <div className="chrome">
        <div className="chrome-lights"><span/><span/><span/></div>
        <div className="chrome-url">
          <span className="lock">🔒</span>
          {host}<span className="path">{path}</span>
        </div>
        <div className="chrome-side">∎ ↺ ⤓</div>
      </div>
      <div style={{ height: height - 44, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SCENE 0 — Overview
// ════════════════════════════════════════════════════════════
function SceneOverview() {
  return (
    <>
      <div className="stage-head">
        <div>
          <div className="stage-num">SUMMARY · v1 walkthrough</div>
          <h1 className="stage-title">Six fixes for <em>Get Good at Python</em>.</h1>
        </div>
      </div>
      <p className="stage-blurb">
        The course content is solid — the chrome around it isn't. This walkthrough
        steps through six concrete proposals, each as an interactive hi-fi mock.
        Click any scenario in the left rail to inspect it. For the written-document
        version, see <a href="./Improvement Plan v2.html" style={{ color: "var(--accent)" }}>Improvement Plan v2</a>.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 12, maxWidth: 1100 }}>
        {[
          { num: "P1", title: "Workspace shell",   blurb: "Drag-resize panes; persist layout." },
          { num: "P2", title: "Progress dashboard", blurb: "Streak, rings, time-to-finish." },
          { num: "P3", title: "Command palette",   blurb: "⌘K across lessons, flags, actions." },
          { num: "P4", title: "Interactive code",  blurb: "Run inline; copy to Lab VM." },
          { num: "P5", title: "Flag tracker",      blurb: "Central CTF scoreboard." },
          { num: "P6", title: "Mobile companion",  blurb: "Read, take notes, resume on desktop." },
        ].map((p) => (
          <div key={p.num} style={{
            background: "var(--bg-elev)",
            border: "1px solid var(--border-soft)",
            borderRadius: 12,
            padding: "20px 22px",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--accent)",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}>{p.num}</div>
            <div style={{
              fontFamily: "var(--font-serif)",
              fontSize: 22,
              fontWeight: 400,
              lineHeight: 1.15,
              marginBottom: 6,
            }}>{p.title}</div>
            <div style={{ fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.55 }}>{p.blurb}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SCENE 1 — Workspace shell
// ════════════════════════════════════════════════════════════
function SceneWorkspace() {
  const [labWidth, setLabWidth] = useSceneState(420);
  return (
    <>
      <div className="stage-head">
        <div className="stage-num">P1 · Workspace shell</div>
        <h2 className="stage-title">Drag to make room for the lab.</h2>
      </div>
      <p className="stage-blurb">
        The Lab VM today is a fixed 380px panel pinned to the bottom of the viewport — it
        covers lesson context and there's no escape on a 13" laptop. The proposed shell makes
        every pane resizable, persists layout per lesson, and supports a tabbed lab strip.
      </p>
      <div className="stage-grid">
        <Browser url="python-reviewer.local/lesson/1.1.3" path="/lesson/1.1.3" height={640}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `240px 1fr 5px ${labWidth}px`,
            height: "100%",
            minHeight: 0,
          }}>
            <MockSidebar compact />
            <div style={{ overflow: "hidden" }}><MockLesson /></div>
            <div
              className="resizer"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startW = labWidth;
                function onMove(ev) {
                  const dx = startX - ev.clientX;
                  setLabWidth(Math.max(280, Math.min(640, startW + dx)));
                }
                function onUp() {
                  window.removeEventListener("mousemove", onMove);
                  window.removeEventListener("mouseup", onUp);
                }
                window.addEventListener("mousemove", onMove);
                window.addEventListener("mouseup", onUp);
              }}
            />
            <div className="lab">
              <div className="lab-tabs">
                <div className="lab-tab active">
                  <span className="dot">●</span>slice_demo.py<span className="x">×</span>
                </div>
                <div className="lab-tab">
                  exercise_3.py<span className="x">×</span>
                </div>
                <div className="lab-tab" style={{ borderRight: "none", color: "var(--fg-dim)" }}>
                  + new
                </div>
              </div>
              <div className="lab-head">
                <span className="status">● Python 3.12 ready</span>
                <button className="run-btn">▶ Run <span style={{ opacity: 0.6 }}>⌘↵</span></button>
              </div>
              <div className="lab-editor">
{`>>> `}<span className="kw">name</span>{` = `}<span className="str">"kali"</span>{`
>>> `}<span className="fn">print</span>{`(`}<span className="kw">name</span>{`[:`}<span className="num">2</span>{`])
`}<span className="str">'ka'</span>{`
>>> `}<span className="fn">print</span>{`(`}<span className="kw">name</span>{`[::`}<span className="num">-1</span>{`])
`}<span className="str">'ilak'</span>{`
>>> `}<span className="com"># try negative indexing</span>{`
>>> ▌`}
              </div>
              <div className="lab-term">
                <div><span className="prompt">$</span> python3 slice_demo.py</div>
                <div>ka</div>
                <div>i</div>
                <div>ilak</div>
                <div><span className="ok">✓</span> Output matches expected. Flag captured: <strong>slice_42</strong></div>
              </div>
            </div>
          </div>
        </Browser>

        <SceneNotes
          title="What changes for the user"
          bullets={[
            ["Drag the vertical handle", "grab between content + lab; layout persists per lesson"],
            ["Tabbed lab", "open multiple .py files; ⌘W closes, ⌘T new"],
            ["⌘\\ collapses lab", "lesson reclaims full width when you don't need it"],
            ["Status pill always visible", "boot state, runtime version, flag chip"],
          ]}
          meta={[
            ["Effort", "M (≈ 3 wks)"],
            ["Files", "App.tsx, LabVM.tsx, layout.ts (new)"],
            ["Risk", "Low — additive"],
          ]}
        />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SCENE 2 — Dashboard / home
// ════════════════════════════════════════════════════════════
function Ring({ pct, color = "var(--accent)", size = 56 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--border-soft)" strokeWidth="4" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="4" fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(pct/100)*c} ${c}`}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2 + 4} textAnchor="middle" fontSize="13" fill="var(--fg)" fontFamily="var(--font-mono)" fontWeight="600">{pct}</text>
    </svg>
  );
}

function SceneDashboard() {
  // Stable pseudo-random heatmap (12 weeks × 7 days = 84 cells)
  const cells = Array.from({ length: 84 }, (_, i) => {
    const v = (Math.sin(i * 1.31) + Math.cos(i * 0.43)) * 1.5 + 1.5;
    if (v < 0.5) return "";
    if (v < 1.5) return "l1";
    if (v < 2.5) return "l2";
    if (v < 3.3) return "l3";
    return "l4";
  });

  return (
    <>
      <div className="stage-head">
        <div className="stage-num">P2 · Landing dashboard</div>
        <h2 className="stage-title">A home screen worth coming back to.</h2>
      </div>
      <p className="stage-blurb">
        Right now / auto-redirects to lesson 1.1.1. The proposed landing surfaces progress
        rings per module, a streak, an activity heatmap, and a "continue where you left off"
        card — turning return visits into a habit.
      </p>
      <div className="stage-grid">
        <Browser url="python-reviewer.local/" path="/" height={640}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100%" }}>
            <MockSidebar compact activeId="" />
            <div className="dash">
              <div className="dash-greeting">
                <h2>Welcome back, <em>kali</em>.</h2>
                <div className="dash-streak">
                  <span style={{ fontSize: 16 }}>🔥</span>
                  <span>7-day streak</span>
                </div>
              </div>

              <div className="dash-card" style={{ marginBottom: 18 }}>
                <div className="dash-continue">
                  <div className="dash-continue-body">
                    <div className="dash-continue-num">Continue · 1.1.4 · ~12 min left</div>
                    <div className="dash-continue-title">Type Casting</div>
                    <div className="dash-continue-detail">
                      You stopped 3 paragraphs in. Pick up at the bool() example.
                    </div>
                  </div>
                  <button className="dash-continue-btn">Resume →</button>
                </div>
              </div>

              <div className="dash-grid">
                <div className="dash-card">
                  <div className="dash-card-head">
                    <span className="dash-card-title">Module progress</span>
                    <a className="dash-card-act" href="#">View all →</a>
                  </div>
                  <div className="dash-rings">
                    <div className="dash-ring">
                      <Ring pct={62} />
                      <div className="dash-ring-meta">
                        <div className="dash-ring-title">1. Python Basics</div>
                        <div className="dash-ring-sub">9 of 14 · ~3.5h left</div>
                      </div>
                    </div>
                    <div className="dash-ring">
                      <Ring pct={31} color="var(--amber)" />
                      <div className="dash-ring-meta">
                        <div className="dash-ring-title">2. Functions</div>
                        <div className="dash-ring-sub">3 of 9 · ~4.2h left</div>
                      </div>
                    </div>
                    <div className="dash-ring">
                      <Ring pct={12} color="var(--blue)" />
                      <div className="dash-ring-meta">
                        <div className="dash-ring-title">3. Networking</div>
                        <div className="dash-ring-sub">1 of 11 · ~6h left</div>
                      </div>
                    </div>
                    <div className="dash-ring">
                      <Ring pct={0} color="var(--fg-dim)" />
                      <div className="dash-ring-meta">
                        <div className="dash-ring-title">4. C2 Tools</div>
                        <div className="dash-ring-sub">Not started</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="dash-card">
                  <div className="dash-card-head">
                    <span className="dash-card-title">Activity · last 12 wks</span>
                    <a className="dash-card-act" href="#">Export →</a>
                  </div>
                  <div className="heatmap">
                    {cells.map((c, i) => <div key={i} className={"heatmap-cell " + c} />)}
                  </div>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 12,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--fg-dim)",
                  }}>
                    <span>less</span>
                    <span style={{ display: "flex", gap: 3, alignItems: "center" }}>
                      <span className="heatmap-cell" style={{ width: 10, height: 10 }} />
                      <span className="heatmap-cell l1" style={{ width: 10, height: 10 }} />
                      <span className="heatmap-cell l2" style={{ width: 10, height: 10 }} />
                      <span className="heatmap-cell l3" style={{ width: 10, height: 10 }} />
                      <span className="heatmap-cell l4" style={{ width: 10, height: 10 }} />
                    </span>
                    <span>more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Browser>

        <SceneNotes
          title="Anchors users to a routine"
          bullets={[
            ["Resume card", "deep-link straight to last-visited paragraph"],
            ["Module rings", "shows what's done, in progress, untouched"],
            ["Streak counter", "consecutive days with ≥1 completion or note edit"],
            ["Activity heatmap", "12 weeks; sums lessons completed + flags captured"],
          ]}
          meta={[
            ["Effort", "M (≈ 2 wks)"],
            ["Files", "pages/Home.tsx (new), App.tsx routes"],
            ["Risk", "Low — purely additive"],
          ]}
        />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SCENE 3 — Command palette
// ════════════════════════════════════════════════════════════
function ScenePalette() {
  const [query, setQuery] = useSceneState("type c");
  return (
    <>
      <div className="stage-head">
        <div className="stage-num">P3 · Command palette</div>
        <h2 className="stage-title">One key to everything.</h2>
      </div>
      <p className="stage-blurb">
        Sidebar search filters subsection titles and stops there. The proposed palette is global:
        lessons, learning objectives, flags, actions, and recent items, ranked by fuzzy score.
        Triggered with <span className="kbd-inline">⌘ K</span>.
      </p>
      <div className="stage-grid">
        <Browser url="python-reviewer.local/lesson/1.1.4" path="/lesson/1.1.4" height={640}>
          <div style={{ position: "relative", height: "100%" }}>
            {/* Blurred app behind */}
            <div className="palette-bg">
              <div className="palette-bg-side" />
              <div className="palette-bg-main">
                <div className="palette-bg-row" style={{ width: "55%" }} />
                <div className="palette-bg-row" style={{ width: "90%" }} />
                <div className="palette-bg-row" style={{ width: "82%" }} />
                <div className="palette-bg-row" style={{ width: "88%", marginTop: 18 }} />
                <div className="palette-bg-row" style={{ width: "72%" }} />
              </div>
            </div>
            <div className="palette-overlay">
              <div className="palette">
                <div className="palette-input">
                  <span className="icon">⌘</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type a command, lesson, or flag…"
                  />
                  <span className="palette-esc">esc</span>
                </div>

                <div className="palette-group">
                  <div className="palette-group-name">Lessons · matches</div>
                  <div className="palette-item sel">
                    <span className="icon">▤</span>
                    <span className="name">1.1.4 <strong>Type C</strong>asting</span>
                    <span className="ctx">module 1</span>
                    <span className="tag lesson">lesson</span>
                  </div>
                  <div className="palette-item">
                    <span className="icon">▤</span>
                    <span className="name">2.3.1 Defining <strong>type</strong>d funCtions</span>
                    <span className="ctx">module 2</span>
                    <span className="tag lesson">lesson</span>
                  </div>
                </div>

                <div className="palette-group">
                  <div className="palette-group-name">Objectives</div>
                  <div className="palette-item">
                    <span className="icon">◎</span>
                    <span className="name">"Set variables to different data <strong>type</strong>s using <strong>type c</strong>asting"</span>
                    <span className="tag obj">obj</span>
                  </div>
                </div>

                <div className="palette-group">
                  <div className="palette-group-name">Actions</div>
                  <div className="palette-item">
                    <span className="icon">↻</span>
                    <span className="name">Toggle Lab VM</span>
                    <span className="ctx">⌘⇧L</span>
                    <span className="tag action">action</span>
                  </div>
                  <div className="palette-item">
                    <span className="icon">⌫</span>
                    <span className="name">Reset progress…</span>
                    <span className="ctx">danger</span>
                    <span className="tag action">action</span>
                  </div>
                </div>

                <div className="palette-group">
                  <div className="palette-group-name">Flags</div>
                  <div className="palette-item">
                    <span className="icon">⚑</span>
                    <span className="name">cast_overflow_42</span>
                    <span className="ctx">captured 2d ago</span>
                    <span className="tag flag">flag</span>
                  </div>
                </div>

                <div className="palette-foot">
                  <span><span className="kbd">↑</span><span className="kbd">↓</span>navigate</span>
                  <span><span className="kbd">↵</span>select</span>
                  <span><span className="kbd">⌘↵</span>open in new tab</span>
                </div>
              </div>
            </div>
          </div>
        </Browser>

        <SceneNotes
          title="Why a palette beats search"
          bullets={[
            ["Universal", "lessons, objectives, flags, and verbs in one surface"],
            ["Fuzzy-matched", "fzf-style scoring; tolerates typos and partial words"],
            ["Action verbs", "\"toggle lab\", \"reset\", \"export notes\", \"focus\""],
            ["Keyboard-only flow", "⌘K · type · ↵ · gone — no mouse needed"],
          ]}
          meta={[
            ["Effort", "S (≈ 1 wk)"],
            ["Files", "components/CommandPalette.tsx (new)"],
            ["Risk", "Low — replaces Sidebar search input"],
          ]}
        />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SCENE 4 — Interactive code (lesson view emphasis)
// ════════════════════════════════════════════════════════════
function SceneCode() {
  return (
    <>
      <div className="stage-head">
        <div className="stage-num">P4 · Interactive code</div>
        <h2 className="stage-title">Snippets you can run on the spot.</h2>
      </div>
      <p className="stage-blurb">
        Today's CodeBlock is a single-color <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>&lt;pre&gt;</code> with
        a copy icon. Learners have to open the Lab VM and paste to try anything. The proposed block:
        full syntax highlighting, run inline, and "↗ Lab" pre-fills the editor.
      </p>
      <div className="stage-grid">
        <Browser url="python-reviewer.local/lesson/1.1.3" path="/lesson/1.1.3" height={640}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100%", minHeight: 0 }}>
            <MockSidebar compact />
            <div style={{ overflow: "hidden" }}><MockLesson /></div>
          </div>
        </Browser>

        <SceneNotes
          title="Three actions, three intents"
          bullets={[
            ["▶ Run", "executes the snippet under the block; no VM needed"],
            ["↗ Lab", "opens Lab VM with code pre-pasted, cursor at end"],
            ["📋", "copy to clipboard — old behavior, kept"],
            ["Tokenizer", "Shiki w/ github-dark; <1ms per block at build"],
          ]}
          meta={[
            ["Effort", "S (≈ 1 wk)"],
            ["Files", "components/CodeBlock.tsx, hooks/useInlineRun.ts (new)"],
            ["Risk", "Low — same DOM shape; new actions"],
          ]}
        />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SCENE 5 — Flag tracker
// ════════════════════════════════════════════════════════════
function SceneFlags() {
  const flags = [
    { num: "01", name: "py_version_kali_pwn", diff: "easy", got: true, lab: "Find Python version", date: "May 8" },
    { num: "02", name: "first_script_42",     diff: "easy", got: true, lab: "Hello, world+",      date: "May 8" },
    { num: "03", name: "slice_me_baby",       diff: "easy", got: true, lab: "Slicing exercise",    date: "May 9" },
    { num: "04", name: "cast_overflow",       diff: "med",  got: true, lab: "Type-cast trap",      date: "May 12" },
    { num: "05", name: "??????????",          diff: "med",  got: false, lab: "Loops with break",   date: "—" },
    { num: "06", name: "??????????",          diff: "med",  got: false, lab: "File I/O",           date: "—" },
    { num: "07", name: "??????????",          diff: "med",  got: false, lab: "Dict crashing",      date: "—" },
    { num: "08", name: "??????????",          diff: "hard", got: false, lab: "Socket scanner",     date: "—" },
    { num: "09", name: "??????????",          diff: "hard", got: false, lab: "Buffer overflow",    date: "—" },
    { num: "10", name: "??????????",          diff: "hard", got: false, lab: "Shellcode injector", date: "—" },
    { num: "11", name: "??????????",          diff: "hard", got: false, lab: "C2 beacon",          date: "—" },
    { num: "12", name: "??????????",          diff: "hard", got: false, lab: "Pivoting",           date: "—" },
  ];

  return (
    <>
      <div className="stage-head">
        <div className="stage-num">P5 · CTF flag tracker</div>
        <h2 className="stage-title">Make the flags worth chasing.</h2>
      </div>
      <p className="stage-blurb">
        Today, captured flags get a one-line toast in the Lab VM and then disappear. The proposed
        /flags page is a permanent scoreboard with difficulty ratings, source-lab links, and
        an export-as-image button for sharing.
      </p>
      <div className="stage-grid">
        <Browser url="python-reviewer.local/flags" path="/flags" height={640}>
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", height: "100%" }}>
            <MockSidebar compact activeId="" />
            <div className="flags-wrap">
              <div className="flags-head">
                <h2>Captured Flags</h2>
                <div className="flags-stats">
                  <div className="flags-stat">
                    <div className="lbl">Total</div>
                    <div className="val green">4 / 12</div>
                  </div>
                  <div className="flags-stat">
                    <div className="lbl">Easy</div>
                    <div className="val">3/3</div>
                  </div>
                  <div className="flags-stat">
                    <div className="lbl">Medium</div>
                    <div className="val">1/4</div>
                  </div>
                  <div className="flags-stat">
                    <div className="lbl">Hard</div>
                    <div className="val">0/5</div>
                  </div>
                </div>
              </div>
              <div className="flags-grid">
                {flags.map((f) => (
                  <div key={f.num} className={"flag-card " + (f.got ? "got" : "locked")}>
                    <div className="flag-card-head">
                      <span className="flag-card-num">#{f.num}</span>
                      <span className={"flag-card-diff " + f.diff}>{f.diff}</span>
                    </div>
                    <div className="flag-card-name">
                      <span className="icon">{f.got ? "⚑" : "🔒"}</span>
                      <span>{f.name}</span>
                    </div>
                    <div className="flag-card-sub">{f.lab}</div>
                    <div className="flag-card-foot">
                      <span>{f.got ? "captured " + f.date : "locked"}</span>
                      {f.got && <a href="#">replay →</a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Browser>

        <SceneNotes
          title="Gamified, not gimmicky"
          bullets={[
            ["/flags route", "first-class page; locked silhouettes for un-captured"],
            ["Difficulty tags", "easy / med / hard set per lab in labStarters.ts"],
            ["Replay link", "jumps back to the originating lab with code reset"],
            ["Share card", "auto-gen 1200×630 OG image with captured count"],
          ]}
          meta={[
            ["Effort", "S (≈ 1 wk)"],
            ["Files", "pages/Flags.tsx (new), labStarters.ts schema"],
            ["Risk", "Low — reads existing localStorage"],
          ]}
        />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// SCENE 6 — Mobile companion
// ════════════════════════════════════════════════════════════
function SceneMobile() {
  return (
    <>
      <div className="stage-head">
        <div className="stage-num">P6 · Mobile companion</div>
        <h2 className="stage-title">Study on the train, run on the laptop.</h2>
      </div>
      <p className="stage-blurb">
        The Lab VM (Pyodide + textarea + Kali aesthetic) is not a mobile experience. Instead of
        forcing it onto small screens, the mobile build delivers a focused reading + flag-tracking
        app and a one-tap "resume on desktop" link so a session crosses devices cleanly.
      </p>
      <div className="phone-scene">
        <div className="phone-copy">
          <h3>Read here, <em>solve there</em>.</h3>
          <p>
            Tap a lesson on your phone, swipe through code samples and exercises,
            then send yourself a deep-link to pick up the lab on your laptop. No
            in-browser Python on mobile — just clean reading and a flag dashboard.
          </p>
          <div className="phone-bits">
            <div className="phone-bit">
              <span className="phone-bit-num">1</span>
              <div className="phone-bit-body">
                <strong>Drawer sidebar</strong> — off-canvas nav with module-level only;
                <span> tap a lesson, the drawer closes.</span>
              </div>
            </div>
            <div className="phone-bit">
              <span className="phone-bit-num">2</span>
              <div className="phone-bit-body">
                <strong>Read-only code</strong> — syntax highlight + copy;
                <span> a soft amber banner explains the lab is desktop-only.</span>
              </div>
            </div>
            <div className="phone-bit">
              <span className="phone-bit-num">3</span>
              <div className="phone-bit-body">
                <strong>Resume on desktop</strong> — emails or AirDrops a deep link;
                <span> open it on your laptop and the lesson + lab boot pre-positioned.</span>
              </div>
            </div>
            <div className="phone-bit">
              <span className="phone-bit-num">4</span>
              <div className="phone-bit-body">
                <strong>Flags scoreboard</strong> — same data as desktop;
                <span> motivating glance while waiting in line.</span>
              </div>
            </div>
          </div>
        </div>
        <window.PhoneDemo />
      </div>
    </>
  );
}

// ════════════════════════════════════════════════════════════
// Side notes panel (used by most scenes)
// ════════════════════════════════════════════════════════════
function SceneNotes({ title, bullets, meta }) {
  return (
    <aside className="notes-panel">
      <div className="notes-eyebrow">Designer's note</div>
      <h3 className="notes-title">{title}</h3>
      <ul className="notes-list">
        {bullets.map(([head, dim]) => (
          <li key={head}>
            <span><strong>{head}</strong>{dim && <span className="dim"> — {dim}</span>}</span>
          </li>
        ))}
      </ul>
      <div className="notes-meta">
        {meta.map(([lbl, val]) => (
          <div className="notes-meta-row" key={lbl}>
            <span className="lbl">{lbl}</span>
            <span className={"val " + (lbl === "Effort" ? "accent" : "")}>{val}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

// ════════════════════════════════════════════════════════════
// Export
// ════════════════════════════════════════════════════════════
Object.assign(window, {
  SceneOverview, SceneWorkspace, SceneDashboard,
  ScenePalette, SceneCode, SceneFlags, SceneMobile,
});
