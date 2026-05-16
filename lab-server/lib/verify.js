// verify.js — Run user script in container, gate via AST, diff stdout vs expected.

import { execInSession } from "./sessions.js";

// Wall-clock budget for a single student program / AST check, enforced by the
// in-container `timeout` binary (coreutils, present in python:3.12-slim).
// `-k 2` SIGKILLs 2s after the initial SIGTERM for processes that ignore it.
const RUN_TIMEOUT_S = 12;
const AST_TIMEOUT_S = 10;
// Node-side safety net — must be looser than the in-container timeout so the
// container kills the process first (clean stream EOF + real exit code).
const RUN_SAFETY_MS = (RUN_TIMEOUT_S + 8) * 1000;
const AST_SAFETY_MS = (AST_TIMEOUT_S + 8) * 1000;

/** Write file content via base64 stdin into /workdir/<filename>. */
export async function writeFile(sessionId, filename, content) {
  filename = safeWorkdirFilename(filename);
  const b64 = Buffer.from(content, "utf8").toString("base64");
  return execInSession(sessionId, [
    "sh", "-c",
    `echo "${b64}" | base64 -d > /workdir/${filename}`,
  ]);
}

export async function readFile(sessionId, filename) {
  filename = safeWorkdirFilename(filename);
  return execInSession(sessionId, ["cat", `/workdir/${filename}`]);
}

/** Run /workdir/<filename> with optional stdin. */
export async function runPython(sessionId, filename, stdin) {
  filename = safeWorkdirFilename(filename);
  const t0 = Date.now();
  let cmd;
  if (typeof stdin === "string" && stdin.length > 0) {
    const b64 = Buffer.from(stdin, "utf8").toString("base64");
    cmd = ["sh", "-c", `echo "${b64}" | base64 -d | timeout -k 2 ${RUN_TIMEOUT_S} python3 ${filename}`];
  } else {
    cmd = ["timeout", "-k", "2", String(RUN_TIMEOUT_S), "python3", filename];
  }
  const res = await execInSession(sessionId, cmd, { workingDir: "/workdir", timeoutMs: RUN_SAFETY_MS });
  return { ...res, durationMs: Date.now() - t0 };
}

/**
 * AST gate: run the baked-in /usr/local/bin/pyforge-ast-check against the user's source.
 * Returns { ok: bool, message?: string }.
 */
