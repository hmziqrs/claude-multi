---
question: "What is claude-multi and why should I use it?"
description: "claude-multi is an open-source CLI that runs multiple Claude Code instances side-by-side, each with its own AI provider, config directory, and history."
category: "Getting Started"
order: 1
---

**claude-multi** is a CLI tool that lets you run multiple Claude Code instances simultaneously, each configured with a different AI provider. Every instance gets its own config directory (`~/.claude-<name>/`), so settings, history, and MCP servers stay isolated.

## Why it exists

Claude Code stores everything in a single `~/.claude` directory — settings, plugins, skills, MCP servers, and conversation history. The moment you want to try a second provider, A/B test models, or keep work and personal configs separate, you start manually juggling environment variables and copying files.

claude-multi solves this by giving each provider its own alias (`claude-glm`, `claude-deepseek`, `claude-anthropic`) backed by a real directory you can inspect and modify.

## What it is not

- It is **not** a fork of Claude Code — it wraps the unmodified `claude` binary
- It is **not** a proxy or daemon — no background processes, no telemetry
- It is **not** a model router — each instance is a fully isolated Claude Code environment

## Key capabilities

- **8 provider templates** with pre-configured base URLs and model mappings
- **Plugin auto-sync** via symlinks so you maintain plugins in one place
- **MCP server management** across instances
- **Health monitoring** to detect broken symlinks, missing dirs, or corrupted config
- **Rich TUI** (Ink/React) with a fallback prompts mode

## References

| Resource | Link |
|----------|------|
| **About page** | [/about/](/about/) — design principles and how it works |
| **Getting started docs** | [/docs/getting-started/](/docs/getting-started/) — install and first instance |
| **Blog: Every TUI menu** | [/blog/inside-claude-multi-every-menu/](/blog/inside-claude-multi-every-menu/) — deep dive into the terminal UI |
| **Blog: Claude Code co-engineer** | [/blog/claude-code-co-engineer-and-claude-multi/](/blog/claude-code-co-engineer-and-claude-multi/) — how claude-multi fits into the Claude Code ecosystem |
| **GitHub: Templates** | [src/templates.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/templates.ts) — provider template definitions |
| **GitHub: Config** | [src/config.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/config.ts) — instance CRUD and plugin management |
