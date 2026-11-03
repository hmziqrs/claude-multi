#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="${TTS_VENV:-$ROOT/recordings/.tts-venv}"
if [ ! -x "$VENV/bin/python" ]; then
  echo "TTS venv not found at $VENV. Set TTS_VENV or create recordings/.tts-venv." >&2
  exit 1
fi
exec "$VENV/bin/python" "$(dirname "$0")/tts_server.py" mps
