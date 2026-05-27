---
question: "How does plugin and skill syncing work?"
description: "When auto-sync is enabled, plugins and skills directories in each instance are symlinked to ~/.claude — update once, every instance sees it."
category: "Plugins & MCP"
order: 6
---

Claude Code stores plugins and skills in `~/.claude/plugins/` and `~/.claude/skills/`. If every instance had its own copies, you'd need to update each one separately. Auto-sync fixes this with **symlinks**.

## How auto-sync works

When auto-sync is enabled on an instance, claude-multi creates symlinks:

```
~/.claude-multi/deepseek/plugins/  →  ~/.claude/plugins/
~/.claude-multi/deepseek/skills/   →  ~/.claude/skills/
```

Install or update a plugin in your primary `~/.claude` install, and every auto-synced instance picks it up immediately.

## Toggling auto-sync

From the TUI, select **Toggle auto-sync** and pick an instance to enable or disable it.

From the CLI:

```sh
claude-multi auto-sync deepseek on
claude-multi auto-sync deepseek off
```

## Fixing broken symlinks

If symlinks break (e.g. you moved `~/.claude`), the **fix-symlinks** command repairs them:

```sh
claude-multi fix-symlinks
```

Or from the TUI, select **Re-sync symlinks**.

## Plugin collision detection

When multiple instances have different versions of the same plugin (e.g. one symlinked, one copied), conflicts can arise. The plugin manager includes collision detection:

```sh
claude-multi plugins check-collisions
```

This scans all instances and reports any plugins that exist in multiple locations with different content.

## References

| Resource | Link |
|----------|------|
| **Plugins & MCP docs** | [/docs/plugins-mcp/](/docs/plugins-mcp/) — plugin and MCP management guide |
| **Blog: Every TUI menu** | [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/) — Manage Plugins and Toggle Auto-sync sections |
| **In-app: Manage plugins** | Run `claude-multi` and select **Manage plugins** |
| **In-app: Toggle auto-sync** | Run `claude-multi` and select **Toggle auto-sync** |
| **In-app: Re-sync symlinks** | Run `claude-multi` and select **Re-sync symlinks** |
| **GitHub: Config (symlink logic)** | [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) — `syncPlugins()`, `syncSkills()`, and symlink repair functions |
| **GitHub: ManagePlugins screen** | [src/ink/screens/ManagePlugins.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/ManagePlugins.tsx) — TUI plugin management |
