---
title: "v0.8.2: Granular Sync Modes and Responsive Web"
description: "claude-multi had two sync modes: symlink everything or copy everything. Now there's a middle ground. Plus a responsive header, sticky sidebar, and SSR footer for the docs site."
date: 2026-06-03
tags: [release, sync, plugins, web, responsive]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/v082-granular-sync-modes-responsive-web.mp3"
---

# v0.8.2: Granular Sync Modes and Responsive Web

Auto-sync was a binary choice. Either `plugins/` and `skills/` were symlinked to `~/.claude` (auto-sync on), or they were independent copies (auto-sync off). That was it. Two options. Pick one.

The problem with auto-sync: every instance sees every plugin you install in `~/.claude`, immediately. You install something in your default Claude, and every `claude-*` alias gets it whether you want it or not. No picking and choosing.

The problem with manual mode: you have to copy new plugins by hand every time. Install a plugin in `~/.claude`, then manually copy it to each instance that needs it. Tedious and easy to forget.

There was no middle ground.

## Three sync modes

Now there are three modes instead of two.

**Auto** works the same as before. The entire `plugins/` and `skills/` directories are symlinked to `~/.claude/plugins` and `~/.claude/skills`. Any change in `~/.claude` is instantly visible to the instance. Fast, but all-or-nothing.

**Half-manual** is the new mode. The `plugins/` and `skills/` directories themselves are real directories, not symlinks. But each plugin and skill *inside* those directories is individually symlinked back to `~/.claude`. So you get the existing plugins from your default installation, but new installs in `~/.claude` don't automatically appear. You control what shows up.

**Full-manual** works the same as the old "manual" mode. Independent copies of everything. No symlinks at all.

## How half-sync works

The function is `halfSyncPluginsAndSkills()` in `config.ts`. When switching from auto to half-manual, it:

1. Removes the whole-directory symlink (e.g. `instance-dir/plugins` pointing to `~/.claude/plugins`)
2. Creates a real directory in its place
3. Iterates over every item in `~/.claude/plugins` and `~/.claude/skills`, creating individual relative symlinks for each one

Items that already exist in the instance directory are not overwritten. If you added your own plugin to the instance, it stays. If you later install a new plugin in `~/.claude`, it does not appear in the half-manual instance until you explicitly re-sync.

Re-syncing is available in the TUI. The ToggleAutoSync screen now has a "Force re-sync" option for both auto and half-manual modes. It rebuilds the symlinks without changing the mode.

## Downgrade only

You can go auto to half-manual to full-manual. You cannot go back up.

This is enforced by `canConvertSyncMode()` in `constants.ts`. It uses an ordered array (`SYNC_MODE_ORDER`) and checks that the target mode has a higher index than the current one. Going back up would require reconciling diverged directories, which is a data loss problem. If the instance has its own plugins that don't exist in `~/.claude`, going back to auto-sync would lose them under a symlink. Not worth the risk.

## CLI flags

The `add` command got new flags:

```
claude-multi add my-instance --sync-mode half-manual
claude-multi add my-instance --half-manual
claude-multi add my-instance --auto-sync
claude-multi add my-instance --manual
```

`--sync-mode` accepts `auto`, `half-manual`, or `full-manual`. The other flags are shortcuts. Specifying more than one is an error.

The `auto-sync` command now accepts mode names instead of just on/off:

```
claude-multi auto-sync my-instance half-manual
claude-multi auto-sync my-instance auto
claude-multi auto-sync my-instance full-manual
```

Legacy `on`/`off` still works. `on` maps to `auto`, `off` maps to `full-manual`.

The TUI got a new Sync Mode screen. It shows the current mode with color-coded labels (green for auto, cyan for half-manual, yellow for full-manual), available downgrades, and the force re-sync option.

## The web changes

The docs site got a responsive overhaul. Five files changed across the header, sidebar, footer, and layout.

**Responsive header.** A `nav-dropdown` custom element provides a hamburger menu on tablet and mobile. The NavLinks component hides below 60rem and the dropdown takes over. It uses a frosted glass panel with `backdrop-filter: blur(20px) saturate(140%)`, same visual treatment as the desktop nav. The dropdown handles Escape to close, click-outside to close, and follows the ARIA menu pattern with `role="menu"` and `role="menuitem"`.

**Sticky sidebar.** On desktop (72rem and up), the `.page` container is restructured as a CSS grid. The sidebar and main content share the same grid cell, overlapping, with the sidebar on top. The sidebar uses `position: sticky` instead of `position: fixed`. The difference matters: a sticky element stops at the boundary of its scroll container. The sidebar scrolls with the page until it hits the footer, then stops. No overlap. On mobile and tablet, Starlight's default flex-column layout is preserved.

**SSR site footer.** The footer was previously trapped inside Starlight's `.page` wrapper, which meant it sat in the sidebar's column and didn't span full width. The fix moves it outside `.page` entirely. In dev mode, Astro middleware rewrites the HTML. In the static build, an integration `buildDone` hook post-processes the output. The footer HTML itself is generated from a shared utility (`site-footer-html.ts`) so the marketing pages and docs pages render the same footer.

**Header and TOC positioning.** Both the docs header and the right sidebar (table of contents) use `position: sticky` now. The header pins to `top: 0` with `z-index: 20` so it stays above the sidebar. The TOC pins below the header at `top: var(--sl-nav-height)`.

Tested across 375px (mobile), 768px (tablet), and 1480px (desktop) viewports.

## Backward compatibility

Existing instances keep their current behavior. The config file has a new `syncMode` field, but the old `autoSync` boolean still works. Resolution order in `getSyncMode()`:

1. If `syncMode` is set and valid, use it
2. If `autoSync` is explicitly `false`, resolve to `full-manual`
3. Everything else (including `autoSync: true` or unset) resolves to `auto`

Both fields are written on update so the config works with old and new versions.

## Upgrading

```
bun add -g claude-multi@0.8.2
```

Existing instances keep their current mode. To switch modes:

```
claude-multi auto-sync my-instance half-manual
```

The TUI sync mode screen is under the instance management menu.

## Numbers

17 files changed for sync modes. 5 files changed for the web. The `SyncMode` enum, `canConvertSyncMode()`, `availableSyncModeConversions()`, and `halfSyncPluginsAndSkills()` are all new exports in `constants.ts`.

---

Full changelog: [CHANGELOG.md](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md). Provider reference: [/docs/providers/](/docs/providers/).
