---
question: "How do I troubleshoot broken instances?"
description: "The built-in health check finds missing directories, broken symlinks, corrupted settings, and failed migrations, and suggests a fix for each."
category: "Troubleshooting"
order: 9
---

claude-multi has a health monitor. Press `!` in the TUI when the warning banner appears, or run:

```sh
claude-multi doctor check
```

It reports missing config directories, deleted wrapper scripts, broken symlinks, corrupted `settings.json`, and failed migrations, each with a suggested fix. It does not change anything unless you run `claude-multi doctor fix`.

Broken symlinks are a common problem. Repair them across every instance:

```sh
claude-multi fix-symlinks --all
```

To target specific instances:

```sh
claude-multi fix-symlinks deepseek glm
```

With no arguments, `fix-symlinks` opens a multiselect prompt. Full-manual instances have no symlinks to repair, so the command reports nothing to fix.

The [troubleshooting guide](/docs/troubleshooting/) covers every check, the recovery steps, and how to restore a migration backup from `~/.claude-multi/backups/`. The checks are implemented in [src/health.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/health.ts).
