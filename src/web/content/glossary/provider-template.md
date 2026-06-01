---
title: "Provider Template"
description: "A pre-configured set of environment variables, base URLs, and model mappings that tells Claude Code how to reach a specific LLM provider."
term: "Provider Template"
category: "Configuration"
related:
  - "base-url"
  - "api-key"
  - "model-mapping"
---

A provider template is a bundled configuration that tells Claude Code which API endpoint to hit, which models to use, and what environment variables to set. Instead of manually configuring each instance, you pick a template and claude-multi handles the rest.

## What's in a template

Each template includes:

- A **base URL** pointing to the provider's Anthropic-compatible endpoint
- **Model mappings** that tell Claude Code which model to use for Sonnet, Opus, and Haiku roles
- **Environment variables** for timeouts, thinking settings, context limits, and output caps
- A **display name** and description shown in the TUI

## Built-in templates

claude-multi ships with templates for GLM, MiniMax, DeepSeek, OpenRouter, and others. You can see the full list by running `claude-multi` and selecting "Create instance."

## Custom templates

You can modify templates or create your own by editing `src/templates.ts` before building, or by changing the environment variables in an instance's config directory after creation.

## Where templates live

Templates are defined in `src/templates.ts` in the claude-multi source. When you create an instance, the template's values get written into that instance's `settings.json` and shell wrapper script.
