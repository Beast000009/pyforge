/* global React, ReactDOM */
// App.jsx — Root component + AppInner orchestrator

const {
  useState: useAppState,
  useEffect: useAppEffect,
  useRef: useAppRef,
  useCallback: useAppCb,
} = React;

// ── TopBar ────────────────────────────────────────────────────
function TopBar({ mod, sec, sub, page, onPalette, onLabToggle, onThemeToggle, onHelp, onDrawer, labOpen, theme }) {
  return (
    <div className="ws-topbar">
      <button className="mobile-menu-btn" onClick={onDrawer} title="Menu" style={{ display: 'none' }} id="mobile-menu-btn">
        ☰
      </button>
      <div className="ws-crumbs">
        {mod && sec && sub && (
          <>
            <span>{mod.number}. {mod.title}</span>
            <span className="sep">›</span>
            <span>{sec.number}. {sec.title}</span>
            <span className="sep">›</span>
            <span className="now">{sub.number}. {sub.title}</span>
          </>
        )}
      </div>
      <div className="ws-actions">
        <button className="ws-btn" onClick={onPalette} title="Command palette (⌘K)">
          ⌘K <span className="kbd">⌘K</span>
        </button>
        <button className={"ws-btn" + (labOpen ? " active" : "")} onClick={onLabToggle} title="Toggle Lab pane (⌘\\)">
          ⚡ Lab <span className="kbd">⌘\</span>
        </button>
        <button className="ws-btn" onClick={onThemeToggle} title="Toggle theme">
          {theme === 'light' ? '🌙' : '☀'}
        </button>
        <button className="ws-btn" onClick={onHelp} title="Keyboard shortcuts">
          ?
        </button>
      </div>
    </div>
  );
}

