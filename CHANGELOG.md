# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-05-30

### Changed
- **Removed pinned Claude Code binary**: claude-multi no longer installs its own copy of `@anthropic-ai/claude-code` into `~/.claude-multi/bin/`. All instance wrappers now resolve to the user's globally installed `claude` binary via `which claude`/`where claude`. This means instances auto-update together with the global `claude` binary.
- `getClaudePath()` in `wrapper.ts` simplified to two priorities: `CLAUDE_MULTI_CLAUDE_PATH` env override, then global PATH. The pinned binary check was removed.
- `doctor fix` no longer installs a pinned Claude binary. It verifies `claude` is available in PATH and regenerates stale wrappers.
- Health check for wrapper binary paths now compares against the resolved global `claude` path instead of `PINNED_CLAUDE_BIN`. Also gained a Windows `.cmd` regex pattern.
- `fixWrapperVersions()` in `health.ts` rewritten to use `tryGetClaudePath()` instead of `PINNED_CLAUDE_BIN`.
- Instance migration (v0.6.2) updated to use `tryGetClaudePath()` instead of the deleted `tryGetGlobalClaudePath()`. Added `console.warn` when claude binary is not found during wrapper regeneration.
- `TUNABLE_ENV_VARS` local duplicate removed from `migration.ts` v0.6.3. Now imports the canonical set from `constants/env.ts` (was missing `CLAUDE_CODE_AUTO_COMPACT_WINDOW` and `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`).
- PATH membership check in the `add` command uses `path.dirname()` and `path.delimiter` instead of Unix-specific `lastIndexOf('/')` and `split(':')`.
- `where claude` output split fixed to handle Windows `\r\n` line endings.
- Version warning banner and `isThirdPartyApiBroken` check removed from the TUI (the affected versions are ancient).

### Removed
- `PINNED_BIN_DIR` and `PINNED_CLAUDE_BIN` constants from `paths.ts`.
- `COMPATIBLE_CLAUDE_VERSION`, `isThirdPartyApiBroken()`, `getPinnedBinaryVersion()`, `installPinnedClaude()` from `version.ts`.
- `getGlobalClaudePath()` and `tryGetGlobalClaudePath()` from `wrapper.ts` (became identical to `getClaudePath()` and `tryGetClaudePath()` after pinning removal).
- `ccVersion` state, `installFailed` doctor result, and version warning banner from `App.tsx`.

