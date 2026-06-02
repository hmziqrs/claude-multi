---
title: "Set Up MCP Servers in Claude Code with claude-multi"
description: "Add filesystem, database, and custom MCP servers to your claude-multi instances. Share them across providers or isolate per instance."
difficulty: "Intermediate"
timeRequired: "10 min"
prerequisites:
  - "claude-multi installed"
  - "At least one provider instance configured"
  - "Basic familiarity with MCP server configuration"
relatedProviders:
  - "Any"
order: 3
---

MCP servers give Claude Code access to external tools: your filesystem, databases, APIs, and custom integrations. With claude-multi, each instance can have its own MCP config, or you can share servers across all instances using auto-sync.

## How MCP servers work with instances

Each claude-multi instance has its own `settings.json` at `~/.claude-<name>/settings.json`. MCP server configuration lives under the `mcpServers` key in that file. When you add an MCP server to one instance, it only affects that instance unless you enable sharing.

## Add an MCP server to a single instance

Open the instance's config file:

```bash
# Replace "glm" with your instance name
nano ~/.claude-glm/settings.json
```

Add or edit the `mcpServers` section:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/you/projects/my-app"
      ]
    }
  }
}
```

Save and restart the instance:

```bash
claude-glm
```

The MCP server loads automatically when the session starts.

## Share MCP servers across all instances

If you want every instance to use the same MCP servers, enable auto-sync:

```bash
claude-multi
# Pick: Toggle auto-sync
# Select all instances
```

Auto-sync symlinks the MCP config from your main `~/.claude/` directory into each instance. Any server you add to `~/.claude/settings.json` appears in every synced instance.

## Add a database MCP server

A common setup is connecting Claude Code to your database for schema exploration and query writing:

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://user:pass@localhost:5432/mydb"
      ]
    }
  }
}
```

After adding this, your Claude Code session can query your database directly:

```bash
claude-glm "what tables exist in the database and how are they related?"
```

## Add a custom MCP server

If you have a custom MCP server (for example, an internal API wrapper), point to its binary:

```json
{
  "mcpServers": {
    "internal-api": {
      "command": "/usr/local/bin/my-mcp-server",
      "args": ["--port", "8080"],
      "env": {
        "API_TOKEN": "your-token-here"
      }
    }
  }
}
```

The `env` block lets you pass environment variables to the MCP server process without leaking them into your shell.

## Verify MCP servers are running

Start a session and check:

```bash
claude-glm
# Inside the session, type:
/mcp
```

This lists all connected MCP servers and their available tools. If a server is missing, check the config path and restart the session.

## Isolate MCP servers per instance

Some MCP servers should only be available to specific providers. For example, a production database server should not be accessible from an experimental sandbox instance.

Keep auto-sync off for that instance and configure MCP servers in its own `settings.json`:

```bash
# Production instance: has database access
~/.claude-glm/settings.json          # includes postgres MCP server

# Sandbox instance: no database access
~/.claude-sandbox/settings.json      # no postgres MCP server
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| MCP server not loading | Check the command path in `settings.json` |
| Permission denied | Make sure the MCP binary is executable (`chmod +x`) |
| Connection refused | Verify the server is running and the port is correct |
| Server loads but no tools | Check the server logs for errors during startup |

## Next steps

- [Separate configs for personal and work](/guides/personal-work-isolation/)
- [Compare providers side by side](/guides/benchmark-providers/)
