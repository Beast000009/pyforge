/* global React */
// LessonView.jsx — Lesson content renderer with QuickCheck, exercises, notes, footer

const { useState: useLV, useEffect: useLVE, useRef: useLVR, useCallback: useLVC } = React;

// ── QuickCheck ────────────────────────────────────────────────
function QuickCheck({ exercise }) {
  const [revealed, setRevealed] = useLV(false);
  if (!exercise) return null;
  const q = exercise.question || exercise.q;
  const a = exercise.answer || exercise.a;
  return (
    <div style={{
      background: 'var(--blue-s, rgba(59,130,246,0.07))',
      border: '1px solid var(--blue, #3b82f6)',
      borderRadius: 8,
      padding: '14px 18px',
      marginBottom: 24,
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--blue)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
        Quick check
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--fg)', margin: '0 0 10px' }}>{q}</p>
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          style={{ background: 'transparent', border: '1px dashed var(--border2)', borderRadius: 6, padding: '7px 14px', color: 'var(--fg2)', fontFamily: 'var(--sans)', fontSize: 13, cursor: 'pointer' }}
        >
          Tap to reveal answer
        </button>
      ) : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 13, color: '#93c5fd' }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ── ExerciseList ──────────────────────────────────────────────
function ExerciseList({ exercises, subId, onOpenLab }) {
  const [shown, setShown] = useLV({});
  if (!exercises || exercises.length === 0) return null;
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 14, fontWeight: 500 }}>
        Exercises
      </div>
      {exercises.map((ex, i) => (
        <div key={i} className="exercise-box">
          <div className="exercise-head">
            <span className="exercise-badge">{ex.isLab ? 'Lab' : `Ex ${i + 1}`}</span>
            {ex.flag && <span className="tag orange">⚑ flag</span>}
          </div>
          <div className="exercise-q">{ex.question || ex.q}</div>
          {ex.isLab && onOpenLab && (
            <button className="open-lab-btn" onClick={() => onOpenLab(subId)}>
              ⚡ Open Lab VM
            </button>
          )}
          <button className="exercise-toggle" onClick={() => setShown(p => ({ ...p, [i]: !p[i] }))}>
            {shown[i] ? '▾ Hide answer' : '▸ Show answer'}
          </button>
          {shown[i] && (
            <div className="exercise-answer">{ex.answer || ex.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function AttachedLabCard({ starter, onOpenLab }) {
  if (!starter || !onOpenLab) return null;
  return (
    <div className="exercise-box lab-attached-card">
      <div className="exercise-head">
        <span className="exercise-badge lab">Lab</span>
        <span className={'flag-diff ' + (starter.diff || 'med')}>{starter.diff || 'med'}</span>
        {starter.hiddenCaseCount > 0 && <span className="tag orange">🔒 {starter.hiddenCaseCount} hidden</span>}
        {starter.hasRequirements && <span className="tag orange">AST gated</span>}
      </div>
      <div className="exercise-q">{starter.instructions}</div>
      <button className="open-lab-btn" onClick={() => onOpenLab(starter.subsectionId)}>
        ⚡ Open Docker Lab
      </button>
    </div>
  );
}

// ── LessonNotes ───────────────────────────────────────────────
function LessonNotes({ subId }) {
  const { state, actions } = window.useStore();
  const [open, setOpen] = useLV(false);
  const timerRef = useLVR(null);

  const savedNote = (state.notes || {})[subId] || '';
  const [draft, setDraft] = useLV(savedNote);

  // Sync draft when subId changes
  useLVE(() => {
    setDraft((state.notes || {})[subId] || '');
  }, [subId]);

  function handleChange(e) {
    const val = e.target.value;
    setDraft(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      actions.setNotes(subId, val);
    }, 600);
  }

  return (
    <div style={{ marginTop: 28, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ background: 'none', border: 'none', color: 'var(--fg2)', fontFamily: 'var(--sans)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>My notes</span>
        {savedNote && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg3)', marginLeft: 4 }}>(saved)</span>}
      </button>
      {open && (
        <textarea
          value={draft}
          onChange={handleChange}
          placeholder="Add private notes for this lesson…"
          style={{
            display: 'block',
            marginTop: 10,
            width: '100%',
            minHeight: 120,
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '10px 12px',
            fontFamily: 'var(--mono)',
            fontSize: 13,
            color: 'var(--fg)',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
}

// ── LessonView ────────────────────────────────────────────────
function LessonView({ mod, sec, sub, completed, onMarkComplete, onNavigate, onOpenLab, onCopyToLab }) {
  const allSubs = window.getAllSubs();
  const idx = allSubs.findIndex(x => x.sub.id === sub.id);
  const prev = idx > 0 ? allSubs[idx - 1] : null;
  const next = idx < allSubs.length - 1 ? allSubs[idx + 1] : null;
  const isDone = completed.has(sub.id);

  // First non-lab exercise for QuickCheck
  const firstNonLab = (sub.exercises || []).find(ex => !ex.isLab);
  const labKey = sub.lab || sub.id;
  const attachedLab = (window.LAB_STARTERS || {})[labKey] || null;
  const hasExplicitLabExercise = (sub.exercises || []).some(ex => ex.isLab);

  return (
    <div className="ws-content">
      <div className="lesson">
        <div className="lesson-crumbs">
          <span>{mod.number}. {mod.title}</span>
          <span className="sep">›</span>
          <span>{sec.number}. {sec.title}</span>
          <span className="sep">›</span>
          <span style={{ color: 'var(--fg)' }}>{sub.number}. {sub.title}</span>
        </div>

        <h1>{sub.title}</h1>
        <div className="lesson-meta">
          {sub.number} — {sec.title}
          {sub.dur && <span style={{ marginLeft: 12 }}>· {sub.dur}</span>}
        </div>

        {(sub.content || []).map((block, i) => {
          if (block.type === 'objectives' && block.items) {
            return (
              <div key={i} className="lesson-obj">
                <div className="lesson-obj-lbl">Learning Objectives</div>
                <ol>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
              </div>
            );
          }
          if (block.type === 'text' && (block.content || block.body)) {
            return <p key={i}>{block.content || block.body}</p>;
          }
          if (block.type === 'heading' && (block.content || block.body)) {
            return <h2 key={i}>{block.content || block.body}</h2>;
          }
          if (block.type === 'code' && (block.codeBlock || block.code)) {
            const cb = block.codeBlock || block;
            return (
              <window.CodeBlock
                key={i}
                code={cb.code || ''}
                lang={cb.language || cb.lang || null}
                caption={cb.caption}
                onCopyToLab={onCopyToLab}
              />
            );
          }
          if (block.type === 'note' && (block.content || block.body)) {
            return (
              <div key={i} className="lesson-note">
                <span className="lesson-note-icon">⚠</span>
                <p>{block.content || block.body}</p>
              </div>
            );
          }
          return null;
        })}

        {/* QuickCheck above exercises */}
        {firstNonLab && <QuickCheck exercise={firstNonLab} />}

        <ExerciseList
          exercises={sub.exercises}
          subId={labKey}
          onOpenLab={onOpenLab}
        />

        {!hasExplicitLabExercise && (
          <AttachedLabCard starter={attachedLab} onOpenLab={onOpenLab} />
        )}

        <LessonNotes subId={sub.id} />

        {/* Footer */}
        <div className="lesson-footer">
          <button
            className={'mark-btn ' + (isDone ? 'done' : 'todo')}
            onClick={() => onMarkComplete(sub.id)}
          >
            {isDone ? '✓ Completed' : 'Mark as Complete'}
          </button>
          <div className="nav-btns">
            {prev && (
              <button className="nav-btn" onClick={() => onNavigate(prev.sub.id)}>
                ← Prev
              </button>
            )}
            {next && (
              <button className="nav-btn next" onClick={() => onNavigate(next.sub.id)}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LessonView });
