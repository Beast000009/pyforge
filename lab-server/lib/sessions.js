// sessions.js — Docker container lifecycle for lab sessions

import Docker from "dockerode";
import { randomUUID } from "node:crypto";

const docker = new Docker();
const LAB_IMAGE = "pyforge-lab:1";
const NETWORK = "pyforge-net";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_SESSIONS = 4;

/** @type {Map<string, { id: string, labId: string, container: any, createdAt: number, lastActivityAt: number }>} */
const sessions = new Map();

export function listSessions() {
  return [...sessions.values()].map((s) => ({
    id: s.id,
    labId: s.labId,
    createdAt: s.createdAt,
    lastActivityAt: s.lastActivityAt,
    ageMs: Date.now() - s.createdAt,
  }));
}

export function touchSession(sessionId) {
  const s = sessions.get(sessionId);
  if (s) s.lastActivityAt = Date.now();
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

// Per-session serialization. A verify run is a writeFile + N execs in ONE
// container; two overlapping runs (double-click, two tabs) would interleave
// and corrupt results. Chain work per session so it runs strictly in order.
const sessionLocks = new Map();

export function withSessionLock(sessionId, fn) {
  const prev = sessionLocks.get(sessionId) || Promise.resolve();
  const next = prev.then(fn, fn);
  // Keep the chain alive but don't leak rejections into the next waiter.
  sessionLocks.set(sessionId, next.then(() => {}, () => {}));
  return next;
}

function forgetSession(sessionId) {
  sessions.delete(sessionId);
  sessionLocks.delete(sessionId);
}

async function ensureNetwork() {
  try {
    const nets = await docker.listNetworks({ filters: { name: [NETWORK] } });
    if (!nets.length) {
      // Internal: lab containers can reach the practice target on this bridge
      // but have NO route to the internet. Student code is untrusted — it must
      // not be able to call out. (Recreate the network if it pre-exists as
      // non-internal: `docker network rm pyforge-net` then restart.)
      await docker.createNetwork({
        Name: NETWORK,
        Driver: "bridge",
        Internal: true,
        IPAM: { Config: [{ Subnet: "192.168.58.0/24" }] },
      });
    }
  } catch (e) {
    console.warn("[sessions] ensureNetwork:", e.message);
  }
}

export async function startSession(labId) {
  if (sessions.size >= MAX_SESSIONS) {
    throw new Error(`Max concurrent sessions reached (${MAX_SESSIONS})`);
  }
  await ensureNetwork();

  const id = randomUUID();
  const containerName = `pyforge-lab-${id.slice(0, 8)}`;

  const container = await docker.createContainer({
    Image: LAB_IMAGE,
    name: containerName,
    Cmd: ["sleep", "infinity"], // keep alive; we exec into it
    Tty: false,
    OpenStdin: false,
    Labels: { "pyforge.lab.id": labId, "pyforge.session.id": id },
    HostConfig: {
      AutoRemove: true,
      Memory: 256 * 1024 * 1024, // 256MB
      MemorySwap: 256 * 1024 * 1024, // disallow swap growth
      NanoCpus: 500_000_000,     // 0.5 CPU
      PidsLimit: 128,
      NetworkMode: NETWORK,
      // Read-only root fs forces all writes into the tmpfs mounts below
      ReadonlyRootfs: true,
      Tmpfs: {
        "/workdir": "rw,size=32m,uid=1000,gid=1000",
        "/tmp":     "rw,size=16m,uid=1000,gid=1000",
        "/home/lab/.cache": "rw,size=16m,uid=1000,gid=1000",
      },
      // No new privileges — block setuid/setgid escalation
      SecurityOpt: ["no-new-privileges:true"],
      // Drop all capabilities; container is a sandboxed shell
      CapDrop: ["ALL"],
    },
    WorkingDir: "/workdir",
    User: "lab",
  });

  await container.start();

  // Wait until the container is actually running (avoid race on first exec)
  const deadline = Date.now() + 3000;
  while (Date.now() < deadline) {
    const info = await container.inspect();
    if (info.State && info.State.Running) break;
    await new Promise((r) => setTimeout(r, 50));
  }

  const session = {
    id,
    labId,
    container,
    createdAt: Date.now(),
    lastActivityAt: Date.now(),
  };
  sessions.set(id, session);
  console.log(`[sessions] started ${id.slice(0, 8)} for lab ${labId}`);
  return session;
}

export async function stopSession(sessionId) {
  const s = sessions.get(sessionId);
  if (!s) return false;
  try {
    await s.container.stop({ t: 1 });
  } catch (_) {
    /* may already be stopped */
  }
  forgetSession(sessionId);
  console.log(`[sessions] stopped ${sessionId.slice(0, 8)}`);
  return true;
}

/** Idle GC + container reconciliation: kill idle, prune sessions whose container is gone. */
export function startIdleGC() {
  setInterval(async () => {
    const now = Date.now();
    for (const s of [...sessions.values()]) {
      // Reconcile: if the container is dead/gone, drop from map
      let alive = false;
      try {
        const info = await s.container.inspect();
        alive = info.State && (info.State.Running || info.State.Restarting);
      } catch (_) {
        alive = false;
      }
      if (!alive) {
        console.log(`[sessions] reconcile: ${s.id.slice(0, 8)} container gone — pruning`);
        forgetSession(s.id);
        continue;
      }
      if (now - s.lastActivityAt > IDLE_TIMEOUT_MS) {
        console.log(`[sessions] idle GC killing ${s.id.slice(0, 8)}`);
        await stopSession(s.id);
      }
    }
  }, 30_000);
}

/** On startup, adopt any pyforge-lab containers from a previous server run. */
export async function adoptOrphans() {
  try {
    const containers = await docker.listContainers({
      all: true,
      filters: { label: ["pyforge.session.id"] },
    });
    for (const c of containers) {
      if (c.State !== "running") {
        // Container died — remove the stale container so AutoRemove or this server can clean up.
        try { await docker.getContainer(c.Id).remove({ force: true }); } catch (_) {}
        continue;
      }
      const sid = c.Labels["pyforge.session.id"];
      const labId = c.Labels["pyforge.lab.id"] || "adopted";
      if (sessions.has(sid)) continue;
      sessions.set(sid, {
        id: sid,
        labId,
        container: docker.getContainer(c.Id),
        createdAt: c.Created * 1000,
        lastActivityAt: Date.now(),
      });
      console.log(`[sessions] adopted orphan ${sid.slice(0, 8)} (lab ${labId})`);
    }
  } catch (e) {
    console.warn("[sessions] adoptOrphans:", e.message);
  }
}

// Hard ceiling for any single exec. The real per-process kill is done by the
// in-container `timeout` wrapper (see verify.js); this is a Node-side safety
// net in case the docker stream itself wedges (e.g. a process that blocks on
// a socket and never writes EOF). Untrusted student code must never be able
// to hang a worker indefinitely.
const EXEC_SAFETY_TIMEOUT_MS = 30_000;

/** Exec a command inside the session container, capturing stdout+stderr. */
export async function execInSession(sessionId, cmd, options = {}) {
  const s = sessions.get(sessionId);
  if (!s) throw new Error("Session not found");

  const exec = await s.container.exec({
    Cmd: cmd,
    AttachStdout: true,
    AttachStderr: true,
    User: options.user || "lab",
    WorkingDir: options.workingDir || "/workdir",
  });
  const stream = await exec.start({ hijack: true, stdin: false });

  return new Promise((resolve, reject) => {
    const stdoutBuf = [];
    const stderrBuf = [];
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      touchSession(sessionId);
      resolve(result);
    };

    // Demux multiplexed stream
    s.container.modem.demuxStream(
      stream,
      { write: (chunk) => stdoutBuf.push(chunk) },
      { write: (chunk) => stderrBuf.push(chunk) }
    );

    const timer = setTimeout(() => {
      try { stream.destroy(); } catch (_) {}
      finish({
        exitCode: 124,
        stdout: Buffer.concat(stdoutBuf).toString("utf8"),
        stderr: (Buffer.concat(stderrBuf).toString("utf8") +
          "\n[pyforge] execution exceeded the time limit and was terminated.").trim(),
        timedOut: true,
      });
    }, options.timeoutMs || EXEC_SAFETY_TIMEOUT_MS);

    stream.on("end", async () => {
      const stdout = Buffer.concat(stdoutBuf).toString("utf8");
      const stderr = Buffer.concat(stderrBuf).toString("utf8");
      let exitCode = null;
      try {
        const info = await exec.inspect();
        exitCode = info.ExitCode;
      } catch (_) {
        /* exec already gone */
      }
      finish({ exitCode, stdout, stderr });
    });
    stream.on("error", (e) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(e);
    });
  });
}

export { docker };