export async function astGate(sessionId, source, requires) {
  if (!requires || Object.keys(requires).length === 0) return { ok: true };
  const reqJson = JSON.stringify(requires).replace(/'/g, "'\\''");
  const srcB64 = Buffer.from(source, "utf8").toString("base64");
  const cmd = [
    "sh", "-c",
    `echo "${srcB64}" | base64 -d | timeout -k 2 ${AST_TIMEOUT_S} pyforge-ast-check '${reqJson}'`,
  ];
  const r = await execInSession(sessionId, cmd, { timeoutMs: AST_SAFETY_MS });
  if (r.exitCode === 0) return { ok: true };
  return { ok: false, message: (r.stderr || "AST gate failed").trim() };
}

/**
 * Server labs (e.g. s2-3-1): the student writes a TCP server that blocks on
 * accept(). We start it in the background, wait for the port, connect a netcat
 * client, and treat what the CLIENT receives as the program output. The server
 * is bounded by the in-container `timeout` and reaped afterwards so a broken or
 * malicious server can never linger.
 */
async function runServerLab(sessionId, lab) {
  const port = lab.serverPort || 8080;
  const filename = safeWorkdirFilename(lab.filename);
  // stdin for the client (some servers recv() before they send())
  const sendExpr = lab.clientPayload ? `printf %s ${shArg(lab.clientPayload)}` : ":";
  // Don't probe with `nc -z` first — a one-shot server's single accept() would
  // be consumed by the probe. Instead retry the *real* connection: while the
  // server isn't listening yet, connect() fails instantly (no accept consumed);
  // the first attempt that succeeds is the one the server handles.
  const script = [
    `timeout -k 2 ${RUN_TIMEOUT_S} python3 ${filename} >/dev/null 2>&1 & SRV=$!`,
    `OUT=""`,
    `for i in $(seq 1 80); do`,
    `  OUT=$( ( ${sendExpr} ) | nc -w 3 127.0.0.1 ${port} 2>/dev/null ) && break`,
    `  sleep 0.1`,
    `done`,
    `kill $SRV 2>/dev/null; pkill -f ${shArg("python3 " + filename)} 2>/dev/null; wait 2>/dev/null`,
    `printf %s "$OUT"`,
  ].join("\n");
  const b64 = Buffer.from(script, "utf8").toString("base64");
  const t0 = Date.now();
  const run = await execInSession(
    sessionId,
    ["sh", "-c", `echo "${b64}" | base64 -d | bash`],
    { workingDir: "/workdir", timeoutMs: RUN_SAFETY_MS }
  );
  const got = (run.stdout || "").replace(/\n+$/, "");
  const expected = (lab.expectedOutput || "").replace(/\n+$/, "");
  const pass = got === expected && got.length > 0;
  return {
    results: [{
      name: "Server responds",
      pass,
      got,
      expected,
      durationMs: Date.now() - t0,
      error: pass ? undefined
        : got.length === 0
          ? "The client connected but received nothing — does your server accept() and send()?"
          : null,
    }],
  };
}

/** Single-quote a string for safe use inside a POSIX shell command. */
function shArg(s) {
  return `'` + String(s).replace(/'/g, `'\\''`) + `'`;
}

export function safeWorkdirFilename(filename) {
  if (typeof filename !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,80}$/.test(filename)) {
    throw new Error("Invalid filename");
  }
  return filename;
}

/**
 * Verify pipeline:
 *  1. AST gate (if `lab.requires`)
 *  2. Server labs → dedicated runner; otherwise run every visible + hidden case
 *  3. Mask `input` of hidden cases (don't reveal to client unless the case fails — give a generic name)
 *
 * Returns { results: [...], gateError?: string }.
 */
export async function verifyLab(sessionId, source, lab) {
  // 1. AST gate
  if (lab.requires && Object.keys(lab.requires).length) {
    const gate = await astGate(sessionId, source, lab.requires);
    if (!gate.ok) {
      // Mark every case as failed with the AST diagnostic
      const visible = (lab.cases && lab.cases.length) ? lab.cases : [{ name: "Sample" }];
      return {
        gateError: gate.message,
        results: visible.map((c) => ({
          name: c.name || "Case",
          input: c.input,
          pass: false,
          got: "",
          expected: c.expected || lab.expectedOutput || "",
          error: gate.message,
          durationMs: 0,
        })),
      };
    }
  }

  // 2. Server labs: background the server + drive a netcat client.
  if (lab.serverLab) {
    await writeFile(sessionId, lab.filename, source);
    return runServerLab(sessionId, lab);
  }

  // 3. Run all cases (visible first, then hidden — hidden ones get sanitised on output)
  const visible = (lab.cases && lab.cases.length) ? lab.cases : [{ name: "Sample", expected: lab.expectedOutput || "" }];
  const hidden = lab.hiddenCases || [];
  const all = [
    ...visible.map((c) => ({ ...c, _hidden: false })),
    ...hidden.map((c, i) => ({ ...c, _hidden: true, name: c.name || `Hidden ${i + 1}` })),
  ];
  const filename = lab.filename;
  const results = [];

  for (const c of all) {
    const testSource = substituteParam(source, lab.paramName, c.input);
    await writeFile(sessionId, filename, testSource);
    const run = await runPython(sessionId, filename, c.stdin);
    const got = (run.stdout || "").replace(/\n+$/, "");
    const expected = (c.expected || "").replace(/\n+$/, "");
    const pass = run.exitCode === 0 && got === expected;
    const result = {
      name: c.name || "Case",
      pass,
      durationMs: run.durationMs,
    };
    if (c._hidden) {
      // Don't leak hidden inputs/expected to the client. Just say it passed or didn't.
      result.hidden = true;
      if (!pass) {
        // Slight hint without revealing the answer
        result.error = run.exitCode === 0
          ? "Output didn't match for a hidden case."
          : "Your code crashed on a hidden case.";
      }
    } else {
      result.input = c.input;
      result.got = got;
      result.expected = expected;
      if (!pass) result.error = run.exitCode === 0 ? null : (run.stderr || "Error").trim();
    }
    results.push(result);
  }
  return { results };
}

// --- Param substitution ------------------------------------------------------

export function pyRepr(val) {
  if (typeof val === "string") return JSON.stringify(val);
  if (val === null || val === undefined) return "None";
  if (typeof val === "boolean") return val ? "True" : "False";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return "[" + val.map(pyRepr).join(", ") + "]";
  if (typeof val === "object") {
    const entries = Object.entries(val).map(([k, v]) => `${JSON.stringify(k)}: ${pyRepr(v)}`);
    return "{" + entries.join(", ") + "}";
  }
  return JSON.stringify(val);
}

function substituteOne(code, varName, value) {
  const re = new RegExp(`^[ \\t]*${varName}\\s*=.*$`, "m");
  const repl = `${varName} = ${pyRepr(value)}`;
  return re.test(code) ? code.replace(re, repl) : `${repl}\n${code}`;
}

export function substituteParam(code, paramName, input) {
  if (!paramName || input === undefined) return code;
  if (Array.isArray(paramName)) {
    let next = code;
    for (const name of paramName) {
      if (input[name] !== undefined) next = substituteOne(next, name, input[name]);
    }
    return next;
  }
  return substituteOne(code, paramName, input);
}
