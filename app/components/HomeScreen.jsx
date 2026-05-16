/* global React */
// HomeScreen.jsx — Dashboard with greeting, progress, heatmap, due cards CTA

const { useState: useHS, useEffect: useHSE, useRef: useHSR, useMemo: useHSM } = React;

// ── EditableName ──────────────────────────────────────────────
function EditableName({ name, onSave }) {
  const [editing, setEditing] = useHS(false);
  const [draft, setDraft] = useHS(name || '');
  const inputRef = useHSR(null);

  useHSE(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        style={{
          fontFamily: 'var(--serif)', fontSize: 'inherit', fontStyle: 'italic',
          color: 'var(--orange)', background: 'transparent', border: 'none',
          borderBottom: '2px solid var(--orange)', outline: 'none',
          width: Math.max(120, draft.length * 16) + 'px',
        }}
        placeholder="your name"
      />
    );
  }

  return (
    <em
      onClick={() => { setDraft(name || ''); setEditing(true); }}
      title="Click to edit your name"
      style={{ cursor: 'text', borderBottom: '1px dashed var(--orange-b)' }}
    >
      {name || 'you'}
    </em>
  );
}

// ── ProgressRing ──────────────────────────────────────────────
function ProgressRing({ pct, color = 'var(--orange)', size = 52 }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--border)" strokeWidth="4" fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="4" fill="none"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle"
        fontSize="12" fill="var(--fg)" fontFamily="var(--mono)" fontWeight="600">{pct}</text>
    </svg>
  );
}

