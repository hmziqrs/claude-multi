---
question: "How does plugin and skill syncing work?"
description: "With auto-sync on, claude-multi symlinks each instance's plugins and skills directories to ~/.claude. Update once, every instance sees it."
category: "Plugins & MCP"
order: 6
---

Auto-sync symlinks each instance's `plugins/` and `skills/` directories back to your primary `~/.claude`, so you install or update a plugin once and every synced instance picks it up immediately. Toggle it per instance:

```sh
claude-multi auto-sync deepseek on
claude-multi auto-sync deepseek off
```

If symlinks break (you moved or deleted `~/.claude`), repair them with `claude-multi fix-symlinks`, or use **Re-sync symlinks** in the TUI.

Sync has three modes (auto / half-manual / full-manual), and conversions only go one way: you can step down from auto to half-manual to full-manual, but not back up. The plugins and MCP guide has the full mechanism, the mode comparison, and how collision detection works.

## Related questions

- [How do I manage MCP servers?](/faq/#mcp-servers): MCP configs work independently per instance
- [How do I troubleshoot broken instances?](/faq/#troubleshooting): fixing broken symlinks and more

## More info

- [/docs/plugins-mcp/](/docs/plugins-mcp/): plugin and MCP management guide
- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/): Manage Plugins and Sync mode screens
