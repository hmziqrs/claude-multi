---
title: "Config Directory"
description: "The directory where a claude-multi instance stores its settings.json, conversation history, MCP server configs, plugins, and skills."
term: "Config Directory"
category: "Architecture"
related:
  - "instance-isolation"
  - "wrapper-script"
  - "mcp-server"
  - "plugin-sync"
---

A config directory is the root folder for a claude-multi instance. Every piece of state that Claude Code needs lives here: settings, history, plugins, skills, and MCP server configs.

## Default location

Instances are stored at `~/.claude-multi/<name>/`. You can choose a custom path during instance creation. The directory name becomes the instance alias.

## What's inside

- **settings.json**: API keys, model preferences, permissions, MCP server definitions
- **projects/**: Per-project conversation history and context
- **plugins/**: Installed plugins and skills (may be symlinked if sync is enabled)
- **tidy.json**: Cleanup and maintenance state

## How Claude Code uses it

Claude Code reads its configuration from the `CLAUDE_CONFIG_DIR` environment variable. The wrapper script that claude-multi generates sets this variable to the instance's config directory before launching Claude Code. That's the entire mechanism. No forking, no patching, just pointing Claude Code at a different folder.

## Relationship to the wrapper

The wrapper script (`/usr/local/bin/claude-<name>`) sets `CLAUDE_CONFIG_DIR` to the instance's config directory and then runs `claude`. Everything else follows from that one variable.

## Health checks

claude-multi's health monitor checks that config directories exist, are writable, and haven't been corrupted. It also verifies that symlinks inside the directory still point to valid targets.
