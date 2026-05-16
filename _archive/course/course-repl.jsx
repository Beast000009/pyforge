/* global React */
// Python REPL — Pyodide-powered, lazy-loaded on first Run click
// Exports: PythonRepl → window

const { useState: useReplState, useRef: useReplRef, useEffect: useReplEf } = React;

// Singleton Pyodide instance
let _pyodide = null;
let _pyodideLoading = null;

async function getPyodide() {
  if (_pyodide) return _pyodide;
  if (_pyodideLoading) return _pyodideLoading;

  _pyodideLoading = (async () => {
    // Load Pyodide script if not present
    if (!window.loadPyodide) {
      await new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    _pyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
    });
    return _pyodide;
  })();

  return _pyodideLoading;
}

// Symbol toolbar items
const SYMS = [
  { l: 'def ',   v: 'def ' },  { l: 'for ',   v: 'for ' },
  { l: 'if ',    v: 'if ' },   { l: 'return ', v: 'return ' },
  { l: 'print(', v: 'print(' },{ l: 'range(',  v: 'range(' },
  { l: '( )',    v: '()' },    { l: '[ ]',     v: '[]' },
  { l: '{ }',    v: '{}' },    { l: ':',       v: ':' },
  { l: '**',     v: '**' },    { l: '→ tab',   v: '    ', title: 'indent' },
];

