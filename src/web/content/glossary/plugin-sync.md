---
title: "Plugin Sync"
description: "A mechanism that keeps plugins and skills consistent across claude-multi instances using symlinks, so you update once and every instance gets the change."
term: "Plugin Sync"
category: "Architecture"
related:
  - "instance-isolation"
  - "config-directory"
  - "mcp-server"
---

Plugin sync keeps your installed Claude Code plugins and skills identical across all claude-multi instances. Instead of manually installing the same plugin in each instance, you install it once and sync propagates it.

## How it works

claude-multi uses symlinks. When you enable auto-sync during instance creation (or run the sync command later), it creates symbolic links from each instance's plugin directory back to the primary `~/.claude` install's plugin directory.

This means:

- Updating a plugin in your primary install updates it everywhere
- Adding a new plugin to the primary install makes it available to all synced instances
- No copying, no version drift, no forgotten updates

## Collision detection

If an instance already has a plugin with the same name but different content, claude-multi detects the collision and warns you before overwriting. You can choose to keep the local version or replace it with the symlinked one.

## Manual sync

```sh
claude-multi sync
```

From the TUI, select **Plugins** and choose sync. It walks through all instances and aligns their plugin directories.

## What gets synced

Plugins, skills, and any other content stored in the `plugins` directory under the instance's config dir. MCP server configs are managed separately through the MCP commands.

## Opt-in

Sync is not forced. You can have some instances synced and others fully independent. The choice is made during instance creation or changed later through the TUI.
