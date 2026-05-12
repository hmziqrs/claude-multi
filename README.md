# claude-multi

> Manage multiple Claude Code instances with different AI providers and configurations

## Why?

Switching Claude Code between providers (Anthropic, GLM, Minimax) means editing config files. **claude-multi** creates isolated instances — each with its own config, history, and `claude-<name>` command.

## Installation

```bash
npm install -g claude-multi
```

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

# Use instances
claude-glm        # uses ~/.claude-glm
claude-work       # uses your custom config path
claude            # original, uses ~/.claude

# Manage instances
claude-multi list
claude-multi info glm
claude-multi remove glm
claude-multi remove glm --force

# Version
claude-multi update       # update Claude Code
```

## Provider Templates

| Provider | Models | API Endpoint |
|----------|--------|-------------|
| **GLM** (智谱AI) | GLM-5.1, GLM-5-Turbo | `api.z.ai` |
| **MiniMax** | MiniMax-M2.7 | `api.minimax.io` |

Customize any template by editing `~/.claude-<name>/settings.json`.

## Requirements

- Node.js >= 18
- `@anthropic-ai/claude-code` installed globally

## License

MIT
