/* global React */
// LabPane.jsx — Interactive Python lab: editor, Docker-backed execution, flag verification, persistence

const { useState: useLP, useEffect: useLPE, useRef: useLPR, useCallback: useLPC, useMemo: useLPM } = React;

const SYMBOLS = [
  { key: 'tab',  label: '⇥',   ins: '    ' },
  { key: ':',    label: ':',   ins: ':' },
  { key: '()',   label: '()',  ins: '()',  caretBack: 1 },
  { key: '[]',   label: '[]',  ins: '[]',  caretBack: 1 },
  { key: '""',   label: '""',  ins: '""',  caretBack: 1 },
  { key: '#',    label: '#',   ins: '# ' },
  { key: '=',    label: '=',   ins: ' = ' },
];

function LabPane({ starter, onFlagCaptured, onClose }) {
  const { state, actions } = window.useStore();
  const layout = state.layout || {};
  const lessonLayout = layout[state.activeId] || {};
  const persisted = lessonLayout.code;

  // Every lab is docker-backed now — Pyodide path removed for cheat resistance.
  const isDocker = !!starter;

  const [code, setCode] = useLP(() => persisted ?? (starter ? starter.code : ''));
  const [output, setOutput] = useLP([]);
  const [results, setResults] = useLP(null); // [{name, pass, got, expected, error?}]
  const [running, setRunning] = useLP(false);
  const [flagCaptured, setFlagCaptured] = useLP(false);
  const [showHint, setShowHint] = useLP(false);
  const [showExpected, setShowExpected] = useLP(false);
  // Docker session state — labId/sessionId set after we POST /session
  const [dockerStatus, setDockerStatus] = useLP(isDocker ? 'connecting' : 'na');
  const [dockerError, setDockerError] = useLP(null); // human-readable
  const [retryNonce, setRetryNonce] = useLP(0);
  const [sessionId, setSessionId] = useLP(null);
  const [tab, setTab] = useLP('editor'); // 'editor' | 'instructions' | 'terminal'

  const termRef = useLPR(null);
  const taRef = useLPR(null);
  const saveTimer = useLPR(null);
  const xtermContainerRef = useLPR(null);
  const xtermRef = useLPR(null);
  const wsRef = useLPR(null);

  const isModified = useLPM(
    () => starter ? code !== starter.code : false,
    [code, starter]
  );
  const lineCount = useLPM(() => code.split('\n').length, [code]);

  // Reset state when starter changes
  useLPE(() => {
    if (!starter) return;
    const saved = (state.layout[state.activeId] || {}).code;
    setCode(saved ?? starter.code);
    setOutput([]);
    setResults(null);
    setFlagCaptured(state.capturedFlags.includes(starter.flag));
    setShowHint(false);
    setShowExpected(false);
  }, [starter?.filename, starter?.code]);

  // Docker backend: start a session when the lab loads, stop on unmount/lab-change
  useLPE(() => {
    if (!isDocker || !starter) return;
    let cancelled = false;
    let createdSid = null;
    setDockerStatus('connecting');
    setDockerError(null);
    setSessionId(null);
    // Pre-flight: hit /health so we can distinguish "server offline" from "container failed"
    window.LabServerClient.health()
      .catch(() => { throw new Error('server-offline'); })
      .then(() => window.LabServerClient.startSession(state.activeId))
      .then((info) => {
        if (cancelled) {
          window.LabServerClient.stopSession(state.activeId, info.sessionId).catch(() => {});
          return;
        }
        createdSid = info.sessionId;
        window.LabServerClient.registerSession(state.activeId, info.sessionId);
        setSessionId(info.sessionId);
        setDockerStatus('ready');
      })
      .catch((e) => {
        if (!cancelled) {
          if (e.message === 'server-offline') {
            setDockerStatus('offline');
            setDockerError('Lab-server unreachable on ' + window.LabServerClient.baseUrl);
          } else if (e.busy) {
            setDockerStatus('busy');
            setDockerError('All practice slots are busy — retrying automatically…');
            setTimeout(() => { if (!cancelled) setRetryNonce(n => n + 1); }, 5000);
          } else {
            setDockerStatus('error');
            setDockerError(e.message);
            setOutput((p) => [...p, { text: 'Failed to start lab session: ' + e.message, type: 'err' }]);
          }
        }
      });
    return () => {
      cancelled = true;
      if (createdSid) {
        window.LabServerClient.unregisterSession(createdSid);
        window.LabServerClient.stopSession(state.activeId, createdSid).catch(() => {});
      }
      // Close WS terminal if open
      try { wsRef.current && wsRef.current.close(); } catch (_) {}
      try { xtermRef.current && xtermRef.current.dispose(); } catch (_) {}
      xtermRef.current = null;
      wsRef.current = null;
    };
  }, [isDocker, starter?.filename, state.activeId, retryNonce]);

  // Debounced persist code edits
  useLPE(() => {
    if (!starter) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const cur = state.layout[state.activeId] || {};
      actions.setLayout({ [state.activeId]: { ...cur, code } });
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [code, starter]);

  // Auto-scroll terminal
  useLPE(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [output]);

  // Listen for "lab-run" (⌘⇧↵ keyboard shortcut)
  useLPE(() => {
    function onLabRun() { run(); }
    window.addEventListener('lab-run', onLabRun);
    return () => window.removeEventListener('lab-run', onLabRun);
  });

  const run = useLPC(async () => {
    if (running || !starter) return;
    setRunning(true);

    const isMultiCase = !!(starter.cases && starter.cases.length);
    const newLines = [
      { text: `$ python3 ${starter.filename}${isMultiCase ? `  # ${starter.cases.length} test cases` : ''}`, type: 'prompt' },
    ];

    try {
      if (!sessionId) throw new Error('Container not ready yet — wait for status: ready');
      const verifyOut = await window.LabServerClient.verify(state.activeId, sessionId, code);
      const caseResults = verifyOut.results || [];
      const gateError = verifyOut.gateError;

      if (gateError) {
        // AST gate failed — show structural-requirements error prominently in terminal
        newLines.push({ text: '', type: 'sys' });
        gateError.split('\n').forEach(l => newLines.push({ text: l, type: 'err' }));
      }

      // Mirror first VISIBLE case's raw output into terminal (so users see something familiar)
      const primary = caseResults.find(r => !r.hidden);
      if (primary && primary.error) {
        primary.error.split('\n').filter(Boolean).forEach(l => newLines.push({ text: l, type: 'err' }));
      } else if (primary) {
        const out = primary.got || '';
        if (out) {
          out.split('\n').forEach(l => newLines.push({ text: l, type: 'out' }));
        } else if (!primary.expected) {
          newLines.push({ text: '(no output)', type: 'sys' });
        }
      }

      const passed = caseResults.filter(r => r.pass).length;
      const total = caseResults.length;
      newLines.push({ text: '', type: 'sys' });
      newLines.push({
        text: passed === total
          ? `✓ All ${total} test${total > 1 ? 's' : ''} passed`
          : `✗ ${passed}/${total} tests passed`,
        type: passed === total ? 'ok' : 'warn',
      });

      // Flag unlocks only when every case passes
      if (passed === total && total > 0) {
        if (!flagCaptured) {
          newLines.push({ text: `⚑ Flag unlocked → ${starter.flag}`, type: 'ok' });
          setFlagCaptured(true);
          onFlagCaptured(starter.flag);
        } else {
          newLines.push({ text: '(flag already captured)', type: 'sys' });
        }
      }
      setResults(caseResults);
    } catch (e) {
      newLines.push({ text: String(e), type: 'err' });
      setResults([{ name: 'Runtime', pass: false, got: '', expected: '', error: String(e) }]);
    }

    setOutput(prev => [...prev, ...newLines, { text: '', type: 'sys' }]);
    setRunning(false);
  }, [running, code, starter, flagCaptured, isDocker, sessionId, state.activeId]);

  function clearTerm() { setOutput([]); setResults(null); }

  // Visualize whitespace in diff (newlines/spaces/tabs become visible)
  function showWS(s) {
    return (s ?? '').replace(/\n/g, '↵\n').replace(/\t/g, '→');
  }

  // Char-level diff: return React nodes with diverging chars highlighted.
  function diffChars(a, b, role /* 'expected' | 'got' */) {
    const aS = String(a ?? ''), bS = String(b ?? '');
    const max = Math.max(aS.length, bS.length);
    if (max === 0) return '(empty)';
    const nodes = [];
    let i = 0;
    while (i < max) {
      const ach = aS[i] ?? '';
      const bch = bS[i] ?? '';
      const own = role === 'expected' ? ach : bch;
      const same = ach === bch;
      if (same) {
        // merge consecutive same chars
        let buf = '';
        while (i < max && (aS[i] ?? '') === (bS[i] ?? '')) {
          buf += (role === 'expected' ? aS[i] : bS[i]) ?? '';
          i++;
        }
        nodes.push(buf.replace(/\n/g, '↵\n').replace(/\t/g, '→'));
      } else {
        let buf = '';
        while (i < max && (aS[i] ?? '') !== (bS[i] ?? '')) {
          const c = (role === 'expected' ? aS[i] : bS[i]) ?? '';
          buf += c;
          i++;
        }
        nodes.push(
          <span key={i + ':' + role} className={'diff-' + role}>{buf.replace(/\n/g, '↵\n').replace(/\t/g, '→')}</span>
        );
      }
    }
    return nodes;
  }

  function resetCode() {
    if (!starter) return;
    if (isModified && !window.confirm('Discard your edits and restore starter code?')) return;
    setCode(starter.code);
  }

  function insertSymbol(sym) {
    const ta = taRef.current;
    if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const next = code.substring(0, s) + sym.ins + code.substring(e);
    setCode(next);
    requestAnimationFrame(() => {
      const back = sym.caretBack || 0;
      const pos = s + sym.ins.length - back;
      ta.focus();
      ta.selectionStart = ta.selectionEnd = pos;
    });
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      run();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = taRef.current;
      const s = ta.selectionStart, end = ta.selectionEnd;
      const next = code.substring(0, s) + '    ' + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 4; });
    }
  }

  const statusPill = ({
    connecting: { label: '◌ spawning container…', color: 'var(--amber)' },
    ready:      { label: '● Docker container',    color: 'var(--green)' },
    offline:    { label: '● server offline',      color: 'var(--err)', cls: 'server-offline' },
    busy:       { label: '◌ waiting for a free slot…', color: 'var(--amber)' },
    error:      { label: '● container error',     color: 'var(--err)' },
  }[dockerStatus] || { label: '◌ idle', color: 'var(--fg3)' });

  // Mount/teardown xterm when Terminal tab is active and session is ready
  useLPE(() => {
    if (!isDocker || tab !== 'terminal' || !sessionId) return;
    if (!window.Terminal) return; // xterm not loaded — should be in index.html
    if (xtermRef.current) return; // already mounted

    const isLight = document.body.classList.contains('light');
    const term = new window.Terminal({
      fontFamily: 'JetBrains Mono, ui-monospace, Menlo, monospace',
      fontSize: 12.5,
      theme: isLight
        ? { background: '#f4f6f9', foreground: '#1a2133', cursor: '#e84b22', selectionBackground: '#ffd9cb' }
        : { background: '#050810', foreground: '#c9d1d9', cursor: '#e84b22' },
      cursorBlink: true,
      convertEol: true,
    });
    if (window.FitAddon) {
      const fit = new window.FitAddon.FitAddon();
      term.loadAddon(fit);
      term._fit = fit;
    }
    term.open(xtermContainerRef.current);
    if (term._fit) term._fit.fit();
    xtermRef.current = term;

    const boundSid = sessionId;
    const ws = new WebSocket(window.LabServerClient.wsTerminalUrl(state.activeId, sessionId));
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;
    ws._boundSid = boundSid;

    ws.onopen = () => {
      term.write('\x1b[32m● connected\x1b[0m\r\n');
      if (term._fit) ws.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
    };
    ws.onmessage = (ev) => {
      if (typeof ev.data === 'string') {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'error') term.write('\x1b[31m' + m.message + '\x1b[0m\r\n');
          if (m.type === 'exit')  term.write('\r\n\x1b[33m● session ended\x1b[0m\r\n');
        } catch (_) {}
      } else {
        term.write(new Uint8Array(ev.data));
      }
    };
    ws.onerror = () => term.write('\r\n\x1b[31m● ws error\x1b[0m\r\n');

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN && ws._boundSid === boundSid) {
        ws.send(JSON.stringify({ type: 'stdin', data }));
      }
    });
    term.onResize(({ cols, rows }) => {
      if (ws.readyState === WebSocket.OPEN && ws._boundSid === boundSid) {
        ws.send(JSON.stringify({ type: 'resize', cols, rows }));
      }
    });

    const handleResize = () => term._fit && term._fit.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      try { ws.close(); } catch (_) {}
      try { term.dispose(); } catch (_) {}
      xtermRef.current = null;
      wsRef.current = null;
    };
  }, [isDocker, tab, sessionId, state.activeId, state.theme]);

  if (!starter) {
    return (
      <div className="lab lab-empty">
        <div className="lab-empty-inner">
          <div className="lab-empty-icon">⚡</div>
          <div className="lab-empty-title">No lab attached</div>
          <div className="lab-empty-sub">Open a lab exercise from a lesson to drop into the editor.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="lab">
      {/* Tab bar */}
      <div className="lab-tabs">
        <button
          className={'lab-tab' + (tab === 'editor' ? ' active' : '')}
          onClick={() => setTab('editor')}
          title="Editor"
        >
          <span className="dot" style={{ color: 'var(--orange)' }}>●</span>
          {starter.filename}
          {isModified && <span className="mod-dot" title="Unsaved changes" />}
        </button>
        <button
          className={'lab-tab' + (tab === 'instructions' ? ' active' : '')}
          onClick={() => setTab('instructions')}
          title="Task"
        >
          <span className="dot" style={{ color: 'var(--blue)' }}>ⓘ</span>
          task
        </button>
        {isDocker && (
          <button
            className={'lab-tab' + (tab === 'terminal' ? ' active' : '')}
            onClick={() => setTab('terminal')}
            title="Bash terminal (real Docker container)"
          >
            <span className="dot" style={{ color: 'var(--purple)' }}>▸</span>
            terminal
          </button>
        )}
        <div className="lab-tabs-spacer" />
        {onClose && (
          <button className="lab-tab-close" onClick={onClose} title="Close lab (⌘\\)">×</button>
        )}
      </div>

      {/* Status bar */}
      <div className="lab-status">
        <span className={'lab-pill ' + (statusPill.cls || '')} style={{ color: statusPill.color }}>{statusPill.label}</span>
        <span className="lab-meta">{lineCount} ln · {starter.diff}</span>
        {flagCaptured && <span className="lab-flag-chip">⚑ Flag captured</span>}
        {isDocker && dockerError && (dockerStatus === 'offline' || dockerStatus === 'error' || dockerStatus === 'busy') && (
          <span className="lab-status-msg" style={{ color: 'var(--fg3)', fontSize: '11px' }}>{dockerError}</span>
        )}
        {isDocker && (dockerStatus === 'offline' || dockerStatus === 'error') && (
          <button
            className="lab-retry-btn"
            onClick={() => setRetryNonce(n => n + 1)}
            title={dockerError || 'Retry'}
          >↻ Retry</button>
        )}
        <div className="lab-status-spacer" />
        <button
          className="lab-icon-btn"
          onClick={resetCode}
          disabled={!isModified}
          title="Reset to starter code"
        >↻ Reset</button>
        <button className="lab-run-btn" onClick={run} disabled={running} title="Run (Ctrl/⌘+Shift+Enter)">
          {running ? <span className="spin">↻</span> : '▶'} Run <span className="lab-run-kbd">⌘⇧↵</span>
        </button>
      </div>

      {/* Tab content */}
      {tab === 'terminal' ? (
        <div className="lab-xterm-wrap">
          <div className="lab-editor-head">
            <span>bash · container session {sessionId ? sessionId.slice(0, 8) : '—'}</span>
            <span className="lab-editor-hint">{dockerStatus}</span>
          </div>
          {!sessionId
            ? <div className="lab-xterm-pending">◌ waiting for container…</div>
            : <div ref={xtermContainerRef} className="lab-xterm" />}
        </div>
      ) : tab === 'instructions' ? (
        <div className="lab-instructions">
          <div className="lab-instructions-label">Objective</div>
          <p className="lab-instructions-text">{starter.instructions}</p>

          {starter.cases && starter.cases.length > 0 ? (
            <>
              <div className="lab-instructions-label">
                Test cases ({starter.cases.length} visible{starter.hiddenCaseCount ? ` + ${starter.hiddenCaseCount} hidden` : ''})
              </div>
              <div className="lab-cases-preview">
                {starter.cases.map((c, i) => (
                  <details key={i} className="lab-case-preview" open={starter.cases.length <= 3 || i === 0}>
                    <summary>
                      <span className="lab-case-preview-num">{i + 1}</span>
                      <span className="lab-case-preview-name">{c.name}</span>
                    </summary>
                    {c.input !== undefined && (
                      <div className="lab-case-row">
                        <span className="lab-case-lbl">input ({Array.isArray(starter.paramName) ? starter.paramName.join(', ') : starter.paramName})</span>
                        <code className="lab-case-val">{typeof c.input === 'string' ? c.input : JSON.stringify(c.input, null, 2)}</code>
                      </div>
                    )}
                    <div className="lab-case-row">
                      <span className="lab-case-lbl">expected</span>
                      <code className="lab-case-val expected">{showWS(c.expected) || '(empty)'}</code>
                    </div>
                  </details>
                ))}
                {starter.hiddenCaseCount > 0 && (
                  <div className="lab-case-hidden-note">
                    🔒 {starter.hiddenCaseCount} additional hidden test{starter.hiddenCaseCount === 1 ? '' : 's'} — your solution must work for inputs you can't see.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="lab-instructions-label">Expected output</div>
              <pre className="lab-expected">{starter.expectedOutput}</pre>
            </>
          )}
          {starter.hasRequirements && (
            <div className="lab-requires-note">
              ⚙ This lab has structural requirements (e.g. must use a loop / function / specific call). Cheating by hardcoding output won't work.
            </div>
          )}

          {starter.hint && (
            <>
              <div className="lab-instructions-label">Hint</div>
              {showHint
                ? <pre className="lab-hint-box">{starter.hint}</pre>
                : <button className="lab-hint-reveal" onClick={() => setShowHint(true)}>Reveal hint →</button>
              }
            </>
          )}

          <div className="lab-instructions-label">Flag</div>
          {flagCaptured
            ? <code className="lab-flag-captured">{starter.flag}</code>
            : <code className="lab-flag-locked">⚑ Run your code to unlock</code>
          }
        </div>
      ) : (
        <div className="lab-editor-wrap">
          <div className="lab-editor-head">
            <span>{starter.filename}</span>
            <span className="lab-editor-hint">Tab = 4sp · ⌘↵ run</span>
          </div>
          <div className="lab-editor-body">
            <div className="lab-gutter" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="lab-ln">{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={taRef}
              className="lab-editor"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
          <div className="lab-symbols">
            {SYMBOLS.map(s => (
              <button key={s.key} className="lab-sym" onClick={() => insertSymbol(s)} tabIndex={-1}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Test results card */}
      {results && results.length > 0 && (
        <div className="lab-tests">
          <div className="lab-tests-head">
            <span className="lab-tests-title">Test results</span>
            <span className={'lab-tests-counter ' + (results.every(r => r.pass) ? 'pass' : 'fail')}>
              {results.filter(r => r.pass).length}/{results.length} passed
            </span>
          </div>
          <div className="lab-tests-body">
            {results.map((r, i) => (
              <div key={i} className={'lab-case ' + (r.pass ? 'pass' : 'fail') + (r.hidden ? ' hidden' : '')}>
                <div className="lab-case-head">
                  <span className={'lab-case-badge ' + (r.pass ? 'pass' : 'fail')}>
                    {r.pass ? '✓' : '✗'}
                  </span>
                  <span className="lab-case-name">
                    {r.hidden ? '🔒 ' : `Case ${i + 1}: `}{r.name}
                  </span>
                </div>
                {!r.pass && !r.hidden && (
                  <div className="lab-case-diff">
                    {r.input !== undefined && (
                      <div className="lab-case-row">
                        <span className="lab-case-lbl">input</span>
                        <code className="lab-case-val">{typeof r.input === 'string' ? r.input : JSON.stringify(r.input, null, 2)}</code>
                      </div>
                    )}
                    <div className="lab-case-row">
                      <span className="lab-case-lbl">expected</span>
                      <code className="lab-case-val expected">{diffChars(r.expected, r.got, 'expected')}</code>
                    </div>
                    <div className="lab-case-row">
                      <span className="lab-case-lbl">got</span>
                      <code className="lab-case-val got">{diffChars(r.expected, r.got, 'got')}</code>
                    </div>
                    {r.error && (
                      <div className="lab-case-row">
                        <span className="lab-case-lbl err">error</span>
                        <code className="lab-case-val err">{r.error.split('\n').slice(-3).join('\n')}</code>
                      </div>
                    )}
                  </div>
                )}
                {!r.pass && r.hidden && (
                  <div className="lab-case-diff">
                    <div className="lab-case-hidden-msg">
                      Hidden test case — inputs and expected output are not shown.
                      {r.error ? ' ' + r.error : ''}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Terminal (always visible) */}
      <div className="lab-term-head">
        <span>terminal · stdout</span>
        {output.length > 0 && (
          <button className="lab-icon-btn small" onClick={clearTerm}>clear</button>
        )}
      </div>
      <div ref={termRef} className="lab-term">
        {output.length === 0 && (
          <div className="t-sys lab-term-empty">▸ press ▶ Run to execute {starter.filename}</div>
        )}
        {output.map((line, i) => {
          if (!line.text && line.type === 'sys') return <div key={i} style={{ height: 4 }} />;
          const cls =
            line.type === 'ok' ? 't-ok'
            : line.type === 'err' ? 't-err'
            : line.type === 'warn' ? 't-warn'
            : line.type === 'prompt' ? 't-prompt-line'
            : line.type === 'sys' ? 't-sys'
            : '';
          return (
            <div key={i} className={cls}>
              {line.type === 'prompt'
                ? <><span className="t-prompt">$</span>{line.text.slice(1)}</>
                : <>{line.text || ' '}</>
              }
            </div>
          );
        })}
        {running && <div className="t-sys"><span className="spin">↻</span> running…</div>}
      </div>
    </div>
  );
}

Object.assign(window, { LabPane });
