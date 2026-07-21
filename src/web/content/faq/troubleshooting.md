---
question: "How do I troubleshoot broken instances?"
description: "Use the built-in health check system to detect and fix missing directories, broken symlinks, corrupted settings, and migration failures."
category: "Troubleshooting"
order: 9
---

claude-multi has a health monitor. Press `!` in the TUI (or watch for the warning banner on the main menu), or run `claude-multi list`. It surfaces missing config directories, deleted wrapper scripts, broken symlinks, corrupted `settings.json`, and failed migrations, each with a suggested fix. It won't change anything without asking.

The most common issue is broken symlinks. Repair them across every instance:

```sh
claude-multi fix-symlinks
```

You can also target specific instances: `claude-multi fix-symlinks deepseek glm`.

For the full set of checks, recovery steps, and how migrations roll back from `.bak` files, see the troubleshooting guide.

## Related questions

- [How does plugin syncing work?](/faq/#plugin-syncing): understanding symlinks and auto-sync
- [How do I create a new instance?](/faq/#create-instance): recreating a corrupted instance

## More info

- [/docs/troubleshooting/](/docs/troubleshooting/): full troubleshooting guide
- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/): health warnings and fix-symlinks sections
- [src/health.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/health.ts): health check implementation
