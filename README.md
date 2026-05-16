# PyForge ⚡

> **Forge your Python skills with PyForge.**

A hands-on Python learning platform — **75 lessons** and **42 graded labs**. Every
lab runs **server-side in a real Docker container** (zero in-browser Python), and
is **cheat-resistant**: an AST gate enforces *how* you solve it and hidden test
cases you never see enforce *that* it actually works.

---

## ✨ Features

- 📚 **75 lessons** — variables and slicing through network scripting and data manipulation
- ⚡ **42 graded labs** — write code, run it in a container, diff against expected, capture flags
- 🧪 **Multi-case testing** — code runs against multiple parameterised inputs; all must pass
- 🛡️ **Cheat-resistant** — per-lab AST requirements + server-only hidden cases. Hardcoding the
  output or branching on visible inputs won't unlock the flag
- 🐳 **Real containers** — real `socket.connect()`, `requests.get()`, file IO, and a real bash
  terminal via [xterm.js](https://xtermjs.org/), one disposable sandbox per session
- 🚩 **Flag-capture progression** — solve labs to unlock named flags; scoreboard in the Flags page
- 📊 **SRS practice deck** — SM-2 spaced repetition over Q/A cards
- 🎨 **Light / dark theme**, `⌘K` palette, keyboard-first nav, mobile responsive
- 💾 **Local-first** — progress in `localStorage`, no account

---

## 🚀 Quick start

Prerequisites: **Docker** running, **Node 18+**, **Python 3** (to serve the static frontend).

```bash
# 1. Build the lab + target images
cd lab-server
npm install
npm run build:images

# 2. Create the (internet-isolated) lab network + the practice target
docker network create --internal --subnet 192.168.58.0/24 pyforge-net 2>/dev/null || true
docker run -d --name pyforge-tgt-www --network pyforge-net --ip 192.168.58.101 pyforge-tgt-www:1

# 3. Start the lab-server
node server.js          # http://127.0.0.1:3030

# 4. In a second terminal, serve the frontend
cd ../app && python3 -m http.server 5174
```

Open <http://localhost:5174>. The frontend fetches the lab catalog from the
lab-server automatically. If the lab-server isn't running you'll see an
on-screen banner explaining how to start it.

Verify everything works:

```bash
cd lab-server
npm run audit       # 42/42 solutions pass; hardcode + visible-branch cheats blocked
npm run test:unit   # pure-helper unit tests
```

---

## 🗺️ Architecture

```
┌─ Browser ──────────────────────────────────────────────┐
│   React 18 (UMD) + Babel-in-browser                     │
│   • fetches lab catalog from lab-server (no Pyodide)    │
│   • xterm.js terminal • localStorage progress           │
└──────────────────────┬──────────────────────────────────┘
                       │ http + ws  (http://127.0.0.1:3030)
┌──────────────────────▼──────────────────────────────────┐
│   lab-server  (Node + Express + ws + dockerode)         │
│   /labs                 public catalog (no answers)     │
│   /labs/:id/session     start / stop a container        │
│   /labs/:id/verify      AST gate → run visible+hidden   │
│   /labs/:id/term        bash via docker exec over WS    │
│   • Server-authoritative registry  • per-session lock   │
│   • per-exec timeout    • idle GC + orphan adoption     │
└──────────────────────┬──────────────────────────────────┘
                       │ /var/run/docker.sock
┌──────────────────────▼──────────────────────────────────┐
│   pyforge-lab:1   user sandbox (python:3.12-slim)       │
│     --user lab --read-only --cap-drop=ALL               │
│     --memory=256m --pids-limit=128 no-new-privileges    │
│     baked-in AST gate at /usr/local/bin/pyforge-ast-check│
│   pyforge-tgt-www:1   deterministic HTTP practice target│
│     at 192.168.58.101 (real /echo, /status/<code>)      │
│   Network: pyforge-net (bridge, **internal** — no       │
│            internet egress from student code)           │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Layout

```
app/                     Frontend — plain HTML/JSX, no build step
├── components/          React components (LabPane, Sidebar, App, …)
├── lib/                 store, persistence, lab-server client, kb shortcuts
├── data/                course-data.js (75 lessons) + lab-helpers.js
└── styles.css           Single stylesheet

lab-server/              Node + Docker backend
├── server.js            Express + ws routes
├── lib/lab-registry.js  Single source of truth for all 42 labs
├── lib/verify.js        AST gate → visible + hidden case runner
├── lib/sessions.js      Container lifecycle, per-session lock, GC
├── lib/ast-check.py     AST validator (baked into the lab image)
├── images/lab.Dockerfile          sandbox image
├── images/targets/                practice target (app.py + fixtures)
├── test-audit.mjs       solution + hardcode/branch-cheat audit (npm run audit)
└── test-unit.mjs        unit tests (npm run test:unit)

_archive/                Superseded design-era prototypes & docs (history only)
```

---

## ⌨️ Keyboard shortcuts

| Key | Action |
|-----|--------|
| `⌘K` / `Ctrl+K` | Command palette |
| `⌘\` | Toggle lab pane |
| `⌘⇧↵` | Run current lab |
| `j` / `→` | Next lesson |
| `k` / `←` | Previous lesson |
| `m` | Mark lesson complete |
| `p` | Practice (SRS) deck |
| `g` | Progress view |
| `t` | Toggle theme |
| `?` | Shortcut list |
| `Esc` | Close modal / palette / drawer |

---

## 🧪 Lab format

Labs live server-side in [`lab-server/lib/lab-registry.js`](lab-server/lib/lab-registry.js).
The client only ever receives a stripped public copy — `hiddenCases` and the
`requires` rules never leave the server.

```js
"s1-3-2": {
  filename: "fizzbuzz.py",
  subsectionId: "s1-3-2",
  diff: "med",
  instructions: "Classify n: 'FizzBuzz' for multiples of 15, …",
  code: '#!/usr/bin/python\nn = 15\nif False:\n    print("FizzBuzz")\nelse:\n    print(n)\n',
  paramName: "n",                       // line substituted per test case
  cases: [                              // VISIBLE to the client
    { name: "Divisible by 15", input: 15, expected: "FizzBuzz" },
    { name: "Neither",         input: 7,  expected: "7" },
  ],
  hiddenCases: [                        // server-only — never sent to client
    { input: 30, expected: "FizzBuzz" },
    { input: 11, expected: "11" },
  ],
  requires: { stmts: ["If"], calls: ["print"] },   // AST gate
  flag: "PYTHON(Conditionals_mastered)",
  hint: "Test n % 15 first, then n % 3, then n % 5, else print(n)",
},
```

The verifier runs the AST gate first, then substitutes `paramName = …` per case
and runs every visible + hidden case. The flag unlocks only when **all** pass.
Server labs (e.g. `s2-3-1`) set `serverLab: true` — the runner backgrounds the
student's server and drives a netcat client against it.

Add a lab by appending to the registry and restarting `node server.js`.

---

## 🛠️ Tech stack

- **Frontend:** React 18 (UMD) + Babel standalone — no build step
- **Backend:** Node 18 + Express + ws + dockerode
- **Terminal:** xterm.js over WebSocket → `docker exec` stream (no node-pty)
- **Sandbox:** `--cap-drop=ALL`, `--read-only`, `no-new-privileges`, 256 MB RAM,
  128 PIDs, in-container exec timeout, **internal** bridge network (no egress)

---

## 📜 License

MIT — see [LICENSE](LICENSE).
