# claude-multi

> Manage multiple Claude Code instances with different aliases and configurations

## Why?

Claude Code supports multiple AI providers (Anthropic, GLM, Minimax), but switching between them requires manually editing config files. **claude-multi** solves this by creating isolated instances with different aliases and config paths.

## Features

- 🔄 **Multiple Instances**: Run different Claude Code configs simultaneously
- 🎯 **Simple CLI**: Easy-to-use commands for managing instances
- 🔒 **Isolated Configs**: Each instance has its own settings and history
- ✅ **Legal**: Uses wrapper scripts, no code modification
- 🚀 **Auto-sync**: Always uses the latest official Claude Code

## Installation

```bash
# Install dependencies
bun install

# Build the project
bun run build

# Install globally (optional)
npm link
```

## Usage

### Create instances

```bash
# Create instance with default config path (~/.claude-glm)
claude-multi add glm

# Create instance with custom config path
claude-multi add work --config ~/configs/claude-work

# Create instance with custom binary path
claude-multi add minimax --binary ~/.local/bin/claude-minimax
```

### Use instances

Each instance gets its own command:

```bash
claude-glm       # Uses ~/.claude-glm config
claude-work      # Uses ~/configs/claude-work
claude-minimax   # Uses ~/.claude-minimax config
claude           # Original command, uses ~/.claude
```

### Manage instances

```bash
# List all instances
claude-multi list

# Show instance details
claude-multi info glm

# Remove instance
claude-multi remove glm

# Remove without confirmation
claude-multi remove glm --force
```

### Version management

```bash
# Check for updates
claude-multi version

# Update Claude Code to latest
claude-multi update
```

## How It Works

`claude-multi` creates wrapper scripts that set the `CLAUDE_CONFIG_DIR` environment variable before calling the original `claude` binary:

```javascript
#!/usr/bin/env node
process.env.CLAUDE_CONFIG_DIR = "/Users/you/.claude-glm"
import("/usr/local/bin/claude")
```

This approach:
- ✅ Doesn't modify Anthropic's code (legal)
- ✅ Uses official Claude Code (no forking)
- ✅ Auto-syncs with upstream (no version tracking needed)
- ✅ Simple and maintainable

## Use Cases

### Personal + Work
```bash
claude-multi add personal
claude-multi add work

claude-personal  # Personal projects
claude-work      # Work projects
```

### Paid + Free Providers
```bash
claude-multi add anthropic  # Paid subscription
claude-multi add glm        # Free GLM API

claude-anthropic  # High-quality, paid
claude-glm        # Free tier
```

### Multiple Environments
```bash
claude-multi add prod
claude-multi add staging
claude-multi add dev

# Different configs for each
```

## Development

```bash
# Install dependencies
bun install

# Run in dev mode
bun run dev

# Build
bun run build

# Test
bun run dev add test --binary ./test-bin/claude-test
bun run dev list
bun run dev remove test --force
```

## Requirements

- Node.js >= 18
- Bun (for development)
- `@anthropic-ai/claude-code` installed globally

## Project Structure

```
claude-multi/
├── src/
│   ├── cli.ts       # Main CLI interface
│   ├── config.ts    # Instance config management
│   ├── wrapper.ts   # Wrapper script generation
│   └── version.ts   # Version checking
├── docs/
│   └── raw-plan.md  # Detailed implementation plan
├── package.json
└── README.md
```

## Configuration

Instance metadata is stored in `~/.claude-multi/config.json`:

```json
{
  "instances": [
    {
      "name": "glm",
      "configDir": "/Users/you/.claude-glm",
      "binaryPath": "/usr/local/bin/claude-glm",
      "createdAt": "2025-11-02T03:57:41.000Z"
    }
  ],
  "version": "1.0.0"
}
```

## License

MIT

## Credits

Built with [Bun](https://bun.sh) and [Commander.js](https://github.com/tj/commander.js)

Wrapper for [@anthropic-ai/claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code)
