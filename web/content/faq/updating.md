---
question: "How do I update claude-multi and Claude Code?"
description: "Use claude-multi version to check for Claude Code updates and claude-multi update to upgrade it. For claude-multi itself, use your package manager."
category: "Maintenance"
order: 14
---

Two things update independently: the claude-multi tool and the Claude Code binary it wraps.

#### Updating Claude Code

Claude Code is the `@anthropic-ai/claude-code` package. Every `claude-<name>` instance launches the same binary, so you only update it once. Check the installed version against npm:

```sh
claude-multi version
```

It prints the installed Claude Code version and the latest version on npm, and flags an update when they differ. To apply it:

```sh
claude-multi update
```

That upgrades the shared `@anthropic-ai/claude-code` package. After it finishes, every instance picks up the new binary on its next launch. You do not need to recreate an instance.

#### Updating claude-multi itself

claude-multi is a separate npm package. Check your own version with `claude-multi --version`, then update it with the package manager you used to install it:

```sh
# bun
bun update -g claude-multi

# npm
npm update -g claude-multi

# pnpm
pnpm update -g claude-multi

# Deno
deno install --reload -g -A -n claude-multi npm:claude-multi
```

The Deno command reinstalls the package. With bun, npm, and pnpm, `update -g` pulls the latest published version.

#### What happens to instances during updates

Nothing destructive. Neither update command edits your instance directories. The config at `~/.claude-<name>/`, the `settings.json`, plugins, skills, and conversation history under `projects/` stay in place. An instance is a config directory plus a wrapper script, and the wrapper only sets `CLAUDE_CONFIG_DIR` before running `claude`. None of that depends on a specific version.

#### Migrations and backups

claude-multi has its own config schema version. When the registry uses an older schema, it migrates on load and copies `config.json` plus each instance's `settings.json` into `~/.claude-multi/backups/` first. It keeps the three most recent backups. `claude-multi doctor fix` applies any instance migrations that are still pending.

If an instance looks wrong after an update, press `!` in the TUI for the health screen. You can also check the newest folder under `~/.claude-multi/backups/` and copy `instances/<name>/settings.json` back by hand. The [troubleshooting guide](/docs/troubleshooting/) has the full recovery flow. The version and update logic is in [src/version.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/version.ts), and release history is on the [changelog](/changelog/).
