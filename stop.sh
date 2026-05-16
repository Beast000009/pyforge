#!/usr/bin/env bash
# stop.sh — stop all PyForge background processes
set -euo pipefail

GRN='\033[0;32m'; RST='\033[0m'
ok() { echo -e "${GRN}✓${RST} $*"; }

for pid_file in /tmp/pyforge-lab-server.pid /tmp/pyforge-frontend.pid; do
  if [ -f "$pid_file" ]; then
    pid=$(cat "$pid_file")
    kill "$pid" 2>/dev/null && ok "Killed PID $pid ($(basename $pid_file .pid))" || true
    rm -f "$pid_file"
  fi
done

# Also kill any pyforge-lab-* containers that are still running
running=$(docker ps --filter "label=pyforge.session.id" -q 2>/dev/null || true)
if [ -n "$running" ]; then
  echo "$running" | xargs docker rm -f >/dev/null 2>&1 && ok "Cleaned up lab containers"
fi

ok "PyForge stopped"
