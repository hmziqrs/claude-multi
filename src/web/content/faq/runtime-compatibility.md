---
question: "Can I use claude-multi with bun, npm, pnpm, and Deno?"
description: "Yes — claude-multi supports Bun, Node.js (npm/pnpm/yarn), and Deno. The polyglot entry point auto-detects which runtime is available."
category: "Installation"
order: 10
---

Yes. It works with every major JavaScript runtime and package manager.

## The full list

| Runtime | Install command | Minimum version |
|---------|----------------|-----------------|
| Bun | `bun add -g claude-multi` | Bun 1.x |
| Node.js (npm) | `npm install -g claude-multi` | Node 18+ |
| Node.js (pnpm) | `pnpm add -g claude-multi` | Node 18+ |
| Node.js (yarn) | `yarn global add claude-multi` | Node 18+ |
| Deno | `deno install -g npm:claude-multi` | Deno 1.x |

## How runtime detection works

The entry point (`bin/claude-multi.js`) is a polyglot file — valid as both a shell script and a JavaScript module. When you run it, the shell portion checks for bun, then node, then deno in your PATH, and re-executes itself under the first one it finds. You don't configure anything.

## In CI/CD

The project tests against all three runtimes on Linux, macOS, and Windows. The `test-install` workflow validates that installation and basic execution work on each platform.

## About the wrapper scripts

The generated wrappers (`~/.local/bin/claude-<name>` or similar, depending on your package manager) are plain shell scripts on Unix and batch files on Windows. They just set `CLAUDE_CONFIG_DIR` and exec the `claude` binary — no JavaScript runtime needed at that point.

## More info

- [/docs/getting-started/](/docs/getting-started/) — install instructions for all runtimes
- Run `claude-multi` — if the wrapper path isn't in your `$PATH`, the TUI will tell you
- [bin/claude-multi.js](https://github.com/hmziqrs/claude-multi/blob/master/bin/claude-multi.js) — the polyglot entry point
- [src/util/runtime.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/runtime.ts) — `detectPackageManager()`
- [.github/workflows/test-install.yml](https://github.com/hmziqrs/claude-multi/blob/master/.github/workflows/test-install.yml) — cross-platform install tests
- [claude-multi on npm](https://www.npmjs.com/package/claude-multi)
