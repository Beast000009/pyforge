/* global React */
// Content area: renders all block types + exercises + lesson notes + nav
// Exports: CourseContent → window

const { useState: useContentState, useEffect: useContentEffect } = React;

// ── Code Block ───────────────────────────────────────────────

function CodeBlock({ code, caption }) {
  const [copied, setCopied] = useContentState(false);

  function copy() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const lines = code.split('\n');

  return (
    <div className="codeblock">
      <div className="codeblock-header">
        <div className="codeblock-label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="#4ade80" strokeWidth="1.3"/>
            <path d="M3.5 4l2 2-2 2M6.5 8h2" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span>terminal</span>
        </div>
        <button className="codeblock-copy" onClick={copy} data-testid="copy-code-btn">
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ color: '#4ade80' }}>Copied</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="4" y="1" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <rect x="1" y="3" width="7" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" fill="#161b22"/>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="codeblock-pre">
        {lines.map((line, i) => <CodeLine key={i} line={line}/>)}
      </div>
      {caption && <div className="codeblock-caption">{caption}</div>}
    </div>
  );
}

function CodeLine({ line }) {
  // Prompt lines: kali@kali or user@host:
  const promptMatch = line.match(/^([a-z0-9_-]+@[a-z0-9_-]+[^$]*\$)(.*)/);
  if (promptMatch) {
    return (
      <div>
        <span style={{ color: '#4ade80' }}>{promptMatch[1]}</span>
        <span style={{ color: '#e5e7eb' }}>{promptMatch[2]}</span>
      </div>
    );
  }
  if (line.startsWith('>>> ')) {
    return <div><span style={{ color: '#60a5fa' }}>{'>>> '}</span><span style={{ color: '#e2e8f0' }}>{line.slice(4)}</span></div>;
  }
  if (line.startsWith('... ')) {
    return <div><span style={{ color: '#6b7280' }}>{'... '}</span><span style={{ color: '#e2e8f0' }}>{line.slice(4)}</span></div>;
  }
  if (line.trimStart().startsWith('#')) {
    return <div style={{ color: '#6b7280' }}>{line}</div>;
  }
  if (/Traceback|Error:|Exception:/.test(line)) {
    return <div style={{ color: '#f87171' }}>{line}</div>;
  }
  return <div style={{ color: '#c9d1d9' }}>{line}</div>;
}

// ── Exercise box ─────────────────────────────────────────────

