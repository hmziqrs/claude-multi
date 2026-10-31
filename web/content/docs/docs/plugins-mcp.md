---
title: Plugins and MCP
description: Install plugins and configure MCP servers across claude-multi instances, with sync modes, collision checks, and verification steps.
---

## Plugins vs MCP

Plugins and MCP servers are different things, and claude-multi handles them differently.

A plugin is a directory of skills, commands, agents, hooks, or MCP server definitions. It lives under the instance's `plugins/` directory. Depending on the sync mode, that directory is a symlink to `~/.claude/plugins`, a directory of per-item symlinks, or a real copy.

An MCP server is a single entry in the instance's `settings.json` under `mcpServers`. It describes how Claude Code starts or connects to a server: a command and args for stdio, or a URL for HTTP and SSE. claude-multi does not symlink individual MCP entries. It edits the settings file.

A plugin can carry its own MCP server in a `.mcp.json` file. That server arrives with the plugin. Servers you add yourself live only in the instance whose settings file you edited.

## Plugin storage

Internal plugins live under `plugins/marketplaces/claude-plugins-official/plugins/`. External plugins live under `external_plugins/` in the same marketplace directory.

```
~/.claude-deepseek/plugins/
├── installed_plugins.json
└── marketplaces/
    └── claude-plugins-official/
        ├── known_marketplaces.json
        ├── blocklist.json
        ├── plugins/
        │   └── some-plugin/
        │       ├── .claude-plugin/plugin.json
        │       └── .mcp.json
        └── external_plugins/
            └── another-plugin/
                ├── .claude-plugin/plugin.json
                └── .mcp.json
```

`installed_plugins.json` is the v2 tracking file. It maps a plugin key to an array of install records with scope, install path, version, and timestamps.

## Listing plugins

From the TUI, select **Manage plugins**, pick an instance, and choose **List installed plugins**.

From the CLI:

```bash
# List plugins available in ~/.claude, with category and MCP badges
claude-multi plugins list-defaults

# List installed plugins for one instance
claude-multi plugins list-installed deepseek

# List enabled plugins for one instance
claude-multi plugins list deepseek
```

`plugins list` with no instance shows the default setup and every instance. `plugins list-installed` with no instance shows every instance.

## Installing a plugin

`plugins install` copies plugin files from `~/.claude` into one instance. It works only in `full-manual` mode, because `auto` and `half-manual` use symlinks.

From the TUI, select **Manage plugins**, pick an instance, then **Install plugins from default**. Use `space` to toggle plugins and `enter` to confirm.

From the CLI:

```bash
claude-multi plugins install deepseek some-plugin
```

Before copying, claude-multi checks whether the plugin would register an MCP server name that another installed plugin already uses. If it finds a collision, it prints a warning and then continues. Run `check-collisions` first if you want to stop before writing.

`plugins install` refuses to run while a Claude Code session is open on the target instance.

## Enabling and disabling

These commands change the plugin map in `settings.json`. They do not move files.

```bash
claude-multi plugins enable deepseek some-plugin@claude-plugins-official
claude-multi plugins disable deepseek some-plugin@claude-plugins-official
```

Claude Code stores plugin keys in `plugin-id@marketplace-name` form. Plugins from the official marketplace use `@claude-plugins-official`. Pass the full key to `enable` and `disable`; `install` and `remove` take the bare plugin ID.

## Copying the enabled plugin list

`plugins copy` takes one instance name. It reads `enabledPlugins` from `~/.claude/settings.json` and writes that map into the instance's `settings.json`.

```bash
claude-multi plugins copy deepseek
```

It does not copy plugin files, and there is no instance-to-instance form. Use `plugins install` for files, or edit the two settings files directly if you need a different mapping.

## Removing a plugin

```bash
claude-multi plugins remove deepseek some-plugin
```

Removal works only in `full-manual` mode. claude-multi renames the plugin directory to a temporary `.removing` path, deletes it, and restores it if the delete fails. It also removes the plugin from `installed_plugins.json`.

## Collision detection

```bash
claude-multi plugins check-collisions deepseek some-plugin
```

This checks whether the named plugins register an MCP server name that is already used by an installed plugin. It compares names, not server contents. The command exits with status 1 when it finds a collision.

## Sync modes and symlinks

Sync has three modes, which control how an instance's `plugins/` and `skills/` relate to `~/.claude/`:

| Mode | What the instance gets |
|------|------------------------|
| `auto` | Whole-directory symlinks to `~/.claude/plugins` and `~/.claude/skills`. Install and remove are blocked. |
| `half-manual` | Real directories with per-item symlinks to each plugin and skill. New installs in `~/.claude` do not appear until a re-sync. Install and remove are blocked. |
| `full-manual` | Independent copies with no symlinks. Per-plugin operations work. |

