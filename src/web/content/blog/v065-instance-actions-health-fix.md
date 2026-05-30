---
title: "v0.6.5: Action Buttons, Health Screen Fix, Hardened Migrations"
description: "Instance details now has action buttons to update settings templates and regenerate alias wrappers. The health screen got a rewrite to fix broken dismiss actions. Migrations are more resilient with stale lock detection and atomic health status writes."
date: 2026-05-30
tags: [release, health, migration, ui, hardening]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/v065-instance-actions-health-fix.mp3"
---

# v0.6.5: Action Buttons, Health Screen Fix, Hardened Migrations

Instance details grew action buttons. The health screen had broken dismiss actions, now fixed. And migrations got more resilient to crashes and race conditions.

## Action buttons in instance details

The instance details screen was a read-only wall of text. You could see your instance's config, version, plugins, MCP servers. But to do anything, you had to go back to the main menu and find the right screen.

Now when you open an instance's details and press Enter, you get an actions menu:

- Update settings template: re-syncs the provider template env vars (model names, thinking limits, base URL) to whatever the latest template defines. Your API key and custom tunable vars are preserved.
- Update alias wrapper: regenerates the wrapper script at `~/.local/bin/claude-<name>` to match the current standard.
- Override alias to standard: only shows up when the wrapper is mismatched or missing. Force-regenerates it.

Each action shows a live status indicator next to it. ✓ up to date, ⚠ mismatch detected, ✗ wrapper missing. You can tell whether an instance needs attention before picking an action.

This is the per-instance equivalent of `claude-multi doctor fix`. Targeted at a single instance, with visual feedback about what's wrong.

## Health screen: dismiss actually works now

The health screen (press `!` from the main menu) had a bug where pressing `d` to dismiss an issue did nothing. The handler checked a `selectedIssue` variable that was never set. There was no way to select an issue from the list. Dead code the whole time.

The fix replaces the old static issue cards with a Select menu. You pick an issue with arrow keys and Enter, see its full details (severity, instance name, resolution hint), then press `d` to dismiss it. `D` still dismisses all at once.

There was also a bug where the "Instance migrations pending" warning kept showing after running `doctor fix`. The migration saved the updated config to disk, but the app's in-memory state wasn't refreshed before health checks re-ran. The fix: call `reload()` after migration, so the health check sees the fresh config version and stops reporting a stale warning.

## Migration hardening

The migration system got three infrastructure fixes.

Stale lock detection. If claude-multi crashes mid-migration (SIGKILL, power loss, whatever), a lock file stays behind at `~/.claude-multi/.migration.lock`. The old code checked whether the PID in the lock was still running, but PIDs get recycled on long-running systems. Now there's a 30-minute staleness check: if the lock is older than half an hour, it gets removed regardless of what the PID check says.

Atomic health status writes. The health status file at `~/.claude-multi/health-status.json` was written with plain `writeFileSync`. If the process crashed mid-write, or if two claude-multi instances wrote at the same time, the file could end up corrupted. Now it writes to a `.tmp` file first, verifies the JSON parses, then renames it into place.

Doctor fix double-fire guard. Pressing `f` on the health screen calls `handleDoctorFix`, which is async. If you hit `f` twice fast, the function would run twice concurrently. The second run was harmless (migrations are idempotent), but it caused an unnecessary reload and a misleading result screen. Now there's a `doctorRunning` flag that prevents concurrent invocations.

## Under the hood

`syncProviderTemplateForInstance()` in `config.ts` is the on-demand version of the v0.6.3 migration logic. Takes an instance, detects its provider, re-applies the latest template while preserving API key and tunable env vars.

`detectTemplateMismatch()` and `detectWrapperMismatch()` in `instance-diagnostics.ts` are pure functions that compare an instance's current state against the expected template. The UI uses them to show mismatch indicators.

`TUNABLE_ENV_VARS` moved to `constants/env.ts`. It's shared between diagnostics (excluded from comparison) and sync (preserved during update) so they can't drift apart.

---

Full changelog: [CHANGELOG.md](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md). Provider reference: [/docs/providers/](/docs/providers/).