// ── AppInner ──────────────────────────────────────────────────
function AppInner() {
  const { state, actions, derived } = window.useStore();

  const [paletteOpen, setPaletteOpen] = useAppState(false);
  const [drawerOpen, setDrawerOpen] = useAppState(false);
  const [showHelp, setShowHelp] = useAppState(false);
  const [activeLab, setActiveLab] = useAppState(null);
  // Bumped when the async /labs catalog fetch resolves (or fails) so views
  // that read window.LAB_STARTERS during render re-render once it's populated.
  const [labsNonce, setLabsNonce] = useAppState(window.LAB_STARTERS_READY ? 1 : 0);
  const [labsOffline, setLabsOffline] = useAppState(false);
  const resizing = useAppRef(false);

  const layout = state.layout || {};
  const activeLayout = layout[state.activeId] || {};
  const labWidth = activeLayout.labWidth || 460;

  // Re-render once the lab catalog finishes loading (or fails) — it's fetched
  // asynchronously after boot, so the first render has an empty LAB_STARTERS.
  useAppEffect(() => {
    const onReady = () => { setLabsNonce(n => n + 1); setLabsOffline(false); };
    const onUnavail = () => { setLabsNonce(n => n + 1); setLabsOffline(true); };
    window.addEventListener('labs-ready', onReady);
    window.addEventListener('labs-unavailable', onUnavail);
    return () => {
      window.removeEventListener('labs-ready', onReady);
      window.removeEventListener('labs-unavailable', onUnavail);
    };
  }, []);

  // Auto-attach the lab starter for the current lesson (by subsectionId)
  useAppEffect(() => {
    const starters = window.LAB_STARTERS || {};
    const match = Object.values(starters).find(l => l.subsectionId === state.activeId);
    setActiveLab(match || null);
  }, [state.activeId, labsNonce]);

  // Lab pane defaults to OPEN when the lesson has a starter, unless the user
  // has explicitly closed it (activeLayout.labOpen === false).
  const hasStarter = Object.values(window.LAB_STARTERS || {}).some(l => l.subsectionId === state.activeId);
  const labOpen = activeLayout.labOpen === undefined ? hasStarter : activeLayout.labOpen;

  // Apply theme class to body
  useAppEffect(() => {
    document.body.className = state.theme === 'light' ? 'light' : '';
  }, [state.theme]);

  // Init keyboard once
  useAppEffect(() => {
    window.Keyboard.init();
  }, []);

  // Show mobile menu btn on small screens
  useAppEffect(() => {
    function applyMobileBtn() {
      const btn = document.getElementById('mobile-menu-btn');
      if (btn) btn.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
    }
    applyMobileBtn();
    window.addEventListener('resize', applyMobileBtn);
    return () => window.removeEventListener('resize', applyMobileBtn);
  }, []);

  // Toggle-drawer custom event from MobileNav
  useAppEffect(() => {
    function onToggleDrawer() { setDrawerOpen(p => !p); }
    window.addEventListener('toggle-drawer', onToggleDrawer);
    return () => window.removeEventListener('toggle-drawer', onToggleDrawer);
  }, []);

  // Navigation helper
  function navigateBy(dir) {
    const all = window.getAllSubs();
    const idx = all.findIndex(x => x.sub.id === state.activeId);
    const target = all[idx + dir];
    if (target) {
      actions.setActiveId(target.sub.id);
      actions.setPage('lesson');
    }
  }

  // Action dispatcher
  const dispatch = useAppCb((action) => {
    switch (action) {
      case 'palette.toggle':
        setPaletteOpen(p => !p);
        break;
      case 'lab.toggle': {
        const cur = (state.layout[state.activeId] || {});
        const nowOpen = !cur.labOpen;
        // If trying to open but nothing to show — give actionable feedback instead of silent no-op
        if (nowOpen) {
          if (labsOffline) {
            window.dispatchEvent(new CustomEvent('toast', { detail: {
              msg: '⚠ Lab server offline. Run: bash start.sh',
              kind: 'warn',
            }}));
            return;
          }
          const starters = window.LAB_STARTERS || {};
          const hasLab = Object.values(starters).some(l => l.subsectionId === state.activeId);
          if (!hasLab) {
            window.dispatchEvent(new CustomEvent('toast', { detail: {
              msg: 'No lab for this lesson — navigate to a lesson marked ⚡',
              kind: 'info',
            }}));
            return;
          }
        }
        actions.setLayout({ ...state.layout, [state.activeId]: { ...cur, labOpen: nowOpen } });
        break;
      }
      case 'lab.run':
        window.dispatchEvent(new CustomEvent('lab-run'));
        break;
      case 'lesson.next':
        navigateBy(1);
        break;
      case 'lesson.prev':
        navigateBy(-1);
        break;
      case 'lesson.toggle-complete':
        actions.markComplete(state.activeId);
        break;
      case 'page.home':
        actions.setPage('home');
        break;
      case 'page.practice':
        actions.setPage('practice');
        break;
      case 'page.progress':
        actions.setPage('progress');
        break;
      case 'page.flags':
        actions.setPage('flags');
        break;
      case 'page.lesson':
        actions.setPage('lesson');
        break;
      case 'theme.toggle':
        actions.setTheme(state.theme === 'dark' ? 'light' : 'dark');
        break;
      case 'help.toggle':
        setShowHelp(p => !p);
        break;
      case 'modal.close':
        setPaletteOpen(false);
        setDrawerOpen(false);
        setShowHelp(false);
        break;
      case 'store.reset':
        if (window.confirm('Reset all progress?')) actions.resetAll();
        break;
      default:
        break;
    }
  }, [state, actions]);

  // Subscribe to "app-action" custom events
  useAppEffect(() => {
    function onAction(e) { dispatch(e.detail); }
    window.addEventListener('app-action', onAction);
    return () => window.removeEventListener('app-action', onAction);
  }, [dispatch]);

  // Resize drag on lab pane divider
  function startResize(e) {
    e.preventDefault();
    resizing.current = true;
    const startX = e.clientX;
    const startW = labWidth;
    function onMove(ev) {
      if (!resizing.current) return;
      const dx = startX - ev.clientX;
      const newW = Math.max(280, Math.min(720, startW + dx));
      const cur = (state.layout[state.activeId] || {});
      actions.setLayout({ ...state.layout, [state.activeId]: { ...cur, labWidth: newW } });
    }
    function onUp() {
      resizing.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  function handleNavigate(id) {
    actions.setActiveId(id);
    actions.setPage('lesson');
    setDrawerOpen(false);
  }

  function openLab(labKey) {
    const starter = window.LAB_STARTERS[labKey];
    if (starter) {
      setActiveLab(starter);
      const cur = (state.layout[state.activeId] || {});
      actions.setLayout({ ...state.layout, [state.activeId]: { ...cur, labOpen: true } });
    }
  }

  function handleCopyToLab(code) {
    const foundNow = window.findSubById(state.activeId);
    const labKey = foundNow?.sub?.lab || state.activeId;
    const starter = activeLab || window.LAB_STARTERS[labKey];
    if (starter) {
      setActiveLab({ ...starter, code, copiedAt: Date.now() });
      const cur = (state.layout[state.activeId] || {});
      actions.setLayout({ ...state.layout, [state.activeId]: { ...cur, labOpen: true } });
    }
  }

  function handleFlagCaptured(flag) {
    actions.captureFlag(flag, new Date().toLocaleDateString());
    window.dispatchEvent(new CustomEvent('toast', { detail: { msg: `Flag captured: ${flag}`, kind: 'ok' } }));
  }

  const found = window.findSubById(state.activeId);
  const { mod, sec, sub } = found || {};
  const { page } = state;

  return (
    <div className={'app' + (drawerOpen ? ' mobile-drawer-open' : '')}>
      {/* Mobile overlay */}
      <div
        className={'mobile-overlay' + (drawerOpen ? ' show' : '')}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Lab-server offline banner */}
      {labsOffline && (
        <div className="app-offline-banner" role="alert">
          <span>
            ⚠ <strong>Lab server offline.</strong> Coding labs won't work until it's running.
            {' '}Quick start: <code>bash start.sh</code> — or manually:
            {' '}<code>cd lab-server &amp;&amp; npm install &amp;&amp; npm run build:images &amp;&amp; node server.js</code>
            {' '}(Docker must be running and images must be built on first use).
          </span>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      )}

      {/* Sidebar */}
      <window.Sidebar
        activeId={state.activeId}
        page={page}
        onSelect={handleNavigate}
        onHome={() => { actions.setPage('home'); setDrawerOpen(false); }}
        onFlags={() => { actions.setPage('flags'); setDrawerOpen(false); }}
        onPractice={() => { actions.setPage('practice'); setDrawerOpen(false); }}
        onProgress={() => { actions.setPage('progress'); setDrawerOpen(false); }}
        onTheme={() => dispatch('theme.toggle')}
        onHelp={() => dispatch('help.toggle')}
        completed={new Set(state.completed)}
        dueCount={derived.dueCards.length}
        moduleMastery={derived.moduleMastery}
      />

      {/* Pages */}
      {page === 'home' && (
        <window.HomeScreen
          onNavigate={handleNavigate}
          capturedFlags={new Set(state.capturedFlags)}
        />
      )}

      {page === 'flags' && (
        <window.FlagsPage
          capturedFlags={new Set(state.capturedFlags)}
          flagDates={state.flagDates || {}}
          onReplay={(labKey) => {
            openLab(labKey);
            actions.setPage('lesson');
          }}
        />
      )}

      {page === 'practice' && <window.PracticePanel />}

      {page === 'progress' && <window.ProgressPanel />}

      {page === 'lesson' && sub && (
        <div className="workspace">
          <TopBar
            mod={mod}
            sec={sec}
            sub={sub}
            page={page}
            onPalette={() => setPaletteOpen(p => !p)}
            onLabToggle={() => dispatch('lab.toggle')}
            onThemeToggle={() => dispatch('theme.toggle')}
            onHelp={() => dispatch('help.toggle')}
            onDrawer={() => setDrawerOpen(p => !p)}
            labOpen={labOpen}
            theme={state.theme}
          />
          <div className="ws-panes">
            <window.LessonView
              mod={mod}
              sec={sec}
              sub={sub}
              completed={new Set(state.completed)}
              onMarkComplete={(id) => actions.markComplete(id)}
              onNavigate={handleNavigate}
              onOpenLab={openLab}
              onCopyToLab={handleCopyToLab}
            />
            {labOpen && activeLab && (
              <>
                <div className="ws-resizer" onMouseDown={startResize} title="Drag to resize" />
                <div className="ws-lab" style={{ width: labWidth + 'px' }}>
                  <window.LabPane
                    starter={activeLab}
                    onFlagCaptured={handleFlagCaptured}
                    onClose={() => {
                      const cur = (state.layout[state.activeId] || {});
                      actions.setLayout({ ...state.layout, [state.activeId]: { ...cur, labOpen: false } });
                    }}
                    labWidth={labWidth}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Command palette */}
      {paletteOpen && (
        <window.CommandPalette
          onClose={() => setPaletteOpen(false)}
          onNavigate={handleNavigate}
          onAction={(action) => {
            window.dispatchEvent(new CustomEvent('app-action', { detail: action }));
          }}
          capturedFlags={new Set(state.capturedFlags)}
          dueCount={derived.dueCards.length}
        />
      )}

      {/* Keyboard help */}
      {showHelp && <window.KeyboardHelp onClose={() => setShowHelp(false)} />}

      {/* Mobile bottom nav */}
      <window.MobileNav page={page} onNavigate={(p) => actions.setPage(p)} />

      {/* Toasts */}
      <window.Toasts />
    </div>
  );
}

function App() {
  return React.createElement(
    window.StoreProvider,
    null,
    React.createElement(AppInner)
  );
}

Object.assign(window, { App });

// Boot
ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(App)
);
