# claude-multi

> Manage multiple Claude Code instances with different aliases and configurations

## Why?

Claude Code supports multiple AI providers (Anthropic, GLM, Minimax), but switching between them requires manually editing config files. **claude-multi** solves this by creating isolated instances with different aliases and config paths.

## Features

- 🔄 **Multiple Instances**: Run different Claude Code configs simultaneously
- 🎯 **Simple CLI**: Easy-to-use commands for managing instances
- 🔒 **Isolated Configs**: Each instance has its own settings and history
- 🎨 **Provider Templates**: Built-in templates for GLM, MiniMax, and more
- ✅ **Legal**: Uses wrapper scripts, no code modification
- 🚀 **Auto-sync**: Always uses the latest official Claude Code

## Installation

```bash
npm install -g claude-multi
```

## Quick Start

Get started with a provider template in 30 seconds:

```bash
# Create a GLM instance
claude-multi add glm --provider glm --api-key "your-glm-api-key"

# Use it!
claude-glm --help
```

**Or use interactive mode:**

```bash
claude-multi add myinstance
# Choose "Yes" when asked about provider templates
# Select GLM or MiniMax
# Enter your API key
# Done!
```

### Windows Setup

On Windows, ensure `%APPDATA%\npm` is in your PATH to use the wrapper commands:

```cmd
# Check if npm directory is in PATH
echo %PATH%

# Add to PATH if needed (PowerShell as Administrator)
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:APPDATA\npm", "User")
```

After adding to PATH, restart your terminal for changes to take effect.

## Usage

### Create instances

```bash
# Create instance (interactive - prompts for provider templates and copying settings)
claude-multi add glm

# Create instance with provider template (CLI mode)
claude-multi add glm --provider glm --api-key "your-api-key-here"
claude-multi add minimax --provider minimax --api-key "your-api-key-here"

# Create instance with custom config path
claude-multi add work --config ~/configs/claude-work

# Create instance with custom binary path
claude-multi add minimax --binary ~/.local/bin/claude-minimax

# Non-interactive modes
claude-multi add glm --copy-settings      # Copy only settings.json
claude-multi add glm --copy-all           # Copy all files (settings, CLAUDE.md, plugins)
claude-multi add glm --skip-prompts       # Start fresh, no prompts
```

**Provider Templates:**
- **GLM (智谱AI)**: GLM-4.5-air and GLM-4.6 models via z.ai
- **MiniMax**: MiniMax-M2 model via minimax.io

**Interactive prompt options:**
- **Provider templates**: Choose GLM, MiniMax, or None/Custom
- **Nothing - start fresh**: Empty config directory
- **Only settings.json**: Copy your settings (API keys, preferences)
- **All files**: Copy settings, CLAUDE.md, plugins, etc. (excludes history, debug logs)

When using a provider template, you'll be prompted to enter your API key securely.

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

## Use Cases

### Personal + Work
```bash
claude-multi add personal
claude-multi add work

claude-personal  # Personal projects
claude-work      # Work projects
```

### Different AI Providers
```bash
# Interactive mode with provider template
claude-multi add anthropic  # Use Anthropic (prompted for API key)
claude-multi add glm        # Use GLM template (prompted for API key)
claude-multi add minimax    # Use MiniMax template (prompted for API key)

# CLI mode with provider template
claude-multi add glm --provider glm --api-key "sk-..."
claude-multi add minimax --provider minimax --api-key "sk-..."

claude-anthropic  # Uses Anthropic Claude
claude-glm        # Uses GLM-4.6
claude-minimax    # Uses MiniMax-M2
```

### Multiple Environments
```bash
claude-multi add prod
claude-multi add staging
claude-multi add dev

# Different configs for each
```

## Provider Templates

Built-in templates for popular AI providers. Each template auto-configures the API endpoint, model mappings, and optimal settings.

### Available Providers

**GLM (智谱AI)**: GLM-4.5-air and GLM-4.6 models via `api.z.ai`

**MiniMax**: MiniMax-M2 model via `api.minimax.io`

### Usage

```bash
# CLI mode
claude-multi add glm --provider glm --api-key "your-api-key"

# Interactive mode
claude-multi add myinstance
# Select provider when prompted and enter API key
```

Customize later by editing `~/.claude-{name}/settings.json`

## Requirements

- Node.js >= 18
- `@anthropic-ai/claude-code` installed globally

## Platform Support

**claude-multi** supports all major operating systems:

- ✅ **Linux**: Fully supported
- ✅ **macOS**: Fully supported  
- ✅ **Windows**: Fully supported

### Platform-Specific Notes

**Windows:**
- Wrapper scripts are created as `.cmd` batch files
- Binary path defaults to `%APPDATA%\npm`
- Example: `claude-glm.cmd` instead of `claude-glm`

**Unix/Linux/macOS:**
- Wrapper scripts are Node.js scripts with shebangs
- Binary path defaults to `~/.local/bin`
- Scripts are automatically marked as executable

## License

MIT

## Credits

Built with [Bun](https://bun.sh) and [Commander.js](https://github.com/tj/commander.js)

Wrapper for [@anthropic-ai/claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code)

## Support

For technical documentation, development setup, and contribution guidelines, see [development.md](development.md).

For issues, questions, or feature requests, please visit the project's issue tracker.
