// pty.js — Bridge a WebSocket to `docker exec -it <ctr> bash` via the dockerode stream.
// No node-pty needed — docker exec with Tty:true gives us a usable TTY.

import { getSession, touchSession } from "./sessions.js";

export async function attachTerminal(ws, sessionId) {
  const s = getSession(sessionId);
  if (!s) {
    ws.send(JSON.stringify({ type: "error", message: "Session not found" }));
    ws.close();
    return;
  }

  let exec;
  let stream;
  try {
    exec = await s.container.exec({
      Cmd: ["/bin/bash", "-l"],
      AttachStdin: true,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      User: "lab",
      WorkingDir: "/workdir",
      Env: ["TERM=xterm-256color", "PS1=\\u@pyforge:\\w$ "],
    });
    stream = await exec.start({ hijack: true, stdin: true, Tty: true });
  } catch (e) {
    ws.send(JSON.stringify({ type: "error", message: "Failed to start shell: " + e.message }));
    ws.close();
    return;
  }

  ws.send(JSON.stringify({ type: "ready" }));

  // Docker → WS: forward bytes as binary frames
  stream.on("data", (chunk) => {
    if (ws.readyState === ws.OPEN) ws.send(chunk);
    touchSession(sessionId);
  });

  stream.on("end", () => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: "exit" }));
      ws.close();
    }
  });

  // WS → Docker: text messages are control (resize/etc), binary are stdin
  ws.on("message", (data, isBinary) => {
    touchSession(sessionId);
    if (!isBinary) {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === "resize" && msg.cols && msg.rows) {
          exec.resize({ w: msg.cols, h: msg.rows }).catch(() => {});
          return;
        }
        if (msg.type === "stdin" && typeof msg.data === "string") {
          stream.write(msg.data);
          return;
        }
      } catch (_) {
        // Fall through — treat as raw stdin
        stream.write(data);
      }
    } else {
      stream.write(data);
    }
  });

  ws.on("close", () => {
    try { stream.end(); } catch (_) {}
  });
}