// ── ActivityHeatmap ───────────────────────────────────────────
function ActivityHeatmap({ activity }) {
  const levels = Array.from({ length: 84 }, (_, i) => {
    const count = (activity || [])[i] || 0;
    if (count === 0) return '';
    if (count < 2) return 'l1';
    if (count < 4) return 'l2';
    if (count < 7) return 'l3';
    return 'l4';
  });
  const swatch = ['', 'l1', 'l2', 'l3', 'l4'];
  return (
    <div>
      <div className="heatmap">
        {levels.map((l, i) => <div key={i} className={'hm-cell ' + l} title={`Day ${i + 1}`} />)}
      </div>
      <div className="hm-legend">
        <span>less</span>
        <div className="hm-legend-cells">
          {swatch.map(s => <span key={s || 'empty'} className={'hm-cell ' + s} style={{ width: 9, height: 9 }} />)}
        </div>
        <span>more</span>
      </div>
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────
function HomeScreen({ onNavigate, capturedFlags }) {
  const { state, actions, derived } = window.useStore();
  const allSubs = window.getAllSubs();

  const streak = state.streak || { count: 0, lastDate: null };
  const activity84 = state.activity84 || Array(84).fill(0);
  const completedSet = new Set(state.completed || []);

  const modules = useHSM(() => {
    const colors = ['var(--orange)', 'var(--amber)', 'var(--blue)', 'var(--purple)'];
    return (window.COURSE_DATA || []).map((mod, i) => {
      const subs = (mod.sections || []).flatMap(s => s.subsections || s.subs || []);
      const done = subs.filter(s => completedSet.has(s.id)).length;
      const pct = subs.length > 0 ? Math.round((done / subs.length) * 100) : 0;
      return { ...mod, done, total: subs.length, pct, color: colors[i % 4] };
    });
  }, [state.completed]);

  const continueLesson = useHSM(() => {
    return allSubs.find(({ sub }) => !completedSet.has(sub.id)) || allSubs[allSubs.length - 1];
  }, [state.completed]);

  const totalDone = allSubs.filter(({ sub }) => completedSet.has(sub.id)).length;
  const pctTotal = allSubs.length > 0 ? Math.round((totalDone / allSubs.length) * 100) : 0;
  const dueCards = derived.dueCards || [];
  const totalFlags = Object.keys(window.LAB_STARTERS || {}).length;

  return (
    <div className="home">
      <div className="home-inner">
        {/* Masthead */}
        <div className="home-head">
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
              PyForge · Dashboard
            </div>
            <h1 className="home-greeting">
              Welcome back, <EditableName name={state.name} onSave={actions.setName} />.
            </h1>
          </div>
          {streak.count > 0 ? (
            <div className="streak-badge">
              <span style={{ fontSize: 18 }}>🔥</span>
              {streak.count}-day streak
            </div>
          ) : (
            <div className="streak-badge" style={{ background: 'var(--orange-s)', borderColor: 'var(--orange-b)', color: 'var(--orange)' }}>
              <span style={{ fontSize: 18 }}>🎯</span>
              Start your streak today
            </div>
          )}
        </div>

        {/* Continue card */}
        {continueLesson && (
          <div className="continue-card">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="continue-num">
                Continue · {continueLesson.sub.number}
                {continueLesson.sub.dur && ` · ${continueLesson.sub.dur}`}
              </div>
              <div className="continue-title">{continueLesson.sub.title}</div>
              <div className="continue-detail">
                {continueLesson.sec.title} — {continueLesson.mod.title}
              </div>
            </div>
            <button className="resume-btn" onClick={() => onNavigate(continueLesson.sub.id)}>
              Resume →
            </button>
          </div>
        )}

        {/* Two-column grid */}
        <div className="home-grid">
          {/* Module progress rings */}
          <div className="home-card">
            <div className="home-card-head">
              <span className="home-card-lbl">Module progress</span>
              <span className="home-card-act" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg3)' }}>
                {totalDone}/{allSubs.length} · {pctTotal}%
              </span>
            </div>
            <div className="rings-grid">
              {modules.map(m => (
                <div key={m.id} className="ring-row">
                  <ProgressRing pct={m.pct} color={m.color} />
                  <div className="ring-meta">
                    <div className="ring-name">{m.number}. {m.title}</div>
                    <div className="ring-sub">{m.done}/{m.total} lessons</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity heatmap */}
          <div className="home-card">
            <div className="home-card-head">
              <span className="home-card-lbl">Activity · 12 weeks</span>
            </div>
            <ActivityHeatmap activity={activity84} />
            <div style={{ marginTop: 16, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Lessons done</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 30, color: 'var(--fg)', lineHeight: 1 }}>{totalDone}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Flags captured</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 30, color: 'var(--green)', lineHeight: 1 }}>{(capturedFlags || new Set()).size}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg3)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Total flags</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 30, color: 'var(--fg)', lineHeight: 1 }}>{totalFlags}</span>
              </div>
            </div>
          </div>
        </div>

        {/* All-modules progress bars */}
        <div className="home-card" style={{ marginTop: 0 }}>
          <div className="home-card-head">
            <span className="home-card-lbl">All modules</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {modules.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--fg)' }}>{m.number}. {m.title}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg3)', marginTop: 2 }}>{m.dur || ''}</div>
                </div>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: m.pct + '%', background: m.color, borderRadius: 3, transition: 'width .6s ease' }} />
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg3)', width: 56, textAlign: 'right' }}>
                  {m.done}/{m.total}
                </div>
                <button
                  style={{ padding: '4px 10px', border: '1px solid var(--border2)', borderRadius: 5, background: 'transparent', color: 'var(--fg2)', fontSize: 11.5, fontFamily: 'var(--sans)', cursor: 'pointer' }}
                  onClick={() => {
                    const first = (m.sections || [])[0];
                    const firstSub = first && ((first.subsections || first.subs || [])[0]);
                    if (firstSub) onNavigate(firstSub.id);
                  }}
                >
                  Open →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Due cards CTA */}
        {dueCards.length > 0 && (
          <div style={{
            background: 'var(--orange-s)',
            border: '1px solid var(--orange-b)',
            borderRadius: 8,
            padding: '16px 20px',
            marginTop: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--orange)' }}>
                {dueCards.length} card{dueCards.length !== 1 ? 's' : ''} due for practice
              </div>
              <div style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 4 }}>
                Review them now to keep your SRS streak going.
              </div>
            </div>
            <button
              style={{ padding: '9px 18px', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 7, fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              onClick={() => window.dispatchEvent(new CustomEvent('app-action', { detail: 'page.practice' }))}
            >
              Practice now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
