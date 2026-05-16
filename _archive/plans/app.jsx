// Root app for Improvement Plan v1 — interactive walkthrough.
// Left rail of scenes, right canvas renders the active scene's mock.

const { useState, useMemo, useEffect } = React;

const SCENES = [
  { id: "ov",    num: "00", name: "Overview",            tag: "summary",    Comp: window.SceneOverview,  area: "Plan" },
  { id: "p1",    num: "P1", name: "Workspace shell",     tag: "/lesson · resizable", Comp: window.SceneWorkspace, area: "Build" },
  { id: "p2",    num: "P2", name: "Landing dashboard",   tag: "/ · home",         Comp: window.SceneDashboard, area: "Build" },
  { id: "p3",    num: "P3", name: "Command palette",     tag: "⌘K · global",      Comp: window.ScenePalette,   area: "Build" },
  { id: "p4",    num: "P4", name: "Interactive code",    tag: "lesson body",      Comp: window.SceneCode,      area: "Polish" },
  { id: "p5",    num: "P5", name: "Flag tracker",        tag: "/flags",           Comp: window.SceneFlags,     area: "Polish" },
  { id: "p6",    num: "P6", name: "Mobile companion",    tag: "≤ 768 px",         Comp: window.SceneMobile,    area: "Reach" },
];

const STORAGE = "offsec-plan-v1-scene";

function App() {
  const [activeId, setActiveId] = useState(() => {
    try { return localStorage.getItem(STORAGE) || "ov"; }
    catch { return "ov"; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE, activeId); } catch (e) {}
  }, [activeId]);

  // Keyboard nav
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      const idx = SCENES.findIndex((s) => s.id === activeId);
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        setActiveId(SCENES[Math.min(SCENES.length - 1, idx + 1)].id);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        setActiveId(SCENES[Math.max(0, idx - 1)].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId]);

  const activeIdx = SCENES.findIndex((s) => s.id === activeId);
  const active    = SCENES[activeIdx];
  const Comp      = active.Comp;
  const progress  = Math.round((activeIdx / (SCENES.length - 1)) * 100);

  const grouped = useMemo(() => {
    const groups = {};
    for (const s of SCENES) {
      groups[s.area] = groups[s.area] || [];
      groups[s.area].push(s);
    }
    return groups;
  }, []);

  return (
    <div className="shell">
      <aside className="rail">
        <div className="rail-head">
          <div className="rail-brand">
            <span className="rail-mark">OffSec</span>
            <span className="rail-brand-name">Python Reviewer</span>
            <span className="rail-brand-sub">v1</span>
          </div>
          <div className="rail-title">
            Improvement <em>plan</em>.
          </div>
          <div className="rail-blurb">
            An interactive walkthrough of six proposals — each rendered as a
            hi-fi mock you can poke at. Use <span className="kbd-inline">↑</span><span className="kbd-inline">↓</span> to step through.
          </div>
        </div>

        <div className="rail-progress">
          <span className="rail-progress-text">{String(activeIdx + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}</span>
          <div className="rail-progress-bar"><div className="rail-progress-fill" style={{ width: progress + "%" }} /></div>
          <span className="rail-progress-text">{progress}%</span>
        </div>

        <nav className="rail-scenes">
          {Object.entries(grouped).map(([area, items]) => (
            <div key={area}>
              <div className="rail-section">{area}</div>
              {items.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={"scene-btn " + (s.id === activeId ? "active" : "")}
                >
                  <span className="scene-id">{s.num}</span>
                  <span className="scene-body">
                    <span className="scene-name">{s.name}</span>
                    <span className="scene-tag">{s.tag}</span>
                  </span>
                  <span className="scene-arrow">→</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="rail-foot">
          <span>Internal · 2026.05.15</span>
          <a href="./Improvement Plan v2.html">v2 doc →</a>
        </div>
      </aside>

      <main className="canvas">
        <div className="canvas-bar">
          <div className="canvas-crumbs">
            <span>Plan</span>
            <span className="sep">›</span>
            <span>{active.area}</span>
            <span className="sep">›</span>
            <span className="now">{active.num} · {active.name}</span>
          </div>
          <div className="canvas-actions">
            <button
              className="cbtn"
              disabled={activeIdx === 0}
              onClick={() => setActiveId(SCENES[Math.max(0, activeIdx - 1)].id)}
            >
              ← Prev
            </button>
            <button
              className="cbtn primary"
              disabled={activeIdx === SCENES.length - 1}
              onClick={() => setActiveId(SCENES[Math.min(SCENES.length - 1, activeIdx + 1)].id)}
            >
              Next → <span className="kbd">↓</span>
            </button>
          </div>
        </div>

        <div className="canvas-stage" key={active.id}>
          <Comp />
        </div>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
