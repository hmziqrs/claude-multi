#!/usr/bin/env bash
# Rebuilds _ds_bundle.js from components/*.js with a deferred-start wrapper so
# component registration only runs once window.React is present.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$DIR/_ds_bundle.js"

tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

{
  printf '%s\n' '/* Claude Multi design system — assembled from components/*.js via assemble.sh. Do not edit by hand. */'
  cat <<'EOF'
(function () {
  'use strict';
  function start() {
EOF
  # icons.js first, then every other .js file alphabetically (excluding icons.js).
  {
    printf '%s\n' "$DIR/components/icons.js"
    find "$DIR/components" -maxdepth 1 -name '*.js' ! -name 'icons.js' | sort
  } | while IFS= read -r f; do
    printf '\n/* ---- %s ---- */\n' "$(basename "$f")"
    cat "$f"
    printf '\n'
  done
  cat <<'EOF'
  }
  if (window.React) { start(); }
  else {
    var iv = setInterval(function () { if (window.React) { clearInterval(iv); start(); } }, 25);
    setTimeout(function () { clearInterval(iv); }, 30000);
  }
})();
EOF
} > "$tmp"

mv "$tmp" "$OUT"
chmod +x "$DIR/assemble.sh"
echo "Assembled $OUT ($(wc -c < "$OUT") bytes)"
