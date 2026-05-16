// pr-lab.jsx — P1: Resizable Lab VM with tabs, persist layout, mock Python runner

const { useState: useLabState, useRef: useLabRef, useEffect: useLabEffect, useCallback: useLabCb } = React;

// ── Simulated Python runner ──────────────────────────────────
// Maps expected outputs so the lab feels real without Pyodide loading time.
function simulateRun(code, starter) {
  // Exact match
  if (code.trimEnd() + "\n" === starter.expectedOutput || code.trimEnd() === starter.expectedOutput.trimEnd()) {
    return { stdout: starter.expectedOutput, stderr: "" };
  }
  // Try running with a simple evaluator mock
  try {
    const lines = code.split("\n");
    const output = [];
    // Very simple print() extractor
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip shebangs, comments, blank lines, non-print
      if (trimmed.startsWith("#") || trimmed.startsWith("!") || !trimmed) continue;
      const printMatch = trimmed.match(/^print\((.+)\)$/);
      if (printMatch) {
        let arg = printMatch[1].trim();
        // Remove outer quotes if simple string
        if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
          output.push(arg.slice(1, -1));
        } else {
          output.push(arg); // expression we can't eval
        }
      }
    }
    if (output.length > 0) {
      const stdout = output.join("\n") + "\n";
      if (stdout === starter.expectedOutput) {
        return { stdout, stderr: "" };
      }
      return { stdout, stderr: "" };
    }
    return { stdout: "", stderr: "No output generated. Check your print() statements." };
  } catch (e) {
    return { stdout: "", stderr: String(e) };
  }
}

function LabVM({ starter, onFlagCaptured, onClose, style }) {
  const [code, setCode] = useLabState(starter.code);
  const [output, setOutput] = useLabState([
    { text: `── Lab VM: ${starter.filename} ─────────────────`, type: "sys" },
    { text: `Task: ${starter.instructions}`, type: "sys" },
    { text: "", type: "sys" },
    { text: "Edit the code on the left, then press ▶ Run (or Ctrl+Enter).", type: "sys" },
  ]);
  const [running, setRunning] = useLabState(false);
  const [flagCaptured, setFlagCaptured] = useLabState(false);
  const [showHint, setShowHint] = useLabState(false);
  const termRef = useLabRef(null);
  const taRef = useLabRef(null);

  useLabEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [output]);

  const run = useLabCb(() => {
    if (running) return;
    setRunning(true);
    const lines = [
      { text: "", type: "sys" },
      { text: `$ python3 ${starter.filename}`, type: "sys" },
    ];
    // Simulate delay for realism
    setTimeout(() => {
      const { stdout, stderr } = simulateRun(code, starter);
      if (stdout) stdout.split("\n").filter((l, i, a) => !(l === "" && i === a.length - 1))
        .forEach(l => lines.push({ text: l, type: "out" }));
      if (stderr) stderr.split("\n").filter(Boolean).forEach(l => lines.push({ text: l, type: "err" }));
      if (!stdout && !stderr) lines.push({ text: "(no output)", type: "sys" });
      if (stdout === starter.expectedOutput && !flagCaptured) {
        lines.push({ text: "", type: "sys" });
        lines.push({ text: `✓ Correct! Flag unlocked: ${starter.flag}`, type: "ok" });
        setFlagCaptured(true);
        onFlagCaptured(starter.flag, starter);
      } else if (stdout && stdout !== starter.expectedOutput && !flagCaptured) {
        lines.push({ text: "", type: "sys" });
        lines.push({ text: "✗ Output doesn't match expected yet.", type: "err" });
      }
      setOutput(prev => [...prev, ...lines]);
      setRunning(false);
    }, 280);
  }, [running, code, starter, flagCaptured, onFlagCaptured]);

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); }
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = taRef.current;
      const s = ta.selectionStart, end = ta.selectionEnd;
      const next = code.substring(0, s) + "    " + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 4; });
    }
  }

  return (
    <div className="lab" style={style}>
      {/* Tabs */}
      <div className="lab-tabs">
        <div className="lab-tab active">
          <span className="dot">●</span>
          {starter.filename}
          {onClose && (
            <span className="cls" onClick={onClose} title="Close lab">×</span>
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="lab-status">
        <span className="lab-pill ready">● Python 3.12 ready</span>
        {flagCaptured && (
          <span className="lab-flag-chip">⚑ Flag captured!</span>
        )}
        <button className="lab-run-btn" onClick={run} disabled={running} title="Run (Ctrl+Enter)">
          {running ? <span className="spin">↻</span> : "▶"} Run <span style={{ opacity: .6, fontSize: 9 }}>Ctrl+↵</span>
        </button>
      </div>

      {/* Editor */}
      <div className="lab-editor-wrap">
        <div className="lab-editor-head">
          <span>{starter.filename}</span>
          <span>Tab = 4 spaces · Ctrl+Enter = run</span>
        </div>
        <textarea
          ref={taRef}
          className="lab-editor"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      </div>

      {/* Terminal output */}
      <div ref={termRef} className="lab-term">
        {output.map((line, i) => {
          if (!line.text) return <div key={i} style={{ height: 6 }} />;
          const cls = line.type === "ok" ? "t-ok" : line.type === "err" ? "t-err" : line.type === "sys" ? "t-sys" : "";
          return <div key={i} className={cls}>{line.type === "sys" && line.text.startsWith("$") ? <><span className="t-prompt">$</span>{line.text.slice(1)}</> : line.text}</div>;
        })}
        {running && <div className="t-sys"><span className="spin">↻</span> running…</div>}
      </div>

      {/* Hint + expected */}
      <div className="lab-hint">
        <span className="exp">
          expected: <span style={{ color: "var(--fg2)" }}>
            {starter.expectedOutput.slice(0, 55).replace(/\n/g, "↵")}
            {starter.expectedOutput.length > 55 ? "…" : ""}
          </span>
        </span>
        {starter.hint && (
          <span>
            {showHint
              ? <span style={{ color: "var(--amber)" }}>{starter.hint}</span>
              : <span style={{ color: "var(--orange)", cursor: "pointer" }} onClick={() => setShowHint(true)}>show hint →</span>
            }
          </span>
        )}
      </div>
    </div>
  );
}

// ── Resizable lab wrapper ────────────────────────────────────
function ResizableLabPane({ starter, onFlagCaptured, onClose, labWidth, onResizeStart }) {
  if (!starter) return null;
  return (
    <>
      <div
        className="ws-resizer"
        onMouseDown={onResizeStart}
        title="Drag to resize"
      />
      <div className="ws-lab" style={{ width: labWidth + "px" }}>
        <LabVM
          starter={starter}
          onFlagCaptured={onFlagCaptured}
          onClose={onClose}
          style={{ flex: 1 }}
        />
      </div>
    </>
  );
}

Object.assign(window, { LabVM, ResizableLabPane });
