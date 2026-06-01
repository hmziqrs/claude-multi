---
title: "Set Up a Standardized AI Environment for Your Team"
description: "Give every developer the same provider config, plugins, and MCP servers. Onboard new hires in minutes, not hours."
slug: "team-setup"
persona: "Team lead / CTO"
painPoint: "Every developer on your team has a different Claude Code setup. Different plugins, different MCP servers, different provider configs. Onboarding takes hours and there is no consistency."
solution: "Create a reference instance with your team's standard config. Copy it to each developer's machine. Everyone gets the same setup with one command."
steps:
  - title: "Install claude-multi"
    code: "npm install -g claude-multi"
  - title: "Create the team reference instance"
    code: "claude-multi\n# Add new instance\n# Name: team\n# Template: your chosen provider\n# Configure: plugins, MCP servers, CLAUDE.md"
  - title: "Export the config for sharing"
    code: "cp -r ~/.claude-team/ ./team-config/"
  - title: "Each developer creates their instance"
    code: "claude-multi\n# Add new instance\n# Name: team\n# Template: same provider\n# Copy options: All files"
  - title: "Or copy the reference config directly"
    code: "cp -r team-config/ ~/.claude-team/"
providers:
  - "Any"
order: 6
---

## The consistency problem

You have five developers. One uses Claude directly. Another has a custom script. A third found some random MCP server on GitHub and installed it without telling anyone. When someone asks "which model are you using?" the answer is different every time.

This is not a tooling problem. It is an operations problem. You need a standard setup that everyone uses, and you need it to be easy enough that people actually adopt it.

## Building the reference setup

Start by creating your team's canonical instance:

```bash
claude-multi
```

Pick **Add new instance**. Name it `team`. Choose your organization's provider template and API key. Then configure it:

- **Install the team's standard plugins** -- code formatters, linters, internal tools
- **Set up MCP servers** -- your database, your CI system, your internal docs
- **Write a team `CLAUDE.md`** -- project conventions, coding standards, common patterns
- **Enable auto-sync** if you want to manage plugins centrally

This becomes your reference config at `~/.claude-team/`.

## Distributing the setup

### Option A: Copy options in the TUI

Each new developer runs:

```bash
npm install -g claude-multi
claude-multi
# Add new instance
# Name: team
# Template: [your provider]
# Copy options: All files
```

If the developer already has a `~/.claude` with the reference config (shared via your internal repo or dotfiles), the "All files" option pulls in everything: settings, plugins, `CLAUDE.md`, skills.

### Option B: Direct config copy

Store the reference config in your team's dotfiles repo:

```bash
# In your dotfiles repo
cp -r ~/.claude-team/ configs/claude-team/

# New developer clones dotfiles and runs
cp -r configs/claude-team/ ~/.claude-team/
```

Then each developer creates the wrapper:

```bash
claude-multi
# Add new instance
# Name: team
# Template: [your provider]
# The config dir already exists, so it uses what is there
```

### Option C: Script it

```bash
#!/bin/bash
# setup-team-ai.sh
npm install -g claude-multi
mkdir -p ~/.claude-team
cp -r ./team-config/* ~/.claude-team/
claude-multi  # developer finishes setup in TUI
```

## Managing updates

When you need to update the team's plugins or MCP config:

```bash
claude-multi
# Pick: Manage plugins
# Select: team instance
# Install or update plugins
```

If auto-sync is on, every team instance that symlinks from the reference picks up the change. If not, push the updated config through your dotfiles repo.

## What a team instance gives you

- **Same provider and model** across all developers
- **Same plugins** -- no "works on my machine" for tooling
- **Same MCP servers** -- everyone can query the same internal systems
- **Same `CLAUDE.md`** -- the AI follows the same coding standards
- **Individual keys** -- each dev uses their own API key, billed to their own account (or a shared team key)

## Revoking access

If someone leaves the team, their instance is self-contained. No central account to revoke. Their API key is their own. Your internal MCP servers should use auth that you can rotate independently.