function PythonRepl({ starter = '' }) {
  const [code, setCode] = useReplState(starter);
  const [output, setOutput] = useReplState(null);
  const [status, setStatus] = useReplState('idle'); // idle | loading | running | done | error
  const [open, setOpen] = useReplState(false);
  const taRef = useReplRef(null);

  async function run() {
    if (!code.trim()) {
      setOutput({ ok: false, text: 'SyntaxError: no code to run' });
      return;
    }
    setStatus('loading');
    setOutput(null);

    try {
      const py = await getPyodide();
      setStatus('running');

      // Capture stdout
      py.runPython(`
import sys, io
_stdout_capture = io.StringIO()
sys.stdout = _stdout_capture
`);

      let result;
      try {
        result = py.runPython(code);
      } catch (err) {
        // Restore stdout
        py.runPython(`sys.stdout = sys.__stdout__`);
        setOutput({ ok: false, text: String(err) });
        setStatus('done');
        return;
      }

      const captured = py.runPython(`
_out = _stdout_capture.getvalue()
sys.stdout = sys.__stdout__
_out
`);

      let text = captured || '';
      if (result !== undefined && result !== null && !text.includes(String(result))) {
        text = text + (text ? '\n' : '') + String(result);
      }

      setOutput({ ok: true, text: text || '(no output)' });
      setStatus('done');
    } catch (err) {
      setOutput({ ok: false, text: 'Failed to load Pyodide: ' + String(err) });
      setStatus('idle');
    }
  }

  function insertSym(v) {
    const ta = taRef.current;
    if (!ta) { setCode(c => c + v); return; }
    const st = ta.selectionStart, en = ta.selectionEnd;
    const next = code.slice(0, st) + v + code.slice(en);
    setCode(next);
    setTimeout(() => { ta.selectionStart = ta.selectionEnd = st + v.length; ta.focus(); }, 0);
  }

  const isLoading = status === 'loading' || status === 'running';

  const panelStyles = {
    wrap: { marginTop: 14, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' },
    toggleBtn: {
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', background: 'var(--bg2)', border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 12, color: 'var(--text-2)', fontWeight: 500,
    },
    editorWrap: { background: 'var(--code-bg)', borderTop: '1px solid var(--border)' },
    editorChrome: {
      display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
      borderBottom: '1px solid var(--border)', background: '#161b22',
    },
    dot: (c) => ({ width: 9, height: 9, borderRadius: 5, background: c, opacity: 0.7 }),
    textarea: {
      width: '100%', minHeight: 120,
      background: 'var(--code-bg)', color: '#c9d1d9',
      border: 'none', outline: 'none', resize: 'vertical',
      fontFamily: 'var(--mono)', fontSize: 13, lineHeight: 1.65,
      padding: '12px 14px', tabSize: 4,
    },
    symBar: {
      display: 'flex', overflowX: 'auto', background: '#161b22',
      borderTop: '1px solid var(--border)', scrollbarWidth: 'none',
    },
    symBtn: {
      flexShrink: 0, background: 'none', border: 'none',
      borderRight: '1px solid var(--border)',
      color: 'var(--text-2)', cursor: 'pointer',
      fontFamily: 'var(--mono)', fontSize: 11.5, padding: '7px 11px', whiteSpace: 'nowrap',
    },
    actionRow: { display: 'flex', gap: 8, padding: '10px 12px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' },
    runBtn: {
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      background: 'var(--primary)', color: '#fff',
      border: 'none', borderRadius: 6, padding: '10px 14px',
      fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    },
    clearBtn: {
      background: 'none', border: '1px solid var(--border)', color: 'var(--text-3)',
      borderRadius: 6, padding: '10px 12px', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
    },
    output: (ok) => ({
      borderTop: '1px solid ' + (ok ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'),
      padding: '12px 14px', background: 'var(--code-bg)',
    }),
    outLabel: (ok) => ({
      fontSize: 10, fontFamily: 'var(--mono)', letterSpacing: '0.1em', textTransform: 'uppercase',
      color: ok ? '#4ade80' : '#f87171', marginBottom: 6,
    }),
    outPre: { fontFamily: 'var(--mono)', fontSize: 13, color: '#c9d1d9', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 },
    spinner: {
      width: 13, height: 13, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
      animation: 'spin 700ms linear infinite', flexShrink: 0,
    },
  };

  return (
    <div style={panelStyles.wrap}>
      <button style={panelStyles.toggleBtn} onClick={() => setOpen(o => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="12" height="12" rx="2" stroke="#4ade80" strokeWidth="1.3"/>
            <path d="M4 5l2.5 2L4 9M7.5 9h3" stroke="#4ade80" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <span style={{ color: '#4ade80', fontWeight: 600 }}>Practice in browser</span>
          <span style={{ fontSize: 10.5, opacity: 0.6 }}>· Pyodide Python 3</span>
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d={open ? 'M2 7.5l4-4 4 4' : 'M2 4.5l4 4 4-4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={panelStyles.editorWrap}>
          <div style={panelStyles.editorChrome}>
            {['#ff5f56','#ffbd2e','#27c93f'].map((c,i) => <div key={i} style={panelStyles.dot(c)}/>)}
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: '#8b949e', marginLeft: 4 }}>practice.py</span>
          </div>

          <textarea
            ref={taRef}
            style={panelStyles.textarea}
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="# Write Python here and click Run"
            onKeyDown={e => {
              if (e.key === 'Tab') { e.preventDefault(); insertSym('    '); }
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
            }}
          />

          {/* Symbol toolbar */}
          <div style={panelStyles.symBar}>
            {SYMS.map(sym => (
              <button key={sym.l} style={panelStyles.symBtn} onClick={() => insertSym(sym.v)} title={sym.title}>
                {sym.l}
              </button>
            ))}
          </div>

          <div style={panelStyles.actionRow}>
            <button style={panelStyles.runBtn} onClick={run} disabled={isLoading}>
              {isLoading ? (
                <><div style={panelStyles.spinner}/>{status === 'loading' ? 'Loading Python…' : 'Running…'}</>
              ) : (
                <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 1.5l9 4.5-9 4.5V1.5z" fill="currentColor"/></svg>Run</>
              )}
            </button>
            <button style={panelStyles.clearBtn} onClick={() => { setCode(starter); setOutput(null); }}>Reset</button>
            <span style={{ fontSize: 10.5, color: 'var(--text-3)', fontFamily: 'var(--mono)', alignSelf: 'center', marginLeft: 4 }}>
              ⌘↵ to run
            </span>
          </div>

          {output && (
            <div style={panelStyles.output(output.ok)}>
              <div style={panelStyles.outLabel(output.ok)}>
                {output.ok ? '✓ output' : '✗ error'}
              </div>
              <pre style={panelStyles.outPre}>{output.text}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PythonRepl });
