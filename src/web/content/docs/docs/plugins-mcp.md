---
title: Plugins & MCP
description: Plugin and MCP server management across instances
---

## Plugin management

Claude Code keeps plugins in `~/.claude/plugins/`. Each claude-multi instance can have its own set of plugins, either symlinked from `~/.claude` (auto-sync) or independently installed.

### How plugins are stored

Each instance has a `plugins/` directory in its config dir:

```
~/.claude-deepseek/plugins/
├── some-plugin/              # actual plugin files
│   ├── plugin.json
│   └── ...
└── external_plugins/         # external plugins live here
    └── another-plugin/
        ├── plugin.json
        └── ...
```

Plugin state is tracked in `installed_plugins.json` (v2 format) with scope, install path, version, and timestamps.

### Listing plugins

**TUI:** Select **Manage plugins**, pick an instance, and see all installed plugins with their status.

**CLI:**

```bash
# List all available default plugins
claude-multi plugins list-defaults

# List installed plugins for a specific instance
claude-multi plugins list-installed deepseek
```

Default plugins show category badges (`[internal]` / `[ext]`) and MCP indicators when a plugin provides MCP servers.

### Installing plugins

**TUI:** Select **Manage plugins** → pick an instance → **Install** → multi-select from the list. `space` toggles, `enter` confirms.

**CLI:**

```bash
claude-multi plugins install deepseek <plugin-id> [<plugin-id>...]
```

Before installing, claude-multi runs collision detection, if a new plugin would conflict with an existing one (same MCP server name, different content), you'll be warned before anything is committed.

### Enabling and disabling

Toggle a plugin without uninstalling it:

```bash
claude-multi plugins enable deepseek <plugin-id>
claude-multi plugins disable deepseek <plugin-id>
```

### Copying between instances

Copy one or more plugins from one instance to another:

```bash
claude-multi plugins copy <source-instance> <dest-instance> <plugin-id> [<plugin-id>...]
```

### Removing plugins

```bash
claude-multi plugins remove deepseek <plugin-id> [<plugin-id>...]
```

Removal uses a rename-to-backup safety pattern, the plugin directory is renamed rather than deleted outright.

### Collision detection

If you've installed the same plugin in multiple places (one symlinked, one copied, different versions), MCP server names might conflict:

```bash
claude-multi plugins check-collisions deepseek <plugin-id> [<plugin-id>...]
```

This scans for plugins that share an MCP server name but have different content.

### Auto-sync and symlinks

Sync has three modes. They control how an instance's `plugins/` and `skills/` relate to `~/.claude/`:

- **`auto`** — `plugins/` and `skills/` are symlinked whole to `~/.claude/`. Install or update a plugin once and every synced instance sees it immediately. Per-plugin operations (install/remove/enable/disable) aren't available, since changes happen at the source.
- **`half-manual`** — real directories, but each plugin and skill inside is individually symlinked back to `~/.claude/`. You keep the existing set, but new installs in `~/.claude` don't appear until you re-sync. Per-plugin management is blocked here too.
- **`full-manual`** — independent copies. No symlinks. The instance can drift freely from `~/.claude/`, and all per-plugin operations work.

```bash
# Set or change the mode
claude-multi auto-sync deepseek auto
claude-multi auto-sync deepseek half-manual
claude-multi auto-sync deepseek full-manual

# Legacy on/off still works (on → auto, off → full-manual)
claude-multi auto-sync deepseek on
claude-multi auto-sync deepseek off
```

Conversions are one-way: `auto` → `half-manual` → `full-manual`. You can't step back up, because reconciling directories that have diverged is a data-loss problem.

### Repairing broken symlinks

If you move or delete `~/.claude`, symlinks across every synced instance break. Rebuild them with:

```bash
claude-multi fix-symlinks [names...]
```

Run it for specific instances, or with `-a`/`--all` across all of them. From the TUI, **Re-sync symlinks** does the same thing.

---

## MCP server management

MCP (Model Context Protocol) servers let Claude Code talk to external tools, databases, APIs, file systems, and anything else you wire up. Each instance can have its own MCP server configuration.

### Listing MCP servers

**TUI:** Select **MCP servers** from the main menu.

**CLI:**

```bash
claude-multi mcp list
```

Shows MCP server configs across all instances so you can see at a glance what's connected where.

### Copying between instances

Set up an MCP server in one instance and want it in another:

```bash
claude-multi mcp copy
```

From the TUI, select **MCP servers** → **Copy**. Pick source and destination instances.

### Verifying configs

MCP server configs can go stale if a server binary gets moved or removed:

```bash
claude-multi mcp verify
```

Checks that referenced executables and paths still exist.

### Adding MCP servers

**TUI:** Select **MCP servers** → pick an instance → **Add custom server**. Enter the server name and JSON config.

MCP configs use the same format as Claude Code's native MCP config, no abstraction layer added.

### Where configs live

Each instance stores MCP server configuration in its own `settings.json`:

```
~/.claude-deepseek/settings.json → mcpServers field
```

### Setting up MCP during instance creation

When creating a new instance through the TUI, the Copy Options step lets you bring over MCP server configs from your default `~/.claude` install. Use `--copy-mcp` on the CLI:

```bash
claude-multi add new-instance --provider deepseek --api-key sk-... --copy-mcp
```

### Example: filesystem and database servers

Edit an instance's `settings.json` directly to add a server manually:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects/my-app"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost:5432/mydb"]
    }
  }
}
```

Restart the instance and the servers load automatically. Inside a session, `/mcp` lists every connected server and its available tools.

### Isolating servers per instance

Some servers should only reach specific providers, a production database server has no business being reachable from an experimental sandbox instance. Keep auto-sync off for that instance and configure MCP servers only in its own `settings.json`:

```
~/.claude-glm/settings.json          # includes the postgres MCP server
~/.claude-sandbox/settings.json      # no postgres MCP server
```

### Troubleshooting

| Problem | Fix |
|---------|-----|
| Server not loading | Check the command path in `settings.json` |
| Permission denied | Make sure the MCP binary is executable (`chmod +x`) |
| Connection refused | Verify the server is running and the port is correct |
| Server loads but no tools | Check the server's own logs for startup errors |
