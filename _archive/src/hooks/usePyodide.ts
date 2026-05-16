import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  runPython: (code: string) => unknown;
  globals: { get: (key: string) => unknown };
}

type Status = "idle" | "loading" | "ready" | "error";

export function usePyodide() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);

  useEffect(() => {
    if (status !== "idle") return;
    setStatus("loading");

    const PYODIDE_CDN =
      "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/";

    // Load the Pyodide script tag if not already present
    if (!document.getElementById("pyodide-script")) {
      const script = document.createElement("script");
      script.id = "pyodide-script";
      script.src = `${PYODIDE_CDN}pyodide.js`;
      script.onload = async () => {
        try {
          const py = await window.loadPyodide({ indexURL: PYODIDE_CDN });
          pyodideRef.current = py;
          setStatus("ready");
        } catch (e) {
          setError(String(e));
          setStatus("error");
        }
      };
      script.onerror = () => {
        setError("Failed to load Pyodide. Check your internet connection.");
        setStatus("error");
      };
      document.head.appendChild(script);
    } else {
      // Script already loaded — wait for window.loadPyodide to appear
      const poll = setInterval(async () => {
        if (typeof window.loadPyodide === "function") {
          clearInterval(poll);
          try {
            const py = await window.loadPyodide({ indexURL: PYODIDE_CDN });
            pyodideRef.current = py;
            setStatus("ready");
          } catch (e) {
            setError(String(e));
            setStatus("error");
          }
        }
      }, 200);
    }
  }, [status]);

  async function runCode(code: string): Promise<{ stdout: string; stderr: string }> {
    if (!pyodideRef.current) {
      return { stdout: "", stderr: "Python runtime not ready yet." };
    }

    const py = pyodideRef.current;
    let stdout = "";
    let stderr = "";

    try {
      // Redirect stdout/stderr via Python's sys module
      await py.runPythonAsync(`
import sys
import io
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

      try {
        await py.runPythonAsync(code);
      } catch (e) {
        // Python runtime error — captured in stderr
      }

      // Collect output
      await py.runPythonAsync(`
_captured_stdout = _stdout_capture.getvalue()
_captured_stderr = _stderr_capture.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);

      stdout = String(py.globals.get("_captured_stdout") ?? "");
      stderr = String(py.globals.get("_captured_stderr") ?? "");
    } catch (e) {
      stderr = String(e);
    }

    return { stdout, stderr };
  }

  return { status, error, runCode };
}
