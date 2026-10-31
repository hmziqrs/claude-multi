---
question: "How does plugin and skill syncing work?"
description: "With auto-sync on, claude-multi symlinks each instance's plugins and skills directories to ~/.claude. Update once, every instance sees it."
category: "Plugins & MCP"
order: 6
---

Auto-sync symlinks each instance's `plugins/` and `skills/` directories to your primary `~/.claude`, so you install or update a plugin once and every synced instance sees it. Toggle it per instance:

```sh
claude-multi auto-sync deepseek on
claude-multi auto-sync deepseek off
```

`on` maps to auto-sync. `off` maps to full-manual.

If a symlink breaks after you move `~/.claude`, restore the directory if needed, then repair it with:

```sh
claude-multi fix-symlinks --all
```

You can select instances interactively by running `claude-multi fix-symlinks` with no arguments, or use **Re-sync symlinks** in the TUI.

#### Sync modes

There are three modes: auto, half-manual, and full-manual. Auto symlinks the whole `plugins/` and `skills/` directories. Half-manual creates real directories and symlinks individual plugins and skills, so new items installed later in `~/.claude` do not appear automatically. Full-manual replaces the symlinks with real copies and leaves the instance independent.

Conversions only go one way: auto to half-manual to full-manual. You cannot move back up, because reconciling directories that have diverged can lose data. The [plugins and MCP guide](/docs/plugins-mcp/) covers the modes and collision detection.
