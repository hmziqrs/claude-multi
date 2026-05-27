---
question: "How do I troubleshoot broken instances?"
description: "Use the built-in health check system to detect and fix missing directories, broken symlinks, corrupted settings, and migration failures."
category: "Troubleshooting"
order: 9
---

claude-multi has a health monitoring system that scans all your instances and surfaces problems. It won't fix things without asking — it shows you what's wrong and suggests how to fix it.

## Running health checks

In the TUI, a warning banner appears at the top of the main menu when issues are detected. Press `!` to jump straight to the health screen, which lists everything it found across all instances.

You can also see health status when listing instances:

```sh
claude-multi list
```

## What gets checked

| Problem | What happened | How to fix |
|---------|--------------|------------|
| Config directory missing | Instance dir was deleted outside claude-multi | Remove the instance from the registry, or recreate the directory |
| Binary not found | Wrapper script was deleted | Re-create the instance or run `claude-multi sync` |
| Corrupted settings.json | Invalid JSON in the config file | Fix or delete the corrupted file |
| Broken symlinks | Plugin/skill links point to nonexistent targets | Run `claude-multi fix-symlinks` |
| Migration failed | Config schema migration was interrupted | The health screen offers retry/restore options |

## Common fixes

### Symlinks

```sh
claude-multi fix-symlinks
```

Repairs symlinks across all instances. Target specific ones with `claude-multi fix-symlinks deepseek glm`.

### Corrupted config

If a settings file is too far gone, remove and recreate the instance:

```sh
claude-multi remove broken-instance
claude-multi add broken-instance --provider deepseek --api-key sk-your-key
```

Your conversation history lives in `~/.claude-multi/broken-instance/projects/` — it's separate from config, so back it up before removing if you want to keep it.

### Migration failures

Migrations create backups before touching anything. If one fails:

1. Check `~/.claude-multi/config.json` for migration status flags
2. Look for `.bak` files in the instance directory
3. The health screen will show the specific error and offer to retry or restore from backup

## More info

- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/) — health warnings and fix-symlinks sections
- [/docs/usage/](/docs/usage/) — CLI command reference
- Run `claude-multi` and press `!` (or watch for the warning banner)
- [src/health.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/health.ts) — health check implementation
- [src/ink/screens/HealthScreen.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/HealthScreen.tsx) — TUI health screen
- [src/migration.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/migration.ts) — config migration with backups
