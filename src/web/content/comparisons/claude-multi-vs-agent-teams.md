---
title: "claude-multi vs Agent Teams"
description: "claude-multi is a community tool for running multiple Claude Code instances. Agent Teams is Anthropic's built-in feature for coordinating multiple agents. Here is how they compare."
toolA: "claude-multi"
toolB: "Agent Teams"
toolAUrl: "https://claude-multi.hmziq.xyz"
toolBUrl: "https://docs.anthropic.com"
verdict: "Use claude-multi for multi-provider parallelism and config isolation. Use Agent Teams if you want native multi-agent coordination built into Claude Code itself. They solve different problems."
toolAPros:
  - "Works with any Claude Code provider, not just Anthropic"
  - "Config-directory isolation between instances"
  - "Provider flexibility: run DeepSeek, GLM, OpenRouter, and Anthropic side by side"
  - "Plugin sync across instances"
  - "Independent instances that don't need to coordinate"
  - "Open source and community maintained"
toolBPros:
  - "Built directly into Claude Code by Anthropic"
  - "Agents can coordinate and share context"
  - "No additional setup required if you use Claude Code"
  - "Official support and documentation"
  - "Tighter integration with Claude's capabilities"
  - "Purpose-built for multi-agent workflows"
toolACons:
  - "No agent coordination. Each instance works independently"
  - "Community maintained, not officially supported"
  - "Requires manual setup for each instance"
  - "Instances don't share context automatically"
toolBCons:
  - "Limited to Anthropic's models and ecosystem"
  - "No provider switching. You use what Anthropic offers"
  - "No config-directory isolation between agents"
  - "Coordination overhead can slow things down"
  - "Fewer customization options"
useToolAWhen: "You want to run parallel tasks with different providers and keep configs isolated. Good for developers who need provider flexibility and independent concurrent sessions."
useToolBWhen: "You want agents that can coordinate, share context, and work together on a single task. Good for complex tasks that benefit from agent collaboration within Anthropic's ecosystem."
order: 5
---

## The key distinction

claude-multi runs independent instances. Each one does its own thing with its own provider. They don't talk to each other. They don't need to.

Agent Teams runs coordinated agents. They share context, divide work, and collaborate on tasks. This is built into Claude Code by Anthropic.

## Independent vs coordinated

claude-multi is designed for independence. Instance A refactors the backend. Instance B writes frontend tests. Instance C updates the docs. They don't need to know about each other.

Agent Teams is designed for coordination. Agent A plans the architecture. Agent B implements it based on A's plan. Agent C reviews B's code. They work together on a shared goal.

## Provider flexibility

claude-multi lets you run different providers in each instance. One on Anthropic, one on DeepSeek, one on GLM. Agent Teams is limited to Anthropic's models.

## When to use which

If your tasks are independent and you want provider choice, claude-multi is the right tool. If your tasks need coordination and you are fine staying in Anthropic's ecosystem, Agent Teams is the better option.

Some teams use both: Agent Teams for coordinated work on complex features, claude-multi for running parallel tasks with different providers in the background.
