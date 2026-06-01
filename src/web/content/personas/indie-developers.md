---
title: "For indie developers"
description: "Ship side projects faster by running multiple AI providers side-by-side. One terminal, zero config clashes."
slug: "indie-developers"
audience: "Solo developers building side projects, SaaS apps, and open-source tools who want to use different models without wrecking their setup."
painPoints:
  - "Swapping API keys in environment variables every time you switch models"
  - "One ~/.claude directory means one model at a time, or manual config juggling"
  - "Testing how different models handle the same prompt means starting over each time"
  - "Plugins and skills you installed for Claude break when you point it at another provider"
  - "No way to keep a cheap model for boilerplate and a strong model for architecture in parallel"
benefits:
  - "Run claude-deepseek for boilerplate and claude-anthropic for hard problems at the same time"
  - "Each instance keeps its own history, settings, and plugins — no cross-contamination"
  - "Plugin sync means you install a skill once and every instance picks it up"
  - "One command to add a new provider, one command to launch it"
  - "MIT licensed, runs locally, no accounts to create"
recommendedProviders:
  - "DeepSeek"
  - "GLM"
  - "Qwen"
order: 1
---

You build side projects. You don't have time to babysit your tooling.

The standard workflow is: install Claude Code, point it at Anthropic, ship. That works until you realize DeepSeek is cheaper for boilerplate, or GLM handles your codebase better, or you want to A/B test prompts across models. Then you're editing env vars, copying config files, and praying nothing breaks.

claude-multi gives each model its own directory. `claude-deepseek` for the grunt work. `claude-anthropic` when you need the heavy lifting. Both running at the same time, both with their own history and settings, neither one touching the other.

## How it fits into your day

You're working on a SaaS app. The backend is mostly CRUD — DeepSeek or Qwen handles that fine at a fraction of the cost. The auth module is tricky — switch to Anthropic for that part. Both instances stay open. Both keep their context. No switching cost.

When you install a new plugin or skill, symlinks carry it to every instance. Update once, done.

## The setup

```sh
bun add -g claude-multi
claude-multi
# Pick "Add new instance", choose a provider, paste your key
# Done. Run `claude-deepseek` or whatever alias it gives you.
```

Two minutes. No config files to write. No daemons running in the background.

## What you're probably comparing this to

- **Multiple Claude Code installs**: Manually creating `~/.claude-deepseek`, writing wrapper scripts, managing symlinks yourself. claude-multi automates all of it.
- **A proxy router**: claude-multi isn't a proxy. Each instance is a real, independent Claude Code environment. You get the full CLI, all flags, all plugins.

## Where to go next

- [/docs/getting-started/](/docs/getting-started/): full setup walkthrough
- [/faq/what-is-claude-multi/](/faq/what-is-claude-multi/): what this tool actually does
- [/for/teams/](/for/teams/): if you're working with others
