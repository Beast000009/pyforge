/* global React */
// Sidebar.jsx — Tree nav, search, progress bar, action rail

const { useState: useSBState, useEffect: useSBEffect, useRef: useSBRef } = React;

function highlight(text, query) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return React.createElement(React.Fragment, null,
    text.slice(0, idx),
    React.createElement('mark', null, text.slice(idx, idx + query.length)),
    text.slice(idx + query.length)
  );
}

function Sidebar({ activeId, page, onSelect, onHome, onPractice, onProgress, onFlags, onTheme, onHelp, completed, dueCount, moduleMastery }) {
  const allSubs = window.getAllSubs();
  // Build a quick lookup of which subsection IDs have a lab. Every lab is
  // Docker-backed now (Pyodide removed), so the tag is always 'docker'.
  const labMap = {};
  for (const lab of Object.values(window.LAB_STARTERS || {})) {
    labMap[lab.subsectionId] = 'docker';
  }
  const totalSubs = allSubs.length;
  const completedCount = allSubs.filter(({ sub }) => completed.has(sub.id)).length;
  const pct = totalSubs > 0 ? Math.round((completedCount / totalSubs) * 100) : 0;

  const [expanded, setExpanded] = useSBState(() => {
    const mods = new Set((window.COURSE_DATA || []).map(m => m.id));
    const secs = new Set((window.COURSE_DATA || []).flatMap(m => (m.sections || []).slice(0, 1).map(s => s.id)));
    return { mods, secs };
  });
  const [query, setQuery] = useSBState('');
  const inputRef = useSBRef(null);

  // Auto-expand active lesson's module + section
  useSBEffect(() => {
    const found = window.findSubById(activeId);
    if (found) {
      setExpanded(prev => ({
        mods: new Set([...prev.mods, found.mod.id]),
        secs: new Set([...prev.secs, found.sec.id]),
      }));
    }
  }, [activeId]);

  const q = query.trim().toLowerCase();
  const results = q ? allSubs.filter(({ mod, sec, sub }) =>
    sub.title.toLowerCase().includes(q) ||
    sec.title.toLowerCase().includes(q) ||
    mod.title.toLowerCase().includes(q)
  ) : null;

  function toggle(type, id) {
    setExpanded(prev => {
      const set = new Set(prev[type]);
      set.has(id) ? set.delete(id) : set.add(id);
      return { ...prev, [type]: set };
    });
  }

  function select(id) {
    onSelect(id);
    setQuery('');
  }

  // Build mastery lookup: id → pct
  const masteryMap = {};
  (moduleMastery || []).forEach(m => { masteryMap[m.id] = m.pct; });

  function masteryColor(pct) {
    if (pct > 70) return 'var(--green)';
    if (pct > 35) return 'var(--amber)';
    return 'var(--orange)';
  }

  return (
    <aside className="sidebar">
      <div className="sb-head">
        <div className="sb-brand">
          <span className="sb-mark" style={{ letterSpacing: '.06em', fontSize: 11 }}>PyForge</span>
          <span className="sb-title">Get Good at Python</span>
        </div>
        <div className="sb-search">
          <span style={{ color: 'var(--fg3)', fontSize: 12 }}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') setQuery('');
              if (e.key === 'Enter' && results?.length) select(results[0].sub.id);
            }}
            placeholder="Search lessons…"
          />
          <span className="cmd">⌘K</span>
        </div>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-bar-inner">
          <div className="progress-bar-fill" style={{ width: pct + '%' }} />
        </div>
        <div className="progress-label">
          <span>{completedCount}/{totalSubs} lessons</span>
          <span>{pct}% complete</span>
        </div>
      </div>

      <nav className="sb-nav">
        {results ? (
          results.length === 0 ? (
            <div style={{ padding: '20px 18px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg3)', textAlign: 'center' }}>
              No results for "{query}"
            </div>
          ) : results.map(({ mod, sec, sub }) => (
            <button key={sub.id} className={'sb-result' + (sub.id === activeId ? ' active' : '')}
              onClick={() => select(sub.id)}>
              <span className="dot" style={completed.has(sub.id) ? { background: 'var(--green)' } : {}} />
              <span>
                <div className="sb-result-main">{highlight(sub.title, query)}</div>
                <div className="sb-result-sub">{mod.number}. {highlight(mod.title, query)} › {sec.number}. {highlight(sec.title, query)}</div>
              </span>
            </button>
          ))
        ) : (window.COURSE_DATA || []).map(mod => {
          const modSubs = (mod.sections || []).flatMap(s => s.subsections || s.subs || []);
          const done = modSubs.filter(s => completed.has(s.id)).length;
          const isModOpen = expanded.mods.has(mod.id);
          const mPct = masteryMap[mod.id];
          return (
            <div key={mod.id}>
              <button className="sb-mod-btn" onClick={() => toggle('mods', mod.id)}>
                <span style={{ color: 'var(--orange)', fontFamily: 'var(--mono)', fontSize: 11 }}>
                  {isModOpen ? '▾' : '▸'}
                </span>
                <span style={{ flex: 1, textAlign: 'left' }}>{mod.number}. {mod.title}</span>
                {mPct !== undefined && (
                  <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: masteryColor(mPct), marginRight: 4 }}>{mPct}%</span>
                )}
                <span className="count">{done}/{modSubs.length}</span>
              </button>
              {isModOpen && (mod.sections || []).map(sec => {
                const isSecOpen = expanded.secs.has(sec.id);
                return (
                  <div key={sec.id}>
                    <button className="sb-sec-btn" onClick={() => toggle('secs', sec.id)}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg3)' }}>
                        {isSecOpen ? '▾' : '▸'}
                      </span>
                      {sec.number}. {sec.title}
                    </button>
                    {isSecOpen && (sec.subsections || sec.subs || []).map(sub => {
                      const isDone = completed.has(sub.id);
                      const isActive = sub.id === activeId;
                      const labKind = labMap[sub.id];
                      return (
                        <button key={sub.id}
                          className={'sb-sub-btn' + (isActive ? ' active' : '')}
                          onClick={() => select(sub.id)}>
                          <span className={'dot' + (isDone ? ' done' : isActive ? ' active' : '')} />
                          <span style={{ flex: 1, textAlign: 'left' }}>{sub.number}. {sub.title}</span>
                          {labKind && (
                            <span
                              className={'sb-lab-tag ' + labKind}
                              title={labKind === 'docker' ? 'Docker-backed lab' : 'In-browser lab'}
                            >⚡</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sb-foot">
        <button className={'sb-foot-btn' + (page === 'home' ? ' active' : '')} onClick={onHome} title="Home">
          <span>⌂</span> Home
        </button>
        <button className={'sb-foot-btn' + (page === 'practice' ? ' active' : '')} onClick={onPractice} title="Practice">
          <span>◉</span> Practice
          {dueCount > 0 && (
            <span style={{ marginLeft: 4, background: 'var(--orange)', color: '#fff', borderRadius: 8, padding: '0 5px', fontSize: 10, fontWeight: 700 }}>
              {dueCount}
            </span>
          )}
        </button>
        <button className={'sb-foot-btn' + (page === 'progress' ? ' active' : '')} onClick={onProgress} title="Progress">
          <span>◎</span> Progress
        </button>
        <button className={'sb-foot-btn' + (page === 'flags' ? ' active' : '')} onClick={onFlags} title="Flags">
          <span>⚑</span> Flags
        </button>
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
        <button className="sb-foot-btn" onClick={onTheme} title="Toggle theme">
          <span>☀</span> Theme
        </button>
        <button className="sb-foot-btn" onClick={onHelp} title="Keyboard shortcuts">
          <span>?</span> Help
        </button>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar });
