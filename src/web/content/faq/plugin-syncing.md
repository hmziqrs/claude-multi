---
question: "How does plugin and skill syncing work?"
description: "When auto-sync is enabled, plugins and skills directories in each instance are symlinked to ~/.claude, update once, every instance sees it."
category: "Plugins & MCP"
order: 6
---

Claude Code keeps plugins and skills in `~/.claude/plugins/` and `~/.claude/skills/`. If every instance had its own copies, you'd need to update each one separately. Auto-sync avoids that with symlinks.

## What auto-sync does

When it's enabled on an instance, claude-multi creates symlinks pointing back to your primary install:

```
~/.claude-multi/deepseek/plugins/  →  ~/.claude/plugins/
~/.claude-multi/deepseek/skills/   →  ~/.claude/skills/
```

Install or update a plugin once in `~/.claude`, and every synced instance picks it up immediately.

## Turning it on and off

From the TUI: select **Toggle auto-sync** and pick an instance.

From the CLI:

```sh
claude-multi auto-sync deepseek on
claude-multi auto-sync deepseek off
```

## When symlinks break

If you move or delete `~/.claude`, the symlinks point to nothing. Fix them with:

```sh
claude-multi fix-symlinks
```

You can also target specific instances: `claude-multi fix-symlinks deepseek glm`.

From the TUI, the **Re-sync symlinks** option does the same thing.

## Collision detection

If you've installed the same plugin in multiple places (one symlinked, one copied, different versions), you might get MCP server name collisions. Check for them with:

```sh
claude-multi plugins check-collisions <instance> <plugin-id>...
```

This scans for conflicts and reports any plugins that share an MCP server name but have different content.

## Related questions

- [How do I manage MCP servers?](/faq/#mcp-servers): MCP configs work independently per instance
- [How do I troubleshoot broken instances?](/faq/#troubleshooting): fixing broken symlinks and more

## More info

- [/docs/plugins-mcp/](/docs/plugins-mcp/): plugin and MCP management guide
- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/): Manage Plugins and Toggle Auto-sync screens
- Run `claude-multi` and try **Manage plugins**, **Toggle auto-sync**, or **Re-sync symlinks**
- [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts): `syncPluginsAndSkills()` and symlink repair logic
- [src/ink/screens/ManagePlugins.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/ManagePlugins.tsx): the TUI plugin screen
