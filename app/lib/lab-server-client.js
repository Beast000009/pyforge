// lab-server-client.js — talks to the local Docker lab-server on :3030
// All methods return Promises.

(function () {
  const DEFAULT_BASE = "http://127.0.0.1:3030";
  let baseUrl = window.localStorage.getItem("pyforge-lab-server-url") || DEFAULT_BASE;

  function setBaseUrl(url) {
    baseUrl = url;
    window.localStorage.setItem("pyforge-lab-server-url", url);
  }

  async function health() {
    const r = await fetch(`${baseUrl}/health`);
    if (!r.ok) throw new Error("health check failed");
    return r.json();
  }

  async function startSession(labId) {
    const r = await fetch(`${baseUrl}/labs/${encodeURIComponent(labId)}/session`, { method: "POST" });
    if (!r.ok) {
      const body = await r.text().catch(() => "");
      const err = new Error("start session failed: " + body);
      if (r.status === 429) { err.busy = true; err.message = "All practice slots are busy."; }
      throw err;
    }
    return r.json();
  }

  async function stopSession(labId, sessionId) {
    await fetch(`${baseUrl}/labs/${encodeURIComponent(labId)}/session/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    });
  }

  async function writeFile(labId, sessionId, name, content) {
    const r = await fetch(
      `${baseUrl}/labs/${encodeURIComponent(labId)}/session/${encodeURIComponent(sessionId)}/files/${encodeURIComponent(name)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) }
    );
    if (!r.ok) throw new Error("write file failed");
    return r.json();
  }

  // Server is authoritative — only the source is sent. The lab spec lives on the server.
  async function verify(labId, sessionId, source) {
    const r = await fetch(
      `${baseUrl}/labs/${encodeURIComponent(labId)}/session/${encodeURIComponent(sessionId)}/verify`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source }) }
    );
    if (!r.ok) throw new Error("verify failed: HTTP " + r.status);
    const body = await r.json();
    return body; // { results: [...], gateError? }
  }

  function wsTerminalUrl(labId, sessionId) {
    const wsBase = baseUrl.replace(/^http/, "ws");
    return `${wsBase}/labs/${encodeURIComponent(labId)}/session/${encodeURIComponent(sessionId)}/term`;
  }

  // Track active sessions so we can beacon-DELETE them on tab close.
  // Map<sessionId, labId>
  const liveSessions = new Map();
  function registerSession(labId, sessionId) { liveSessions.set(sessionId, labId); }
  function unregisterSession(sessionId)      { liveSessions.delete(sessionId); }

  // sendBeacon supports DELETE only via fetch keepalive — use POST to a /cleanup route
  // OR use fetch with `keepalive: true` which Chrome/Firefox honor for DELETE during unload.
  function flushOnUnload() {
    for (const [sessionId, labId] of liveSessions) {
      const url = `${baseUrl}/labs/${encodeURIComponent(labId)}/session/${encodeURIComponent(sessionId)}`;
      try {
        fetch(url, { method: "DELETE", keepalive: true });
      } catch (_) {}
    }
    liveSessions.clear();
  }
  window.addEventListener("pagehide", flushOnUnload);
  window.addEventListener("beforeunload", flushOnUnload);

  window.LabServerClient = {
    setBaseUrl,
    get baseUrl() { return baseUrl; },
    health,
    startSession,
    stopSession,
    writeFile,
    verify,
    wsTerminalUrl,
    registerSession,
    unregisterSession,
  };
})();
