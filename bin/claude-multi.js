#!/usr/bin/env sh
SCRIPT="$0"
while [ -L "$SCRIPT" ]; do
  LINK=$(readlink "$SCRIPT")
  case "$LINK" in
    /*) SCRIPT="$LINK" ;;
    *)  SCRIPT="$(dirname "$SCRIPT")/$LINK" ;;
  esac
done
DIR=$(cd "$(dirname "$SCRIPT")" && pwd)
CLI="$DIR/../build/cli.js"

if command -v bun >/dev/null 2>&1; then
  exec bun "$CLI" "$@"
elif command -v node >/dev/null 2>&1; then
  exec node "$CLI" "$@"
else
  echo "claude-multi: no JavaScript runtime found (install bun or node 22+)" >&2
  exit 1
fi
