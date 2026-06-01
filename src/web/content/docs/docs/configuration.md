---
title: Configuration
description: "Configuration file reference for claude-multi instances: settings.json schema, environment variables, provider template overrides, and plugin management options."
---

## Config registry

All instances are tracked in a central registry:

**Path:** `~/.claude-multi/config.json`

```json
{
  "version": "2",
  "instances": [
    {
      "name": "deepseek",
      "configDir": "/Users/you/.claude-deepseek",
      "binaryPath": "/Users/you/.local/bin/claude-deepseek",
      "createdAt": "2026-05-27T10:00:00.000Z",
      "autoSync": true
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `version` | `string` | Config format version (`"2"` after migration) |
| `instances` | `array` | All registered instances |
| `instances[].name` | `string` | Instance name, letters, numbers, hyphens, underscores |
| `instances[].configDir` | `string` | Absolute path to the instance's config directory |
| `instances[].binaryPath` | `string` | Absolute path to the generated wrapper script |
| `instances[].createdAt` | `string` | ISO 8601 creation timestamp |
| `instances[].autoSync` | `boolean` | Whether plugins/skills are symlinked from `~/.claude` |

---

## Instance settings

Each instance has its own `settings.json` at `~/.claude-<name>/settings.json`. This is the same format Claude Code uses natively.

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-flash",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash"
  },
  "enabledPlugins": {
    "some-plugin": true,
    "another-plugin": false
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

Environment variables set when launching Claude Code for this instance. Provider templates populate this automatically.

| Key | Description |
|-----|-------------|
| `ANTHROPIC_AUTH_TOKEN` | API key for the provider |
| `ANTHROPIC_BASE_URL` | Provider's Anthropic-compatible API endpoint |
| `ANTHROPIC_MODEL` | Primary model (mapped to Claude Code's internal opus slot) |
| `ANTHROPIC_SMALL_FAST_MODEL` | Fast/cheap model (mapped to haiku slot) |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet-tier model |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus-tier model |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku-tier model |
| `API_TIMEOUT_MS` | Request timeout (some templates set this to `600000`) |
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model used by sub-agents for background tasks |
| `CLAUDE_CODE_EFFORT_LEVEL` | Reasoning effort level (`low`, `medium`, `high`, `max`) |

### `enabledPlugins` object

Map of plugin IDs to enabled/disabled state. Only includes plugins that have been explicitly toggled.

### `mcpServers` object

Map of MCP server names to their configuration. Supports `stdio`, `http`, and `sse` transport types.

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
    "url": "http://localhost:3000"
  }
}
```

---

## Instance state

Each instance has a `.claude.json` at `~/.claude-<name>/.claude.json`:

```json
{
  "hasCompletedOnboarding": true,
  "migrationVersion": 2,
  "userID": "generated-uuid"
}
```

This file is created automatically during instance setup. `hasCompletedOnboarding: true` tells Claude Code to skip its first-run wizard.

---

## Plugin tracking

Installed plugins are tracked in `~/.claude-<name>/plugins/installed_plugins.json` (v2 format):

```json
{
  "plugins": {
    "plugin-id": {
      "scope": "internal",
      "installPath": "plugins/plugin-id",
      "version": "1.0.0",
      "installedAt": "2026-05-27T10:00:00.000Z",
      "enabled": true
    }
  }
}
```

---

## Health status

Persistent health issue tracking at `~/.claude-multi/health-status.json`:

```json
{
  "issues": [
    {
      "instanceName": "deepseek",
      "type": "broken_symlink",
      "message": "plugins/some-plugin points to a missing target",
      "detectedAt": "2026-05-27T10:00:00.000Z"
    }
  ]
}
```

Issues can be dismissed from the TUI health screen. They're re-detected on subsequent checks if the underlying problem persists.

---

## Migration backups

When config format changes, backups are stored in `~/.claude-multi/backups/`:

```
~/.claude-multi/backups/
├── config.json.backup.2026-05-27T10-00-00
├── deepseek-settings.json.backup.2026-05-27T10-00-00
└── glm-settings.json.backup.2026-05-27T10-00-00
```

The last 3 backup sets are kept. Older ones are automatically cleaned up.

---

## File locations summary

| Path | Purpose |
|------|---------|
| `~/.claude-multi/config.json` | Instance registry |
| `~/.claude-multi/health-status.json` | Health issue tracking |
| `~/.claude-multi/backups/` | Migration backups |
| `~/.claude-multi/.migration.lock` | PID-based migration lock |
| `~/.claude-<name>/settings.json` | Per-instance settings (env, plugins, MCP) |
| `~/.claude-<name>/.claude.json` | Per-instance state |
| `~/.claude-<name>/plugins/` | Plugins (symlinked or copied) |
| `~/.claude-<name>/skills/` | Skills (symlinked or copied) |
| `~/.claude-<name>/projects/` | Conversation history |
| `~/.local/bin/claude-<name>` | Wrapper script |
