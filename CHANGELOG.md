# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.2.0]: https://github.com/hmziqrs/claude-multi/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/hmziqrs/claude-multi/releases/tag/v0.1.0