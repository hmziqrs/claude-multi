#!/bin/bash
set -e
VENV="/Users/hmziq/os/claude-multi/recordings/.tts-venv"
exec "$VENV/bin/python" "$(dirname "$0")/tts_server.py" mps
