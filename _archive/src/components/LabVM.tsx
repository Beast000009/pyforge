import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Play,
  RotateCcw,
  Terminal,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Flag,
} from "lucide-react";
import { usePyodide } from "@/hooks/usePyodide";
import type { LabStarter } from "@/data/labStarters";

interface LabVMProps {
  starter: LabStarter;
  onFlagCaptured: (flag: string) => void;
  onClose: () => void;
}

interface OutputLine {
  text: string;
  type: "stdout" | "stderr" | "system" | "success";
}

export function LabVM({ starter, onFlagCaptured, onClose }: LabVMProps) {
  const { status, error, runCode } = usePyodide();
  const [code, setCode] = useState(starter.code);
  const [output, setOutput] = useState<OutputLine[]>([
    {
      text: `── Lab VM: ${starter.filename} ──────────────────────────`,
      type: "system",
    },
    { text: `Task: ${starter.instructions}`, type: "system" },
    { text: ``, type: "system" },
    { text: `Edit the code on the left, then press Run (or Ctrl+Enter).`, type: "system" },
  ]);
  const [running, setRunning] = useState(false);
  const [flagCaptured, setFlagCaptured] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Add loading message once Pyodide starts loading
  useEffect(() => {
    if (status === "loading") {
      setOutput((prev) => [
        ...prev,
        { text: "", type: "system" },
        {
          text: "⟳ Booting Python runtime (Pyodide). This may take ~15s on first load...",
          type: "system",
        },
      ]);
    }
    if (status === "ready") {
      setOutput((prev) => [
        ...prev,
        { text: "✓ Python 3 runtime ready. Press Run to execute.", type: "success" },
      ]);
    }
    if (status === "error" && error) {
      setOutput((prev) => [
        ...prev,
        { text: `✗ Error loading Python: ${error}`, type: "stderr" },
      ]);
    }
  }, [status, error]);

  const run = useCallback(async () => {
    if (status !== "ready" || running) return;
    setRunning(true);

    setOutput((prev) => [
      ...prev,
      { text: "", type: "system" },
      { text: `$ python3 ${starter.filename}`, type: "system" },
    ]);

    const { stdout, stderr } = await runCode(code);

    const newLines: OutputLine[] = [];
    if (stdout) {
      for (const line of stdout.split("\n")) {
        if (line !== "" || stdout.endsWith("\n")) {
          newLines.push({ text: line, type: "stdout" });
        }
      }
    }
    if (stderr) {
      for (const line of stderr.split("\n")) {
        if (line) newLines.push({ text: line, type: "stderr" });
      }
    }
    if (!stdout && !stderr) {
      newLines.push({ text: "(no output)", type: "system" });
    }

    // Check if output matches expected
    if (stdout === starter.expectedOutput && !flagCaptured) {
      newLines.push({ text: "", type: "system" });
      newLines.push({
        text: `✓ Correct output! Flag unlocked: ${starter.flag}`,
        type: "success",
      });
      setFlagCaptured(true);
      onFlagCaptured(starter.flag);
    } else if (stdout && stdout !== starter.expectedOutput && !flagCaptured) {
      newLines.push({ text: "", type: "system" });
      newLines.push({
        text: `✗ Output doesn't match expected yet. Keep trying!`,
        type: "stderr",
      });
    }

    setOutput((prev) => [...prev, ...newLines]);
    setRunning(false);
  }, [status, running, code, starter, flagCaptured, runCode, onFlagCaptured]);

  function reset() {
    setCode(starter.code);
    setOutput((prev) => [
      ...prev,
      { text: "", type: "system" },
      { text: "── Code reset to starter ──", type: "system" },
    ]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    }
    // Handle Tab key for indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = code.substring(0, start) + "    " + code.substring(end);
      setCode(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  }

  return (
    <div
      className="fixed bottom-0 left-72 right-0 flex flex-col border-t z-50"
      style={{
        height: "380px",
        background: "#0a0e17",
        borderColor: "#1e293b",
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b shrink-0"
        style={{ background: "#111827", borderColor: "#1e293b" }}
      >
        <div className="flex items-center gap-2 flex-1">
          <Terminal size={13} style={{ color: "#4ade80" }} />
          <span className="font-mono text-xs" style={{ color: "#e2e8f0" }}>
            Lab VM — {starter.filename}
          </span>
          {status === "loading" && (
            <Loader2
              size={11}
              className="animate-spin"
              style={{ color: "#fbbf24" }}
            />
          )}
          {status === "ready" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}>
              Python 3 ready
            </span>
          )}
          {status === "loading" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
              booting…
            </span>
          )}
          {status === "error" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(248,113,113,0.15)", color: "#f87171" }}>
              error
            </span>
          )}
        </div>

        {flagCaptured && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono"
            style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}
          >
            <Flag size={11} />
            Flag captured!
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            data-testid="vm-reset-btn"
            onClick={reset}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors hover:bg-white/5"
            style={{ color: "#8b949e" }}
            title="Reset to starter code"
          >
            <RotateCcw size={11} />
            Reset
          </button>

          <button
            data-testid="vm-run-btn"
            onClick={run}
            disabled={status !== "ready" || running}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all disabled:opacity-40"
            style={{
              background: status === "ready" ? "#e84b22" : "#374151",
              color: "#fff",
            }}
            title="Run code (Ctrl+Enter)"
          >
            {running ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Play size={11} />
            )}
            Run
          </button>

          <button
            data-testid="vm-close-btn"
            onClick={onClose}
            className="ml-1 p-1 rounded hover:bg-white/5 transition-colors"
            style={{ color: "#6b7280" }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Split pane: editor | terminal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code editor */}
        <div className="flex-1 flex flex-col border-r" style={{ borderColor: "#1e293b" }}>
          <div
            className="px-3 py-1.5 text-[10px] font-mono border-b flex items-center justify-between shrink-0"
            style={{ background: "#0d1117", borderColor: "#1e293b", color: "#6b7280" }}
          >
            <span>{starter.filename}</span>
            <span style={{ color: "#374151" }}>Ctrl+Enter to run · Tab to indent</span>
          </div>
          <textarea
            ref={textareaRef}
            data-testid="vm-code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="flex-1 resize-none outline-none p-4 font-mono text-sm leading-relaxed"
            style={{
              background: "#0d1117",
              color: "#c9d1d9",
              caretColor: "#e84b22",
              tabSize: 4,
            }}
          />
        </div>

        {/* Terminal output */}
        <div className="w-96 flex flex-col" style={{ minWidth: "360px" }}>
          <div
            className="px-3 py-1.5 text-[10px] font-mono border-b flex items-center gap-1.5 shrink-0"
            style={{ background: "#0d1117", borderColor: "#1e293b", color: "#6b7280" }}
          >
            <ChevronRight size={10} style={{ color: "#4ade80" }} />
            <span>output</span>
          </div>
          <div
            ref={outputRef}
            className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
            style={{ background: "#060a0f" }}
          >
            {output.map((line, i) => (
              <OutputLineView key={i} line={line} />
            ))}
            {running && (
              <div className="flex items-center gap-2 mt-1" style={{ color: "#6b7280" }}>
                <Loader2 size={10} className="animate-spin" />
                <span>running…</span>
              </div>
            )}
          </div>

          {/* Expected output hint */}
          <div
            className="px-3 py-2 border-t text-[10px] font-mono shrink-0"
            style={{ background: "#0d1117", borderColor: "#1e293b", color: "#374151" }}
          >
            <span style={{ color: "#4b5563" }}>expected: </span>
            <span style={{ color: "#6b7280" }}>
              {starter.expectedOutput.slice(0, 60).replace(/\n/g, "↵")}
              {starter.expectedOutput.length > 60 ? "…" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OutputLineView({ line }: { line: OutputLine }) {
  if (line.text === "") return <div className="h-2" />;

  const colors: Record<OutputLine["type"], string> = {
    stdout: "#c9d1d9",
    stderr: "#f87171",
    system: "#4b5563",
    success: "#4ade80",
  };

  const prefixes: Record<OutputLine["type"], string> = {
    stdout: "",
    stderr: "",
    system: "",
    success: "",
  };

  return (
    <div style={{ color: colors[line.type] }}>
      {line.type === "stderr" && (
        <AlertCircle
          size={10}
          className="inline mr-1 mb-0.5"
          style={{ color: "#f87171" }}
        />
      )}
      {line.type === "success" && (
        <CheckCircle2
          size={10}
          className="inline mr-1 mb-0.5"
          style={{ color: "#4ade80" }}
        />
      )}
      {prefixes[line.type]}
      {line.text}
    </div>
  );
}