Conversions are one-way: `auto` to `half-manual` to `full-manual`. claude-multi rejects upgrades because reconciling directories that have diverged is a data-loss problem.

```bash
claude-multi auto-sync deepseek full-manual
```

Legacy `on` and `off` still work (`on` maps to `auto`, `off` maps to `full-manual`). See [Sync modes](/docs/usage/#sync-modes) for the full command reference.

If you move or delete `~/.claude`, symlinks across every synced instance break. Rebuild them with:

```bash
claude-multi fix-symlinks deepseek
claude-multi fix-symlinks --all
```

From the TUI, **Re-sync symlinks** does the same thing.

## End-to-end: install a plugin and verify it

This example installs a plugin into a `deepseek` instance running in `full-manual` mode.

1. Find the plugin ID.

   ```bash
   claude-multi plugins list-defaults
   ```

2. Switch the instance to `full-manual` if it is still synced. Skip this if `claude-multi info deepseek` already shows full-manual.

   ```bash
   claude-multi auto-sync deepseek full-manual
   ```

3. Install the plugin.

   ```bash
   claude-multi plugins install deepseek some-plugin
   ```

4. Enable it.

   ```bash
   claude-multi plugins enable deepseek some-plugin@claude-plugins-official
   ```

5. Verify the files and tracking entry.

   ```bash
   claude-multi plugins list-installed deepseek
   ```

   The plugin should appear with a checkmark and an `[ext]` badge when it came from `external_plugins/`. You can also inspect `~/.claude-deepseek/plugins/installed_plugins.json`.

6. Start the instance and use the plugin's skill or command.

   ```bash
   claude-deepseek
   ```

   Plugin skills and commands load from the instance's own `plugins/` directory. If the plugin ships an MCP server, run `/mcp` to confirm the server connected.

## MCP server management

### Listing MCP servers

From the TUI, select **MCP servers**, then **List MCP servers with sources**.

From the CLI:

```bash
# Every instance
claude-multi mcp list

# One instance
claude-multi mcp list deepseek
```

The output shows each server's transport type and, for stdio servers, the command and args. For HTTP and SSE servers it shows the URL.

### Copying MCP servers between instances

```bash
claude-multi mcp copy
```

The command prompts for a source and a target. It replaces the target's `mcpServers` block with the source's block. It does not merge the two.

From the TUI, select **MCP servers**, then **Copy between instances**.

### Verifying MCP configs

```bash
claude-multi mcp verify deepseek
```

This checks config shape. A stdio entry needs a `command`; an HTTP or SSE entry needs a `url`. It does not start the server or test the connection. Use `/mcp` inside a session for that.

### Adding an MCP server

From the TUI, select **MCP servers**, pick an instance, then **Add custom MCP server**. Enter a name and the JSON config.

From the CLI or an editor, add the entry to `~/.claude-<name>/settings.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/projects/my-app"]
    },
    "internal-api": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

MCP servers load when a Claude Code session starts. Save the file, then restart the instance.

### End-to-end: add a server and check it

1. Add the server entry to `~/.claude-deepseek/settings.json` as shown above, or use **Add custom MCP server** in the TUI.
2. Check that the entry has the fields its transport needs.

   ```bash
   claude-multi mcp verify deepseek
   ```

3. Restart the instance.

   ```bash
   claude-deepseek
   ```

4. Run `/mcp` inside the session. It lists connected servers and their tools.

If the server is missing from `/mcp`, the problem is usually the command path, a missing executable, or a port that is not listening. `mcp verify` will not catch those because it only reads the config.

### Keeping servers per instance

Some servers should reach only specific instances. A production database server has no business being reachable from a sandbox instance. Configure it in that instance's `settings.json` only. Sync mode does not change this, since MCP entries are never symlinked.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Server not loading | Check the command path in `settings.json` and confirm the command runs in your shell |
| Permission denied | Make the MCP binary executable (`chmod +x`) |
| Connection refused | Verify the server is running and the port is correct |
| Server loads but no tools | Check the server's own logs for startup errors |
| Plugin install blocked | Switch the instance to `full-manual` and close any open session |

See [Troubleshooting](/docs/troubleshooting/) for PATH, auth, and migration issues. See [Configuration](/docs/configuration/) for the full `settings.json` layout.

Reviewed 2026-10-31

## Related

- [Usage](/docs/usage/)
- [Configuration](/docs/configuration/)
- [Troubleshooting](/docs/troubleshooting/)
- [Environment variables](/docs/environment-variables/)
