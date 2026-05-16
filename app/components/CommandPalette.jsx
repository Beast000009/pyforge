/* global React */
// CommandPalette.jsx — ⌘K fuzzy search palette

const { useState: useCP, useEffect: useCPE, useRef: useCPR, useMemo: useCPM } = React;

// Verbatim from pr-palette.jsx
function fuzzyScore(text, query) {
  const t = text.toLowerCase(), q = query.toLowerCase();
  if (t.includes(q)) return 100 - t.indexOf(q);
  let score = 0, qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) { score += 10; qi++; }
  }
  return qi === q.length ? score : 0;
}

function CommandPalette({ onClose, onNavigate, onAction, capturedFlags, dueCount }) {
  const [query, setQuery] = useCP('');
  const [sel, setSel] = useCP(0);
  const inputRef = useCPR(null);

  useCPE(() => { inputRef.current?.focus(); }, []);

  const q = query.trim();

  const commands = window.CommandRegistry.getCommands(dueCount || 0);

  const items = useCPM(() => {
    const all = [];

    // Lessons
    for (const { mod, sec, sub } of window.getAllSubs()) {
      const score = q
        ? Math.max(fuzzyScore(sub.title, q), fuzzyScore(sec.title, q), fuzzyScore(mod.title, q))
        : 50;
      if (!q || score > 0) {
        all.push({ type: 'lesson', label: `${sub.number} ${sub.title}`, ctx: mod.title, kind: 'lesson', score, id: sub.id, action: null });
      }
    }

    // Commands (nav + action + danger)
    for (const cmd of commands) {
      const score = q ? fuzzyScore(cmd.title, q) : 30;
      if (!q || score > 0) {
        all.push({ type: 'action', label: cmd.title, ctx: cmd.ctx, kind: cmd.kind, score, id: cmd.id, action: cmd.action, badge: cmd.badge || null });
      }
    }

    // Captured flags
    for (const [key, starter] of Object.entries(window.LAB_STARTERS || {})) {
      if ((capturedFlags || new Set()).has(starter.flag)) {
        const score = q ? fuzzyScore(starter.flag, q) : 20;
        if (!q || score > 0) {
          all.push({ type: 'flag', label: starter.flag, ctx: 'captured', kind: 'flag', score, id: key, action: null });
        }
      }
    }

    return all.sort((a, b) => b.score - a.score).slice(0, 30);
  }, [q, capturedFlags, dueCount]);

  useCPE(() => { setSel(0); }, [query]);

  function commit(item) {
    if (!item) return;
    if (item.type === 'lesson') { onNavigate(item.id); }
    else if (item.type === 'action' && item.action) {
      onAction(item.action);
    }
    else if (item.type === 'flag') { onNavigate(item.id); }
    onClose();
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(items.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === 'Enter') commit(items[sel]);
    else if (e.key === 'Escape') onClose();
  }

  const groups = [
    { name: 'Lessons', type: 'lesson' },
    { name: 'Actions', type: 'action' },
    { name: 'Flags',   type: 'flag' },
  ];

  function typeIcon(type) {
    if (type === 'lesson') return '▤';
    if (type === 'flag') return '⚑';
    return '↻';
  }

  return (
    <div className="palette-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="palette">
        <div className="palette-input">
          <span className="palette-input-icon">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a lesson, command, or flag…"
          />
          <span className="palette-esc">esc</span>
        </div>
        <div className="palette-list">
          {groups.map(g => {
            const gItems = items.filter(i => i.type === g.type);
            if (!gItems.length) return null;
            return (
              <div key={g.type} className="palette-section">
                <div className="palette-section-name">{g.name}</div>
                {gItems.map((item) => {
                  const globalIdx = items.indexOf(item);
                  const isDanger = item.kind === 'danger';
                  return (
                    <div
                      key={item.id}
                      className={'palette-item' + (globalIdx === sel ? ' sel' : '')}
                      onClick={() => commit(item)}
                      onMouseEnter={() => setSel(globalIdx)}
                      style={isDanger ? { color: '#f87171' } : {}}
                    >
                      <span className="p-icon">{typeIcon(item.type)}</span>
                      <span className="p-name" style={isDanger ? { color: '#f87171' } : {}}>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <span style={{ background: 'var(--orange)', color: '#fff', borderRadius: 8, padding: '1px 6px', fontSize: 10, fontWeight: 700, marginLeft: 4 }}>
                          {item.badge}
                        </span>
                      )}
                      <span className="p-ctx">{item.ctx}</span>
                      <span className={'p-tag ' + (item.kind || item.type)}>{item.kind || item.type}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg3)' }}>
              No results for "{query}"
            </div>
          )}
        </div>
        <div className="palette-foot">
          <span><span className="p-kbd">↑</span><span className="p-kbd">↓</span> navigate</span>
          <span><span className="p-kbd">↵</span> select</span>
          <span><span className="p-kbd">esc</span> close</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CommandPalette });
