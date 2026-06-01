---
title: "Run Isolated Experiments Without Breaking Your Setup"
description: "Sandbox a new model, plugin, or MCP server in its own instance. If it breaks, your main Claude Code config stays clean."
slug: "isolated-experiments"
persona: "Tinkerer / early adopter"
painPoint: "You want to try a new model or plugin but you are worried about messing up your main Claude Code setup. One bad config edit and your daily driver is down."
solution: "Create a disposable instance with its own config directory. Experiment freely. If it breaks, delete it and start over -- your main setup is untouched."
steps:
  - title: "Install claude-multi"
    code: "npm install -g claude-multi"
  - title: "Create a sandbox instance"
    code: "claude-multi\n# Add new instance\n# Name: sandbox\n# Template: None / Custom"
  - title: "Experiment freely"
    code: "claude-sandbox \"test this experimental MCP server\""
  - title: "If it breaks, nuke it"
    code: "claude-multi\n# Pick: Remove instance\n# Select: sandbox\n# Delete config dir: y"
  - title: "Start fresh"
    code: "claude-multi\n# Add new instance again"
providers:
  - "Any"
order: 4
---

## The fear of breaking things

Your main Claude Code setup works. You have your MCP servers configured, your plugins installed, your `CLAUDE.md` tuned just right. The last thing you want is to install some experimental plugin or point at a new provider and watch the whole thing fall over.

claude-multi gives you a sandbox. Each instance gets its own config directory at `~/.claude-<name>/`. Whatever you do in that directory stays there.

## Setting up a sandbox

```bash
claude-multi
```

Pick **Add new instance**. Name it `sandbox`. Choose **None / Custom** as the template -- you will configure it by hand, or pick a provider template if you want to test a specific model.

Say **no** to auto-sync and **Nothing** for copy options. This instance starts completely empty.

```bash
claude-sandbox
```

You now have a blank Claude Code session. Install that experimental plugin. Point at that weird endpoint. Edit `settings.json` however you want. If it catches fire:

```bash
claude-multi
# Pick: Remove instance
# Select: sandbox
# Delete config directory? y
```

Gone. Your main `~/.claude` is untouched.

## What to use a sandbox for

- **Testing new MCP servers** before adding them to your main config
- **Trying a new provider** without committing your API key to your primary setup
- **Experimenting with model parameters** -- change `ANTHROPIC_MODEL` in the sandbox's `settings.json` and see what happens
- **Testing plugin combinations** that might conflict
- **Reproducing a bug** in a clean environment

## Keeping some things shared

If you want the sandbox to have access to your existing plugins but nothing else, use the **Select plugins** copy option during creation:

```bash
claude-multi
# Add new instance
# Name: sandbox
# Copy options: Select plugins
# Pick the ones you want, skip the rest
```

This copies the selected plugins into the sandbox without symlinking. Changes in the sandbox do not affect your main setup.

## Restoring from a broken state

If you break the sandbox but want to keep it:

```bash
claude-multi
# Pick: Instance details
# Select: sandbox
# Check what is wrong
# Edit ~/.claude-sandbox/settings.json to fix it
```

Or just remove it and recreate. The whole cycle takes under a minute.
