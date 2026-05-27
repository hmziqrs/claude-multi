---
question: "How do I install claude-multi?"
description: "Install with any JS runtime, bun, npm, pnpm, or Deno, then run claude-multi to launch the interactive TUI."
category: "Getting Started"
order: 2
---

Pick whichever package manager you already use:

```sh
# bun
bun add -g claude-multi

# npm
npm install -g claude-multi

# pnpm
pnpm add -g claude-multi

# Deno
deno install -g npm:claude-multi
```

Then launch the interactive TUI:

```sh
claude-multi
```

Or create an instance directly:

```sh
claude-multi add deepseek --provider deepseek --api-key sk-your-key
```

This generates a wrapper script in your PATH (the exact location depends on your package manager, could be `~/.bun/bin/`, `~/.local/bin/`, or similar) that you can run like any other command.

## Before you start

You'll need Claude Code installed (`npm install -g @anthropic-ai/claude-code`), a supported runtime (Bun 1+, Node 18+, or Deno 1+), and an API key for at least one provider.

## How the entry point works

The `bin/claude-multi.js` file is a polyglot, it works as both a shell script and a JavaScript module. When you run it, the shell portion checks for bun, then node, then deno, and re-executes itself under whichever one it finds. You never have to think about it.

## Related questions

- [How do I create a new instance?](/faq/create-instance/): step-by-step after install
- [Which providers are supported?](/faq/supported-providers/): pick the right one

## More info

- [/docs/getting-started/](/docs/getting-started/): full setup walkthrough
- [/docs/providers/](/docs/providers/): pick a provider
- [bin/claude-multi.js](https://github.com/hmziqrs/claude-multi/blob/master/bin/claude-multi.js): the polyglot entry point
- [src/util/runtime.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/runtime.ts): package manager detection
- [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts): wrapper script generation
- [claude-multi on npm](https://www.npmjs.com/package/claude-multi)
