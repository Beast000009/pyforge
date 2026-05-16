// server.js — PyForge lab orchestrator
//
// Endpoints:
//   GET  /health
//   POST /labs/:labId/session                     → { sessionId }
//   DELETE /labs/:labId/session/:sid              → 204
//   GET  /labs/:labId/session/:sid                → session state
//   POST /labs/:labId/session/:sid/files/:name    → { ok }
//   GET  /labs/:labId/session/:sid/files/:name    → { content }
//   POST /labs/:labId/session/:sid/verify         → [{ name, pass, got, expected }]
//   WS   /labs/:labId/session/:sid/term           → bash bridge
//
// Bound to 127.0.0.1:3030 by default; no auth (local single-user dev).

import express from "express";
import http from "node:http";
import { WebSocketServer } from "ws";
import {
  startSession, stopSession, getSession, listSessions,
  startIdleGC, adoptOrphans, withSessionLock,
} from "./lib/sessions.js";
import { writeFile, readFile, verifyLab, safeWorkdirFilename } from "./lib/verify.js";
import { attachTerminal } from "./lib/pty.js";
import { listPublicLabs, getPublicLab, getLabFull } from "./lib/lab-registry.js";

const PORT = Number(process.env.PORT || 3030);
const HOST = process.env.HOST || "127.0.0.1";

const app = express();
app.use(express.json({ limit: "1mb" }));

function getBoundSession(req, res) {
  const s = getSession(req.params.sid);
  if (!s) {
    res.status(404).json({ error: "Session not found" });
    return null;
  }
  if (s.labId !== req.params.labId) {
    res.status(409).json({ error: "Session does not belong to this lab" });
    return null;
  }
  return s;
}

// CORS — allow the static frontend served on a different port
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, sessions: listSessions() });
});

// Public lab catalog — strips hiddenCases + requires so the client can't bypass.
app.get("/labs", (_req, res) => {
  res.json({ labs: listPublicLabs() });
});

app.get("/labs/:labId", (req, res) => {
  const lab = getPublicLab(req.params.labId);
  if (!lab) return res.status(404).json({ error: "lab not found" });
  res.json({ lab });
});

app.post("/labs/:labId/session", async (req, res) => {
  try {
    const session = await startSession(req.params.labId);
    res.json({ sessionId: session.id, labId: session.labId });
  } catch (e) {
    if (/Max concurrent sessions/.test(e.message)) {
      res.setHeader("Retry-After", "5");
      return res.status(429).json({ error: "All practice slots are busy. Please wait a moment.", retryable: true });
    }
    res.status(500).json({ error: e.message });
  }
});

app.delete("/labs/:labId/session/:sid", async (req, res) => {
  const s = getSession(req.params.sid);
  if (s && s.labId !== req.params.labId) {
    return res.status(409).json({ error: "Session does not belong to this lab" });
  }
  const ok = await stopSession(req.params.sid);
  res.status(ok ? 204 : 404).end();
});

app.get("/labs/:labId/session/:sid", (req, res) => {
  const s = getBoundSession(req, res);
  if (!s) return;
  res.json({
    sessionId: s.id,
    labId: s.labId,
    createdAt: s.createdAt,
    lastActivityAt: s.lastActivityAt,
  });
});

app.post("/labs/:labId/session/:sid/files/:name", async (req, res) => {
  try {
    if (!getBoundSession(req, res)) return;
    const filename = safeWorkdirFilename(req.params.name);
    const { content } = req.body || {};
    if (typeof content !== "string") return res.status(400).json({ error: "content required" });
    const r = await writeFile(req.params.sid, filename, content);
    res.json({ ok: r.exitCode === 0, stderr: r.stderr });
  } catch (e) {
    res.status(e.message === "Invalid filename" ? 400 : 500).json({ error: e.message });
  }
});

app.get("/labs/:labId/session/:sid/files/:name", async (req, res) => {
  try {
    if (!getBoundSession(req, res)) return;
    const filename = safeWorkdirFilename(req.params.name);
    const r = await readFile(req.params.sid, filename);
    res.json({ content: r.stdout });
  } catch (e) {
    res.status(e.message === "Invalid filename" ? 400 : 500).json({ error: e.message });
  }
});

app.post("/labs/:labId/session/:sid/verify", async (req, res) => {
  try {
    const { source } = req.body || {};
    if (typeof source !== "string") {
      return res.status(400).json({ error: "source required" });
    }
    // ALWAYS use the server-side registry — never trust client-supplied lab specs.
    const lab = getLabFull(req.params.labId);
    if (!lab) return res.status(404).json({ error: "unknown lab" });
    if (!getBoundSession(req, res)) return;
    const out = await withSessionLock(req.params.sid, () => verifyLab(req.params.sid, source, lab));
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  // Path: /labs/:labId/session/:sid/term
  const m = req.url.match(/^\/labs\/([^/]+)\/session\/([^/]+)\/term$/);
  if (!m) {
    socket.destroy();
    return;
  }
  const sessionId = m[2];
  wss.handleUpgrade(req, socket, head, (ws) => {
    attachTerminal(ws, sessionId);
  });
});

await adoptOrphans();
startIdleGC();

server.listen(PORT, HOST, () => {
  console.log(`[pyforge-lab-server] listening on http://${HOST}:${PORT}`);
});
