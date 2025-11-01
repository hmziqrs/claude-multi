# Claude Multi - Implementation Plan

## Goal

Create a CLI tool to manage multiple Claude Code instances with different aliases and configurations. This enables simultaneous use of multiple AI providers (GLM, Minimax, Anthropic) without manual config switching.

## Problem

- Claude Code supports multiple API providers (Anthropic, GLM, Minimax)
- Switching between providers requires changing config files manually
- Users may want to use both a paid subscription and free/alternative providers
- Current approach: manually edit `~/.claude/settings.json` each time

## Solution: Wrapper-Based Approach

Instead of forking and republishing Claude Code (which would violate licensing), we create **wrapper scripts** that leverage the existing `CLAUDE_CONFIG_DIR` environment variable.

### How It Works

1. **Install claude-multi**: `npm install -g claude-multi`
2. **Create instances**:
   ```bash
   claude-multi add glm --config ~/.claude-glm
   claude-multi add minimax --config ~/.claude-minimax
   ```
3. **Use different instances**:
   ```bash
   claude-glm    # Uses ~/.claude-glm config
   claude-minimax # Uses ~/.claude-minimax config
   claude        # Uses default ~/.claude config
   ```

Each wrapper is a simple Node.js script:
```javascript
#!/usr/bin/env node
process.env.CLAUDE_CONFIG_DIR = "/Users/you/.claude-glm"
require("@anthropic-ai/claude-code/cli.js")
```

## Implementation Details

### Architecture

```
claude-multi/
├── src/
│   ├── cli.ts       # Main CLI (add, remove, list, version commands)
│   ├── config.ts    # Manage ~/.claude-multi/config.json
│   ├── wrapper.ts   # Generate wrapper scripts
│   └── version.ts   # Check upstream claude-code versions
├── package.json     # Peer dependency on @anthropic-ai/claude-code
└── tsconfig.json
```

### Core Components

**1. Config Management** (`src/config.ts`)
- Stores instance metadata in `~/.claude-multi/config.json`
- Each instance has: name, configDir, binaryPath, createdAt
- CRUD operations for instances

**2. Wrapper Generation** (`src/wrapper.ts`)
- Finds original `claude` binary location
- Generates Node.js wrapper that sets `CLAUDE_CONFIG_DIR`
- Creates executable in `/usr/local/bin/claude-{name}`
- Ensures config directory exists

**3. Version Management** (`src/version.ts`)
- Queries npm registry for latest `@anthropic-ai/claude-code`
- Compares with locally installed version
- Provides update command

**4. CLI Interface** (`src/cli.ts`)
- `add <name>` - Create new instance
- `remove <name>` - Remove instance
- `list` - Show all instances
- `info <name>` - Show instance details
- `version` - Check for updates
- `update` - Update claude-code

### Commands

```bash
# Install
npm install -g claude-multi

# Create instances
claude-multi add work                           # → claude-work, ~/.claude-work
claude-multi add glm --config ~/configs/glm     # Custom path

# List instances
claude-multi list

# Get instance info
claude-multi info glm

# Check version
claude-multi version

# Update claude-code
claude-multi update

# Remove instance
claude-multi remove glm
```

## Why Wrapper Approach?

### Advantages ✅
- **Legal**: No redistribution of Anthropic's code
- **Simple**: Leverages existing `CLAUDE_CONFIG_DIR` feature
- **Auto-sync**: No need to track upstream versions and republish
- **Clean**: Users install both packages independently
- **Safe**: No modification of minified/bundled code

### Alternative Rejected ❌
- **Fork & Republish**: Would violate Anthropic's proprietary license
- **String Replacement**: Fragile, breaks on updates, likely illegal
- **Source Modification**: Claude Code is closed-source

## Technical Constraints

After exploring the Claude Code repository:

1. **Closed Source**: Only bundled `cli.js` available (3,896 lines minified)
2. **Proprietary License**: Cannot legally fork/modify/redistribute
3. **No Build Access**: Cannot rebuild from source
4. **OAuth Hardcoded**: Client ID tied to Anthropic services

## Version Synchronization

Originally planned: Auto-publish modified packages every 3 hours.

**Actual approach**: Not needed! Since we use wrappers:
- `claude-multi` depends on `@anthropic-ai/claude-code` as peer dependency
- Users update claude-code directly: `npm update -g @anthropic-ai/claude-code`
- Or use: `claude-multi update` (convenience wrapper)
- No republishing needed

## Use Cases

### Example 1: Personal + Work
```bash
claude-multi add personal
claude-multi add work

# Use different API keys for each
claude-personal  # Personal projects
claude-work      # Work projects
```

### Example 2: Paid + Free
```bash
claude-multi add anthropic  # Paid subscription
claude-multi add glm        # Free GLM API

claude-anthropic  # High-quality, paid
claude-glm        # Free tier
```

### Example 3: Testing
```bash
claude-multi add prod
claude-multi add staging
claude-multi add dev

# Different configs for each environment
```

## Benefits

1. **Zero Config Switching**: Use different commands instead of editing files
2. **Independent Configs**: Each instance has isolated settings
3. **Session Isolation**: No conflicts between projects
4. **Easy Management**: Simple CLI for all operations
5. **Standard Tool**: Uses official Claude Code underneath

## Future Enhancements

- [ ] Interactive setup wizard for providers (GLM, Minimax API keys)
- [ ] Config templates for common providers
- [ ] Background daemon to auto-check for updates
- [ ] Import/export instance configurations
- [ ] Shell completion (bash/zsh)
