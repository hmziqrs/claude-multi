---
title: "For researchers"
description: "Run the same prompt against multiple models, compare outputs side-by-side, keep every experiment isolated and reproducible."
slug: "researchers"
audience: "AI researchers, ML engineers, and anyone evaluating language models who needs to compare outputs across providers without setup friction."
painPoints:
  - "Running the same prompt against GPT, Claude, DeepSeek, and Qwen means four different setups"
  - "No easy way to keep experiment configs isolated so results don't contaminate each other"
  - "Switching models mid-experiment means losing context or overwriting settings"
  - "Comparing model outputs requires manual copy-paste or custom scripts"
  - "Reproducing results is hard when configs drift between runs"
benefits:
  - "Create one instance per model, run them in parallel, compare outputs in real time"
  - "Each instance has its own config and history — experiments stay isolated"
  - "Templates handle endpoint and model configuration so you focus on prompts, not plumbing"
  - "Plugin sync means your evaluation tools work across all instances"
  - "Full Claude Code feature set in every instance — tools, file access, MCP servers"
recommendedProviders:
  - "Anthropic"
  - "DeepSeek"
  - "GLM"
  - "Qwen"
  - "Kimi"
order: 3
---

Model evaluation shouldn't take longer than the research itself.

If you're comparing how different models handle code generation, reasoning, or tool use, the setup is the bottleneck. Each provider has its own SDK, its own auth flow, its own quirks. You end up writing wrapper scripts that break when an API changes, or manually copying prompts between browser tabs.

claude-multi gives you a separate Claude Code instance for each model. Same interface, same tools, same plugins. Different model underneath.

## The evaluation workflow

1. Create an instance for each model you're testing: `claude-anthropic`, `claude-deepseek`, `claude-glm`, `claude-qwen`.
2. Run the same prompt in each terminal window.
3. Compare outputs side-by-side. Each instance keeps its own history, so you can go back and review later.
4. Swap models without changing your evaluation script — every instance supports the same Claude Code features.

## Why instances instead of scripts?

Because instances give you the full Claude Code environment. File reads, shell commands, MCP servers, multi-turn conversations. Your evaluation isn't limited to "send prompt, get response." You can test how models handle complex, multi-step tasks with real tool use.

And because each instance is isolated, the context from one experiment doesn't leak into the next. Run ten experiments on `claude-deepseek`, and `claude-anthropic` stays clean.

## Reproducibility

Instance configs are just JSON files in `~/.claude-<name>/settings.json`. Check them into version control alongside your experiment code. Anyone on your team can reproduce the exact same setup by running `claude-multi` and pointing at the same template.

## Where to go next

- [/docs/providers/](/docs/providers/): see all available templates
- [/faq/supported-providers/](/faq/supported-providers/): provider details and model lists
- [/for/indie-developers/](/for/indie-developers/): if you also build tools around your research
