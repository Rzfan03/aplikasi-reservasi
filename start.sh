#!/usr/bin/env bash
# Start server (API :4000) + form (UI :5173) + admin dashboard (:5174) at once.
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

echo "Starting Form (public UI) on :5173..."
(cd "$ROOT" && npm run dev) &
FORM_PID=$!

echo "Starting Dashboard (admin UI) on :5174..."
(cd "$ROOT/admin" && npm run dev -- --port 5174) &
ADMIN_PID=$!

cleanup() {
  echo
  echo "Stopping..."
  kill "$SERVER_PID" "$FORM_PID" "$ADMIN_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait