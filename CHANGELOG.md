# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.5] - 2026-05-22

### Added
- **Runtime detection** (`src/util/runtime.ts`): `detectPackageManager()` identifies the active package manager (bun / npm / pnpm / deno) at runtime

### Changed
- **Cross-runtime support**: all package-manager operations (`upgradeClaudeMulti`, `getCurrentVersion`, `updateClaudeCode`) now use the detected package manager instead of hard-coding bun commands
- `getLatestVersion()` replaced `bun pm npm view` with a direct `fetch()` to the npm registry — works in any runtime
- `getDefaultBinaryPath()` selects the correct global bin directory for the active package manager on Windows (was always `%LOCALAPPDATA%\bun\bin`)
- Generated wrapper shebang changed from `#!/usr/bin/env bun` to `#!/usr/bin/env node`
- Default action (no subcommand) always launches the Ink TUI and awaits `waitUntilExit()` — the `CLAUDE_MULTI_INK=false` prompts fallback is removed
- Update check is now **opt-in**: set `CLAUDE_MULTI_UPDATE_CHECK=true` to enable; it no longer runs on every invocation
- Removed `interactive` / `i` command alias (default action covers this)

### Fixed
- `AddInstance` provider selection: choosing "None" now correctly resets `selectedProvider` to `null` and sets `useProvider` to `false`; choosing a provider correctly sets `useProvider` to `true`
- `getCurrentVersion()` handles pnpm's array-shaped JSON response

### CI
- Publish workflow: skip git tag creation when the tag already exists remotely
- Publish workflow: make git tagging optional via workflow input
- Switch publish workflow from bun to npm with OIDC trusted publishing (no token)
- Update Node.js to 24.x in CI and deployment workflows
- Add `ci:publish` script to trigger versioned publish from local

## [0.5.1] - 2026-05-22

### Changed
- **Interactive-first launch**: Running `claude-multi` with no arguments now opens the Ink TUI directly instead of printing help text
  - CLI subcommands (`add`, `remove`, `list`, etc.) continue to work as before
  - `--help` and `--version` flags are unaffected
  - `CLAUDE_MULTI_INK=false` still falls back to the `prompts`-based interactive mode

## [0.5.0] - 2026-05-14

### Added
- **Ink-based Interactive UI**: Full terminal UI built with Ink + React
  - Home screen with instance list, menu, and health warning banner
  - Animated components: Header, StatusBar, StepIndicator, InstanceCard, IssueCard, WarningBanner
  - Screens: AddInstance, RemoveInstance, ShowInstanceInfo, ToggleAutoSync, FixSymlinks, HealthScreen, ManagePlugins, ManageMcp, ListInstances
  - Keyboard navigation: arrow keys, Enter, ESC, `!` for health, `q` to quit
  - `useConfig`, `useNavigation`, `useHealthCheck`, `useAnimations` hooks
- **Per-Instance Plugin Management**: Granular plugin control per instance
  - `PluginInfo` interface with id, name, category (internal/external), hasMcp, mcpServerNames, enabled, isSymlink
  - `scanPluginsFromDir()` discovers plugins from both `plugins/` and `external_plugins/` subdirs
  - `listDefaultPlugins()` / `listInstancePlugins()` for querying available and installed plugins
  - `copySinglePlugin()` / `copySelectedPlugins()` for individual or batch install with rollback
  - `removeSinglePlugin()` with rename-to-backup safety pattern
  - `detectMcpCollisions()` to check MCP server name conflicts before install
  - `validatePluginOperation()` pre-flight checks (configDir, symlink, plugin existence, collisions)
  - Handles 12 internal LSP plugins without `plugin.json` (falls back to dir name)
  - Supports both flat `{"serverName": config}` and nested `{"mcpServers": {"serverName": config}}` `.mcp.json` formats
  - Coordinates with `installed_plugins.json` v2 format (scope, installPath, version, timestamps)
  - Symlink detection: refuses per-plugin operations when auto-sync is active
- **Migration System** (`src/migration.ts`): Safe v1 → v2 config upgrade
  - `runMigration()` with 4-step procedure: backup → validate → transform → save
  - PID-based lock file prevents concurrent migrations
  - Automatic backup of config.json + instance settings.json (keeps last 3)
  - Failure flag: sets `migrationStatus: "failed"` with error details, prevents auto-retry
  - `clearMigrationFailure()` for explicit retry
  - `CLAUDE_MULTI_HOME` env override for testability
- **Health Check System** (`src/health.ts`): Detects and reports issues
  - Checks: migration failure, missing configDir, missing binary, corrupted settings.json, broken symlinks
  - Persistent health status at `~/.claude-multi/health-status.json`
  - `dismissIssue()` / `dismissAllIssues()` for acknowledging warnings
  - Warning banner on home screen with `!` key to review
  - HealthScreen with list/detail views, retry, dismiss actions
