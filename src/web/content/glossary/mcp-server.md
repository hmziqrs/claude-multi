---
title: "MCP Server"
description: "An external tool server that connects to Claude Code through the Model Context Protocol, giving it access to databases, APIs, file systems, and other services."
term: "MCP Server"
category: "Architecture"
related:
  - "instance-isolation"
  - "plugin-sync"
  - "config-directory"
---

An MCP server is a process that speaks the Model Context Protocol and exposes tools, resources, or prompts to Claude Code. Think of it as a plugin system: each MCP server adds capabilities that Claude Code doesn't have out of the box.

## How it works in claude-multi

Each instance stores its own MCP server configuration in `settings.json` inside its config directory. That means two instances can run completely different sets of MCP servers without interfering with each other.

claude-multi provides commands to manage MCP servers across instances:

- `claude-multi mcp list` shows what's configured where
- `claude-multi mcp copy` copies server configs between instances
- `claude-multi mcp verify` checks that referenced binaries and paths still exist

## Why it matters

Without per-instance MCP configs, every Claude Code instance shares the same `~/.claude/settings.json`. You'd have to manually edit JSON files every time you wanted a different tool setup. claude-multi handles the plumbing so each instance stays independent.

## Example

A database instance might run an MCP server that connects to PostgreSQL. A frontend instance might run one that serves design tokens. They don't need to know about each other.
