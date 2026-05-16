#!/usr/bin/env bash
# start.sh — PyForge one-command launcher (fresh-clone safe)
# Usage: bash start.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAB_DIR="$ROOT/lab-server"
APP_DIR="$ROOT/app"

RED='\033[0;31m'; GRN='\033[0;32m'; YLW='\033[1;33m'; CYN='\033[0;36m'; RST='\033[0m'
ok()   { echo -e "${GRN}✓${RST} $*"; }
info() { echo -e "${CYN}▸${RST} $*"; }
warn() { echo -e "${YLW}⚠${RST} $*"; }
die()  { echo -e "${RED}✗ ERROR:${RST} $*" >&2; exit 1; }

# ── Preflight checks ────────────────────────────────────────────
info "Checking prerequisites…"

command -v node  >/dev/null 2>&1 || die "Node.js not found. Install Node 18+: https://nodejs.org"
command -v docker>/dev/null 2>&1 || die "Docker not found. Install Docker: https://docs.docker.com/get-docker/"
docker info >/dev/null 2>&1       || die "Docker daemon is not running. Start it with: sudo systemctl start docker"
ok "Node $(node --version), Docker $(docker --version | head -c 30)…"

# ── npm install (idempotent) ────────────────────────────────────
if [ ! -d "$LAB_DIR/node_modules" ]; then
  info "Running npm install in lab-server/…"
  (cd "$LAB_DIR" && npm install --silent)
  ok "Dependencies installed"
else
  ok "node_modules present — skipping npm install"
fi

# ── Build Docker images if missing ─────────────────────────────
build_needed=false
if ! docker image inspect pyforge-lab:1 >/dev/null 2>&1; then
  warn "pyforge-lab:1 image not found — will build it"
  build_needed=true
fi
if ! docker image inspect pyforge-tgt-www:1 >/dev/null 2>&1; then
  warn "pyforge-tgt-www:1 image not found — will build it"
  build_needed=true
fi

if $build_needed; then
  info "Building Docker images (this takes ~1-2 min on first run)…"
  docker build -q -t pyforge-lab:1     -f "$LAB_DIR/images/lab.Dockerfile"          "$LAB_DIR/images/"
  docker build -q -t pyforge-tgt-www:1 -f "$LAB_DIR/images/targets/www.Dockerfile"  "$LAB_DIR/images/targets/"
  ok "Docker images built"
else
  ok "Docker images already present"
fi

# ── pyforge-net network ─────────────────────────────────────────
if ! docker network inspect pyforge-net >/dev/null 2>&1; then
  info "Creating pyforge-net network…"
  docker network create --internal --subnet 192.168.58.0/24 pyforge-net >/dev/null
  ok "pyforge-net created"
else
  ok "pyforge-net already exists"
fi

# ── Target container ────────────────────────────────────────────
if ! docker ps --filter "name=pyforge-tgt-www" --filter "status=running" --format "{{.Names}}" | grep -q pyforge-tgt-www; then
  # Remove a stopped/dead container of the same name if it exists
  docker rm -f pyforge-tgt-www >/dev/null 2>&1 || true
  info "Starting target container (pyforge-tgt-www)…"
  docker run -d --name pyforge-tgt-www \
    --network pyforge-net --ip 192.168.58.101 \
    --restart unless-stopped \
    pyforge-tgt-www:1 >/dev/null
  ok "Target container started at 192.168.58.101"
else
  ok "Target container already running"
fi

# ── Kill any stale lab-server on :3030 ──────────────────────────
if lsof -ti :3030 >/dev/null 2>&1; then
  warn "Port 3030 already in use — killing old process"
  lsof -ti :3030 | xargs kill -9 2>/dev/null || true
  sleep 0.5
fi

# ── Kill any stale static server on :5174 ───────────────────────
if lsof -ti :5174 >/dev/null 2>&1; then
  warn "Port 5174 already in use — killing old process"
  lsof -ti :5174 | xargs kill -9 2>/dev/null || true
  sleep 0.5
fi

# ── Start lab-server in background ──────────────────────────────
info "Starting lab-server on http://127.0.0.1:3030 …"
(cd "$LAB_DIR" && node server.js >> /tmp/pyforge-lab-server.log 2>&1) &
LAB_PID=$!
echo $LAB_PID > /tmp/pyforge-lab-server.pid

# Wait for it to be ready
for i in $(seq 1 20); do
  sleep 0.3
  if curl -sf http://127.0.0.1:3030/health >/dev/null 2>&1; then
    ok "Lab-server ready (PID $LAB_PID)"
    break
  fi
  if [ $i -eq 20 ]; then
    die "Lab-server did not start. Check /tmp/pyforge-lab-server.log"
  fi
done

# ── Serve frontend ───────────────────────────────────────────────
PORT=5174
info "Serving frontend on http://127.0.0.1:$PORT …"
(cd "$APP_DIR" && python3 -m http.server $PORT --bind 127.0.0.1 >> /tmp/pyforge-frontend.log 2>&1) &
FRONTEND_PID=$!
echo $FRONTEND_PID > /tmp/pyforge-frontend.pid
sleep 0.5
ok "Frontend ready (PID $FRONTEND_PID)"

echo ""
echo -e "${GRN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
echo -e "${GRN}  PyForge is running!${RST}"
echo -e "${GRN}  Open: http://127.0.0.1:$PORT${RST}"
echo -e "${GRN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RST}"
echo ""
echo "  Lab-server log : /tmp/pyforge-lab-server.log"
echo "  Frontend log   : /tmp/pyforge-frontend.log"
echo ""
echo "  Stop with: bash stop.sh  (or kill PIDs $LAB_PID $FRONTEND_PID)"
echo ""

# Open browser if available
if command -v xdg-open >/dev/null 2>&1; then
  sleep 1 && xdg-open "http://127.0.0.1:$PORT" &
elif command -v open >/dev/null 2>&1; then
  sleep 1 && open "http://127.0.0.1:$PORT" &
fi

wait
