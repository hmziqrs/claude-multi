# Claude Multi - Project Roadmap

## Overview
Claude Multi is a CLI tool for managing multiple Claude Code instances with different aliases and configurations. This roadmap outlines planned features and improvements.

## 🚀 Priority Features

### 1. Basic Backup & Restore
**Goal**: Simple way to export/import configs without ongoing sync maintenance

#### Features:
- **Archive Export/Import**:
  ```bash
  claude-multi backup export <file.tar.gz>    # Archive selected instances + metadata
  claude-multi backup import <file.tar.gz>    # Restore into local config dirs
  ```
- **Scope**: Local archives only; no cloud providers, encryption, or auto-sync
- **Manifest**: Include a small JSON manifest describing included instances

### 2. Enhanced Interactive Mode
**Goal**: More powerful and user-friendly interactive interface

#### Features:
- **Simplified Interface**:
  - Clean list view of all instances
  - Basic status indicators
  - Easy navigation without complex filtering

## 🔧 Quality of Life Improvements

### 3. Shell Integration
**Goal**: Seamless terminal experience

#### Features:
- **Auto-completion**:
  - Bash/Zsh completion scripts
  - Context-aware suggestions
  - Instance name completion

- **Shell Aliases**:
  - Quick access to favorite instances
  - Custom shortcuts for common operations
  - Environment-specific configurations

- **Prompt Integration**:
  - (Future consideration) Optional prompt snippet showing last used instance

### 4. Configuration Management
**Goal**: Advanced configuration handling

#### Features:
- **Global Defaults**:
  - Preferred paths and settings
  - Environment-specific overrides

- **Validation**:
  - Configuration schema validation
  - Cross-instance consistency checks
  - Migration guides for breaking changes

- **Settings Inheritance**:
  - Global settings inheritance
  - Instance-specific customizations

## 🔧 Technical Considerations

### Configuration Storage
- Keep config JSON lean; validate shape before save
- Use atomic writes when updating config metadata

### Performance
- Keep operations synchronous and fast; avoid premature abstractions
- Only load instance details when needed in interactive mode

### Error Handling
- Graceful degradation for missing dependencies
- Clear error messages with suggested fixes
- Prefer manual fixes over automatic mutation of user files

### Security
- Respect CLAUDE_CONFIG_DIR permissions; do not handle secrets directly
- Leave credential storage to Claude Code
