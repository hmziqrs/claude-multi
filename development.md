# Development Guide

This document contains technical documentation for developers working on claude-multi.

## Table of Contents

- [Development Setup](#development-setup)
- [Building and Packaging](#building-and-packaging)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Testing](#testing)
- [Debugging](#debugging)
- [Contribution Guidelines](#contribution-guidelines)
- [CI/CD](#cicd)

## Development Setup

### Prerequisites

- Node.js >= 18
- Bun (for development and building)
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd claude-multi

# Install dependencies
bun install

# Build the project
bun run build

# Install globally for testing
npm link
```

### Development Workflow

```bash
# Run in dev mode (uses ts-node)
bun run dev

# Build TypeScript to JavaScript
bun run build

# Watch mode for development
bun run dev
```

### Testing Commands

```bash
# Test adding an instance
bun run dev add test --binary ./test-bin/claude-test

# List all instances
bun run dev list

# Remove an instance
bun run dev remove test --force
```

## Building and Packaging

### Build Process

The project uses TypeScript and Bun for building:

```bash
# Full build
bun run build

# This compiles TypeScript to JavaScript in the dist/ directory
```

### Package Structure

The built package includes:

```
dist/
├── cli.js          # Main CLI entry point
├── config.js       # Instance configuration management
├── wrapper.js      # Wrapper script generation
├── version.js      # Version checking
└── templates.js    # Provider templates
```

### Publishing

```bash
# Update version in package.json
# Commit changes
git commit -am "Bump version to X.Y.Z"
git tag vX.Y.Z

# Publish to npm
npm publish
```

The CI/CD pipeline automatically publishes to npm when version tags are pushed.

## Architecture

### Design Decisions

**Wrapper Script Approach**

claude-multi uses wrapper scripts to create isolated Claude Code instances. This approach was chosen because:

- ✅ Doesn't modify Anthropic's code (legal)
- ✅ Uses official Claude Code (no forking)
- ✅ Auto-syncs with upstream (no version tracking needed)
- ✅ Simple and maintainable

**Why Not Fork?**

Forking would require:
- Maintaining a separate codebase
- Merging upstream changes manually
- Tracking Claude Code versions
- Potential licensing complications

**Why Not Modify Config Files Directly?**

Direct modification would:
- Require complex config parsing and manipulation
- Be fragile across Claude Code updates
- Make it difficult to switch between providers
- Risk corrupting user configurations

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLI Interface                       │
│                    (cli.ts)                             │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────────┐
        │            │            │                │
        ▼            ▼            ▼                ▼
┌──────────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐
│   Config     │ │ Wrapper │ │ Templates│ │   Version    │
│  Management  │ │ Generator│ │          │ │   Checker    │
│  (config.ts) │ │(wrapper.ts)│ │(templates.ts)│ │ (version.ts) │
└──────────────┘ └─────────┘ └──────────┘ └──────────────┘
```

### Key Components

**CLI Interface ([`cli.ts`](src/cli.ts))**
- Parses command-line arguments using Commander.js
- Routes commands to appropriate handlers
- Manages user interaction and prompts

**Config Management ([`config.ts`](src/config.ts))**
- Reads and writes instance metadata
- Manages `~/.claude-multi/config.json`
- Validates instance configurations

**Wrapper Generator ([`wrapper.ts`](src/wrapper.ts))**
- Creates wrapper scripts for each instance
- Handles platform-specific script formats (Unix/Windows)
- Sets `CLAUDE_CONFIG_DIR` environment variable

**Templates ([`templates.ts`](src/templates.ts))**
- Defines provider-specific configurations
- Handles API key prompts
- Generates initial settings.json

**Version Checker ([`version.ts`](src/version.ts))**
- Checks for Claude Code updates
- Manages version information

## How It Works

### Wrapper Script Mechanism

claude-multi creates wrapper scripts that set the `CLAUDE_CONFIG_DIR` environment variable before calling the original `claude` binary:

```javascript
#!/usr/bin/env node
process.env.CLAUDE_CONFIG_DIR = "/Users/you/.claude-glm"
import("/usr/local/bin/claude")
```

### Instance Creation Flow

```
User runs: claude-multi add glm --provider glm --api-key "key"
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Parse command arguments                               │
│ 2. Validate provider and API key                         │
│ 3. Create config directory (~/.claude-glm)               │
│ 4. Apply provider template (settings.json)               │
│ 5. Generate wrapper script (claude-glm)                  │
│ 6. Register instance in ~/.claude-multi/config.json      │
│ 7. Mark wrapper as executable (Unix only)               │
└─────────────────────────────────────────────────────────┘
         │
         ▼
Instance ready: claude-glm
```

### Wrapper Script Execution

When a user runs `claude-glm`:

```
User runs: claude-glm --help
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 1. Wrapper script executes                               │
│ 2. Sets CLAUDE_CONFIG_DIR=~/.claude-glm                 │
│ 3. Invokes original claude binary                       │
│ 4. Claude Code reads config from ~/.claude-glm          │
│ 5. Uses provider-specific settings (API, models, etc.)   │
└─────────────────────────────────────────────────────────┘
```

### Platform Differences

**Unix/Linux/macOS:**
```javascript
#!/usr/bin/env node
process.env.CLAUDE_CONFIG_DIR = "/home/user/.claude-glm";
import("/usr/local/bin/claude");
```

**Windows:**
```batch
@echo off
set CLAUDE_CONFIG_DIR=C:\Users\user\.claude-glm
node "%~dp0claude-glm-wrapper.js" %*
```

## Project Structure

```
claude-multi/
├── src/
│   ├── cli.ts          # Main CLI interface and command routing
│   ├── config.ts       # Instance config management (read/write)
│   ├── wrapper.ts      # Wrapper script generation
│   ├── templates.ts    # Provider templates and configurations
│   └── version.ts      # Version checking and updates
├── test/
│   └── wrapper.test.ts # Unit tests for wrapper generation
├── scripts/
│   └── check-version.ts # Version validation script
├── docs/
│   └── raw-plan.md     # Detailed implementation plan
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
├── bun.lock            # Bun lock file
├── .npmignore          # Files to exclude from npm package
├── .gitignore          # Files to exclude from git
├── README.md           # Consumer-facing documentation
├── development.md      # This file - developer documentation
├── CHANGELOG.md        # Version history
└── ROADMAP.md          # Future plans
```

## Configuration

### Instance Metadata

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

### Instance Config Directory

Each instance has its own config directory:

```
~/.claude-{name}/
├── settings.json       # Claude Code settings
├── CLAUDE.md          # Custom instructions
├── plugins/           # Installed plugins
├── history/           # Conversation history
└── debug.log          # Debug logs
```

### Provider Template Configuration

Provider templates define default settings:

```typescript
interface ProviderTemplate {
  name: string;
  displayName: string;
  apiEndpoint: string;
  models: string[];
  settings: Record<string, any>;
}
```

Example GLM template:

```typescript
{
  name: "glm",
  displayName: "GLM (智谱AI)",
  apiEndpoint: "https://api.z.ai/v1",
  models: ["glm-4.5-air", "glm-4.6"],
  settings: {
    "apiProvider": "custom",
    "customApiEndpoint": "https://api.z.ai/v1",
    "model": "glm-4.6"
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test test/wrapper.test.ts

# Run tests in watch mode
bun test --watch
```

### Test Structure

Tests are located in the `test/` directory:

```typescript
// test/wrapper.test.ts
import { describe, it, expect } from 'bun:test';
import { generateWrapper } from '../src/wrapper';

describe('Wrapper Generation', () => {
  it('should generate Unix wrapper script', () => {
    const wrapper = generateWrapper('glm', '/home/user/.claude-glm', '/usr/local/bin/claude');
    expect(wrapper).toContain('#!/usr/bin/env node');
    expect(wrapper).toContain('process.env.CLAUDE_CONFIG_DIR');
  });

  it('should generate Windows batch file', () => {
    const wrapper = generateWrapper('glm', 'C:\\Users\\user\\.claude-glm', 'C:\\npm\\claude.cmd');
    expect(wrapper).toContain('@echo off');
    expect(wrapper).toContain('set CLAUDE_CONFIG_DIR');
  });
});
```

### Manual Testing

Test the CLI manually:

```bash
# Add instance
bun run dev add test --binary ./test-bin/claude-test

# List instances
bun run dev list

# Get instance info
bun run dev info test

# Remove instance
bun run dev remove test --force
```

## Debugging

### Enable Debug Logging

Set the `DEBUG` environment variable:

```bash
DEBUG=claude-multi:* bun run dev add test
```

### Common Issues

**Instance not found:**

```bash
# Check if instance exists
claude-multi list

# Check config file
cat ~/.claude-multi/config.json

# Verify wrapper exists
ls -la /usr/local/bin/claude-{name}
```

**Wrapper not executable:**

```bash
# On Unix/Linux/macOS
chmod +x /usr/local/bin/claude-{name}

# Or recreate the instance
claude-multi remove {name} --force
claude-multi add {name}
```

**Config directory issues:**

```bash
# Check config directory
ls -la ~/.claude-{name}

# Check settings.json
cat ~/.claude-{name}/settings.json

# Verify permissions
ls -ld ~/.claude-{name}
```

**Provider template not working:**

```bash
# Check if provider is supported
claude-multi add test --provider invalid

# Verify API key format
claude-multi add test --provider glm --api-key "sk-..."
```

### Debug Commands

```bash
# Show instance details
claude-multi info {name}

# Check Claude Code version
claude-multi version

# Update Claude Code
claude-multi update

# List all instances with details
cat ~/.claude-multi/config.json | jq '.instances[]'
```

## Contribution Guidelines

### Getting Started

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Write tests for new functionality
5. Ensure all tests pass: `bun test`
6. Build the project: `bun run build`
7. Commit your changes: `git commit -am 'Add new feature'`
8. Push to the branch: `git push origin feature/my-feature`
9. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Add JSDoc comments for public functions
- Write descriptive commit messages
- Include tests for new features

### Adding New Provider Templates

To add a new provider template:

1. Edit [`src/templates.ts`](src/templates.ts)
2. Add provider configuration:

```typescript
{
  name: "newprovider",
  displayName: "New Provider",
  apiEndpoint: "https://api.newprovider.com/v1",
  models: ["model-1", "model-2"],
  settings: {
    "apiProvider": "custom",
    "customApiEndpoint": "https://api.newprovider.com/v1",
    "model": "model-1"
  }
}
```

3. Update documentation in [`README.md`](README.md)
4. Add tests for the new template
5. Submit a pull request

### Adding New CLI Commands

To add a new CLI command:

1. Edit [`src/cli.ts`](src/cli.ts)
2. Add command definition:

```typescript
program
  .command('newcommand [name]')
  .description('Description of the new command')
  .option('--option', 'Option description')
  .action((name, options) => {
    // Command logic here
  });
```

3. Implement the command logic
4. Add tests
5. Update documentation
6. Submit a pull request

### Reporting Issues

When reporting issues, please include:

- Operating system and version
- Node.js version
- claude-multi version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages or logs

## CI/CD

### Continuous Integration

CI runs on all pull requests and pushes to the master branch:

- **Node Version**: 20.x
- **Tests**: All tests must pass
- **Build**: Project must build successfully
- **Linting**: Code must pass linting rules

### Publishing

The project automatically publishes to npm when version tags are pushed:

```bash
# Create and push version tag
git tag vX.Y.Z
git push origin vX.Y.Z
```

**Requirements:**
- `NPM_TOKEN` secret must be configured in GitHub
- Version in `package.json` must match the tag
- All CI checks must pass

### Release Process

1. Update version in [`package.json`](package.json)
2. Update [`CHANGELOG.md`](CHANGELOG.md)
3. Commit changes: `git commit -am "Bump version to X.Y.Z"`
4. Create tag: `git tag vX.Y.Z`
5. Push tag: `git push origin vX.Y.Z`
6. CI/CD automatically publishes to npm

### Workflow

```
Pull Request → CI Tests → Code Review → Merge to Master
                                                    │
                                                    ▼
                                            Version Tag Push
                                                    │
                                                    ▼
                                            Auto-publish to npm
```

## Additional Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [Bun Documentation](https://bun.sh/docs)
- [Commander.js Documentation](https://github.com/tj/commander.js)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
