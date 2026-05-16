// pr-lesson.jsx — P4: Lesson view with syntax-highlighted + interactive code blocks

const { useState: useLState, useRef: useLRef } = React;

// ── Syntax tokeniser (subset: python + bash) ────────────────
function tokenise(code, lang) {
  if (!code) return [];
  const PY_KW = /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|pass|break|continue|try|except|with|as|raise|del|lambda|yield|global|nonlocal|print)\b/g;
  const PY_STR = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  const PY_NUM = /\b(\d+\.?\d*)\b/g;
  const PY_FN  = /\b([a-zA-Z_]\w*)\s*(?=\()/g;
  const PY_COM = /(#.*)$/gm;
  const SH_COM = /(#.*)$/gm;

  // Build tagged token list
  const ranges = [];

  function addRanges(re, cls) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(code)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, cls });
    }
  }

  if (lang === "python" || lang === "py") {
    addRanges(PY_COM, "com");
    addRanges(PY_STR, "str");
    addRanges(PY_FN,  "fn");
    addRanges(PY_NUM, "num");
    addRanges(PY_KW,  "kw");
  } else {
    addRanges(SH_COM, "com");
  }

  // Sort, de-overlap
  ranges.sort((a, b) => a.start - b.start);
  const clean = [];
  let pos = 0;
  for (const r of ranges) {
    if (r.start < pos) continue;
    clean.push(r);
    pos = r.end;
  }

  // Build spans
  const spans = [];
  let cursor = 0;
  for (const r of clean) {
    if (r.start > cursor) spans.push({ cls: "", text: code.slice(cursor, r.start) });
    spans.push({ cls: r.cls, text: code.slice(r.start, r.end) });
    cursor = r.end;
  }
  if (cursor < code.length) spans.push({ cls: "", text: code.slice(cursor) });
  return spans;
}

function SyntaxCode({ code, lang }) {
  const spans = tokenise(code, lang);
  return (
    <div className="cblock-body">
      {spans.map((s, i) =>
        s.cls
          ? <span key={i} className={s.cls}>{s.text}</span>
          : <React.Fragment key={i}>{s.text}</React.Fragment>
      )}
    </div>
  );
}

