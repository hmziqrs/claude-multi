# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.3.0]: https://github.com/hmziqrs/claude-multi/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/hmziqrs/claude-multi/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/hmziqrs/claude-multi/releases/tag/v0.1.0