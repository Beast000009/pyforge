// pr-palette.jsx — P3: ⌘K Command palette

const { useState: usePState, useEffect: usePEffect, useRef: usePRef } = React;

function fuzzyScore(text, query) {
  const t = text.toLowerCase(), q = query.toLowerCase();
  if (t.includes(q)) return 100 - t.indexOf(q);
  let score = 0, qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) { score += 10; qi++; }
  }
  return qi === q.length ? score : 0;
}

function CommandPalette({ onClose, onNavigate, onAction, capturedFlags }) {
  const [query, setQuery] = usePState("");
  const [sel, setSel] = usePState(0);
  const inputRef = usePRef(null);
  const listRef = usePRef(null);

  usePEffect(() => { inputRef.current?.focus(); }, []);

  const q = query.trim();

  const items = React.useMemo(() => {
    const all = [];
    // Lessons
    for (const { mod, sec, sub } of window.getAllSubs()) {
      const score = q ? Math.max(fuzzyScore(sub.title, q), fuzzyScore(sec.title, q)) : 50;
      if (!q || score > 0) all.push({ type: "lesson", label: `${sub.num} ${sub.title}`, ctx: mod.title, tag: "lesson", score, id: sub.id });
    }
    // Actions
    const actions = [
      { label: "Toggle Lab VM", ctx: "⌘\\", tag: "action", id: "toggle-lab" },
      { label: "Go to Dashboard", ctx: "/", tag: "action", id: "home" },
      { label: "View Flag Tracker", ctx: "/flags", tag: "action", id: "flags" },
      { label: "Mark current lesson complete", ctx: "M", tag: "action", id: "mark-complete" },
    ];
    for (const a of actions) {
      const score = q ? fuzzyScore(a.label, q) : 30;
      if (!q || score > 0) all.push({ type: "action", ...a, score });
    }
    // Flags
    for (const [key, starter] of Object.entries(window.LAB_STARTERS)) {
      if (capturedFlags.has(starter.flag)) {
        const score = q ? fuzzyScore(starter.flag, q) : 20;
        if (!q || score > 0) all.push({ type: "flag", label: starter.flag, ctx: "captured", tag: "flag", score, id: key });
      }
    }
    return all.sort((a, b) => b.score - a.score).slice(0, 20);
  }, [q, capturedFlags]);

  usePEffect(() => { setSel(0); }, [query]);

  function commit(item) {
    if (!item) return;
    if (item.type === "lesson") onNavigate(item.id);
    else if (item.type === "action") onAction(item.id);
    else if (item.type === "flag") onNavigate(item.id);
    onClose();
  }

  function onKey(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(items.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
    else if (e.key === "Enter") commit(items[sel]);
    else if (e.key === "Escape") onClose();
  }

  const groups = [
    { name: "Lessons", type: "lesson" },
    { name: "Actions", type: "action" },
    { name: "Flags", type: "flag" },
  ];

  return (
    <div className="palette-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="palette">
        <div className="palette-input">
          <span className="palette-input-icon">⌘</span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey} placeholder="Type a lesson, command, or flag…" />
          <span className="palette-esc">esc</span>
        </div>
        <div className="palette-list" ref={listRef}>
          {groups.map(g => {
            const gItems = items.filter(i => i.type === g.type);
            if (!gItems.length) return null;
            return (
              <div key={g.type} className="palette-section">
                <div className="palette-section-name">{g.name}</div>
                {gItems.map((item, i) => {
                  const globalIdx = items.indexOf(item);
                  return (
                    <div key={item.id + i}
                      className={"palette-item" + (globalIdx === sel ? " sel" : "")}
                      onClick={() => commit(item)}
                      onMouseEnter={() => setSel(globalIdx)}>
                      <span className="p-icon">
                        {item.type === "lesson" ? "▤" : item.type === "flag" ? "⚑" : "↻"}
                      </span>
                      <span className="p-name">{item.label}</span>
                      <span className="p-ctx">{item.ctx}</span>
                      <span className={"p-tag " + item.tag}>{item.tag}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {items.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--fg3)" }}>
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
