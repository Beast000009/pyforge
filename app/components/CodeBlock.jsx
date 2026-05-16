/* global React */
// CodeBlock.jsx — Syntax-highlighted, read-only lesson code block (Copy + ↗ Lab)

const { useState: useCB, useEffect: useCBE } = React;

// ── Syntax tokeniser (verbatim from pr-lesson.jsx) ────────────
function tokenise(code, lang) {
  if (!code) return [];
  const PY_KW  = /\b(def|class|import|from|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|pass|break|continue|try|except|with|as|raise|del|lambda|yield|global|nonlocal|print)\b/g;
  const PY_STR = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g;
  const PY_NUM = /\b(\d+\.?\d*)\b/g;
  const PY_FN  = /\b([a-zA-Z_]\w*)\s*(?=\()/g;
  const PY_COM = /(#.*)$/gm;
  const SH_COM = /(#.*)$/gm;

  const ranges = [];

  function addRanges(re, cls) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(code)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length, cls });
    }
  }

  if (lang === 'python' || lang === 'py') {
    addRanges(PY_COM, 'com');
    addRanges(PY_STR, 'str');
    addRanges(PY_FN,  'fn');
    addRanges(PY_NUM, 'num');
    addRanges(PY_KW,  'kw');
  } else {
    addRanges(SH_COM, 'com');
  }

  ranges.sort((a, b) => a.start - b.start);
  const clean = [];
  let pos = 0;
  for (const r of ranges) {
    if (r.start < pos) continue;
    clean.push(r);
    pos = r.end;
  }

  const spans = [];
  let cursor = 0;
  for (const r of clean) {
    if (r.start > cursor) spans.push({ cls: '', text: code.slice(cursor, r.start) });
    spans.push({ cls: r.cls, text: code.slice(r.start, r.end) });
    cursor = r.end;
  }
  if (cursor < code.length) spans.push({ cls: '', text: code.slice(cursor) });
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

// Lightweight inline lang detection — no Pyodide dependency.
function detectInlineLang(code) {
  if (!code) return "python";
  const head = code.split("\n").slice(0, 6).join("\n");
  if (/^[\w.\-]+@[\w.\-]+:[~\w/\-.]*[$#]\s/m.test(head)) return "shell";
  if (/^\s*[$#]\s+\w/m.test(head) && !/^(def |class |import |from |print\(|\w+\s*=)/m.test(head)) return "shell";
  if (/^>>>\s/m.test(code)) return "repl";
  return "python";
}

// ── CodeBlock ─────────────────────────────────────────────────
// All execution moved to Docker labs. Inline code blocks are read-only.
function CodeBlock({ code, lang, caption, onCopyToLab }) {
  const detected = lang || detectInlineLang(code);
  const isShell = detected === 'shell';
  const isRepl  = detected === 'repl';
  const displayLang = isShell ? 'shell' : isRepl ? 'python · repl' : 'python';

  function copyCode() {
    try { navigator.clipboard.writeText(code); } catch {}
  }

  return (
    <div className="cblock">
      <div className="cblock-head">
        <span className="cblock-name">
          <span className="cblock-lang">{displayLang}</span>
          {caption && <span style={{ color: 'var(--fg3)' }}>{caption}</span>}
        </span>
        <span className="cblock-actions">
          {onCopyToLab && !isShell && (
            <button className="cblock-btn" onClick={() => onCopyToLab(code)} title="Copy to Lab VM">
              ↗ Lab
            </button>
          )}
          <button className="cblock-btn" onClick={copyCode} title="Copy code">📋</button>
        </span>
      </div>
      <SyntaxCode code={code} lang={isShell ? 'shell' : 'python'} />
    </div>
  );
}

Object.assign(window, { CodeBlock });
