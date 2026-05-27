---
question: "What is claude-multi and why should I use it?"
description: "claude-multi is an open-source CLI that runs multiple Claude Code instances side-by-side, each with its own AI provider, config directory, and history."
category: "Getting Started"
order: 1
---

claude-multi is a CLI that lets you run multiple Claude Code instances at the same time, each pointed at a different AI provider. Every instance gets its own config directory under `~/.claude-<name>/`, so settings, history, and MCP servers don't bleed into each other.

## The problem it solves

Claude Code keeps everything in one `~/.claude` folder — settings, plugins, skills, MCP servers, conversation history. That works fine until you want to try a second provider, or keep a work setup separate from a personal one. Suddenly you're manually copying files around, swapping environment variables, and hoping nothing gets overwritten.

claude-multi gives each provider its own alias (`claude-glm`, `claude-deepseek`, `claude-anthropic`), each backed by a real directory you can browse and edit. No shared state, no accidental overwrites.

## What it isn't

It doesn't fork or patch Claude Code. It doesn't run a proxy or daemon. It doesn't do model routing. Each instance is a standalone Claude Code environment — claude-multi just manages the plumbing.

## What you get

- 8 provider templates with pre-configured endpoints and model mappings
- Plugin auto-sync via symlinks (update once, all instances get it)
- MCP server management across instances
- Health monitoring that catches broken symlinks, missing dirs, corrupted config
- A terminal UI built with Ink/React, plus a fallback prompts mode

## Related questions

- [Is it a fork of Claude Code?](/faq/is-it-a-fork/) — how the wrapper mechanism works
- [Which providers are supported?](/faq/supported-providers/) — the full template list
- [Does it cost anything?](/faq/pricing/) — it's free, you just pay for API usage

## Dive deeper

- [/about/](/about/) — design principles and how it works
- [/docs/getting-started/](/docs/getting-started/) — install and create your first instance
- [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/) — walkthrough of every TUI screen
- [/blog/claude-code-co-engineer-and-claude-multi/](/blog/claude-code-co-engineer-and-claude-multi/) — how it fits into the Claude Code ecosystem
- [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts) — where provider templates are defined
- [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) — instance creation and plugin management
