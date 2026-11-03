---
title: Configuration
description: "Configuration reference for claude-multi 0.13.x: the instance registry, settings.json, .claude.json, plugin tracking, health status, and migration backups."
---

## Config registry

claude-multi tracks all instances in a central registry at `~/.claude-multi/config.json`. The file holds names and paths, not API keys.

```json
{
  "instances": [
    {
      "name": "deepseek",
      "configDir": "/Users/you/.claude-deepseek",
      "binaryPath": "/Users/you/.local/bin/claude-deepseek",
      "createdAt": "2026-10-31T10:00:00.000Z",
      "autoSync": false,
      "syncMode": "full-manual",
      "createdWithVersion": "0.13.0",
      "providerTemplate": "deepseek"
    },
    {
      "name": "mimo-sg",
      "configDir": "/Users/you/.claude-mimo-sg",
      "binaryPath": "/Users/you/.local/bin/claude-mimo-sg",
      "createdAt": "2026-10-31T10:05:00.000Z",
      "autoSync": true,
      "syncMode": "auto",
      "createdWithVersion": "0.13.0",
      "providerTemplate": "mimo-token",
      "providerRegion": "sgp"
    }
  ],
  "version": "2.0.0",
  "instanceMigrationVersion": "0.13.0"
}
```

### Registry fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | `string` | Config format version. `2.0.0` is current |
| `instanceMigrationVersion` | `string` | Last claude-multi version whose instance migrations ran |
| `migrationMeta` | `object` | Present after a schema migration runs |
| `migrationMeta.migrationStatus` | `string` | `pending`, `failed`, or `completed` |
| `migrationMeta.lastMigrationAt` | `string` | ISO 8601 timestamp of the last migration attempt |
| `migrationMeta.migratedFromVersion` | `string` | Config version before the migration |
| `migrationMeta.failureInfo` | `object` | Failed step, error message, timestamp, and whether a retry is possible |
| `instances` | `array` | All registered instances |

### Instance fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Instance name. Letters, numbers, hyphens, and underscores |
| `configDir` | `string` | Absolute path to the instance's config directory |
| `binaryPath` | `string` | Absolute path to the generated wrapper |
| `createdAt` | `string` | ISO 8601 creation timestamp |
| `autoSync` | `boolean` | Deprecated. `false` maps to `full-manual`; any other value falls back to `auto` |
| `syncMode` | `string` | `auto`, `half-manual`, or `full-manual`. Takes priority over `autoSync` |
| `createdWithVersion` | `string` | claude-multi version that created the instance. Instances from before version tracking show `0.5` |
| `providerTemplate` | `string` | Optional template name, such as `glm` or `mimo-token` |
| `providerRegion` | `string` | Optional region for `mimo-token`: `cn`, `sgp`, or `ams` |

If `syncMode` is missing, claude-multi reads `autoSync` for backward compatibility. `autoSync: false` resolves to `full-manual`. Everything else resolves to `auto`.

---

## Instance settings