// ── Code block (P4) ─────────────────────────────────────────
function CodeBlock({ code, lang = "python", caption, onCopyToLab }) {
  const [output, setOutput] = useLState(null);
  const [running, setRunning] = useLState(false);

  function runInline() {
    setRunning(true);
    setTimeout(() => {
      // Simple inline runner: extract print() calls
      const lines = code.split("\n");
      const printed = [];
      for (const line of lines) {
        const m = line.trim().match(/^print\((.+)\)$/);
        if (m) {
          let arg = m[1].trim();
          if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
            printed.push(arg.slice(1, -1));
          } else if (/^[\d.]+$/.test(arg)) {
            printed.push(arg);
          } else {
            printed.push(`<${arg}>`);
          }
        }
      }
      if (printed.length > 0) {
        setOutput({ lines: printed, ok: true });
      } else {
        setOutput({ lines: ["(no output — complex expression)"], ok: false });
      }
      setRunning(false);
    }, 200);
  }

  function copyCode() {
    try { navigator.clipboard.writeText(code); } catch {}
  }

  const isShell = lang === "bash" || lang === "shell";

  return (
    <div className="cblock">
      <div className="cblock-head">
        <span className="cblock-name">
          <span className="cblock-lang">{lang}</span>
          {caption && <span style={{ color: "var(--fg3)" }}>{caption}</span>}
        </span>
        <span className="cblock-actions">
          {!isShell && (
            <button className="cblock-btn run" onClick={runInline} disabled={running} title="Run inline">
              {running ? <span className="spin">↻</span> : "▶"} Run
            </button>
          )}
          {onCopyToLab && !isShell && (
            <button className="cblock-btn" onClick={() => onCopyToLab(code)} title="Copy to Lab VM">
              ↗ Lab
            </button>
          )}
          <button className="cblock-btn" onClick={copyCode} title="Copy code">📋</button>
        </span>
      </div>
      <SyntaxCode code={code} lang={lang} />
      {output && (
        <div className="cblock-output">
          {output.lines.map((l, i) => (
            <div key={i}>
              <span className="arrow">▸</span>
              <span className={output.ok ? "ok" : ""}>{l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Exercise box ─────────────────────────────────────────────
function ExerciseBox({ exercises, subId, onOpenLab }) {
  const [shown, setShown] = useLState({});
  if (!exercises || exercises.length === 0) return null;
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--fg3)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 14, fontWeight: 500 }}>
        Exercises
      </div>
      {exercises.map((ex, i) => (
        <div key={i} className="exercise-box">
          <div className="exercise-head">
            <span className="exercise-badge">{ex.isLab ? "Lab" : `Ex ${i + 1}`}</span>
            {ex.flag && <span className="tag orange">⚑ flag</span>}
          </div>
          <div className="exercise-q">{ex.question || ex.q}</div>
          {ex.isLab && onOpenLab && (
            <button className="open-lab-btn" onClick={() => onOpenLab(subId)}>
              ⚡ Open Lab VM
            </button>
          )}
          <button className="exercise-toggle" onClick={() => setShown(p => ({ ...p, [i]: !p[i] }))}>
            {shown[i] ? "▾ Hide answer" : "▸ Show answer"}
          </button>
          {shown[i] && (
            <div className="exercise-answer">{ex.answer || ex.a}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Lesson view ──────────────────────────────────────────────
function LessonView({ mod, sec, sub, completed, onMarkComplete, onNavigate, onOpenLab, onCopyToLab }) {
  const allSubs = window.getAllSubs();
  const idx = allSubs.findIndex(x => x.sub.id === sub.id);
  const prev = idx > 0 ? allSubs[idx - 1] : null;
  const next = idx < allSubs.length - 1 ? allSubs[idx + 1] : null;
  const isDone = completed.has(sub.id);

  return (
    <div className="ws-content">
      <div className="lesson">
        <div className="lesson-crumbs">
          <span>{mod.number}. {mod.title}</span>
          <span className="sep">›</span>
          <span>{sec.number}. {sec.title}</span>
          <span className="sep">›</span>
          <span style={{ color: "var(--fg)" }}>{sub.number}. {sub.title}</span>
        </div>

        <h1>{sub.title}</h1>
        <div className="lesson-meta">
          {sub.number} — {sec.title}
          {sub.dur && <span style={{ marginLeft: 12 }}>· {sub.dur}</span>}
        </div>

        {sub.content?.map((block, i) => {
          if (block.type === "objectives" && block.items) {
            return (
              <div key={i} className="lesson-obj">
                <div className="lesson-obj-lbl">Learning Objectives</div>
                <ol>{block.items.map((item, j) => <li key={j}>{item}</li>)}</ol>
              </div>
            );
          }
          if (block.type === "text" && (block.content || block.body)) {
            return <p key={i}>{block.content || block.body}</p>;
          }
          if (block.type === "heading" && (block.content || block.body)) {
            return <h2 key={i}>{block.content || block.body}</h2>;
          }
          if (block.type === "code" && (block.codeBlock || block.code)) {
            const cb = block.codeBlock || block;
            return (
              <CodeBlock
                key={i}
                code={cb.code || ""}
                lang={cb.language || cb.lang || "python"}
                caption={cb.caption}
                onCopyToLab={onCopyToLab}
              />
            );
          }
          if (block.type === "note" && (block.content || block.body)) {
            return (
              <div key={i} className="lesson-note">
                <span className="lesson-note-icon">⚠</span>
                <p>{block.content || block.body}</p>
              </div>
            );
          }
          return null;
        })}

        <ExerciseBox
          exercises={sub.exercises}
          subId={sub.lab || sub.id}
          onOpenLab={onOpenLab}
        />

        <div className="lesson-footer">
          <button
            className={"mark-btn " + (isDone ? "done" : "todo")}
            onClick={() => onMarkComplete(sub.id)}
          >
            {isDone ? "✓ Completed" : "Mark as Complete"}
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

Object.assign(window, { LessonView, CodeBlock });