### Fixed
- v0.6.3 migration `TUNABLE_ENV_VARS` local duplicate was missing two entries (`CLAUDE_CODE_AUTO_COMPACT_WINDOW`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`), causing auto-compaction settings to be overwritten with template defaults during migration.
- Health check and `doctor fix` were fighting the v0.6.2 migration: migration set wrappers to global path, doctor overwrote them back to pinned binary. Both now use the same global path resolution.
- `where claude` output on Windows was split on `\n` only, missing `\r\n` carriage returns.
- `add` command PATH check was Unix-only (`lastIndexOf('/')` and `split(':')`).
- Health check had no regex for Windows `.cmd` wrapper format.

### Blog
- Blog post: [v0.7.0: No More Pinned Claude Binary](https://claude-multi.hmziq.xyz/blog/v070-no-more-pinned-claude/)

## [0.6.5] - 2026-05-30

### Added
- **Instance details actions**: The instance details screen now has action buttons. Press Enter on any instance to access: Update settings template, Update alias wrapper, and Override alias to standard. Each action shows a live mismatch indicator (✓ up to date, ⚠ mismatch detected, ✗ wrapper missing).
- `syncProviderTemplateForInstance()` in `config.ts` — on-demand provider template sync for a single instance. Re-applies the latest template env vars while preserving API keys and user-customized tunable vars.
- `detectTemplateMismatch()` and `detectWrapperMismatch()` in `instance-diagnostics.ts` — compare an instance's current settings/wrapper against the expected provider template.
- `TUNABLE_ENV_VARS` shared constant in `constants/env.ts` — single source of truth for env vars that are preserved during template sync and excluded from staleness checks.

### Changed
- **Health screen rewrite**: Replaced static `IssueCard` list with a Select-based issue picker. Issues can now be selected, viewed in detail, and dismissed. Press Enter to view an issue, `d` to dismiss, `D` to dismiss all.
- **Post-migration stale state fixed**: After running `doctor fix`, the health check warning no longer persists. The config is now reloaded before health checks re-run.
- **Migration lock staleness**: Added a 30-minute staleness check to the migration lock file. Prevents stale locks from blocking migrations after crashes or PID reuse.
- **Atomic health status writes**: `saveHealthStatus()` now uses write-to-temp + rename to prevent file corruption on crash or concurrent access.
- **Doctor fix guard**: `handleDoctorFix` is now guarded against double-invocation from rapid keypresses.
- Removed pre-existing TypeScript type errors in `migration.ts` v0.6.3 migration body (narrow `Record` type inference on `newEnv`).

### Blog
- Blog post: [v0.6.5: Action Buttons, Health Screen Fix, Hardened Migrations](https://claude-multi.hmziq.xyz/blog/v065-instance-actions-health-fix/)

## [0.6.4] - 2026-05-29

### Added
- Instance migration (0.6.3) syncs provider template env vars to existing instances. Detects the provider from `ANTHROPIC_BASE_URL` in `settings.json` and re-applies the latest template (model names, thinking tokens, output limits). Preserves API keys and user-added env vars.
- `detectProvider()` and `getProviderByBaseUrl()` in `templates.ts` match a base URL to a provider template name.
- `providerTemplate` field on the `Instance` type. New instances store it; migration backfills it for existing instances.

### Blog
- Blog post: [v0.6.4: Existing Instances Now Auto-Sync Provider Template Updates](https://claude-multi.hmziq.xyz/blog/v064-provider-template-sync/)

## [0.6.3] - 2026-05-29

### Changed
- Instance migrations regenerate wrappers pointing to the globally installed `claude` binary (via `which claude`), not the pinned binary at `~/.claude-multi/bin`. Wrappers that already match the expected content are left untouched.
- `runMigration` and `createBackup` are synchronous now (had no `await` expressions).
- MiMo (pay-per-token and Token Plan) models bumped to `mimo-v2.5-pro[1m]` and `mimo-v2.5[1m]` (1M context window variants).
- Kimi opus model changed from `kimi-k2.6` to `kimi-k2.5`.
- Provider templates now include explicit thinking and output token limits:
  - MiniMax: 32K thinking, 64K output
  - DeepSeek: 32K thinking, 128K output
  - MiMo (both plans): 128K output
  - Kimi: 16K thinking, 64K output
  - Qwen and Qwen Coding Plan: 16K thinking, 64K output

### Added
- `getGlobalClaudePath()` and `tryGetGlobalClaudePath()` in `wrapper.ts` resolve the claude binary from the env override or PATH, skipping the pinned binary.
- Instance migration tests: fast-path skip on current-version instances, mixed instances (some current, some old), `.claude.json` updates when the wrapper file is missing, and a verification that regenerated wrappers contain the global claude path.

### Fixed
- Health test compared `fixWrapperVersions` output against `generateWrapperScript()` (resolves via env override) instead of `buildWrapperScript(inst, PINNED_CLAUDE_BIN)` (what the function actually uses). Would break if `CLAUDE_MULTI_CLAUDE_PATH` was set.

### Blog
- Blog post: [v0.6.3: Drop the Pinned Binary, Update Every Provider Template](https://claude-multi.hmziq.xyz/blog/v063-migration-and-provider-updates/)

### Added
- Instances track the claude-multi version they were created with (`createdWithVersion`). New instances get the current version. Instances created before this field existed get `0.5` and show "before version tracking" in the UI.
- `doctor` and the TUI health screen report when instance migrations are pending or when an instance is running an older version.
- `doctor fix` shows which instances need migration and asks for confirmation before running.
- Version column added to `list`, `info`, and the Ink TUI instance cards and detail screens.

### Changed
- `instanceMigrationVersion` in config now stores the actual package version rather than a separate numbering scheme.
- The legacy sentinel (`"0.5"`) is defined once as `LEGACY_INSTANCE_VERSION` and imported everywhere, instead of being hardcoded in multiple files.
- Wrapper script template exists in a single place (`buildWrapperScript` in `wrapper.ts`). Migration and health check both delegate to it instead of duplicating the template string.
- Instance migration only rewrites wrappers when the file content actually differs (version check + content diff), instead of unconditionally regenerating every wrapper.
- `fixWrapperVersions` uses the canonical template targeting the pinned binary explicitly, with a content-diff check to avoid unnecessary writes.

### Fixed
- Removed broken `compareVersions` references from `version.test.ts`.
- `resolveClaudePath()` in `migration.ts` used `await` in a non-async function (TypeScript error). Removed — replaced by `generateWrapperScriptSafe` from `wrapper.ts`.
- Unused imports (`COMPATIBLE_CLAUDE_VERSION`, `installPinnedClaude`, `getPinnedBinaryVersion`, `isThirdPartyApiBroken`, `PINNED_CLAUDE_BIN`) removed from `migration.ts`.
- `config.ts` `loadConfig` backfill loop now handles `noUncheckedIndexedAccess` correctly (pre-existing TypeScript error).
- `createBackup` changed from async to sync (had no `await` expressions — pre-existing lint warning).
- Array `.sort()` / `.reverse()` calls in `migration.ts` and `config.ts` changed to `.toSorted()` / `.toReversed()` (pre-existing lint warnings).
- Duplicate `existsSync` import in `test/wrapper.test.ts` merged into single import.

## [0.6.1] - 2026-05-29

### Changed
- Pinned Claude version updated from `2.1.153` to `2.1.156`. `isThirdPartyApiBroken()` now covers v2.1.154 through v2.1.155.
- Auto-updates re-enabled. `PROVIDER_COMMON_ENV` no longer injects `DISABLE_AUTOUPDATER`/`DISABLE_UPDATES`. `autoUpdates` set to `true` in instance state.
- `doctor fix` now reinstalls the pinned binary when its version differs from `COMPATIBLE_CLAUDE_VERSION`, not just when broken. Covers the upgrade path from the old v2.1.153 pin.
- Unknown CLI subcommands exit with an error instead of falling through to the Ink TUI.
- All version pinning and compatibility code tagged with `[SAFE PARK]` comments for easy discovery and reactivation.

### Added
- Blog post: "Claude Code v2.1.156 fixes the third-party provider breakage"

## [0.6.0] - 2026-05-29

### Added
- **`doctor fix` auto-installs pinned Claude binary**: when the compatible binary at `~/.claude-multi/bin` is missing or running an incompatible version, `doctor fix` now installs Claude Code v2.1.156 (the version that fixed the 3rd-party API breakage from v2.1.154–v2.1.155) before fixing wrappers. Works from both CLI and TUI.
- **Version verification on pinned binary**: `getPinnedBinaryVersion()` reads the installed version and triggers a reinstall if it's v2.1.154–v2.1.155.
- **`COMPATIBLE_CLAUDE_VERSION` constant** (`src/version.ts`): single source of truth for the pinned version (`2.1.156`).
- **`PINNED_CLAUDE_BIN` in `src/paths.ts`**: shared path constant (previously duplicated in `wrapper.ts` and `health.ts`).

### Changed
- **Global version banner**: now reads "Run 'claude-multi doctor fix' to install a compatible version" instead of the passive "wait for a fix" message.
- **TUI "Fix wrappers" action**: installs the pinned binary first if missing, then fixes wrappers. Both the menu option and the `f` key in the health screen follow this flow.
- **Wrapper scripts now use pinned binary by default**: `getClaudePath()` checks `~/.claude-multi/bin` before falling back to global `which claude`, so new instances automatically use the compatible version.

### Fixed
- **Tests**: integration tests updated for current version and help output.

## [0.5.8] - 2026-05-28

### Added
- **Region selection for MiMo Token Plan** (`--region`): `mimo-token` provider now supports regional endpoints — China (`cn`), Singapore (`sgp`), Europe (`ams`). Users are prompted to pick a region after selecting `mimo-token` in all three entry points (CLI `--region` flag, interactive prompts, Ink TUI wizard). Defaults to `cn` for backward compatibility.
- **API key prefix mapping** (`API_KEY_PREFIXES`): `mimo-token` shows `tp_...` placeholder in the API key input; all other providers show `sk-...`. Extensible map for future providers with non-standard key formats.

### Changed
- **`--provider` error message** (`src/cli.ts`): unknown provider error now dynamically lists all available providers instead of hardcoding three names.
- **Region advisory**: both the interactive prompts and Ink TUI display a highlighted message reminding users to check their Xiaomi account console for the correct region.

## [0.5.7] - 2026-05-27

### Added
- **Provider templates** (`src/templates.ts`): five new AI provider templates
  - **Xiaomi MiMo** (`mimo`): MiMo-V2.5-Pro and MiMo-V2.5 via xiaomimimo.com, pay-per-token API
  - **Xiaomi MiMo Token Plan** (`mimo-token`): MiMo-V2.5-Pro via xiaomimimo.com subscription; replace base URL with your regional endpoint (CN/SG/EU) from the subscription console
  - **Moonshot Kimi** (`kimi`): Kimi K2.6 (opus) and Kimi K2.5 (sonnet/haiku) via moonshot.ai, pay-per-token
  - **Alibaba Qwen** (`qwen`): Qwen3-Coder-Next/Plus/Flash via Alibaba DashScope, pay-per-token API
  - **Alibaba Qwen Coding Plan** (`qwen-coding`): Qwen3-Coder-Next/Plus/Flash via DashScope Coding Plan subscription

### Changed
- **GLM template** (`glm`): display name updated to "GLM Coding Plan"; description now clarifies the Anthropic endpoint is coding-plan-only (standard Z.ai pay-per-token API has no Anthropic-compatible URL)
- **Kimi template** (`kimi`): sonnet/haiku tiers use `kimi-k2.5` instead of `kimi-k2.6`, same family, ~37% cheaper; legacy K2 series EOL'd May 25 2026

## [0.5.6] - 2026-05-23

### Added
- **`robots.txt` route** (`src/web/pages/robots.txt.ts`): serves sitemap reference and user-agent directives for the docs site

### Changed
- **Runtime-agnostic launcher** (`bin/claude-multi.js`): polyglot bin entry is simultaneously valid POSIX sh and ESM JavaScript
  - On Linux/macOS: shell shebang detects bun/node/deno and execs the correct runtime
  - On Windows + bun global install: bun's `.exe` shim reads the `.js` extension and runs directly as ESM, no `/bin/sh` lookup required
  - On Windows + npm install: npm's `.cmd` shim calls `node` on the `.js` file
  - Shebang changed to `#!/usr/bin/env bun` so bun's Windows shim can resolve itself in `PATH`

### CI
- Add cross-platform install verification workflow covering bun, node, and deno on Linux, Windows, and macOS
- Separate build into its own job; test jobs download the artifact instead of rebuilding
- Publish workflow now includes version bump step and enhanced post-publish verification
- Add `ci:test-install` script to trigger the install-verification workflow from local

## [0.5.5] - 2026-05-22

### Added
- **Runtime detection** (`src/util/runtime.ts`): `detectPackageManager()` identifies the active package manager (bun / npm / pnpm / deno) at runtime

### Changed
- **Cross-runtime support**: all package-manager operations (`upgradeClaudeMulti`, `getCurrentVersion`, `updateClaudeCode`) now use the detected package manager instead of hard-coding bun commands
- `getLatestVersion()` replaced `bun pm npm view` with a direct `fetch()` to the npm registry, works in any runtime
- `getDefaultBinaryPath()` selects the correct global bin directory for the active package manager on Windows (was always `%LOCALAPPDATA%\bun\bin`)
- Generated wrapper shebang changed from `#!/usr/bin/env bun` to `#!/usr/bin/env node`
- Default action (no subcommand) always launches the Ink TUI and awaits `waitUntilExit()`, the `CLAUDE_MULTI_INK=false` prompts fallback is removed
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
  - `plugins install <instance> <ids...>`, install plugins with collision detection
  - `plugins remove <instance> <ids...>`, remove plugins with symlink guard
  - `plugins list-defaults`, list all 50 default plugins with category/MCP badges
  - `plugins list-installed [instance]`, list installed plugins per instance
  - `plugins check-collisions <instance> <ids...>`, detect MCP name conflicts
- **Provider Templates**: DeepSeek provider template added
- **Instance State**: `initializeInstanceState()` creates `.claude.json` with `hasCompletedOnboarding: true`
- **Provider Env**: `mergeProviderEnv()` integrates provider template env vars into instance settings
- **Screenshot Capture**: `scripts/capture-screens.tsx` for automated UI screenshots

### Changed
- `copyAllFromDefault()` restored `autoSync` parameter for symlink-based plugin sync
- `syncPluginsAndSkills()` creates actual symlinks instead of copying files
- Broken symlink detection uses `lstatSync` (works when `existsSync` returns false)
- `~/.claude` is strictly read-only, never modified by any operation
- Atomic file writes for both config.json and settings.json (temp-file-rename pattern)
- Lazy path resolution in migration.ts and health.ts for testability

### Fixed
- `syncPluginsAndSkills` was doing recursive copy instead of creating symlinks
- `copyAllFromDefault` `autoSync` parameter was removed, breaking symlink-based sync
- Broken symlinks not cleaned before creating new ones (used `lstatSync` instead of `existsSync`)
- `isClaudeCodeRunning()` blocked tests, skips in `NODE_ENV=test`
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

[0.6.4]: https://github.com/hmziqrs/claude-multi/compare/v0.6.3...v0.6.4
[0.6.3]: https://github.com/hmziqrs/claude-multi/compare/v0.6.2...v0.6.3
[0.5.5]: https://github.com/hmziqrs/claude-multi/compare/v0.5.1...v0.5.5
[0.5.1]: https://github.com/hmziqrs/claude-multi/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/hmziqrs/claude-multi/compare/v0.4.4...v0.5.0
[0.4.4]: https://github.com/hmziqrs/claude-multi/compare/v0.4.3...v0.4.4
[0.3.0]: https://github.com/hmziqrs/claude-multi/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/hmziqrs/claude-multi/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/hmziqrs/claude-multi/releases/tag/v0.1.0