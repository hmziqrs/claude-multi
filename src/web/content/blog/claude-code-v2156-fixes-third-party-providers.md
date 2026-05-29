---
title: "Claude Code v2.1.156 fixes the third-party provider breakage"
description: "Anthropic shipped v2.1.156, which fixes the HTTP 422 error that broke every non-Anthropic API provider in v2.1.154 and v2.1.155. Here is what changed and what claude-multi users need to do."
date: 2026-05-29
tags: [Claude Code, third-party providers, compatibility, claude-multi]
---

# Claude Code v2.1.156 fixes the third-party provider breakage

Yesterday I wrote about how Claude Code v2.1.154 broke every third-party API provider. The bug was in the fallback logic: Claude Code's retry handler only caught HTTP 400, but providers return HTTP 422 for validation errors. The beta feature that sends `role: "system"` in the messages array would fail, the fallback would not trigger, and your conversation died.

Anthropic shipped v2.1.156 a few hours ago. It fixes this.

## What changed in v2.1.156

The fallback detection now catches both HTTP 400 and 422. When a provider rejects the `mid-conversation-system` beta with either status code, Claude Code removes the beta header and falls back to putting system instructions in `<system-reminder>` blocks inside user messages. This is the same fallback that already worked for first-party API calls that happened to return 400.

Versions 2.1.154 and 2.1.155 still have the bug. Upgrade to 2.1.156 or later.

## What claude-multi users need to do

If you are on claude-multi v0.6.0 or later:

```bash
claude-multi doctor fix
```

This reinstalls the pinned Claude binary at `~/.claude-multi/bin/` to v2.1.156 and updates any wrapper scripts that still point to the old version.

If you are on an older version of claude-multi, update first:

```bash
bun update -g claude-multi
claude-multi doctor fix
```

## Auto-updates are back on

When the breakage hit, we disabled auto-updates in claude-multi to prevent Claude Code from silently updating to a broken version. Now that v2.1.156 fixes the issue, auto-updates are re-enabled. New instances created with provider templates will not have `DISABLE_AUTOUPDATER=1` or `DISABLE_UPDATES=1` injected into their settings.

If you have existing instances with those env vars in their `settings.json`, you can remove them manually or re-apply the provider template. They are harmless to leave in place; they just prevent Claude Code from auto-updating.

## The safety infrastructure stays

We are keeping the version pinning and health check code in place, labeled with `[SAFE PARK]` comments throughout the codebase. If a future Claude Code update breaks third-party providers again, we can reactivate it by flipping a few constants:

- `isThirdPartyApiBroken()` in `src/version.ts` gets an updated version range
- `COMPATIBLE_CLAUDE_VERSION` gets the last working version number
- `PROVIDER_COMMON_ENV` in `src/templates.ts` gets `DISABLE_AUTOUPDATER` and `DISABLE_UPDATES` back
- `autoUpdates` in `src/config.ts` flips back to `false`

The `doctor fix` command and the TUI health screen will pick up the changes automatically. No new code needed.

This is the second time in recent months that a Claude Code update has broken provider compatibility. Keeping the safety code parked and ready seems prudent.

## TL;DR

- v2.1.156 fixes the HTTP 422 bug that broke third-party providers in v2.1.154 and v2.1.155
- Run `claude-multi doctor fix` to update your pinned binary
- Auto-updates are re-enabled for new instances
- The pinning safety code stays parked, ready to reactivate if it happens again
