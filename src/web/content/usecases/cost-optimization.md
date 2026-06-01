---
title: "Cut API Costs by Routing Tasks to Cheaper Models"
description: "Use DeepSeek for quick lookups and Claude for complex reasoning. claude-multi keeps both a keystroke away with no config editing."
slug: "cost-optimization"
persona: "Solo developer"
painPoint: "You burn through your Claude API budget on tasks that don't need a frontier model. Quick refactors, style tweaks, and doc updates cost the same as architecture planning."
solution: "Create two instances: a cheap one for routine work and a powerful one for hard problems. Route tasks by picking the right command."
steps:
  - title: "Install claude-multi"
    code: "npm install -g claude-multi"
  - title: "Add a budget instance with DeepSeek"
    code: "claude-multi\n# Pick: Add new instance\n# Name: budget\n# Template: deepseek\n# Paste your DeepSeek API key"
  - title: "Add a power instance with GLM"
    code: "claude-multi\n# Pick: Add new instance\n# Name: power\n# Template: glm\n# Paste your GLM API key"
  - title: "Use the cheap one for throwaway work"
    code: "claude-budget \"rename all variables in auth.ts\""
  - title: "Use the powerful one for hard problems"
    code: "claude-power \"refactor the entire auth module to support SAML\""
providers:
  - "DeepSeek"
  - "GLM"
order: 1
---

## The math

A DeepSeek Flash call costs a fraction of what Claude Opus charges per token. Most day-to-day coding tasks -- renaming variables, writing boilerplate, updating configs -- do not need a frontier model.

With claude-multi you get two (or more) commands in your terminal. Each one launches a full Claude Code session, but pointed at a different provider. Pick the right one for the job and watch your bill drop.

## Setting up the split

After installing claude-multi, open the TUI:

```bash
claude-multi
```

Create a **budget** instance using the DeepSeek template. This gives you a `claude-budget` command that routes through DeepSeek's API at lower per-token cost.

Then create a **power** instance using the GLM template. This gives you `claude-power` for the harder tasks.

```bash
# Routine work -- cheap and fast
claude-budget "add error handling to all fetch calls"

# Hard problems -- frontier model
claude-power "redesign the data layer to support offline-first"
```

Both instances share the same Claude Code interface. Same `/loop`, same skills, same plugins. The only difference is which provider handles the request.

## What you keep

Because each instance is still Claude Code under the hood, you lose nothing:

- All your MCP servers still work
- Plugins and skills carry over if you enable auto-sync
- Conversation history stays isolated per instance
- You can still use `/compact`, `/loop`, and every built-in command

## When to use which

| Task | Command | Why |
|------|---------|-----|
| Rename variables | `claude-budget` | Simple text transformation |
| Write unit tests | `claude-budget` | Pattern-based generation |
| Debug a regex | `claude-budget` | Focused, small scope |
| Refactor a module | `claude-power` | Needs broad context |
| Design an API | `claude-power` | Requires judgment |
| Architecture review | `claude-power` | Complex reasoning |

## Tips

- Use auto-sync during setup so both instances share the same plugins and skills
- Check `claude-multi` TUI to see cost-relevant config per instance under **Instance details**
- Add a third instance for MiniMax if you want another price-performance tier