- **ManagePlugins Screen**: Full plugin management UI
  - Install plugins from default (MultiSelect with MCP badge, [ext] tag)
  - Remove installed plugins
  - Enable/disable plugins
  - List installed plugins with status indicators
  - Symlink detection with warning
- **ManageMcp Screen**: Enhanced MCP server management
  - List MCP servers with source attribution ([pluginName] or [custom])
  - Add custom MCP server (name + JSON config input)
  - Remove custom MCP server (select from custom servers)
  - Verify MCP configuration
  - Copy between instances
- **CLI Plugin Commands**: 5 new `plugins` sub-commands
  - `plugins install <instance> <ids...>` — install plugins with collision detection
  - `plugins remove <instance> <ids...>` — remove plugins with symlink guard
  - `plugins list-defaults` — list all 50 default plugins with category/MCP badges
  - `plugins list-installed [instance]` — list installed plugins per instance
  - `plugins check-collisions <instance> <ids...>` — detect MCP name conflicts
- **Provider Templates**: DeepSeek provider template added
- **Instance State**: `initializeInstanceState()` creates `.claude.json` with `hasCompletedOnboarding: true`
- **Provider Env**: `mergeProviderEnv()` integrates provider template env vars into instance settings
- **Screenshot Capture**: `scripts/capture-screens.tsx` for automated UI screenshots

### Changed
- `copyAllFromDefault()` restored `autoSync` parameter for symlink-based plugin sync
- `syncPluginsAndSkills()` creates actual symlinks instead of copying files
- Broken symlink detection uses `lstatSync` (works when `existsSync` returns false)
- `~/.claude` is strictly read-only — never modified by any operation
- Atomic file writes for both config.json and settings.json (temp-file-rename pattern)
- Lazy path resolution in migration.ts and health.ts for testability

### Fixed
- `syncPluginsAndSkills` was doing recursive copy instead of creating symlinks
- `copyAllFromDefault` `autoSync` parameter was removed, breaking symlink-based sync
- Broken symlinks not cleaned before creating new ones (used `lstatSync` instead of `existsSync`)
- `isClaudeCodeRunning()` blocked tests — skips in `NODE_ENV=test`
- `writeFileSync` not imported in config.ts
- `McpSourceDetails` prop name mismatch in ManageMcp
- `renameSync` dynamic import in `saveConfigAtomic` replaced with top-level import
- TypeScript: `updateInstanceAutoSync` object possibly undefined after bounds check

### Tests
- **155 tests, 0 failures** across 16 test files
- `test/plugin-management.test.ts` (18 tests): scanning, copy, remove, MCP helpers, atomic writes
- `test/e2e/plugin-flow.test.ts` (6 tests): CLI plugin operations end-to-end
- `test/migration.test.ts` (15 tests): migration, backup, lock, failure recovery
- `test/health.test.ts` (15 tests): health checks, persistence, dismiss
- `test/ink/` (31 tests): component rendering, screen navigation, animation hooks
- `test/config.test.ts` (53 tests): sync/unsync, copyAllFromDefault, symlink cycles

## [0.4.3] - 2026-01-26

### Added
- **Broken Symlink Detection**: Automatically detect and fix broken symlinks
  - New `isBrokenSymlink()` and `detectBrokenSymlinks()` functions
  - Auto-fix broken symlinks when creating or updating instances
  - Handles edge cases: broken symlinks, existing directories, incorrect symlink targets
- **`fix-symlinks` Command**: Fix broken symlinks for existing instances
  - Interactive instance selection with multi-select support
  - `--all` flag to fix all instances at once
  - Auto-fixes instances with auto-sync enabled, warns for manual mode
  - Clear status indicators for broken symlinks vs. valid symlinks
- **Interactive Re-sync**: Added "Re-sync symlinks" option to interactive mode menu
  - Quick access to symlink diagnosis and repair from interactive UI
- **Test Suite**: Comprehensive tests for symlink detection and fixing
  - Tests for broken symlink detection
  - Tests for valid symlink handling
  - Tests for mixed scenarios (broken + valid symlinks)
  - Error handling tests for non-existent paths

### Fixed
- Symlink creation now uses `lstatSync` for proper broken symlink detection
- Previously, `existsSync()` returned `false` for broken symlinks, preventing detection
- Now correctly identifies and repairs broken symlinks in all scenarios

[0.4.3]: https://github.com/hmziqrs/claude-multi/compare/v0.4.2...v0.4.3

## [0.4.2] - 2026-01-26

### Fixed
- Auto-sync symlinks now use absolute paths instead of relative paths
  - Previously used hardcoded `../../.claude/` which assumed instances were in `~/.claude-instances/`
  - Now uses `homedir()` to resolve absolute paths, working for any instance location
  - Fixes broken symlinks when instances are created directly in home directory (e.g., `~/.claude-tester/`)

