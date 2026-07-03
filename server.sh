#!/usr/bin/env bash
#
# server.sh — management script for the local portfolio web server.
#
# Serves ./ over Python's built-in http.server on port 8080, matching the
# infrastructure spec (Cloudflare Tunnel forwards to localhost:8080).
#
# Usage:
#   ./server.sh start     # start the server in the background
#   ./server.sh stop      # stop the running server
#   ./server.sh restart   # stop + start
#   ./server.sh status    # show whether the server is running
#   ./server.sh logs      # tail the server log
#
set -euo pipefail

PORT=8080
BIND_ADDR="127.0.0.1"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$DIR/.server.pid"
LOG_FILE="$DIR/server.log"

# Prefer python3; fall back to python if that's the only one on PATH.
PYTHON_BIN="$(command -v python3 || command -v python || true)"

usage() {
  echo "Usage: $0 {start|stop|restart|status|logs}"
  exit 1
}

is_running() {
  [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null
}

start() {
  if [[ -z "$PYTHON_BIN" ]]; then
    echo "Error: no python3 or python interpreter found on PATH." >&2
    exit 1
  fi

  if is_running; then
    echo "Server already running (PID $(cat "$PID_FILE")) on http://${BIND_ADDR}:${PORT}"
    return 0
  fi

  echo "Starting server on http://${BIND_ADDR}:${PORT} ..."
  cd "$DIR"
  nohup "$PYTHON_BIN" -m http.server "$PORT" --bind "$BIND_ADDR" \
    >> "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"

  # Give it a moment, then confirm it actually bound the port.
  sleep 0.5
  if is_running; then
    echo "Server started (PID $(cat "$PID_FILE")). Logs: $LOG_FILE"
  else
    echo "Error: server failed to start. Check $LOG_FILE for details." >&2
    rm -f "$PID_FILE"
    exit 1
  fi
}

stop() {
  if ! is_running; then
    echo "Server is not running."
    rm -f "$PID_FILE"
    return 0
  fi

  local pid
  pid="$(cat "$PID_FILE")"
  echo "Stopping server (PID $pid) ..."
  kill "$pid" 2>/dev/null || true

  # Wait up to 5s for a graceful exit, then force-kill if needed.
  for _ in {1..10}; do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.5
  done
  kill -0 "$pid" 2>/dev/null && kill -9 "$pid" 2>/dev/null || true

  rm -f "$PID_FILE"
  echo "Server stopped."
}

status() {
  if is_running; then
    echo "Server is RUNNING (PID $(cat "$PID_FILE")) on http://${BIND_ADDR}:${PORT}"
  else
    echo "Server is STOPPED."
  fi
}

logs() {
  touch "$LOG_FILE"
  tail -f "$LOG_FILE"
}

case "${1:-}" in
  start)   start ;;
  stop)    stop ;;
  restart) stop; start ;;
  status)  status ;;
  logs)    logs ;;
  *)       usage ;;
esac
