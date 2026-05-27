---
question: "How do I troubleshoot broken instances?"
description: "Use the built-in health check system to detect and fix missing directories, broken symlinks, corrupted settings, and migration failures."
category: "Troubleshooting"
order: 9
---

claude-multi includes a **health monitoring system** that scans all instances for common problems and offers one-click fixes.

## Running health checks

From the TUI, press `!` (when the health indicator is visible) or look for the warning banner at the top of the main menu. The health screen shows all detected issues across every instance.

From the CLI, health status is shown when you list instances:

```sh
claude-multi list
```

## What health checks detect

| Issue | Description | Fix |
|-------|-------------|-----|
| **Missing directory** | Instance directory was deleted outside claude-multi | Remove the instance from the registry |
| **Broken symlinks** | Plugin/skill symlinks point to non-existent targets | Run `claude-multi fix-symlinks` |
| **Corrupted settings** | `settings.json` contains invalid JSON | Restore from backup or recreate |
| **Migration failure** | Config schema migration failed or was interrupted | Re-run migration with backup restore |
| **Missing wrapper** | Wrapper script was deleted but instance exists | Regenerate with `claude-multi fix-symlinks` |

## Common fixes

### Broken symlinks

```sh
claude-multi fix-symlinks
```

Repairs all symlinks across all instances. Can also target specific instances:

```sh
claude-multi fix-symlinks deepseek glm
```

### Corrupted instance

If an instance's config is corrupted beyond repair, remove and recreate it:

```sh
claude-multi remove broken-instance
claude-multi add broken-instance --provider deepseek --api-key sk-your-key
```

Your conversation history in `~/.claude-multi/broken-instance/projects/` is preserved separately from config — back it up before removing.

### Migration issues

Config migrations create backups before making changes. If a migration fails:

1. Check `~/.claude-multi/config.json` for migration status flags
2. Look for `.bak` files in the instance directory
3. The health screen will show the specific failure and offer to retry or restore

## References

| Resource | Link |
|----------|------|
| **Blog: Every TUI menu** | [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/) — Health warnings and fix-symlinks sections |
| **Usage docs** | [/docs/usage/](/docs/usage/) — CLI command reference |
| **In-app: Health screen** | Run `claude-multi` and press `!` or watch for the warning banner |
| **In-app: Re-sync symlinks** | Run `claude-multi` and select **Re-sync symlinks** |
| **GitHub: Health checks** | [src/health.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/health.ts) — health check implementation |
| **GitHub: HealthScreen** | [src/ink/screens/HealthScreen.tsx](https://github.com/hmziqrs/claude-multi/blob/master/src/ink/screens/HealthScreen.tsx) — TUI health screen |
| **GitHub: Migration** | [src/migration.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/migration.ts) — config migration with backups |
