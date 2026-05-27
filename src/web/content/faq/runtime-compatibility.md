---
question: "Can I use claude-multi with bun, npm, pnpm, and Deno?"
description: "Yes — claude-multi supports Bun, Node.js (npm/pnpm/yarn), and Deno. The polyglot entry point auto-detects which runtime is available."
category: "Installation"
order: 10
---

Yes. claude-multi supports every major JavaScript runtime and package manager.

## Supported runtimes

| Runtime | Install command | Minimum version |
|---------|----------------|-----------------|
| **Bun** | `bun add -g claude-multi` | Bun 1.x |
| **Node.js** (npm) | `npm install -g claude-multi` | Node 18+ |
| **Node.js** (pnpm) | `pnpm add -g claude-multi` | Node 18+ |
| **Node.js** (yarn) | `yarn global add claude-multi` | Node 18+ |
| **Deno** | `deno install -g npm:claude-multi` | Deno 1.x |

## How runtime detection works

The `bin/claude-multi.js` entry point is a **polyglot file** — valid as both a shell script and a JavaScript module. When executed:

1. The shell portion runs first and checks for `bun`, then `node`, then `deno` in your PATH
2. It re-executes itself under the first available runtime
3. The JavaScript portion loads and runs the CLI

This means you never need to specify which runtime to use. Install with whichever package manager you prefer, and the entry point handles the rest.

## CI/CD environments

The project's CI tests against all three runtimes on Linux, macOS, and Windows. The `test-install` workflow specifically validates that `claude-multi` installs and runs correctly under bun, node, and deno on all platforms.

## Wrapper scripts

The generated wrapper scripts (`~/.local/bin/claude-<name>`) are shell scripts on Unix and batch files on Windows. They don't depend on any JavaScript runtime — they just set `CLAUDE_CONFIG_DIR` and `exec` the real `claude` binary.

## References

| Resource | Link |
|----------|------|
| **Getting started docs** | [/docs/getting-started/](/docs/getting-started/) — install instructions for all runtimes |
| **In-app: Path setup** | Run `claude-multi` — if the wrapper path isn't in your `$PATH`, the TUI shows a setup prompt |
| **GitHub: Entry point** | [bin/claude-multi.js](https://github.com/hmziqrs/claude-multi/blob/master/bin/claude-multi.js) — polyglot runtime detection |
| **GitHub: Runtime util** | [src/util/runtime.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/runtime.ts) — `detectPackageManager()` |
| **GitHub: CI workflow** | [.github/workflows/test-install.yml](https://github.com/hmziqrs/claude-multi/blob/master/.github/workflows/test-install.yml) — cross-platform install tests |
| **npm** | [claude-multi on npm](https://www.npmjs.com/package/claude-multi) |
