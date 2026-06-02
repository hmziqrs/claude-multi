---
title: "Switch Between AI Providers Without Editing Config"
description: "Run claude-glm for one task, claude-deepseek for the next. No config swaps, no environment variable changes, no downtime."
difficulty: "Beginner"
timeRequired: "3 min"
prerequisites:
  - "claude-multi installed"
  - "At least two provider instances set up"
relatedProviders:
  - "GLM"
  - "DeepSeek"
  - "MiniMax"
order: 2
---

Once you have multiple provider instances configured, switching between them is a matter of running a different command. No config files to edit. No environment variables to export. Just pick the right binary.

## The short version

```bash
claude-glm "explain this function"
# Done with GLM, switch to DeepSeek for the next task
claude-deepseek "write tests for auth.ts"
```

Each command launches a full, independent Claude Code session pointed at its respective provider. They do not interfere with each other.

## Why this beats editing config

Without claude-multi, switching providers means one of these:

- Edit `settings.json` to change the base URL and model
- Swap `ANTHROPIC_BASE_URL` in your shell profile
- Use different tools for different providers

All of these are slow and error-prone. claude-multi gives each provider its own config directory and wrapper script, so switching is just typing a different command name.

## Running multiple sessions at once

Each instance is fully independent. Open two terminals:

```bash
# Terminal 1
claude-glm "refactor the database layer"

# Terminal 2
claude-deepseek "review the API endpoints for security issues"
```

Both run simultaneously. Neither knows the other exists.

## Using the one-shot mode

Pass a prompt directly to avoid the interactive session:

```bash
claude-glm -p "list all TODO comments in src/"
claude-deepseek -p "generate a migration for the users table"
```

This is useful for scripting, CI pipelines, or quick questions where you do not need a back-and-forth.

## Checking which providers you have

```bash
claude-multi
# Pick: Instance details
# Lists every instance with its provider, config path, and status
```

You can also check directly:

```bash
ls ~/.local/bin/claude-*
```

Each binary corresponds to one provider instance.

## Removing a provider

If you stop using a provider:

```bash
claude-multi
# Pick: Remove instance
# Select the instance
# Choose whether to delete the config directory
```

This removes the wrapper binary and optionally wipes the config.

## Next steps

- [Cut your AI bill with provider routing](/guides/cost-optimization/)
- [Set up MCP servers](/guides/mcp-server-setup/)
