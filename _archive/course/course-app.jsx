/* global React, ReactDOM, CourseStoreProvider, useCourseStore,
   CourseSidebar, CourseContent, PracticePanel, ProgressPanel2 */
const { useState: useAppSt, useEffect: useAppEf, useCallback: useAppCb } = React;

const ACTIVE_KEY = 'pyrev-active-v3';
const THEME_KEY  = 'pyrev-theme';

function AppInner() {
  const { state, actions, derived } = useCourseStore();
  const defaultId = window.COURSE_DATA[0].sections[0].subsections[0].id;

  const [activeId, setActiveId] = useAppSt(() => {
    try { return localStorage.getItem(ACTIVE_KEY) || defaultId; } catch { return defaultId; }
  });

  const [sidebarOpen, setSidebarOpen] = useAppSt(false);
  const [mode, setMode] = useAppSt('learn'); // 'learn' | 'practice' | 'progress'
  const [showHelp, setShowHelp] = useAppSt(false);
  const [theme, setTheme] = useAppSt(() => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
  });

  // Apply theme class
  useAppEf(() => {
    document.body.classList.toggle('light', theme === 'light');
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }, [theme]);

  useAppEf(() => {
    try { localStorage.setItem(ACTIVE_KEY, activeId); } catch {}
  }, [activeId]);

  function navigate(id) {
    setActiveId(id); setMode('learn');
    const el = document.getElementById('content-scroll');
    if (el) el.scrollTop = 0; else window.scrollTo(0, 0);
  }

  const navigateBy = useAppCb((dir) => {
    const all = window.getAllSubsections();
    const idx = all.findIndex(x => x.subsection.id === activeId);
    const target = all[idx + dir];
    if (target) navigate(target.subsection.id);
  }, [activeId]);

  useAppEf(() => {
    function isTyping(e) {
      const tag = e.target?.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable;
    }
    function onKey(e) {
      if (e.key === 'Escape') { setShowHelp(false); setSidebarOpen(false); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('focus-search'));
        setSidebarOpen(true); return;
      }
      if (isTyping(e)) return;
      if (e.key === 'j' || e.key === 'ArrowRight') { e.preventDefault(); navigateBy(1); }
      else if (e.key === 'k' || e.key === 'ArrowLeft') { e.preventDefault(); navigateBy(-1); }
      else if (e.key === 'm' || e.key === 'M') { e.preventDefault(); actions.markComplete(activeId); }
      else if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setMode(m => m === 'practice' ? 'learn' : 'practice'); }
      else if (e.key === 'g' || e.key === 'G') { e.preventDefault(); setMode(m => m === 'progress' ? 'learn' : 'progress'); }
      else if (e.key === 't' || e.key === 'T') { e.preventDefault(); setTheme(t => t === 'dark' ? 'light' : 'dark'); }
      else if (e.key === '?') { e.preventDefault(); setShowHelp(h => !h); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, navigateBy]);

  useAppEf(() => {
    const btn = document.getElementById('hamburger-btn');
    if (!btn) return;
    const h = () => setSidebarOpen(true);
    btn.addEventListener('click', h);
    return () => btn.removeEventListener('click', h);
  });

  function closeSidebar() { setSidebarOpen(false); }

  const completed = new Set(state.completed);
  const found = window.findSubsectionById(activeId);
  if (!found) return null;
  const { module, section, subsection } = found;

  return (
    <div className="app">
      {/* Mobile overlay */}
      <div className={'drawer-overlay' + (sidebarOpen ? ' open' : '')} onClick={closeSidebar}/>

      {/* Sidebar */}
      <CourseSidebar
        activeId={activeId}
        onSelect={navigate}
        completed={completed}
        onClose={closeSidebar}
        isOpen={sidebarOpen}
        onPractice={() => { setMode('practice'); setSidebarOpen(false); }}
        onProgress={() => { setMode('progress'); setSidebarOpen(false); }}
        onTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        onHelp={() => setShowHelp(true)}
        dueCount={derived.dueCards.length}
      />

      {/* Main panel */}
      {mode === 'practice' && <PracticePanel onBack={() => setMode('learn')}/>}
      {mode === 'progress' && <ProgressPanel2 onBack={() => setMode('learn')}/>}
      {mode === 'learn' && (
        <CourseContent
          module={module} section={section} subsection={subsection}
          completed={completed}
          onMarkComplete={actions.markComplete}
          onNavigate={navigate}
        />
      )}

      {/* Keyboard shortcuts modal */}
      {showHelp && (
        <div className="kbd-overlay" onClick={() => setShowHelp(false)}>
          <div className="kbd-modal" onClick={e => e.stopPropagation()}>
            <h2>Keyboard shortcuts</h2>
            {[
              { keys: ['j', '→'], label: 'Next lesson' },
              { keys: ['k', '←'], label: 'Previous lesson' },
              { keys: ['m'], label: 'Toggle mark complete' },
              { keys: ['p'], label: 'Toggle Practice deck' },
              { keys: ['g'], label: 'Toggle Progress view' },
              { keys: ['t'], label: 'Toggle dark / light' },
              { keys: ['Ctrl K'], label: 'Search lessons' },
              { keys: ['?'], label: 'Show this help' },
              { keys: ['Esc'], label: 'Close modals / sidebar' },
            ].map(({ keys, label }) => (
              <div className="kbd-row" key={label}>
                <span>{label}</span>
                <div className="keys">
                  {keys.map(k => <kbd key={k} className="kbd">{k}</kbd>)}
                </div>
              </div>
            ))}
            <button onClick={() => setShowHelp(false)} style={{ marginTop: 18, width: '100%', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 6, padding: '9px', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <CourseStoreProvider>
      <AppInner/>
    </CourseStoreProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
