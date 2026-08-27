---
question: "How do I manage MCP servers across instances?"
description: "claude-multi can list, copy, and verify MCP server configs across all your instances from the TUI or CLI."
category: "Plugins & MCP"
order: 7
---

MCP (Model Context Protocol) servers let Claude Code talk to external tools: Jira, GitHub, Slack, databases, anything you've wired up. Each instance can have its own set, and claude-multi manages them without making you dig through JSON:

- `claude-multi mcp list`: show MCP server configs across all instances
- `claude-multi mcp copy`: copy a server config from one instance to another (also available in the TUI under **MCP servers**)
- `claude-multi mcp verify`: check that referenced executables and paths still exist

When you create an instance through the TUI, the Copy Options step can bring MCP configs over from your primary `~/.claude` install. Configs live in each instance's `settings.json` at `~/.claude-multi/<name>/settings.json`, same format as Claude Code's native MCP config.

For setup details, edge cases, and the full command reference, see the plugins and MCP guide.

## Related questions

- [How does plugin syncing work?](/faq/#plugin-syncing): symlinks, auto-sync, and collision detection

## More info

- [/docs/plugins-mcp/](/docs/plugins-mcp/): plugin and MCP guide
- [/blog/claude-code-mcp-workflow-automation/](/blog/claude-code-mcp-workflow-automation/): what MCP buys you in practice
- [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts): `copyMcpServersFromDefault()`, `copyMcpServersBetweenInstances()`, `listMcpServers()`
