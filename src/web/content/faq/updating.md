---
question: "How do I update claude-multi and Claude Code?"
description: "Use claude-multi version to check for updates and claude-multi update to upgrade Claude Code. For claude-multi itself, use your package manager."
category: "Maintenance"
order: 14
---

Two separate things need updating: the claude-multi tool itself, and the Claude Code binary it wraps.

## Updating Claude Code

Check what you're running vs. what's latest:

```sh
claude-multi version
```

This shows your installed version, the latest published version, and whether an update is available. To upgrade:

```sh
claude-multi update
```

This updates the `@anthropic-ai/claude-code` package that all your instances share.

## Updating claude-multi

Use the same package manager you installed with:

```sh
# bun
bun update -g claude-multi

# npm
npm update -g claude-multi

# pnpm
pnpm update -g claude-multi

# Deno
deno install -g npm:claude-multi
```

## What happens to instances during updates

Nothing. Updating Claude Code doesn't touch your instance directories — they keep their settings, plugins, and conversation history. Since instances are just config directories + wrapper scripts, updates to either tool are non-destructive.

## More info

- [src/version.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/version.ts) — `checkForUpdates()` and `updateClaudeCode()` implementation
- [/changelog/](/changelog/) — release history
- [claude-multi on npm](https://www.npmjs.com/package/claude-multi) — check the latest published version
