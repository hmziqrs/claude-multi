---
question: "How do I troubleshoot broken instances?"
description: "The built-in health check finds missing directories, broken symlinks, corrupted settings, and failed migrations, and suggests a fix for each."
category: "Troubleshooting"
order: 9
---

claude-multi has a health monitor. Press `!` in the TUI, watch for the warning banner on the main menu, or run `claude-multi list`. It reports missing config directories, deleted wrapper scripts, broken symlinks, corrupted `settings.json`, and failed migrations, each with a suggested fix. It won't change anything without asking.

Broken symlinks are the most common problem. Repair them across every instance:

```sh
claude-multi fix-symlinks
```

You can also target specific instances: `claude-multi fix-symlinks deepseek glm`.

The troubleshooting guide covers every check, the recovery steps, and how migrations roll back from `.bak` files.

## Related questions

- [How does plugin syncing work?](/faq/#plugin-syncing): understanding symlinks and auto-sync
- [How do I create a new instance?](/faq/#create-instance): recreating a corrupted instance

## More info

- [/docs/troubleshooting/](/docs/troubleshooting/): full troubleshooting guide
- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/): health warnings and fix-symlinks sections
- [src/health.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/health.ts): health check implementation
