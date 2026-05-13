# claude-multi

> Manage multiple Claude Code instances with different AI providers and configurations

## Why?

Switching Claude Code between providers (Anthropic, GLM, MiniMax, DeepSeek) means editing config files. **claude-multi** creates isolated instances — each with its own config, history, and `claude-<name>` command.

## Installation

```bash
npm install -g claude-multi
```

Requires Node.js >= 18 and `@anthropic-ai/claude-code` installed globally.

## Quick Start

```bash
# Create a GLM instance
claude-multi add glm --provider glm --api-key "your-key"

# Use it
claude-glm --help
```

Interactive mode:

```bash
claude-multi add myinstance
# Follow the prompts to pick a provider, enter your API key
```

## Usage

```bash
# Create instances
claude-multi add glm                                    # interactive
claude-multi add glm --provider glm --api-key "sk-..."  # non-interactive
claude-multi add work --config ~/configs/claude-work    # custom config path
claude-multi add dev --copy-settings                    # copy existing settings
claude-multi add dev --copy-all                         # copy all files with auto-sync
claude-multi add dev --manual                           # copy files instead of symlinks

# Use instances
claude-glm        # uses ~/.claude-glm
claude-work       # uses your custom config path
claude            # original, uses ~/.claude

# Manage instances
claude-multi list
claude-multi info glm
claude-multi remove glm
claude-multi remove glm --force

# Plugins and MCP
claude-multi plugins list               # list plugins across all instances
claude-multi plugins enable glm plugin-id
claude-multi plugins disable glm plugin-id
claude-multi plugins copy glm            # copy default Claude's plugin config
claude-multi mcp list                    # list MCP servers across instances
claude-multi mcp copy src-instance dst-instance

# Auto-sync (symlink plugins/skills from ~/.claude)
claude-multi auto-sync glm on
claude-multi auto-sync glm off
claude-multi fix-symlinks --all          # repair broken symlinks

# Version
claude-multi version                     # check for Claude Code updates
claude-multi update                      # update Claude Code
```

## Provider Templates

| Provider | Models | API Endpoint |
|----------|--------|-------------|
| **GLM** (智谱AI) | GLM-5.1, GLM-5-Turbo | `api.z.ai` |
| **MiniMax** | MiniMax-M2.7 | `api.minimax.io` |
| **DeepSeek** | DeepSeek-V4-Pro, DeepSeek-V4-Flash | `api.deepseek.com` |

Provider templates configure environment variables (`ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, etc.) in `~/.claude-<name>/settings.json`. Customize any template by editing that file.

## How It Works

### Wrapper Scripts

claude-multi creates wrapper scripts (e.g., `claude-glm`) that set the `CLAUDE_CONFIG_DIR` environment variable before launching Claude Code:

```javascript
#!/usr/bin/env bun
process.env.CLAUDE_CONFIG_DIR = "/Users/you/.claude-glm"
spawn("claude", process.argv.slice(2), { stdio: "inherit", env: process.env })
```

This approach uses official Claude Code unmodified — no forking or patching required.

### Instance Creation Flow

1. Parse command arguments
2. Validate provider and API key (if using a template)
3. Create config directory (`~/.claude-<name>`)
4. Apply provider template or copy existing settings
5. Generate wrapper script (`~/.local/bin/claude-<name>`)
6. Register instance in `~/.claude-multi/config.json`

### Configuration

Instance metadata is stored in `~/.claude-multi/config.json`:

```json
{
  "instances": [
    {
      "name": "glm",
      "configDir": "/Users/you/.claude-glm",
      "binaryPath": "/Users/you/.local/bin/claude-glm",
      "createdAt": "2025-11-02T03:57:41.000Z",
      "autoSync": true
    }
  ]
}
```

Each instance has its own config directory at `~/.claude-<name>/` with isolated `settings.json`, plugins, skills, and history. When auto-sync is enabled, `plugins/` and `skills/` directories are symlinked from `~/.claude/` to stay in sync with the default installation.

## License

MIT
