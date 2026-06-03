---
title: "v0.8.2: Granular Sync Modes and Responsive Web"
description: "claude-multi had two sync modes: symlink everything or copy everything. Now there's a middle ground. Plus a responsive header, sticky sidebar, and SSR footer for the docs site."
date: 2026-06-03
tags: [release, sync, plugins, web, responsive]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/v082-granular-sync-modes-responsive-web.mp3"
---

# v0.8.2: Granular Sync Modes and Responsive Web

Auto-sync was a binary choice. Either `plugins/` and `skills/` were symlinked to `~/.claude` (auto-sync on), or they were independent copies (auto-sync off). Two options. Pick one.

The problem with auto-sync: every instance sees every plugin you install in `~/.claude`, immediately. You install something in your default Claude, and every `claude-*` alias gets it whether you want it or not.

The problem with manual mode: you have to copy new plugins by hand every time. Install a plugin in `~/.claude`, then manually copy it to each instance that needs it. Tedious.

## Three modes instead of two

Auto works the same as before. The entire `plugins/` and `skills/` directories are symlinked to `~/.claude/plugins` and `~/.claude/skills`. Any change in `~/.claude` is instantly visible to the instance.

Full-manual works the same as the old "manual" mode. Independent copies of everything. No symlinks.

Half-manual is the new one. The `plugins/` and `skills/` directories are real directories, not symlinks. But each plugin and skill inside them is individually symlinked back to `~/.claude`. You get the existing plugins from your default installation, but new installs in `~/.claude` don't automatically appear. You control what shows up.

The function behind this is `halfSyncPluginsAndSkills()` in `config.ts`. When switching from auto to half-manual, it removes the whole-directory symlink, creates a real directory in its place, then iterates over every item in `~/.claude/plugins` and `~/.claude/skills` and creates individual relative symlinks for each one. Items that already exist in the instance directory are not overwritten. If you added your own plugin to the instance, it stays. If you later install a new plugin in `~/.claude`, it does not appear until you explicitly re-sync.

Re-syncing is available in the TUI. The ToggleAutoSync screen now has a "Force re-sync" option for auto and half-manual modes. It rebuilds the symlinks without changing the mode.

## Downgrade only

You can go auto to half-manual to full-manual. You cannot go back up. Going back up would require reconciling diverged directories, which is a data loss problem. If the instance has its own plugins that don't exist in `~/.claude`, going back to auto-sync would lose them under a symlink.

`canConvertSyncMode()` in `constants.ts` enforces this. It uses an ordered array and checks that the target mode has a higher index than the current one.

## CLI and TUI changes

The `add` command got new flags:

```
claude-multi add my-instance --sync-mode half-manual
claude-multi add my-instance --half-manual
claude-multi add my-instance --auto-sync
claude-multi add my-instance --manual
```

`--sync-mode` accepts `auto`, `half-manual`, or `full-manual`. The other flags are shortcuts. Specifying more than one is an error.

The `auto-sync` command now accepts mode names:

```
claude-multi auto-sync my-instance half-manual
```

Legacy `on`/`off` still works. `on` maps to `auto`, `off` maps to `full-manual`.

The TUI ToggleAutoSync screen is now a Sync Mode screen. Current mode gets a color label (green for auto, cyan for half-manual, yellow for full-manual), and it shows which downgrades are available. `plugin install/remove` is blocked when the instance is in half-manual mode, because individually symlinked plugins can't be individually managed.

## The web side

Five files changed on the docs site.

The header got a hamburger dropdown. Below 60rem, the nav links disappear and a `nav-dropdown` custom element takes over. Frosted glass panel (`backdrop-filter: blur(20px) saturate(140%)`), Escape to close, click-outside to close, proper ARIA menu roles. On desktop, nothing changed.

The sidebar is sticky now. On desktop (72rem+), the `.page` container is a CSS grid where the sidebar and main content overlap in the same grid cell. The sidebar uses `position: sticky` instead of fixed. The difference: a sticky element stops at the boundary of its scroll container, so the sidebar scrolls with the page until it hits the footer, then stops. No overlap. On mobile and tablet, Starlight's default layout is untouched.

The footer used to be trapped inside Starlight's `.page` wrapper, sitting in the sidebar column instead of spanning the viewport. The fix moves it outside `.page` entirely. Dev mode uses Astro middleware, the static build uses an integration `buildDone` hook. The footer HTML comes from `site-footer-html.ts`, shared between marketing and docs pages.

Both the header and the right sidebar (table of contents) pin with `position: sticky`. Header at `top: 0`, TOC at `top: var(--sl-nav-height)`.

## Backward compat

Existing instances keep their current behavior. The config has a new `syncMode` field, but `getSyncMode()` falls back to the old `autoSync` boolean if it's not set. `autoSync: false` resolves to `full-manual`. Everything else resolves to `auto`. Both fields are written on update so the config works with old and new versions.

## Upgrading

```
bun add -g claude-multi@0.8.2
```

Existing instances keep their current mode. To switch:

```
claude-multi auto-sync my-instance half-manual
```

22 files changed. 17 for sync modes, 5 for the web. The `SyncMode` enum, `canConvertSyncMode()`, `availableSyncModeConversions()`, and `halfSyncPluginsAndSkills()` are new exports in `constants.ts`.

---

Full changelog: [CHANGELOG.md](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md). Provider reference: [/docs/providers/](/docs/providers/).
