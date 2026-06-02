---
title: "Separate Claude Code Configs for Personal and Work"
description: "Keep your personal side projects and work codebase in isolated Claude Code instances. Different API keys, different plugins, zero crossover."
difficulty: "Beginner"
timeRequired: "3 min"
prerequisites:
  - "claude-multi installed"
  - "Two different API keys (or two provider accounts)"
relatedProviders:
  - "Any"
order: 5
---

Mixing personal and work projects in the same Claude Code config creates problems. Your work API key ends up in personal sessions. Your personal MCP servers leak into work sessions. Conversation histories get tangled. claude-multi solves this by giving each context its own isolated instance.

## Create the work instance

```bash
claude-multi
# Add new instance
# Name: work
# Template: your work provider
# Paste your work API key
```

This creates `~/.claude-work/` with its own `settings.json`, plugins, and history.

## Create the personal instance

```bash
claude-multi
# Add new instance
# Name: personal
# Template: your personal provider
# Paste your personal API key
```

This creates `~/.claude-personal/` with a completely separate config.

## The result

```bash
# Work projects
claude-work "review the Q3 migration plan"

# Personal projects
claude-personal "build me a bookmark manager in Go"
```

Two commands, two configs, two billing accounts. No crossover.

## What stays isolated

| Setting | Work instance | Personal instance |
|---------|--------------|-------------------|
| API key | Work billing | Personal billing |
| Config dir | `~/.claude-work/` | `~/.claude-personal/` |
| Plugins | Work-specific tools | Personal experiments |
| MCP servers | Work database, CI | Local tools |
| History | Work conversations | Personal conversations |
| `CLAUDE.md` | Work coding standards | Personal preferences |

## Configure each instance separately

Edit the work instance to point at work resources:

```bash
nano ~/.claude-work/settings.json
```

Add work-specific MCP servers:

```json
{
  "mcpServers": {
    "work-postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://..."]
    }
  }
}
```

Do the same for the personal instance with personal resources:

```bash
nano ~/.claude-personal/settings.json
```

## Keep auto-sync off

Do not enable auto-sync between these instances. Auto-sync shares plugins from `~/.claude/`, which defeats the purpose of isolation. Manage plugins independently in each instance.

## Using different providers

Nothing stops you from using different providers for each context:

```bash
# Work uses GLM (company has a subscription)
claude-work "update the billing service to handle new tax rules"

# Personal uses DeepSeek (pay-per-token, cheaper for side projects)
claude-personal "write a CLI tool that generates static sites"
```

The provider choice is independent for each instance.

## Cleaning up

If you change jobs or stop using one context:

```bash
claude-multi
# Pick: Remove instance
# Select: work
# Delete config directory: y
```

Everything related to that instance is gone. The other instance is unaffected.

## Next steps

- [Set up MCP servers per instance](/guides/mcp-server-setup/)
- [Switch between providers quickly](/guides/switch-providers/)
