#!/usr/bin/env bash
# Start server (API) + admin (UI) at once.
set -e
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Free busy ports from a previous run.
for port in 4000 5173 5174; do
  fuser -k "$port/tcp" 2>/dev/null || true
done
sleep 1

echo "Starting API (server) on :4000..."
(cd "$ROOT/server" && npm run dev) &
SERVER_PID=$!

echo "Starting Admin (UI) on :5174..."
(cd "$ROOT/admin" && npm run dev) &
ADMIN_PID=$!

cleanup() {
  echo
  echo "Stopping..."
  kill "$SERVER_PID" "$ADMIN_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait