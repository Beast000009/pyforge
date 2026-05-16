// pr-app.jsx — Root app: routing, P1 workspace, P3 palette, P6 mobile

const {
  useState: useAppState, useEffect: useAppEffect,
  useCallback: useAppCb, useRef: useAppRef
} = React;

const ACTIVE_KEY  = "offsec-python-active";
const DONE_KEY    = "offsec-python-completed";
const FLAGS_KEY   = "offsec-py-flags";
const LAYOUT_KEY  = "offsec-py-layout";

function App() {
  // ── Routing ──────────────────────────────────────────────
  const [page, setPage] = useAppState(() => {
    const stored = window.LS.get("offsec-py-page", "home");
    return stored;
  });

  // ── Lesson state ──────────────────────────────────────────
  const defaultId = window.COURSE[0].sections[0].subsections[0].id;
  const [activeId, setActiveId] = useAppState(() => window.LS.get(ACTIVE_KEY, defaultId));
  const [completed, setCompleted] = useAppState(() => {
    return new Set(window.LS.get(DONE_KEY, []));
  });
  const [capturedFlags, setCapturedFlags] = useAppState(() => {
    return new Set(window.LS.get(FLAGS_KEY, []));
  });

  // ── P1: Lab VM state ─────────────────────────────────────
  const [labOpen, setLabOpen] = useAppState(() => window.LS.get("offsec-py-lab-open", false));
  const [labWidth, setLabWidth] = useAppState(() => window.LS.get("offsec-py-lab-w", 460));
  const [activeLab, setActiveLab] = useAppState(null);
  const resizing = useAppRef(false);

  // ── P3: Palette ───────────────────────────────────────────
  const [paletteOpen, setPaletteOpen] = useAppState(false);

  // ── P6: Mobile drawer ────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useAppState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  // ── Persist ───────────────────────────────────────────────
  useAppEffect(() => { window.LS.set(ACTIVE_KEY, activeId); }, [activeId]);
  useAppEffect(() => { window.LS.set(DONE_KEY, [...completed]); }, [completed]);
  useAppEffect(() => { window.LS.set(FLAGS_KEY, [...capturedFlags]); }, [capturedFlags]);
  useAppEffect(() => { window.LS.set("offsec-py-lab-open", labOpen); }, [labOpen]);
  useAppEffect(() => { window.LS.set("offsec-py-lab-w", labWidth); }, [labWidth]);
  useAppEffect(() => { window.LS.set("offsec-py-page", page); }, [page]);

  // ── Streak updater ────────────────────────────────────────
  function updateStreak() {
    const today = new Date().toDateString();
    const s = window.LS.get("offsec-py-streak", { count: 0, lastDate: null });
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (s.lastDate === today) return;
    const count = s.lastDate === yesterday ? s.count + 1 : 1;
    window.LS.set("offsec-py-streak", { count, lastDate: today });
    // Update activity heatmap
    const a = window.LS.get("offsec-py-activity", Array(84).fill(0));
    a[83] = (a[83] || 0) + 1;
    window.LS.set("offsec-py-activity", a);
  }

  // ── Keyboard shortcuts ────────────────────────────────────
  useAppEffect(() => {
    function onKey(e) {
      const typing = ["INPUT", "TEXTAREA"].includes(e.target?.tagName) || e.target?.isContentEditable;
      // ⌘K — palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen(p => !p);
        return;
      }
      // ⌘\ — toggle lab
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setLabOpen(p => !p);
        return;
      }
      if (typing) return;
      // j / ArrowRight — next lesson
      if (e.key === "j" || e.key === "ArrowRight") {
        e.preventDefault();
        navigateBy(1);
      } else if (e.key === "k" || e.key === "ArrowLeft") {
        e.preventDefault();
        navigateBy(-1);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        markComplete(activeId);
      } else if (e.key === "Escape") {
        setPaletteOpen(false);
        setDrawerOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeId, labOpen]);

  function navigateBy(dir) {
    const all = window.getAllSubs();
    const idx = all.findIndex(x => x.sub.id === activeId);
    const target = all[idx + dir];
    if (target) {
      setActiveId(target.sub.id);
      setPage("lesson");
    }
  }

  function markComplete(id) {
    setCompleted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    updateStreak();
  }

  function handleNavigate(id) {
    setActiveId(id);
    setPage("lesson");
    setDrawerOpen(false);
    window.scrollTo?.(0, 0);
  }

  function handleFlagCaptured(flag, starter) {
    setCapturedFlags(prev => new Set([...prev, flag]));
    // Record date
    const dates = window.LS.get("offsec-py-flag-dates", {});
    dates[flag] = new Date().toLocaleDateString();
    window.LS.set("offsec-py-flag-dates", dates);
  }

  function openLab(labKey) {
    const starter = window.LAB_STARTERS[labKey];
    if (starter) {
      setActiveLab(starter);
      setLabOpen(true);
    }
  }

  function handlePaletteAction(actionId) {
    if (actionId === "toggle-lab") setLabOpen(p => !p);
    else if (actionId === "home") setPage("home");
    else if (actionId === "flags") setPage("flags");
    else if (actionId === "mark-complete") markComplete(activeId);
  }

  // ── P1: Resize drag ───────────────────────────────────────
  const containerRef = useAppRef(null);
  function startResize(e) {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startW = labWidth;
    function onMove(ev) {
      if (!resizing.current) return;
      const dx = startX - ev.clientX;
      const newW = Math.max(280, Math.min(720, startW + dx));
      setLabWidth(newW);
    }
    function onUp() {
      resizing.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  // ── Current lesson lookup ─────────────────────────────────
  const found = window.findSubById(activeId);
  const { mod, sec, sub } = found || {};

  // ── Top bar of workspace ─────────────────────────────────
  function WorkspaceTopBar() {
    return (
      <div className="ws-topbar">
        <button
          className="mobile-menu-btn"
          style={{ display: "none" }}
          id="mobile-menu-btn"
          onClick={() => setDrawerOpen(p => !p)}
        >
          ☰ Menu
        </button>
        <div className="ws-crumbs">
          {mod && <>
            <span>{mod.number}. {mod.title}</span>
            <span className="sep">›</span>
            <span>{sec.number}. {sec.title}</span>
            <span className="sep">›</span>
            <span className="now">{sub.number}. {sub.title}</span>
          </>}
        </div>
        <div className="ws-actions">
          <button className="ws-btn" onClick={() => setPaletteOpen(p => !p)} title="⌘K">
            ⌘K <span className="kbd">⌘K</span>
          </button>
          <button
            className={"ws-btn" + (labOpen ? " active" : "")}
            onClick={() => setLabOpen(p => !p)}
            title="Toggle Lab VM (⌘\)"
          >
            ⚡ Lab <span className="kbd">⌘\</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className={"app" + (drawerOpen ? " mobile-drawer-open" : "")} ref={containerRef}>

      {/* Mobile overlay */}
      <div className={"mobile-overlay" + (drawerOpen ? " show" : "")} onClick={() => setDrawerOpen(false)} />

      {/* Sidebar (P6: off-canvas on mobile) */}
      <window.Sidebar
        activeId={activeId}
        onSelect={handleNavigate}
        completed={completed}
        onHome={() => { setPage("home"); setDrawerOpen(false); }}
        onFlags={() => { setPage("flags"); setDrawerOpen(false); }}
        page={page}
      />

      {/* Main area */}
      {page === "home" && (
        <window.HomeScreen
          completed={completed}
          onNavigate={handleNavigate}
          capturedFlags={capturedFlags}
        />
      )}

      {page === "flags" && (
        <window.FlagsPage
          capturedFlags={capturedFlags}
          onReplay={(labKey) => {
            openLab(labKey);
            setPage("lesson");
          }}
        />
      )}

      {page === "lesson" && sub && (
        <div className="workspace">
          <WorkspaceTopBar />
          <div className="ws-panes">
            <window.LessonView
              mod={mod}
              sec={sec}
              sub={sub}
              completed={completed}
              onMarkComplete={markComplete}
              onNavigate={handleNavigate}
              onOpenLab={openLab}
              onCopyToLab={(code) => {
                const starter = activeLab || window.LAB_STARTERS[sub.lab || sub.id];
                if (starter) {
                  setActiveLab({ ...starter, code });
                  setLabOpen(true);
                }
              }}
            />
            {labOpen && activeLab && (
              <window.ResizableLabPane
                starter={activeLab}
                onFlagCaptured={handleFlagCaptured}
                onClose={() => setLabOpen(false)}
                labWidth={labWidth}
                onResizeStart={startResize}
              />
            )}
          </div>
        </div>
      )}

      {/* P3: Command palette */}
      {paletteOpen && (
        <window.CommandPalette
          onClose={() => setPaletteOpen(false)}
          onNavigate={handleNavigate}
          onAction={handlePaletteAction}
          capturedFlags={capturedFlags}
        />
      )}

      {/* P6: Mobile bottom nav */}
      <div className="mobile-bottom-nav">
        {[
          { lbl: "Home",   ico: "⌂", p: "home" },
          { lbl: "Learn",  ico: "▤", p: "lesson" },
          { lbl: "Flags",  ico: "⚑", p: "flags" },
          { lbl: "Menu",   ico: "≡", p: "menu" },
        ].map(t => (
          <button key={t.p} className={"mob-tab" + (page === t.p ? " active" : "")}
            onClick={() => {
              if (t.p === "menu") setDrawerOpen(p => !p);
              else setPage(t.p);
            }}>
            <span className="ico">{t.ico}</span>
            <span>{t.lbl}</span>
          </button>
        ))}
      </div>

    </div>
  );
}

// ── Boot ───────────────────────────────────────────────────
// Show mobile menu btn on small screens
function applyMobileMenuVisibility() {
  const btn = document.getElementById("mobile-menu-btn");
  if (btn) btn.style.display = window.innerWidth <= 768 ? "flex" : "none";
}
window.addEventListener("resize", applyMobileMenuVisibility);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
