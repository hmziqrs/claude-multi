---
title: "Stop paying Opus prices for a git status"
description: "If you're sending every request to a flagship model, you're overpaying by a lot. A look at how LLM routing actually works, what kind of savings to expect, and how to set it up."
date: 2026-05-27
tags: [LLM cost optimization, AI development, LLM routing, claude-code-llm-router, tiered models, cost savings, AI engineering, developer tools]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/public/audio/llm-cost-optimization-routing.mp3"
---

Running every Claude Code call through Opus is fine if you're not paying the bill. If you are, it's the most expensive way to do something a model 50x cheaper would have done correctly.

The fix is routing: classify the request, send it to the cheapest model that can handle it. Boring solution, real savings. The numbers people are quoting from production are 60 to 80 percent off versus all-Opus, with no measurable hit to output quality on the easy stuff.

### The cost shape, in concrete terms

A normal day with Claude Code looks something like:

- Lots of small calls. "Explain this `git` command." "Rename this variable." "Add a JSDoc to this function." Cheap to generate, cheap to verify.
- A medium pile of scoped work. "Write unit tests for this function." "Refactor this module to use the new logger." Clear spec, contained blast radius.
- A small number of hard calls. "Why is the auth service deadlocking?" "Design the migration plan for splitting this monolith." These actually need the smart model.

If you bill all three tiers at flagship rates, the first two are subsidizing the third by a wide margin. The first tier alone is usually 70% of your call volume and almost none of your hard-problem load.

### How a router fits in

A router sits between Claude Code and the providers. Every prompt goes through a tiny classifier first (usually itself a cheap LLM, sometimes a heuristic), which decides what tier the request belongs to. Then it forwards to a model you've designated for that tier.

A reasonable default classification is roughly:

- `simple`: typos, renames, formatting, one-liners.
- `medium`: clearly scoped features, tests, single-module refactors.
- `complex`: architecture, cross-subsystem debugging, anything that touches more than a couple of services.

The router (`claude-code-smart-router`, `claude-code-llm-router`, and friends) ships with sensible defaults. You almost always want to tweak them after watching a few days of traffic.

### What the routing chain looks like in practice

Most setups walk through something like:

1. Local model (Ollama with whatever fits your GPU) for the trivial stuff.
2. A cheap remote model (Gemini Flash, Groq Llama, DeepSeek) for the medium tier.
3. A mid-tier model (Sonnet, GPT mid-tier) when the cheap tier isn't confident.
4. Opus, GPT-5, or whatever your flagship is, only when the classifier picks `complex`.

The "free first" routing is the part that produces the savings. If your Ollama box can handle 30% of your calls for free, that's 30% of your bill gone before you spend anything on the rest.

### The features that matter once you're past the demo

A few things to look for in a router beyond the basic tier mapping:

- **Budget caps and downgrades.** When a tier hits its quota, the router falls back to a cheaper model instead of failing the request or silently busting your budget.
- **Caching.** Identical inputs hit the same classification result and, ideally, the same response.
- **Effort knobs.** Some routers can call a model at reduced "thinking" effort for medium work, which cuts the reasoning-token cost meaningfully without dropping output quality on most tasks.
- **Output caps.** Hard limits on response length per tier. Stops a "summarize" call from accidentally generating a novella.

### Where claude-multi fits in

The router needs somewhere to route to. claude-multi gives each provider its own configured instance, so when the router decides "send this to Qwen Flash" or "send this to Kimi" or "send this to local Ollama," the right base URL, model name, and key are already wired up. You don't write a multi-provider config from scratch; you point the router at your existing instances.

### How to start

Pick one router (`claude-code-llm-router` is the most-used right now). Drop in a config that defines your providers and a routing strategy per Claude Code task class: `default`, `background`, `think`, `longContext`, `webSearch`. Send `background` tasks to your cheapest model. Send `think` to the smart one. Watch a week of traffic and adjust.

You won't get the routing right on day one. You'll get it 80% right, save most of the money, and refine the rest as you go.

---

### References

*   [1] TokenMix Blog: Claude Code Router: Configuration + Troubleshooting 2026: [https://tokenmix.ai/blog/claude-code-router-guide-2026](https://tokenmix.ai/blog/claude-code-router-guide-2026)
*   [2] MostafaGalal1/claude-code-smart-router GitHub: [https://github.com/MostafaGalal1/claude-code-smart-router](https://github.com/MostafaGalal1/claude-code-smart-router)
*   [3] rmb/maestro-router GitHub: [https://github.com/rmb/maestro-router](https://github.com/rmb/maestro-router)
