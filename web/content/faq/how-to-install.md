---
question: "How do I install claude-multi?"
description: "Install with bun, npm, pnpm, or Deno, then run claude-multi to launch the interactive TUI."
category: "Getting Started"
order: 2
---

Pick the package manager you use:

```sh
# bun
bun add -g claude-multi

# npm
npm install -g claude-multi

# pnpm
pnpm add -g claude-multi

# Deno
deno install -g -A -n claude-multi npm:claude-multi
```

Then run `claude-multi` to open the TUI, or create an instance directly:

```sh
claude-multi add deepseek --provider deepseek --api-key sk-your-key
```

`--api-key` is required whenever you pass `--provider`. Without it, the CLI exits with an error.

The CLI writes a wrapper script for each instance. On macOS and Linux the default is `~/.local/bin/claude-<name>`. On Windows it goes to your package manager's global bin directory, such as `%APPDATA%\npm` for npm. Pass `--binary <path>` if you want a different path.

#### Before you start

You need Claude Code installed (`npm install -g @anthropic-ai/claude-code`), a runtime (Bun 1+, Node.js 18+, or Deno 1+), and an API key for at least one provider.

The [getting started guide](/docs/getting-started/) walks through the first instance. The [providers page](/providers/) lists endpoints and model mappings. Wrapper generation lives in [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts).
