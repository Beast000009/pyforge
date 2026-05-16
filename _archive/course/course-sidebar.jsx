/* global React */
// Sidebar — module/section/subsection tree + search
// Exports: CourseSidebar → window

const { useState: useSBState, useEffect: useSBEffect, useRef: useSBRef } = React;

function CourseSidebar({ activeId, onSelect, completed, onClose, isOpen, onPractice, dueCount, onProgress, onTheme, onHelp }) {
  // Mastery per module from store (if available)
  const store = window.useCourseStore ? window.useCourseStore() : null;
  const moduleMastery = store ? store.derived.moduleMastery : null;
  const [expanded, setExpanded] = useSBState(() => new Set(window.COURSE_DATA.map(m => m.id)));
  const [expandedSec, setExpandedSec] = useSBState(() => {
    const s = new Set();
    window.COURSE_DATA.forEach(m => m.sections.forEach((sec, i) => { if (i === 0) s.add(sec.id); }));
    return s;
  });
  const [query, setQuery] = useSBState('');
  const inputRef = useSBRef(null);

  useSBEffect(() => {
    function onFocus() { inputRef.current?.focus(); inputRef.current?.select(); }
    window.addEventListener('focus-search', onFocus);
    return () => window.removeEventListener('focus-search', onFocus);
  }, []);

  // Auto-expand active item
  useSBEffect(() => {
    for (const mod of window.COURSE_DATA) {
      for (const sec of mod.sections) {
        for (const sub of sec.subsections) {
          if (sub.id === activeId) {
            setExpanded(p => new Set([...p, mod.id]));
            setExpandedSec(p => new Set([...p, sec.id]));
            return;
          }
        }
      }
    }
  }, [activeId]);

  const q = query.trim().toLowerCase();

  const searchResults = q ? window.COURSE_DATA.flatMap(mod =>
    mod.sections.flatMap(sec =>
      sec.subsections
        .filter(sub => sub.title.toLowerCase().includes(q) || sec.title.toLowerCase().includes(q) || mod.title.toLowerCase().includes(q))
        .map(sub => ({ sub, sec, mod }))
    )
  ) : [];

  function toggleMod(id) { setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleSec(id) { setExpandedSec(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  function handleSelect(id) {
    onSelect(id);
    setQuery('');
    onClose && onClose();
  }

  function hl(text) {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q);
    if (i === -1) return text;
    return React.createElement(React.Fragment, null,
      text.slice(0, i),
      React.createElement('mark', null, text.slice(i, i + q.length)),
      text.slice(i + q.length)
    );
  }

  // Count completed per module
  function modProgress(mod) {
    const subs = mod.sections.flatMap(s => s.subsections);
    return { done: subs.filter(s => completed.has(s.id)).length, total: subs.length };
  }

  return (
    <aside className={'sidebar' + (isOpen ? ' open' : '')} id="sidebar">
      {/* Header */}
      <div className="sidebar-head">
        <div className="offsec-badge">
          <span className="offsec-pill">OffSec</span>
          <span className="offsec-name">Get Good at Python</span>
        </div>
        <button className="sidebar-close" onClick={onClose} title="Close sidebar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Practice button */}
      {onPractice && (
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button onClick={onPractice} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 14px', background: 'rgba(232,75,34,0.07)',
            border: 'none', borderRight: '1px solid var(--border)',
            cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, color: 'var(--primary)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
              Practice
            </span>
            {dueCount > 0 && (
              <span style={{ background: 'var(--primary)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>
                {dueCount}
              </span>
            )}
          </button>
          <button onClick={onProgress} style={{
            padding: '9px 12px', background: 'rgba(232,75,34,0.04)', border: 'none',
            borderRight: '1px solid var(--border)',
            cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center',
          }} title="Progress">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 13V9M7.5 13V5M12 13V2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
          <button onClick={onTheme} style={{
            padding: '9px 12px', background: 'rgba(232,75,34,0.04)', border: 'none',
            borderRight: '1px solid var(--border)',
            cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center',
          }} title="Toggle theme">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M3.2 3.2l1 1M10.8 10.8l1 1M3.2 11.8l1-1M10.8 4.2l1-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
          <button onClick={onHelp} style={{
            padding: '9px 12px', background: 'rgba(232,75,34,0.04)', border: 'none',
            cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
          }} title="Keyboard shortcuts">?</button>
        </div>
      )}

      {/* Search */}
      <div className="sidebar-search">
        <div className="search-wrap">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9 9l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search lessons… (Ctrl+K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setQuery('');
              if (e.key === 'Enter' && searchResults.length > 0) handleSelect(searchResults[0].sub.id);
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', lineHeight: 0 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {q ? (
          searchResults.length > 0 ? (
            <div>
              <div className="search-count">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</div>
              {searchResults.map(({ sub, sec, mod }) => (
                <button key={sub.id} className={'search-result-btn' + (activeId === sub.id ? ' active' : '')}
                  onClick={() => handleSelect(sub.id)}>
                  <div style={{ flexShrink: 0, marginTop: 2, color: completed.has(sub.id) ? 'var(--primary)' : 'var(--text-3)' }}>
                    {completed.has(sub.id) ? <CheckIcon/> : <CircleIcon/>}
                  </div>
                  <div>
                    <div className="search-result-title">{hl(sub.title)}</div>
                    <div className="search-result-sub">{hl(mod.title)} › {hl(sec.title)}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p style={{ padding: '24px 16px', fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>No lessons match "{q}"</p>
          )
        ) : (
          window.COURSE_DATA.map(mod => {
            const { done, total } = modProgress(mod);
            const isExpanded = expanded.has(mod.id);
            const mm = moduleMastery ? moduleMastery.find(m => m.id === mod.id) : null;
            const masteryColor = mm ? (mm.pct > 70 ? '#4ade80' : mm.pct > 35 ? 'var(--primary)' : '#fbbf24') : 'var(--text-3)';
            return (
              <div key={mod.id}>
                <button className="mod-toggle" onClick={() => toggleMod(mod.id)}>
                  <span className="chevron">
                    {isExpanded ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}
                  </span>
                  <span style={{ flex: 1 }}>{mod.number}. {mod.title}</span>
                  {mm && mm.pct > 0 && (
                    <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: masteryColor, marginRight: 6 }}>{mm.pct}%</span>
                  )}
                  <span className="mod-count">{done}/{total}</span>
                </button>
                {isExpanded && mod.sections.map(sec => {
                  const secExp = expandedSec.has(sec.id);
                  return (
                    <div key={sec.id}>
                      <button className="sec-toggle" onClick={() => toggleSec(sec.id)}>
                        <span className="chevron">
                          {secExp ? <ChevronDown size={11}/> : <ChevronRight size={11}/>}
                        </span>
                        <span style={{ flex: 1 }}>{sec.number}. {sec.title}</span>
                      </button>
                      {secExp && sec.subsections.map(sub => (
                        <button key={sub.id}
                          className={'sub-btn' + (activeId === sub.id ? ' active' : '')}
                          onClick={() => handleSelect(sub.id)}>
                          <span className={completed.has(sub.id) ? 'check' : 'circle'}>
                            {completed.has(sub.id) ? <CheckIcon/> : <CircleIcon/>}
                          </span>
                          <span>{sub.number}. {sub.title}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
}

// Tiny icon helpers
function ChevronDown({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 13 13" fill="none"><path d="M2 4l4.5 5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function ChevronRight({ size = 13 }) {
  return <svg width={size} height={size} viewBox="0 0 13 13" fill="none"><path d="M4 2l5 4.5L4 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M2.5 5.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function CircleIcon() {
  return <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="5" stroke="currentColor" strokeWidth="1.2"/></svg>;
}

Object.assign(window, { CourseSidebar });
