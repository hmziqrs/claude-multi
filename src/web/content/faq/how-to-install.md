---
question: "How do I install claude-multi?"
description: "Install with any JS runtime — bun, npm, pnpm, or Deno — then run claude-multi to launch the interactive TUI."
category: "Getting Started"
order: 2
---

claude-multi supports four JavaScript runtimes. Pick the one you already use:

### bun

```sh
bun add -g claude-multi
```

### npm

```sh
npm install -g claude-multi
```

### pnpm

```sh
pnpm add -g claude-multi
```

### Deno

```sh
deno install -g npm:claude-multi
```

## After install

Run the interactive TUI to create your first instance:

```sh
claude-multi
```

Or create one directly from the command line:

```sh
claude-multi add deepseek --provider deepseek --api-key sk-your-key
```

This creates a wrapper at `~/.local/bin/claude-deepseek` that you can run like any other command.

## Prerequisites

- **Claude Code** must be installed (`npm install -g @anthropic-ai/claude-code`)
- A supported runtime: Bun 1.x+, Node.js 18+, or Deno 1.x+
- An API key for at least one provider

## How the polyglot entry point works

The `bin/claude-multi.js` entry point is a polyglot file that works as both shell script and JavaScript. It detects which runtime is available (bun > node > deno) and delegates to it automatically. You don't need to configure anything.

## References

| Resource | Link |
|----------|------|
| **Getting started docs** | [/docs/getting-started/](/docs/getting-started/) — full setup guide |
| **Providers docs** | [/docs/providers/](/docs/providers/) — pick the right provider for your use case |
| **GitHub: Entry point** | [bin/claude-multi.js](https://github.com/hmziqrs/claude-multi/blob/master/bin/claude-multi.js) — polyglot runtime detection |
| **GitHub: Runtime util** | [src/util/runtime.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/runtime.ts) — package manager detection |
| **GitHub: Wrapper** | [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts) — shell/batch wrapper generation |
| **npm** | [claude-multi on npm](https://www.npmjs.com/package/claude-multi) |
