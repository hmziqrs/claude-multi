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

That writes a wrapper script into your PATH, which you then run like any other command. Where it lands depends on your package manager: `~/.bun/bin/`, `~/.local/bin/`, or somewhere similar.

## Before you start

You need Claude Code installed (`npm install -g @anthropic-ai/claude-code`), a supported runtime (Bun 1+, Node 18+, or Deno 1+), and an API key for at least one provider.

## Related questions

- [How do I create a new instance?](/faq/#create-instance): step-by-step after install
- [Which providers are supported?](/faq/#supported-providers): pick the right one

## More info

- [/docs/getting-started/](/docs/getting-started/): full setup walkthrough
- [/providers/](/providers/): pick a provider
- [bin/claude-multi.js](https://github.com/hmziqrs/claude-multi/blob/master/bin/claude-multi.js): the polyglot entry point
- [src/util/runtime.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/runtime.ts): package manager detection
- [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts): wrapper script generation
- [claude-multi on npm](https://www.npmjs.com/package/claude-multi)
