#!/bin/sh
":" //; S="$0"; while [ -L "$S" ]; do L=$(readlink "$S"); case "$L" in /*) S="$L";; *) S="$(dirname "$S")/$L";; esac; done; D=$(cd "$(dirname "$S")" && pwd); C="$D/../dist/cli.js"; command -v bun >/dev/null 2>&1 && exec bun "$C" "$@"; command -v node >/dev/null 2>&1 && exec node "$C" "$@"; command -v deno >/dev/null 2>&1 && exec deno run -A "$C" "$@"; echo "claude-multi: no JavaScript runtime found (install bun, node, or deno)" >&2; exit 1
await import(new URL('../dist/cli.js', import.meta.url).href);
