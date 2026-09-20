---
title: Getting started
description: Install claude-multi, add your first provider instance, and launch an isolated Claude Code session. Covers macOS, Linux, and Windows.
---

## Prerequisites

You need two things:

1. **Claude Code** installed globally
2. **A JavaScript runtime**, Bun 1+, Node.js 18+, or Deno 1+

If you don't have Claude Code yet:

```bash
npm install -g @anthropic-ai/claude-code
```

## Install claude-multi

Pick whichever package manager you already use:

```bash
# Bun
bun add -g claude-multi

# npm
npm install -g claude-multi

# pnpm
pnpm add -g claude-multi

# Deno
deno install -g npm:claude-multi
```

The entry point is a polyglot file that detects your runtime, so you do not have to configure anything.

## Create your first instance

Launch the interactive TUI:

```bash
claude-multi
```

Select **Add new instance** and follow the wizard:

1. **Instance name**, something short like `glm` or `deepseek`. This becomes your command (`claude-glm`, `claude-deepseek`).
2. **Provider template**, pick from the list, or choose `None / Custom` for manual setup.
3. **API key**, paste your key (masked input, stored in the instance's `settings.json`).
4. **Confirm paths**, accept the defaults (`~/.claude-<name>/` for config, `~/.local/bin/claude-<name>` for the binary).
5. **Copy options**, optionally copy settings, plugins, or everything from your default `~/.claude`.
6. **Auto-sync**, if you copied all files, choose whether to symlink plugins/skills back to `~/.claude`.

When the wizard finishes:

```
✓ Instance 'deepseek' created successfully!
  ├─ Binary: /Users/you/.local/bin/claude-deepseek
  └─ Config: /Users/you/.claude-deepseek
```

Run it:

```bash
claude-deepseek
```

You now have a full Claude Code session connected to DeepSeek with its own isolated config. It is the same `claude` binary you already know, pointed at a different provider.

## CLI quick start

You can also create instances from the command line instead of the TUI:

```bash
claude-multi add deepseek --provider deepseek --api-key sk-your-key
claude-multi add glm --provider glm --api-key your-zai-key
```

Then run them:

```bash
claude-deepseek
claude-glm
```

## Add `~/.local/bin` to your PATH

If `claude-<name>` isn't found after creation, your global binary directory probably isn't on `PATH`. Add it once:

```bash
# zsh (macOS default)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

The exact binary location depends on your package manager. The TUI prints the actual path when it creates the instance.

## What's next

- [Providers](/providers/): full list of provider templates and model mappings
- [Usage](/docs/usage/): all CLI commands and flags
- [Configuration](/docs/configuration/): settings file reference
- [Plugins & MCP](/docs/plugins-mcp/): manage plugins and MCP servers across instances
