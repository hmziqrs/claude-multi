# claude-multi

Run multiple Claude Code instances side by side — each with its own provider, config, and `claude-<name>` command.

Switching providers (Anthropic, GLM, MiniMax, DeepSeek) normally means editing `settings.json` by hand. This tool gives each one its own isolated install instead.

## Install

```bash
bun add -g claude-multi      # or: npm i -g claude-multi
pnpm add -g claude-multi
deno install -g -A -n claude-multi npm:claude-multi
```

Requires Node 18+ (or Bun 1+) and `@anthropic-ai/claude-code` installed globally.

## Quick start

```bash
claude-multi add glm --provider glm --api-key "sk-..."
claude-glm
```

Or run `claude-multi add glm` for an interactive prompt.

## Commands

```bash
# Instances
claude-multi add <name> [--provider <p>] [--api-key <k>]
claude-multi add <name> --config ~/path        # custom config dir
claude-multi add <name> --copy-settings        # seed from ~/.claude
claude-multi add <name> --copy-all             # copy everything + auto-sync
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
