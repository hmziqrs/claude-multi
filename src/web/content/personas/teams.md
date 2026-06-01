---
title: "For engineering teams"
description: "Standardize how your team uses AI coding tools. Shared provider configs, consistent setups, no 'works on my machine' incidents."
slug: "teams"
audience: "Engineering teams and tech leads who want consistent AI tooling across developers without locking into a single provider."
painPoints:
  - "Every developer configures Claude differently — different models, different plugins, different settings"
  - "No way to standardize which provider the team uses without mandating one API key for everyone"
  - "Junior devs waste hours on setup that senior devs automated months ago"
  - "Switching providers means the whole team has to redo their config"
  - "No audit trail of which model was used for what code"
benefits:
  - "Templates let you pre-configure providers so new hires type one command and match the team setup"
  - "Each developer keeps their own instance with their own history, but the provider config is shared"
  - "Plugin sync keeps skills consistent — the team lead installs once, everyone gets it"
  - "Switch providers without breaking anyone's setup — add a new template, tell the team the alias"
  - "Runs on top of stock Claude Code, so onboarding is zero-friction if they've used Claude before"
recommendedProviders:
  - "Anthropic"
  - "DeepSeek"
  - "GLM"
order: 2
---

Teams don't have a tooling problem. They have a consistency problem.

One developer uses Claude with Anthropic. Another found a cheaper model on DeepSeek. A third wrote a custom script that wraps the API. None of them share plugins, none of them share configs, and when someone asks "which model did you use for this function?" nobody knows.

claude-multi doesn't solve this with opinions. It solves it with structure.

## The team workflow

1. A tech lead creates a provider template (or uses a built-in one).
2. New developers run `claude-multi`, pick the template, paste their API key.
3. Everyone gets the same base config — same endpoint, same model defaults, same MCP servers.
4. Each developer still has their own history, their own working directory, their own preferences.

Plugin sync means when the team adopts a new skill or plugin, one person installs it and symlinks carry it to every instance. No Slack message saying "hey everyone, install this."

## Why not just mandate one provider?

Because providers change. Pricing shifts. Models get deprecated or upgraded. If your entire team is hardcoded to one endpoint, switching is a migration project. With claude-multi, adding a new provider is one TUI interaction. Tell the team the new alias. Done.

Some teams also run two providers intentionally — a cheap one for low-stakes work, a strong one for reviews and architecture. claude-multi makes that trivial.

## How the config works

Each instance lives in `~/.claude-<name>/`. The team can check a base `settings.json` into the repo (minus API keys) and new hires get it automatically when they create their instance. MCP server configs, allowed tools, default model — all portable.

## Where to go next

- [/docs/getting-started/](/docs/getting-started/): share this with new team members
- [/faq/plugin-syncing/](/faq/plugin-syncing/): how symlink-based plugin sharing works
- [/for/freelancers/](/for/freelancers/): if you're also doing contract work on the side