Each instance has its own `settings.json` at `~/.claude-<name>/settings.json`. This is the same format Claude Code uses natively.

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "API_TIMEOUT_MS": "3000000",
    "ANTHROPIC_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "deepseek-flash[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-flash",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-flash",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "786432",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": "128000",
    "CLAUDE_CODE_EFFORT_LEVEL": "max",
    "CLAUDE_CODE_ALWAYS_ENABLE_EFFORT": "1",
    "MAX_THINKING_TOKENS": "32000"
  },
  "enabledPlugins": {
    "some-plugin@claude-plugins-official": true,
    "another-plugin@claude-plugins-official": false
  },
  "mcpServers": {
    "my-server": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/server.js"]
    }
  }
}
```

### `env` object

`env` holds the environment variables Claude Code receives when it launches for this instance. Provider templates fill the provider-specific keys, and each instance's file has its own `ANTHROPIC_AUTH_TOKEN` entry. [Environment variables](/docs/environment-variables/) documents every key and the values each template ships with.

### `enabledPlugins` object

Map of plugin keys to enabled or disabled state. Claude Code uses the `plugin-id@marketplace-name` form. The map lists the plugins with an explicit state, whether you toggled them by hand or copied them from `~/.claude`.

### `mcpServers` object

Map of MCP server names to their configuration. The `type` field accepts `stdio`, `http`, and `sse`.

```json
{
  "stdio-server": {
    "type": "stdio",
    "command": "node",
    "args": ["path/to/server.js"],
    "env": { "SOME_VAR": "value" }
  },
  "http-server": {
    "type": "http",
    "url": "http://localhost:3000/mcp"
  }
}
```

MCP entries are not symlinked. They stay in the instance's own settings file regardless of sync mode. See [Plugins and MCP](/docs/plugins-mcp/) for the management commands.

---

## Instance state

Each instance has a `.claude.json` at `~/.claude-<name>/.claude.json`. claude-multi writes it during setup so Claude Code skips its first-run wizard.

```json
{
  "numStartups": 1,
  "installMethod": "global",
  "autoUpdates": true,
  "hasSeenTasksHint": true,
  "hasCompletedOnboarding": true,
  "lastOnboardingVersion": "2.0.31",
  "firstStartTime": "2026-10-31T10:00:00.000Z",
  "userID": "64-character-hex-string",
  "promptQueueUseCount": 0,
  "sonnet45MigrationComplete": true,
  "opus45MigrationComplete": true,
  "thinkingMigrationComplete": true,
  "sonnet1m45MigrationComplete": true,
  "opusProMigrationComplete": true,
  "migrationVersion": 13
}
```

`hasCompletedOnboarding: true` skips the first-run wizard. `userID` is 32 random bytes encoded as hex. Claude Code adds other fields as you use the instance, so treat this file as Claude Code state rather than a claude-multi config file.

---

## Plugin tracking

claude-multi tracks installed plugins in `~/.claude-<name>/plugins/installed_plugins.json`. The file uses v2 format, where each plugin key maps to an array of install records.

```json
{
  "version": 2,
  "plugins": {
    "some-plugin@claude-plugins-official": [
      {
        "scope": "user",
        "installPath": "/Users/you/.claude-deepseek/plugins/marketplaces/claude-plugins-official",
        "version": "1.0.0",
        "installedAt": "2026-10-31T10:00:00.000Z",
        "lastUpdated": "2026-10-31T10:00:00.000Z"
      }
    ]
  }
}
```

`installPath` points at the marketplace directory, not the individual plugin directory. The plugin files themselves live under `plugins/marketplaces/claude-plugins-official/plugins/<plugin-id>/` or `external_plugins/<plugin-id>/`.

---

## Health status

Health issues are stored at `~/.claude-multi/health-status.json`:

```json
{
  "lastChecked": "2026-10-31T10:00:00.000Z",
  "issues": [
    {
      "id": "broken-symlinks-deepseek",
      "severity": "warning",
      "category": "symlink",
      "title": "Broken symlinks",
      "message": "Instance 'deepseek' has broken symlinks: plugins",
      "detail": "plugins",
      "instanceName": "deepseek",
      "timestamp": "2026-10-31T10:00:00.000Z",
      "dismissed": false,
      "resolved": false,
      "resolutionHint": "Re-sync symlinks from the home screen"
    }
  ]
}
```

Severity is `error`, `warning`, or `info`. You can dismiss issues from the TUI health screen. claude-multi finds them again on the next check if the problem is still there.

---

## Migration backups

When the config format changes or an instance migration runs, claude-multi creates a timestamped backup directory:

```
~/.claude-multi/backups/
└── 2026-10-31T10-00-00-000Z-a1b2-v2.0.0-to-v2.0.0/
    ├── config.json
    └── instances/
        ├── deepseek/
        │   └── settings.json
        └── glm/
            └── settings.json
```

The directory name includes the timestamp, a short random suffix, and the source and target config versions. Each backup contains the registry and every instance's `settings.json`. claude-multi keeps the newest three backup directories and deletes older ones.

---

## File locations summary

| Path | Purpose |
|------|---------|
| `~/.claude-multi/config.json` | Instance registry |
| `~/.claude-multi/health-status.json` | Health issue tracking |
| `~/.claude-multi/backups/` | Migration backups, newest three kept |
| `~/.claude-multi/.migration.lock` | PID-based migration lock |
| `~/.claude-<name>/settings.json` | Per-instance env, plugins, and MCP servers |
| `~/.claude-<name>/.claude.json` | Per-instance Claude Code state |
| `~/.claude-<name>/plugins/` | Plugins, symlinked or copied |
| `~/.claude-<name>/skills/` | Skills, symlinked or copied |
| `~/.claude-<name>/projects/` | Conversation history |
| `~/.local/bin/claude-<name>` | Wrapper script on macOS and Linux |

See [How it works](/docs/how-it-works/) for the full layout, including Windows paths.

Reviewed 2026-10-31

## Related

- [How it works](/docs/how-it-works/)
- [Environment variables](/docs/environment-variables/)
- [Plugins and MCP](/docs/plugins-mcp/)
- [Troubleshooting](/docs/troubleshooting/)
