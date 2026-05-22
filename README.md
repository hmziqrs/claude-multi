<div align="center">

<img src="public/favicon-animated.svg" width="256" height="256" alt="claude-multi logo">

# claude-multi

</div>

Run multiple Claude Code instances side by side — each with its own provider, config, and `claude-<name>` command.

Switching providers (Anthropic, GLM, MiniMax, DeepSeek) normally means editing `settings.json` by hand. This tool gives each one its own isolated install instead.

## Install

```bash
bun add -g claude-multi
```

```bash
npm install -g claude-multi
```

```bash
pnpm add -g claude-multi
```

```bash
deno install -g -A -n claude-multi npm:claude-multi
```

Requires Node 18+ (or Bun 1+) and `@anthropic-ai/claude-code` installed globally.

## Usage

Just run it — the interactive TUI opens by default:

```bash
claude-multi
```

You get a full terminal UI to add instances, manage plugins, configure MCP servers, and more. No subcommand needed.

**Adding an instance** — pick it from the menu, or run directly:

```bash
claude-multi add glm
```

No flags = the guided wizard walks you through provider, API key, and copy options. Then use your new instance:

```bash
claude-glm
```

## CLI (non-interactive)

For scripting and automation, all operations are available as flags:

```bash
# Instances
claude-multi add <name> --provider glm --api-key "sk-..."
claude-multi add <name> --config ~/path        # custom config dir
claude-multi add <name> --copy-settings        # seed from ~/.claude
claude-multi add <name> --copy-all             # copy everything + auto-sync
claude-multi add <name> --skip-prompts         # start fresh, no wizard
claude-multi add <name> --manual               # copy files instead of symlinking
claude-multi list
claude-multi info <name>
claude-multi remove <name> [--force]

# Plugins & MCP
claude-multi plugins list
claude-multi plugins enable <name> <plugin-id>
claude-multi plugins disable <name> <plugin-id>
claude-multi plugins copy <name>               # copy from default ~/.claude
claude-multi mcp list
claude-multi mcp copy <src> <dst>

# Sync
claude-multi auto-sync <name> on|off           # symlink plugins/skills from ~/.claude
claude-multi fix-symlinks --all

# Claude Code itself
claude-multi version
claude-multi update
```

Set `CLAUDE_MULTI_INK=false` to force the simpler prompts-based UI instead of the Ink TUI.

## Providers

| Provider | Endpoint |
|---|---|
| GLM (智谱AI) | `api.z.ai` |
| MiniMax | `api.minimax.io` |
| DeepSeek | `api.deepseek.com` |

Templates write `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and related env vars to `~/.claude-<name>/settings.json`. Edit that file to customize.

## How it works

Each instance gets a config dir at `~/.claude-<name>/` and a wrapper script at `~/.local/bin/claude-<name>`. The wrapper sets `CLAUDE_CONFIG_DIR` before launching the unmodified `claude` binary — no forking, no patching.

```js
#!/usr/bin/env bun
process.env.CLAUDE_CONFIG_DIR = "/Users/you/.claude-glm"
spawn("claude", process.argv.slice(2), { stdio: "inherit", env: process.env })
```

Instance metadata lives in `~/.claude-multi/config.json`. With auto-sync on, `plugins/` and `skills/` are symlinked from `~/.claude/`, so installing a plugin once makes it available everywhere.

## License

MIT