### Added
- Symlink test suite to verify both relative and absolute symlink behaviors

[0.4.2]: https://github.com/hmziqrs/claude-multi/compare/v0.4.1...v0.4.2

## [0.4.1] - 2026-01-26

### Added
- **Test Suite**: Comprehensive sandboxing tests for auto-sync functionality
  - 46 tests covering syncPluginsAndSkills, unsyncPluginsAndSkills, copySettingsFromDefault, and copyAllFromDefault
  - Real file system operations in temporary directories with complete isolation
  - AutoSyncTestHelper class for test utilities and assertions
  - Test helper functions to override default Claude directory for testing
  - Integration tests for sync/unsync cycles and auto-sync toggle

### Fixed
- macOS compatibility: Fixed rmSync usage to properly handle both symlinks and directories
- Security: copySettingsFromDefault now uses whitelist approach to only copy safe settings (exclude sensitive data like env and mcpServers)

[0.4.1]: https://github.com/hmziqrs/claude-multi/compare/v0.4.0...v0.4.1

## [0.4.0] - 2026-01-26

### Added
- **Auto-Sync for Plugins and Skills**: Share plugins/skills across instances via symlinks
  - New `--auto-sync` and `--manual` flags for `add` command
  - Auto-sync enabled by default when copying all files
  - `auto-sync <name> <on|off>` command to toggle for existing instances
  - Interactive mode option to toggle auto-sync setting
  - Instance info/list now display auto-sync status
- **Bun Runtime Support**: Migrated from npm/node to Bun
  - All npm commands replaced with bun equivalents
  - Build target changed from node to bun
  - Shebangs updated to use bun instead of node
  - Windows binary path changed to `%LOCALAPPDATA%\bun\bin`

### Changed
- Plugins and skills directories now use symlinks by default (auto-sync mode)
- When auto-sync is enabled, plugins/skills are symlinked from `~/.claude`
- When auto-sync is disabled, files are copied to instance config directory

### Fixed
- Removed unused code and improved error handling

## [0.3.0] - 2025-01-XX

### Added
- **Provider Templates**: Built-in templates for popular AI providers
  - GLM (智谱AI) template with GLM-4.5-air and GLM-4.6 models
  - MiniMax template with MiniMax-M2 model
  - Interactive provider selection with secure API key prompt
  - CLI flags: `--provider <name>` and `--api-key <key>`
  - Auto-configuration of base URLs, model mappings, and optimal settings
- **Quick Start Guide**: Added quick start section with provider template examples

### Changed
- Interactive mode now prompts for provider templates before config copying
- Enhanced instance creation flow with provider-first approach

## [0.2.0] - 2025-01-XX

### Added
- **Windows Support**: Full cross-platform support for Windows
  - Generates `.cmd` batch wrapper scripts on Windows
  - Uses `where` command instead of `which` on Windows
  - Default binary path set to `%APPDATA%\npm` on Windows
  - Skips Unix-specific `chmod` operations on Windows
- **Cross-platform CI**: GitHub Actions now tests on Ubuntu, Windows, and macOS
- **Platform Documentation**: Added platform-specific notes and Windows PATH setup guide
- **Test Suite**: Added comprehensive tests for wrapper script generation on all platforms

### Changed
- Binary naming convention: Windows wrappers now use `.cmd` extension (e.g., `claude-test.cmd`)
- Improved `getClaudePath()` to handle platform-specific path detection
- Enhanced wrapper generation to create appropriate script types per platform

### Fixed
- TypeScript strict null checks in config.ts
- Windows compatibility issues with shebang and chmod operations

## [0.1.0] - 2025-01-XX

### Added
- Initial release
- Basic instance management (add, remove, list, info)
- Wrapper script generation for multiple Claude Code instances
- Interactive and non-interactive modes for creating instances
- Settings and config copying from default Claude installation
- MCP (Model Context Protocol) server configuration support
- Version checking and update commands
- CI/CD workflows for automated testing and npm publishing

### Features
- Create isolated Claude Code instances with custom aliases
- Copy settings, plugins, and MCP configurations between instances
- Manage multiple instances simultaneously
- Support for custom config and binary paths
- Command-line interface built with Commander.js

[0.5.5]: https://github.com/hmziqrs/claude-multi/compare/v0.5.1...v0.5.5
[0.5.1]: https://github.com/hmziqrs/claude-multi/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/hmziqrs/claude-multi/compare/v0.4.4...v0.5.0
[0.4.4]: https://github.com/hmziqrs/claude-multi/compare/v0.4.3...v0.4.4
[0.3.0]: https://github.com/hmziqrs/claude-multi/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/hmziqrs/claude-multi/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/hmziqrs/claude-multi/releases/tag/v0.1.0