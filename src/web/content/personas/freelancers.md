---
title: "For freelancers"
description: "Keep client work strictly separated. Different projects, different models, different configs — all from one machine."
slug: "freelancers"
audience: "Freelance developers and consultants juggling multiple clients who need clean separation between workspaces."
painPoints:
  - "Client A pays for Anthropic, Client B wants you on DeepSeek — switching is manual and error-prone"
  - "Conversation history and settings from one client's project bleed into another"
  - "API keys from different clients end up in the same environment variables"
  - "No clean way to hand off a project without exposing your personal setup"
  - "Billing is a mess when you can't track which model was used for which client"
benefits:
  - "One instance per client — separate history, separate settings, separate API keys"
  - "Use the provider each client prefers without reconfiguring anything"
  - "Hand off a project by sharing the instance config — your personal stuff stays personal"
  - "Track usage per instance — no mixing billing across clients"
  - "Plugin and skill sync works across all client instances"
recommendedProviders:
  - "Anthropic"
  - "DeepSeek"
  - "GLM"
  - "MiniMax"
order: 4
---

Freelancing means context-switching. A lot of it.

Monday morning you're on Client A's React app, using their Anthropic API key. After lunch you switch to Client B's Python backend, and they want you on DeepSeek because it's cheaper. By Wednesday you're on Client C's infrastructure project and they don't care which model you use, just that it works.

That's three different configs, three different API keys, three different sets of plugins and MCP servers. In a single `~/.claude` directory, that's chaos.

## The per-client setup

claude-multi gives each client their own instance:

- `claude-clienta` — Anthropic, their API key, their MCP servers
- `claude-clientb` — DeepSeek, their API key, their tools
- `claude-clientc` — GLM, your key, your default setup

Each one is a full Claude Code environment. History, settings, plugins — all isolated. When you switch projects, you switch instances. No env var gymnastics. No "wait, which API key am I using right now?"

## Handoffs

When a project ends, you can export the instance config (minus the API key) and hand it to the client's internal team. They recreate the setup on their end with `claude-multi` and pick up exactly where you left off.

Your personal instances — your side projects, your experiments — stay completely separate.

## Billing

Each instance uses its own API key. If Client A is paying for Anthropic usage and Client B is paying for DeepSeek, the billing is clean. No parsing through invoices trying to figure out which call was for which project.

## Where to go next

- [/docs/getting-started/](/docs/getting-started/): set up your first instance
- [/faq/api-key-safety/](/faq/api-key-safety/): how API keys are stored per instance
- [/for/indie-developers/](/for/indie-developers/): for your personal projects
