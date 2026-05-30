---
title: "v0.7.0: No More Pinned Claude Binary"
description: "claude-multi no longer bundles its own copy of Claude Code. All instances now use your globally installed claude binary, which means they auto-update together. Doctor fix, health checks, and migrations were rewritten. Four pre-existing bugs were fixed along the way."
date: 2026-05-30
tags: [release, architecture, health, migration, bugfix]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/v070-no-more-pinned-claude.mp3"
---

# v0.7.0: No More Pinned Claude Binary

Here's what was happening. claude-multi installed its own private copy of `@anthropic-ai/claude-code` into `~/.claude-multi/bin/` via npm. Every wrapper script hardcoded the path to that copy. The idea was to pin a known-good version so third-party providers wouldn't break during the v2.1.154 incident.

Meanwhile your global `claude` kept auto-updating by rotating a symlink at `~/.local/share/claude/versions/`. But the wrappers stayed stuck on whatever `claude-multi` had pinned. You'd be on 2.1.158 globally while every `claude-*` alias was still running 2.1.156. Two versions behind. No way to close the gap without changing code and bumping a constant.

That pinned copy is gone. Every wrapper now resolves to whatever `claude` you have in PATH. One binary, one version, auto-updates work.

## What changed

`getClaudePath()` used to have three priorities: env override, pinned binary, global PATH. We ripped out the pinned binary check. Now it goes straight from env override to `which claude` (or `where claude` on Windows).

`getGlobalClaudePath()` and `tryGetGlobalClaudePath()` became identical to `getClaudePath()` and `tryGetClaudePath()` after the removal, so we deleted them. All callers updated.

We removed four things from `version.ts`: `COMPATIBLE_CLAUDE_VERSION`, `isThirdPartyApiBroken()`, `getPinnedBinaryVersion()`, and `installPinnedClaude()`. The pinned path constants `PINNED_BIN_DIR` and `PINNED_CLAUDE_BIN` are gone from `paths.ts`.

53 references across 15 files. Zero left.

## Health checks and doctor fix rewritten

This one was embarrassing. The health check that validates wrapper binary paths used to compare against `PINNED_CLAUDE_BIN`. If a wrapper pointed to anything else, it flagged it as broken. The v0.6.2 migration started using the global path, which meant the health check would immediately flag every migrated wrapper as wrong. Then `doctor fix` would rewrite them back to the pinned binary. The migration and the health check were fighting each other. Every time you ran doctor, it undid what the migration just did.

Both now resolve the current global claude path and compare against that. The check also picked up a Windows `.cmd` regex pattern so it can parse wrapper scripts on both platforms.

`doctor fix` used to install the pinned binary as its first step. Now it just checks that `claude` is available in PATH, tells you which binary it found, and regenerates any stale wrappers.

## Migration fixes

The v0.6.2 migration already called `tryGetGlobalClaudePath()` to point wrappers at the global binary. Since we deleted that function, the migration now calls `tryGetClaudePath()`. Same result, different name.

We added a `console.warn` for the case where claude can't be found during migration. Previously the wrapper regeneration just silently skipped. Now you actually hear about it.

The v0.6.3 migration had a bug with `TUNABLE_ENV_VARS`. It had a local copy of the set that was missing two entries: `CLAUDE_CODE_AUTO_COMPACT_WINDOW` and `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`. If you had customized auto-compaction settings, that migration would overwrite them with template defaults. We replaced the duplicate with an import from `constants/env.ts` so the canonical set is the only set.

## Three Windows bugs

Found during the audit, not caused by this change, but fixed in the same pass.

`where claude` output was split on `\n` but Windows uses `\r\n`. The PATH membership check in the `add` command used `lastIndexOf('/')` and `split(':')` instead of `path.dirname()` and `path.delimiter`. And the health check had no regex for `.cmd` wrapper format.

## Upgrading from v0.6.5

Run `claude-multi doctor fix`. It regenerates all your wrapper scripts to point to your global `claude` binary.

Then delete the old npm install:

```
rm -rf ~/.claude-multi/bin/
```

That's about 100MB of duplicated Claude Code you don't need anymore.

Your instances follow whatever version your global `claude` is on now. When Claude Code auto-updates itself, all your aliases pick it up on the next launch.

## Numbers

15 files changed. 53 references removed. 4 bugs fixed. 242 tests passing.

---

Full changelog: [CHANGELOG.md](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md). Provider reference: [/docs/providers/](/docs/providers/).
