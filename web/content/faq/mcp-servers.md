---
question: "How do I manage MCP servers across instances?"
description: "claude-multi can list, copy, and verify MCP server configs across all your instances from the TUI or CLI."
category: "Plugins & MCP"
order: 7
---

MCP servers let Claude Code talk to external tools such as Jira, GitHub, Slack, and databases. Each instance can have its own set. claude-multi has three commands for them:

- `claude-multi mcp list`: show MCP server configs across all instances
- `claude-multi mcp copy <source> <target>`: replace the target's MCP server entries with the source's
- `claude-multi mcp verify`: check that each server config has a command (stdio) or a URL (HTTP and SSE)

With no arguments, `mcp copy` asks for the source and target instances.

When you create an instance through the TUI, the Copy Options step can bring MCP configs over from your primary `~/.claude` install. The CLI equivalent is `--copy-mcp`.

MCP configs live in each instance's `settings.json` at `~/.claude-<name>/settings.json`, in the same format as Claude Code's native MCP config. If the instance has no `settings.json`, claude-multi writes a separate `mcp.json`.

The [plugins and MCP guide](/docs/plugins-mcp/) covers setup details and edge cases. The implementation is in [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts).