function ExerciseBox({ exercises, subsectionId }) {
  return (
    <div className="exercise-box">
      <div className="exercise-header">
        <h3>Exercises</h3>
        <span>{exercises.length} question{exercises.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="exercise-list">
        {exercises.map((ex, i) => (
          ex.isLab
            ? <LabExercise key={i} ex={ex} idx={i + 1} subsectionId={subsectionId}/>
            : <RegExercise key={i} ex={ex} idx={i + 1}/>
        ))}
      </div>
    </div>
  );
}

function RegExercise({ ex, idx }) {
  const [shown, setShown] = useContentState(false);
  return (
    <div className="exercise-item">
      <div className="exercise-num" style={{ background: 'var(--card2)', color: 'var(--text-2)' }}>{idx}</div>
      <div className="exercise-body">
        <p className="exercise-q">{ex.question}</p>
        <button className="btn-reveal" onClick={() => setShown(s => !s)} data-testid={`reveal-answer-${idx}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><ellipse cx="6" cy="6" rx="5" ry="4" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="currentColor"/></svg>
          {shown ? 'Hide Answer' : 'Reveal Answer'}
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d={shown ? 'M2 7l3.5-4 3.5 4' : 'M2 4l3.5 4 3.5-4'} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {shown && <div className="answer-box">{ex.answer}</div>}
      </div>
    </div>
  );
}

function LabExercise({ ex, idx, subsectionId }) {
  const [flagInput, setFlagInput] = useContentState('');
  const [status, setStatus] = useContentState('idle'); // idle | correct | wrong
  const [attempts, setAttempts] = useContentState(0);
  const [hintShown, setHintShown] = useContentState(false);

  function submit() {
    const trimmed = flagInput.trim();
    if (!trimmed) return;
    setAttempts(a => a + 1);
    if (trimmed === ex.flag) {
      setStatus('correct');
    } else {
      setStatus('wrong');
      setTimeout(() => setStatus('idle'), 1800);
    }
  }

  return (
    <div className="exercise-item">
      <div className="exercise-num" style={{ background: 'rgba(232,75,34,0.12)', color: 'var(--primary)' }}>{idx}</div>
      <div className="exercise-body">
        <div className="lab-badge">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="10" height="10" rx="2" stroke="var(--primary)" strokeWidth="1.3"/>
            <path d="M3 8l2-5 2 5M3.5 6.5h3" stroke="var(--primary)" strokeWidth="1.1" strokeLinecap="round"/>
          </svg>
          <span className="lab-badge-text">Lab Exercise</span>
        </div>
        <p className="exercise-q">{ex.question}</p>

        {status === 'correct' ? (
          <div className="flag-success">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="8" stroke="#4ade80" strokeWidth="1.4"/>
              <path d="M5 9l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80', marginBottom: 4 }}>Flag accepted!</p>
              <code style={{ fontFamily: 'var(--mono)', fontSize: 13, color: '#4ade80', opacity: 0.85 }}>{ex.flag}</code>
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>Enter the flag from your lab environment:</p>
            <div className={'flag-form' + (status === 'wrong' ? ' error' : '')}>
              <div className="flag-icon">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M3 12V2l8 3-8 3" stroke={status === 'wrong' ? 'var(--err)' : 'var(--primary)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input
                type="text"
                className="flag-input"
                placeholder="PYTHON(your_flag_here)"
                value={flagInput}
                onChange={e => setFlagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
                style={{ color: status === 'wrong' ? 'var(--err)' : '#e2e8f0' }}
                data-testid={`flag-input-${idx}`}
              />
              <button className="flag-submit" onClick={submit} data-testid={`submit-flag-${idx}`}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5h9M6 2l4 3.5L6 9" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Submit
              </button>
            </div>
            {status === 'wrong' && (
              <div className="flag-err-msg">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5v3M6 8.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Incorrect flag. Double-check your output.
              </div>
            )}
            {attempts >= 3 && status !== 'correct' && ex.flag && (
              <div style={{ marginTop: 10 }}>
                <button onClick={() => setHintShown(h => !h)} style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><ellipse cx="5.5" cy="5.5" rx="4.5" ry="3.5" stroke="currentColor" strokeWidth="1.1"/><circle cx="5.5" cy="5.5" r="1.2" fill="currentColor"/></svg>
                  {hintShown ? 'Hide hint' : 'Show flag hint'}
                </button>
                {hintShown && (
                  <div className="hint-reveal">
                    Hint: {ex.flag.slice(0, Math.ceil(ex.flag.length * 0.4))}{'•'.repeat(ex.flag.length - Math.ceil(ex.flag.length * 0.4))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* In-browser REPL for practice */}
        {window.PythonRepl && React.createElement(window.PythonRepl, { starter: '# Practice this lab in browser\n' })}
      </div>
    </div>
  );
}

// ── Lesson Notes ──────────────────────────────────────────────

function LessonNotes({ subsectionId }) {
  const key = 'pyrev-notes-' + subsectionId;
  const [open, setOpen] = useContentState(false);
  const [notes, setNotes] = useContentState(() => {
    try { return localStorage.getItem(key) || ''; } catch { return ''; }
  });

  useContentEffect(() => {
    try { setNotes(localStorage.getItem(key) || ''); } catch {}
  }, [subsectionId]);

  // Load notes when lesson changes
  useContentEffect(() => {
    try { setNotes(localStorage.getItem(key) || ''); } catch {}
  }, [subsectionId]);

  function save(val) {
    setNotes(val);
    try { localStorage.setItem(key, val); } catch {}
  }

  return (
    <div className="lesson-notes" style={{ marginTop: 24 }}>
      <div className="lesson-notes-head" onClick={() => setOpen(o => !o)}>
        <span>📝 My Notes</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d={open ? 'M2 7.5l4-4 4 4' : 'M2 4.5l4 4 4-4'} stroke="var(--text-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {open && (
        <textarea
          className="notes-textarea"
          placeholder="Write your notes for this lesson…"
          value={notes}
          onChange={e => save(e.target.value)}
        />
      )}
    </div>
  );
}

// ── Inline comprehension check ───────────────────────────────

function InlineCheck({ exercise }) {
  const [revealed, setRevealed] = useContentState(false);
  if (!exercise) return null;
  return (
    <div style={{
      margin: '28px 0', borderRadius: 8, overflow: 'hidden',
      border: '1px solid rgba(96,165,250,0.25)',
      background: 'rgba(96,165,250,0.05)',
    }}>
      <div style={{
        padding: '10px 16px', borderBottom: '1px solid rgba(96,165,250,0.15)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="#60a5fa" strokeWidth="1.3"/><path d="M6.5 4v3M6.5 8.5v.5" stroke="#60a5fa" strokeWidth="1.3" strokeLinecap="round"/></svg>
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#60a5fa' }}>Quick Check</span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{exercise.question}</p>
        <button className="btn-reveal" onClick={() => setRevealed(r => !r)}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><ellipse cx="6" cy="6" rx="5" ry="4" stroke="currentColor" strokeWidth="1.2"/><circle cx="6" cy="6" r="1.5" fill="currentColor"/></svg>
          {revealed ? 'Hide Answer' : 'Reveal Answer'}
        </button>
        {revealed && (
          <div className="answer-box" style={{ marginTop: 10 }}>{exercise.answer}</div>
        )}
      </div>
    </div>
  );
}

// ── Main content area ─────────────────────────────────────────

function CourseContent({ module, section, subsection, completed, onMarkComplete, onNavigate }) {
  const all = window.getAllSubsections();
  const idx = all.findIndex(x => x.subsection.id === subsection.id);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const isDone = completed.has(subsection.id);
  const total = all.length;
  const doneCount = all.filter(x => completed.has(x.subsection.id)).length;
  const pct = total ? (doneCount / total * 100).toFixed(1) : 0;

  return (
    <main className="main">
      {/* progress bar */}
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: pct + '%' }}/>
      </div>

      {/* breadcrumb top bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <button className="hamburger" id="hamburger-btn" aria-label="Open sidebar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="breadcrumb">
            <span>{module.number}. {module.title}</span>
            <span className="sep">/</span>
            <span>{section.number}. {section.title}</span>
            <span className="sep">/</span>
            <span className="active-crumb">{subsection.number}. {subsection.title}</span>
          </div>
        </div>
        <div className="top-bar-right">
          <span>{doneCount}/{total} done</span>
          <span style={{ color: 'var(--border2)' }}>·</span>
          <span style={{ color: 'var(--primary)' }}>{pct}%</span>
          <span style={{ color: 'var(--border2)', margin: '0 4px' }}>|</span>
          <span className="kbd">j</span>/<span className="kbd">k</span>
          <span style={{ marginLeft: 6 }}>nav</span>
          <span style={{ margin: '0 6px', color: 'var(--border2)' }}>·</span>
          <span className="kbd">m</span>
          <span style={{ marginLeft: 6 }}>complete</span>
          <span style={{ margin: '0 6px', color: 'var(--border2)' }}>·</span>
          <span className="kbd">Ctrl K</span>
          <span style={{ marginLeft: 6 }}>search</span>
        </div>
      </header>

      {/* content */}
      <div className="content-scroll" id="content-scroll">
        <div className="content-inner anim-in" key={subsection.id}>
          <h1 className="lesson-title">{subsection.title}</h1>
          <div className="lesson-meta">
            {subsection.number} — {section.title}
            {subsection.duration && <span style={{ marginLeft: 12 }}>· {subsection.duration}</span>}
          </div>

          {subsection.content.map((block, i) => {
            if (block.type === 'objectives' && block.items) {
              return (
                <div key={i} className="block-objectives">
                  <p className="block-objectives-header">Learning Objectives</p>
                  <ol>
                    {block.items.map((item, j) => (
                      <li key={j}><span className="num">{j + 1}.</span>{item}</li>
                    ))}
                  </ol>
                </div>
              );
            }
            if (block.type === 'text' && block.content) {
              return <p key={i} className="block-text">{block.content}</p>;
            }
            if (block.type === 'heading' && block.content) {
              return <h2 key={i} className="block-heading">{block.content}</h2>;
            }
            if (block.type === 'code' && block.codeBlock) {
              return <CodeBlock key={i} code={block.codeBlock.code} caption={block.codeBlock.caption}/>;
            }
            if (block.type === 'note' && block.content) {
              return (
                <div key={i} className="block-note">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 2 }}>
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M8 5v4M8 10.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  <p>{block.content}</p>
                </div>
              );
            }
            return null;
          })}

          {subsection.exercises?.length > 0 && (
            <>
              <InlineCheck exercise={subsection.exercises.find(e => !e.isLab)}/>
              <ExerciseBox exercises={subsection.exercises} subsectionId={subsection.id}/>
            </>
          )}

          <LessonNotes subsectionId={subsection.id}/>

          <div className="lesson-footer">
            <button
              data-testid="mark-complete-btn"
              className={'btn-complete ' + (isDone ? 'done' : 'todo')}
              onClick={() => onMarkComplete(subsection.id)}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4 7.5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isDone ? 'Completed' : 'Mark as Complete'}
            </button>

            <div className="nav-btns">
              {prev && (
                <button className="btn-nav prev" data-testid="nav-prev-btn" onClick={() => onNavigate(prev.subsection.id)}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8 2L3 6.5 8 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Previous
                </button>
              )}
              {next && (
                <button className="btn-nav next" data-testid="nav-next-btn" onClick={() => onNavigate(next.subsection.id)}>
                  Next
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M5 2l5 4.5L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

Object.assign(window, { CourseContent });
