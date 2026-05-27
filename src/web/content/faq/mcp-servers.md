---
question: "How do I manage MCP servers across instances?"
description: "claude-multi can list, copy, and verify MCP server configs across all your instances from the TUI or CLI."
category: "Plugins & MCP"
order: 7
---

MCP (Model Context Protocol) servers let Claude Code connect to external tools — databases, APIs, file systems, and more. Each instance can have its own set of MCP servers, and claude-multi helps you manage them.

## Listing MCP servers

From the CLI:

```sh
claude-multi mcp list
```

This shows MCP server configurations across all instances, so you can see at a glance which servers are configured where.

## Copying MCP servers between instances

If you set up an MCP server in one instance and want it in another:

```sh
claude-multi mcp copy
```

From the TUI, select **MCP servers** and choose the copy action. You can copy from any instance to any other instance.

## Verifying MCP configs

MCP server configs can become stale if a server binary is moved or removed. The verify command checks that referenced executables and paths still exist:

```sh
claude-multi mcp verify
```

## Setting up MCP during instance creation

When you create a new instance through the TUI wizard, step 6 offers to **Copy MCP servers** from your primary `~/.claude` install. This is the fastest way to get a new instance connected to the same tools.

## Where MCP configs live

Each instance stores its MCP server configuration in its own `settings.json` at `~/.claude-multi/<name>/settings.json`. The format is the same as Claude Code's native MCP config — claude-multi doesn't introduce any abstraction layer.

## References

| Resource | Link |
|----------|------|
| **Plugins & MCP docs** | [/docs/plugins-mcp/](/docs/plugins-mcp/) — full plugin and MCP guide |
| **Blog: Every TUI menu** | [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/) — MCP servers section |
| **Blog: Claude Code co-engineer** | [/blog/claude-code-co-engineer-and-claude-multi/](/blog/claude-code-co-engineer-and-claude-multi/) — MCP integrations overview |
| **In-app: MCP servers** | Run `claude-multi` and select **MCP servers** |
| **GitHub: ManageMcp screen** | [src/ink/screens/ManageMcp.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/ManageMcp.tsx) — TUI MCP management |
| **GitHub: Config (MCP functions)** | [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) — `copyMcpServers()`, `listMcpServers()`, `verifyMcpServers()` |
