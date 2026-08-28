---
question: "How do I update claude-multi and Claude Code?"
description: "Use claude-multi version to check for updates and claude-multi update to upgrade Claude Code. For claude-multi itself, use your package manager."
category: "Maintenance"
order: 14
---

Two things update independently: the claude-multi tool, and the Claude Code binary it wraps. Mixing them up is the usual reason people say "I updated but nothing changed".

## Updating Claude Code

Claude Code is the `@anthropic-ai/claude-code` package. Every `claude-<name>` instance launches the same shared binary, so you only update it once. Check what you have versus what's published:

```sh
claude-multi version
```

This prints three things: the version of claude-multi you are running, the installed version of Claude Code, and the latest Claude Code available on npm, with a flag if an update is pending. To apply it:

```sh
claude-multi update
```

That runs the upgrade for the shared `@anthropic-ai/claude-code` package. After it finishes, every instance picks up the new binary on its next launch. You do not need to recreate or touch any instance.

## Updating claude-multi itself

claude-multi is a separate npm package. Update it with whatever you installed it with:

```sh
# bun
bun update -g claude-multi

# npm
npm update -g claude-multi

# pnpm
pnpm update -g claude-multi

# Deno
deno install -g -A -n claude-multi npm:claude-multi
```

Deno's `install` command reinstalls, which is how you get the new version under Deno. With bun, npm, and pnpm, the `update -g` flag pulls the latest.

## What happens to instances during updates

Nothing destructive. Neither update touches your instance directories. The config at `~/.claude-multi/<name>/`, the `settings.json`, the plugins, the skills, and the conversation history under `projects/` all stay where they were. An instance is a config directory plus a wrapper script, and the wrapper only sets `CLAUDE_CONFIG_DIR` before exec'ing `claude`. None of that depends on a specific version.

## After a major Claude Code release

Occasionally Claude Code ships a breaking change to its config schema. claude-multi detects that on launch and runs a migration, writing a `.bak` file first. If an instance looks wrong after an update, open the TUI and press `!` for the health screen, or look for `.bak` files in `~/.claude-multi/<name>/` and restore one by hand. The troubleshooting FAQ has the full recovery flow.

## More info

- [src/version.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/version.ts): `checkForUpdates()` and `updateClaudeCode()` implementation
- [/changelog/](/changelog/): release history
- [claude-multi on npm](https://www.npmjs.com/package/claude-multi): check the latest published version
