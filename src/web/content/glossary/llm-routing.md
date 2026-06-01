---
title: "LLM Routing"
description: "Choosing which LLM provider or model handles a given task based on cost, speed, context needs, or capability requirements."
term: "LLM Routing"
category: "Concepts"
related:
  - "provider-template"
  - "model-mapping"
  - "context-window"
---

LLM routing means directing a coding task to the model best suited for it. Some tasks need a massive context window. Others need fast, cheap responses. Routing is how you match the task to the right provider.

## How claude-multi handles it

claude-multi doesn't do automatic routing. Each instance is pinned to a single provider. But because instances are cheap to create and independent, you can run multiple instances side by side and pick the right one for the job.

Common routing patterns:

- Use a **GLM instance** for general coding (fast, cost-effective)
- Use a **MiniMax instance** when you need a huge context window (1M tokens)
- Use a **DeepSeek instance** for deep reasoning tasks
- Use an **Anthropic instance** when you need the original Claude experience

## Why not automatic routing

Automatic routing adds latency, complexity, and a failure point. claude-multi keeps it simple: you create instances for the providers you want, and you pick which one to use. No proxy, no daemon, no middleware deciding for you.

## Practical tip

Create a naming convention that makes routing obvious. `claude-glm` for fast work, `claude-minimax` for large files, `claude-deepseek` for complex debugging. The wrapper scripts make this natural.
