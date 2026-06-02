---
title: "Cut Your AI Coding Bill in Half with Provider Routing"
description: "Route cheap tasks to DeepSeek and hard problems to a frontier model. Same interface, different price tags, no friction."
difficulty: "Intermediate"
timeRequired: "5 min"
prerequisites:
  - "claude-multi installed"
  - "API keys for at least two providers"
relatedProviders:
  - "DeepSeek"
  - "GLM"
  - "MiniMax"
order: 4
---

Most coding tasks do not need a frontier model. Renaming variables, writing boilerplate, updating docs, fixing lint errors. These are fast, mechanical tasks that cheaper models handle just fine. The expensive model should reserved for the hard stuff: architecture decisions, complex refactors, debugging race conditions.

claude-multi makes this split trivial. Set up two instances, use the cheap one for day-to-day work, and reach for the powerful one when you need it.

## The cost math

A DeepSeek Flash call costs a fraction of what GLM or MiniMax charges per token for their top-tier models. If you route 80% of your requests to the cheap provider, your total bill drops significantly without changing your workflow.

## Set up the budget instance

```bash
claude-multi
# Add new instance
# Name: budget
# Template: deepseek
# Paste your DeepSeek API key
```

This gives you `claude-budget` for routine work.

## Set up the power instance

```bash
claude-multi
# Add new instance
# Name: power
# Template: glm
# Paste your GLM API key
```

This gives you `claude-power` for heavy lifting.

## The routing rule

No automation needed. You decide per task:

```bash
# Cheap and fast
claude-budget "add error handling to all fetch calls"
claude-budget "rename user_id to userId everywhere"
claude-budget "write a README for this module"

# Expensive and thorough
claude-power "redesign the auth module to support SAML"
claude-power "find the race condition in worker.ts"
claude-power "refactor the data layer for offline-first support"
```

## Decision table

Use this as a quick reference for which instance to pick:

| Task | Instance | Reason |
|------|----------|--------|
| Rename variables | `claude-budget` | Simple text transformation |
| Write unit tests | `claude-budget` | Pattern-based generation |
| Fix lint errors | `claude-budget` | Deterministic fixes |
| Update config files | `claude-budget` | Structured, low-risk |
| Debug a regex | `claude-budget` | Focused, small scope |
| Refactor a module | `claude-power` | Needs broad context |
| Design an API | `claude-power` | Requires judgment |
| Architecture review | `claude-power` | Complex reasoning |
| Security audit | `claude-power` | High stakes, needs depth |

## Share plugins, keep costs separate

Enable auto-sync on both instances so they share plugins and MCP servers:

```bash
claude-multi
# Pick: Toggle auto-sync
# Select: budget
# Select: power
```

Both instances get the same tools. The only difference is the price per token.

## Add a middle tier

If you want three tiers, add MiniMax:

```bash
claude-multi
# Add new instance
# Name: mid
# Template: minimax
```

Now you have budget (DeepSeek), mid (MiniMax), and power (GLM). Route based on task complexity.

## Track your spending

Each provider's dashboard shows token usage and cost. Check them periodically to see if your routing strategy is working:

- **DeepSeek**: Check usage at deepseek.com
- **GLM**: Check usage at your GLM dashboard
- **MiniMax**: Check usage at your MiniMax dashboard

## Next steps

- [A/B test providers on your codebase](/guides/benchmark-providers/)
- [Set up multiple providers from scratch](/guides/multi-provider-setup/)
