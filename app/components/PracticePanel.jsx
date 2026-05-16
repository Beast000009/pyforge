/* global React */
// PracticePanel.jsx — SRS Practice panel
// Ported from course/course-practice.jsx: useCourseStore() → useStore(), onBack → actions.setPage("lesson")

const { useState: usePP, useMemo: usePPMemo } = React;

function PracticePanel() {
  const { derived, actions } = window.useStore();
  const { dueCards, overallPct, moduleMastery } = derived;

  function onBack() { actions.setPage('lesson'); }

  // Build a session deck (max 10, shuffle)
  const deck = usePPMemo(() => {
    const cards = [...dueCards].sort(() => Math.random() - 0.5).slice(0, 10);
    if (cards.length === 0) {
      return (window._courseCards || []).slice(0, 5).sort(() => Math.random() - 0.5);
    }
    return cards;
  }, []); // stable for this session

  const [idx, setIdx] = usePP(0);
  const [revealed, setRevealed] = usePP(false);
  const [graded, setGraded] = usePP(null);
  const [done, setDone] = usePP(false);

  const card = deck[idx];

  function grade(g) {
    setGraded(g);
    actions.gradeCard(card.id, g);
  }

  function nextCard() {
    if (idx >= deck.length - 1) { setDone(true); return; }
    setIdx(i => i + 1); setRevealed(false); setGraded(null);
  }

  const s = {
    wrap: { flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' },
    inner: { maxWidth: 680, margin: '0 auto', padding: '40px 40px 80px', width: '100%' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
    backBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'var(--fg2)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 500 },
    deckInfo: { fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg3)' },
    card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 24, position: 'relative' },
    cardStack: { position: 'absolute', inset: -4, borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)', transform: 'translateY(8px) scale(0.96)', opacity: 0.55, zIndex: -1 },
    cardHead: { display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)' },
    cardTag: { fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--orange)' },
    cardSub: { fontSize: 10, color: 'var(--fg3)', fontFamily: 'var(--mono)' },
    cardBody: { padding: '20px 18px' },
    question: { fontSize: 14.5, lineHeight: 1.65, color: 'var(--fg)', whiteSpace: 'pre-wrap', marginBottom: 16 },
    revealBtn: { width: '100%', padding: '13px', background: 'transparent', border: '1px dashed var(--border2)', color: 'var(--fg2)', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, transition: 'border-color 120ms' },
    answer: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 13.5, color: '#93c5fd', marginTop: 12 },
    explain: { marginTop: 10, fontSize: 12.5, color: 'var(--fg3)', lineHeight: 1.5 },
    gradeRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 4 },
    nextBtn: { width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, padding: '13px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 12 },
    doneWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: 40, textAlign: 'center' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', marginTop: 32, width: '100%', maxWidth: 400 },
    statBox: { background: 'var(--bg2)', padding: '20px 24px' },
    statN: { fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 36, lineHeight: 1 },
    statL: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--fg3)', marginTop: 4, letterSpacing: '0.04em' },
  };

  const progPct = deck.length ? ((idx + (graded !== null ? 1 : 0)) / deck.length * 100) : 0;

  if (done) return (
    <div style={s.wrap}>
      <div style={s.doneWrap}>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 72, color: 'var(--orange)', lineHeight: 1 }}>★</div>
        <h2 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 36, margin: '16px 0 8px', letterSpacing: '-0.01em' }}>Session complete.</h2>
        <p style={{ color: 'var(--fg2)', fontSize: 14, lineHeight: 1.5 }}>{deck.length} cards reviewed. Come back tomorrow for the next batch.</p>
        <div style={s.statsGrid}>
          <div style={s.statBox}><div style={s.statN}>{deck.length}</div><div style={s.statL}>cards done</div></div>
          <div style={s.statBox}><div style={s.statN}>{overallPct}%</div><div style={s.statL}>overall mastery</div></div>
          <div style={{ ...s.statBox, gridColumn: '1/-1', display: 'grid', gap: 8 }}>
            {moduleMastery.map(m => {
              const mod = (window.COURSE_DATA || []).find(x => x.id === m.id);
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--fg2)', flex: 1 }}>{mod ? mod.title : m.id}</span>
                  <div style={{ width: 80, height: 5, background: 'var(--border2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: m.pct + '%', height: '100%', background: m.pct > 70 ? 'var(--green)' : m.pct > 35 ? 'var(--orange)' : '#fbbf24', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--fg3)', width: 28, textAlign: 'right' }}>{m.pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={onBack} style={{ marginTop: 28, background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Back to lessons →</button>
      </div>
    </div>
  );

  if (!card) return (
    <div style={{ ...s.doneWrap }}>
      <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 48, color: 'var(--orange)', lineHeight: 1 }}>∅</div>
      <h2 style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, margin: '16px 0 8px' }}>No cards due.</h2>
      <p style={{ color: 'var(--fg2)', fontSize: 14 }}>Complete more lessons to unlock cards, or check back tomorrow.</p>
      <button onClick={onBack} style={{ marginTop: 24, background: 'var(--orange)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Go to lessons</button>
    </div>
  );

  return (
    <div style={s.wrap}>
      {/* progress bar */}
      <div style={{ height: 3, background: 'var(--border)', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'var(--orange)', width: progPct + '%', transition: 'width 300ms ease' }} />
      </div>

      <div style={s.inner}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={onBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to lessons
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={s.deckInfo}>{idx + 1} / {deck.length}</span>
            <span style={{ ...s.deckInfo, color: 'var(--orange)' }}>{derived.dueCards.length} due total</span>
          </div>
        </div>

        {/* deck progress dots */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {deck.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < idx ? 'var(--orange)' : i === idx ? 'rgba(232,75,34,0.35)' : 'var(--border)' }} />
          ))}
        </div>

        {/* card */}
        <div style={s.card}>
          {idx < deck.length - 1 && <div style={s.cardStack} />}
          <div style={s.cardHead}>
            <span style={s.cardTag}>Predict</span>
            <span style={s.cardSub}>{card.subsectionTitle}</span>
          </div>
          <div style={s.cardBody}>
            <p style={s.question}>{card.question}</p>
            {!revealed ? (
              <button style={s.revealBtn} onClick={() => setRevealed(true)}>Tap to reveal answer</button>
            ) : (
              <div className="anim-in">
                <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Answer</div>
                <div style={s.answer}>{card.answer}</div>
              </div>
            )}
          </div>
        </div>

        {/* grade buttons */}
        {revealed && !graded && (
          <div className="anim-in">
            <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--fg3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>How well did you know it?</div>
            <div style={s.gradeRow}>
              {[
                { g: 0, label: 'Again', sub: '< 1 day', color: '#f87171' },
                { g: 3, label: 'Hard',  sub: '2 days',  color: '#fbbf24' },
                { g: 5, label: 'Easy',  sub: '8 days',  color: '#4ade80' },
              ].map(({ g, label, sub, color }) => (
                <button key={g} onClick={() => grade(g)} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 8px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--fg)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color }}>{label}</span>
                  <span style={{ fontSize: 10.5, color: 'var(--fg3)', fontFamily: 'var(--mono)' }}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {graded !== null && (
          <button style={s.nextBtn} onClick={nextCard} className="anim-in">
            {idx < deck.length - 1 ? 'Next card →' : 'Finish session ✓'}
          </button>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { PracticePanel });
