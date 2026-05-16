/* global React */
// ProgressPanel.jsx — Progress insights panel
// Ported from course/course-progress.jsx: useCourseStore() → useStore(), onBack → actions.setPage("lesson")

const { useMemo: useProg } = React;

function ProgressPanel() {
  const { state, derived, actions } = window.useStore();
  function onBack() { actions.setPage('lesson'); }

  const { moduleMastery, dueCards, overallPct, allCards } = derived;

  const totalLessons = (window.COURSE_DATA || []).reduce(
    (s, m) => s + (m.sections || []).flatMap(sec => sec.subsections || sec.subs || []).length, 0
  );
  const doneLessons = (state.completed || []).length;
  const graded = Object.keys(state.srsStates || {}).length;

  // Topic strength from SRS states
  const topicMap = useProg(() => {
    const map = {};
    (allCards || []).forEach(card => {
      const cs = state.srsStates?.[card.id];
      const topic = card.subsectionTitle;
      if (!map[topic]) map[topic] = { reps: 0, ease: 2.5, n: 0 };
      if (cs) {
        map[topic].reps += cs.reps || 0;
        map[topic].ease += (cs.ease || 2.5);
        map[topic].n += 1;
      }
    });
    return Object.entries(map).map(([topic, d]) => ({
      topic,
      strength: d.n > 0 ? Math.min(1, (d.reps / d.n) / 5 * (d.ease / d.n) / 2.5) : 0,
      n: d.n,
    })).sort((a, b) => a.strength - b.strength);
  }, [state.srsStates, allCards]);

  const weakTopics   = topicMap.slice(0, 5);

  const s = {
    wrap: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' },
    inner: { maxWidth: 780, margin: '0 auto', padding: '40px 40px 80px', width: '100%' },
    backBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--fg2)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, marginBottom: 32 },
    h1: { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 400, fontSize: 36, letterSpacing: '-0.01em', marginBottom: 6 },
    sub: { fontSize: 13, color: 'var(--fg2)', marginBottom: 40, lineHeight: 1.5 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginBottom: 32 },
    statBox: { background: 'var(--bg2)', padding: '20px 24px' },
    statN: { fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 40, lineHeight: 1, color: 'var(--fg)' },
    statL: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--fg3)', marginTop: 5, letterSpacing: '0.04em' },
    sectionH: { fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--fg3)', marginBottom: 14 },
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 22px', marginBottom: 24 },
  };

  return (
    <div style={s.wrap}>
      {/* progress bar */}
      <div style={{ height: 3, background: 'var(--border)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'var(--orange)', width: overallPct + '%', transition: 'width 600ms ease' }} />
      </div>

      <div style={s.inner}>
        <button style={s.backBtn} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back to lessons
        </button>

        <h1 style={s.h1}>Your progress</h1>
        <p style={s.sub}>Weighted mastery — not just lessons opened.</p>

        {/* Stats */}
        <div style={s.grid}>
          {[
            { n: overallPct + '%', l: 'overall mastery' },
            { n: doneLessons + '/' + totalLessons, l: 'lessons done' },
            { n: graded, l: 'cards graded' },
          ].map(({ n, l }) => (
            <div key={l} style={s.statBox}>
              <div style={s.statN}>{n}</div>
              <div style={s.statL}>{l}</div>
            </div>
          ))}
        </div>

        {/* Module mastery bars */}
        <div style={s.card}>
          <div style={s.sectionH}>Module mastery</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {moduleMastery.map((mm, i) => {
              const mod = (window.COURSE_DATA || [])[i];
              const color = mm.pct > 70 ? '#4ade80' : mm.pct > 35 ? 'var(--orange)' : '#fbbf24';
              return (
                <div key={mm.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg)' }}>{mod?.number}. {mod?.title}</span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--fg3)' }}>
                      {mm.done}/{mm.total} lessons
                      <span style={{ color, marginLeft: 8, fontWeight: 600 }}>{mm.pct}%</span>
                    </span>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: 'var(--border2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: mm.pct + '%', background: color, borderRadius: 4, transition: 'width 600ms ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic strength heatmap */}
        {topicMap.length > 0 && (
          <div style={s.card}>
            <div style={s.sectionH}>Topic strength map</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6 }}>
              {topicMap.slice(0, 20).map(({ topic, strength }) => {
                const bg = strength === 0
                  ? 'var(--bg3)'
                  : `oklch(${0.28 + strength * 0.44} ${0.04 + strength * 0.12} ${85 - strength * 10})`;
                return (
                  <div key={topic} style={{
                    background: bg, borderRadius: 6, padding: '8px 10px',
                    opacity: strength === 0 ? 0.5 : 1,
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{ fontSize: 10.5, fontWeight: 500, color: strength > 0.55 ? 'rgba(10,10,10,0.8)' : 'var(--fg)', lineHeight: 1.2, marginBottom: 3 }}>
                      {topic.length > 22 ? topic.slice(0, 20) + '…' : topic}
                    </div>
                    <div style={{ fontSize: 9.5, fontFamily: 'var(--mono)', color: strength > 0.55 ? 'rgba(10,10,10,0.6)' : 'var(--fg3)' }}>
                      {strength === 0 ? 'not started' : Math.round(strength * 100) + '%'}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--fg3)' }}>
              <span>weak</span>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'linear-gradient(to right, oklch(0.28 0.04 85), oklch(0.72 0.16 75))' }} />
              <span>strong</span>
            </div>
          </div>
        )}

        {/* Focus recommendations */}
        <div style={s.card}>
          <div style={s.sectionH}>Where to focus</div>
          {weakTopics.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--fg2)' }}>Complete lessons and practice cards to see recommendations here.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {weakTopics.map(({ topic, strength }, i) => (
                <div key={topic} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 0',
                  borderBottom: i < weakTopics.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--fg)', marginBottom: 5 }}>{topic}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border2)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: Math.max(strength * 100, 2) + '%', background: strength < 0.3 ? '#f87171' : '#fbbf24', borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--fg3)', whiteSpace: 'nowrap' }}>
                        {Math.round(strength * 100)}% strength
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SRS due cards */}
        {dueCards.length > 0 && (
          <div style={{ background: 'rgba(232,75,34,0.07)', border: '1px solid var(--orange-b)', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--orange)', fontWeight: 600 }}>
              {dueCards.length} card{dueCards.length !== 1 ? 's' : ''} due for review
            </div>
            <p style={{ fontSize: 12, color: 'var(--fg2)', marginTop: 4, lineHeight: 1.5 }}>
              Press <kbd style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 3, padding: '1px 5px', fontFamily: 'var(--mono)', fontSize: 11 }}>P</kbd> or click Practice in the sidebar to start your session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { ProgressPanel });
