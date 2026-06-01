---
title: "Instance Isolation"
description: "Each claude-multi instance runs in its own config directory with separate settings, history, MCP servers, and plugins. No shared state between instances."
term: "Instance Isolation"
category: "Architecture"
related:
  - "config-directory"
  - "mcp-server"
  - "plugin-sync"
  - "wrapper-script"
---

Instance isolation means every claude-multi instance operates independently. Each one gets its own config directory, its own settings, its own conversation history, and its own MCP server setup. Nothing bleeds across instances.

## What's isolated

- **Settings**: Each instance has its own `settings.json` with its own API keys, model preferences, and permissions
- **History**: Conversation logs are stored per-instance, not shared
- **MCP servers**: Each instance can run a different set of external tools
- **Plugins and skills**: Managed per-instance (though auto-sync can keep them aligned)
- **Environment variables**: Each wrapper script sets its own env vars

## How it works

When you create an instance, claude-multi creates a directory at `~/.claude-multi/<name>/` (or a custom path). This directory becomes the instance's `CLAUDE_CONFIG_DIR`. Claude Code reads all its configuration from this directory, so two instances with different config dirs are fully independent.

## Why it matters

Without isolation, switching providers means overwriting settings, losing history, or accidentally running the wrong model. Instance isolation means you can run `claude-glm` and `claude-deepseek` at the same time, in different terminals, and neither knows the other exists.

## The exception: plugin sync

Plugin syncing uses symlinks to share plugins across instances. This is opt-in and directional. The isolation is preserved because each instance still controls which plugins it loads.
