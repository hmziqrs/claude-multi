---
title: Changelog
description: Release history and changes
---

All notable changes to claude-multi are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.7] — 2026-05-27

### Added
- **Five new provider templates** — Xiaomi MiMo (`mimo`), Xiaomi MiMo Token Plan (`mimo-token`), Moonshot Kimi (`kimi`), Alibaba Qwen (`qwen`), Alibaba Qwen Coding Plan (`qwen-coding`)

### Changed
- GLM template display name updated to "GLM Coding Plan" — the Anthropic endpoint is coding-plan-only
- Kimi template sonnet/haiku tiers use `kimi-k2.5` instead of `kimi-k2.6` (same family, ~37% cheaper)

## [0.5.6] — 2026-05-23

### Added
- `robots.txt` route for the docs site

### Changed
- Polyglot bin entry is simultaneously valid POSIX sh and ESM JavaScript — works across bun/node/deno on all platforms including Windows

### CI
- Cross-platform install verification workflow (bun, node, deno × Linux, Windows, macOS)
- Separate build job; test jobs download the artifact instead of rebuilding
- Publish workflow with version bump and enhanced post-publish verification

## [0.5.5] — 2026-05-22

### Added
- Runtime detection (`detectPackageManager()`) identifies active package manager at runtime

### Changed
- All package-manager operations use the detected runtime instead of hard-coding bun
- `getLatestVersion()` uses direct `fetch()` to npm registry — works in any runtime
- Default action (no subcommand) always launches the Ink TUI
- Update check is opt-in (`CLAUDE_MULTI_UPDATE_CHECK=true`)
- Removed `interactive` / `i` command alias

### Fixed
- `AddInstance` provider selection: "None" now correctly resets `selectedProvider`
- `getCurrentVersion()` handles pnpm's array-shaped JSON response

## [0.5.1] — 2026-05-22

### Changed
- Running `claude-multi` with no arguments now opens the Ink TUI directly instead of printing help text

## [0.5.0] — 2026-05-14

### Added
- **Ink-based Terminal UI** — full React-based TUI with animated components, 9 screens, keyboard navigation
- **Per-instance plugin management** — install, remove, enable, disable, copy, collision detection
- **Migration system** — safe v1 → v2 config upgrade with backups, locking, and failure recovery
- **Health check system** — detects missing dirs, broken symlinks, corrupted settings, migration failures
- **ManageMcp screen** — list, add, remove, verify, copy MCP server configs
- **5 new CLI plugin commands** — `install`, `remove`, `list-defaults`, `list-installed`, `check-collisions`
- DeepSeek provider template
- Instance state initialization (`hasCompletedOnboarding: true`)
- Provider env merging for templates

### Changed
- `syncPluginsAndSkills()` creates actual symlinks instead of copying files
- `~/.claude` is strictly read-only — never modified by any operation
- Atomic file writes for config.json and settings.json

### Tests
- 155 tests across 16 test files — 0 failures

## [0.4.3] — 2026-01-26

### Added
- Broken symlink detection and auto-fix
- `fix-symlinks` command with `--all` flag and instance selection
- Interactive re-sync option in TUI menu

### Fixed
- Symlink creation uses `lstatSync` for proper broken symlink detection

## [0.4.2] — 2026-01-26

### Fixed
- Auto-sync symlinks now use absolute paths instead of relative paths — fixes broken symlinks when instances are in non-standard locations

## [0.4.1] — 2026-01-26

### Added
- 46 tests covering sync, unsync, copy operations with complete isolation

### Fixed
- macOS compatibility for `rmSync` with symlinks and directories
- Security: `copySettingsFromDefault` uses whitelist to exclude sensitive data

## [0.4.0] — 2026-01-26

### Added
- Auto-sync for plugins and skills via symlinks
- `--auto-sync` and `--manual` flags for `add` command
- `auto-sync <name> <on|off>` command
- Bun runtime support

## [0.3.0] — 2025-01-XX

### Added
- Provider templates for GLM and MiniMax
- Interactive provider selection with secure API key prompt
- `--provider` and `--api-key` CLI flags

## [0.2.0] — 2025-01-XX

### Added
- Windows support with `.cmd` batch wrapper scripts
- Cross-platform CI (Ubuntu, Windows, macOS)

## [0.1.0] — 2025-01-XX

### Added
- Initial release
- Instance management (`add`, `remove`, `list`, `info`)
- Wrapper script generation
- Interactive and non-interactive modes
- Settings and config copying
- MCP server configuration support
- Version checking and update commands
- CI/CD workflows

[0.5.7]: https://github.com/hmziqrs/claude-multi/compare/v0.5.6...v0.5.7
[0.5.6]: https://github.com/hmziqrs/claude-multi/compare/v0.5.5...v0.5.6
[0.5.5]: https://github.com/hmziqrs/claude-multi/compare/v0.5.1...v0.5.5
[0.5.1]: https://github.com/hmziqrs/claude-multi/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/hmziqrs/claude-multi/compare/v0.4.3...v0.5.0
[0.4.3]: https://github.com/hmziqrs/claude-multi/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/hmziqrs/claude-multi/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/hmziqrs/claude-multi/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/hmziqrs/claude-multi/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/hmziqrs/claude-multi/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/hmziqrs/claude-multi/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/hmziqrs/claude-multi/releases/tag/v0.1.0
