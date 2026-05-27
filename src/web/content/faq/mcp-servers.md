---
question: "How do I manage MCP servers across instances?"
description: "claude-multi can list, copy, and verify MCP server configs across all your instances from the TUI or CLI."
category: "Plugins & MCP"
order: 7
---

MCP (Model Context Protocol) servers let Claude Code talk to external tools, databases, APIs, file systems, whatever you've wired up. Each instance can have its own set, and claude-multi gives you commands to manage them without digging through JSON files.

## Listing what's configured

```sh
claude-multi mcp list
```

Shows MCP server configs across all instances so you can see at a glance what's connected where.

## Copying between instances

Set up an MCP server in one instance and want it in another?

```sh
claude-multi mcp copy
```

From the TUI, select **MCP servers** and choose copy. You pick the source and destination instances.

## Verifying configs

MCP server configs can go stale if a server binary gets moved or removed:

```sh
claude-multi mcp verify
```

This checks that referenced executables and paths still exist.

## Setting up MCP during instance creation

When you create a new instance through the TUI, the Copy Options step lets you bring over MCP server configs from your primary `~/.claude` install. That's the fastest way to get a new instance connected to the same tools.

## Where configs live

Each instance stores MCP server configuration in its own `settings.json` at `~/.claude-multi/<name>/settings.json`. Same format as Claude Code's native MCP config, no abstraction layer added.

## Related questions

- [How does plugin syncing work?](/faq/plugin-syncing/): symlinks, auto-sync, and collision detection

## More info

- [/docs/plugins-mcp/](/docs/plugins-mcp/): plugin and MCP guide
- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/): MCP servers section
- [/blog/claude-code-co-engineer-and-claude-multi/](/blog/claude-code-co-engineer-and-claude-multi/): MCP integrations overview
- Run `claude-multi` and select **MCP servers**
- [src/ink/screens/ManageMcp.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/ManageMcp.tsx): TUI MCP screen
- [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts): `copyMcpServersFromDefault()`, `copyMcpServersBetweenInstances()`, `listMcpServers()`
