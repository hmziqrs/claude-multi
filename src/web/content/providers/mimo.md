---
title: "Xiaomi MiMo Provider for Claude Code"
description: "Run Claude Code with MiMo-V2.5-Pro and MiMo-V2.5 via xiaomimimo.com. 1T parameter MoE model, 1M context, pay-per-token pricing with a token plan option."
provider: "mimo"
tagline: "1T MoE model at a fraction of frontier pricing"
setupCommand: "claude-multi add mimo"
useCases:
  - "High-quality coding at low per-token cost"
  - "Large-scale refactoring and code generation"
  - "Agentic workflows with extended tool use"
  - "Budget-conscious development teams"
pricing: "Pay-per-token via xiaomimimo.com"
order: 4
---

MiMo-V2.5-Pro is a 1 trillion parameter mixture-of-experts model with 42B active parameters and a 1M token context window. It delivers frontier-class coding performance at a significantly lower cost per token than comparable models. The Anthropic-compatible endpoint means it drops straight into Claude Code.

## Model specs

| Role | Model | Parameters | Context | Max Output |
|------|-------|------------|---------|------------|
| Primary (Opus/Sonnet) | MiMo-V2.5-Pro | 1T MoE (42B active) | 1M | 128K |
| Fast (Haiku) | MiMo-V2.5 | 310B MoE (15B active) | 1M | 128K |

V2.5-Pro handles the heavy reasoning. V2.5 runs background tasks, subagent calls, and quick edits at lower cost. The template maps them to the right roles automatically.

Thinking mode is enabled by default.

## Setup

1. Create an account at [xiaomimimo.com](https://xiaomimimo.com) and generate an API key
2. Run the setup command:

```sh
claude-multi add mimo
```

3. Paste your API key when prompted

The template sets up the base URL, model mappings, and thinking parameters. Your instance is ready to use immediately.

## Token Plan alternative

Xiaomi also offers a subscription-based Token Plan with a monthly credit pool. If you prefer predictable monthly costs, use the `mimo-token` template instead. Note that Token Plan uses different regional endpoints (CN, SG, EU). After setup, edit `~/.claude-<name>/settings.json` and replace `ANTHROPIC_BASE_URL` with the endpoint from your subscription console.

## When to pick MiMo

MiMo is the cost-performance leader. If you do a lot of coding and want frontier quality without frontier pricing, MiMo-V2.5-Pro delivers. The 1M context window handles large codebases, and the MoE architecture means you only pay for the active parameters.

For developers who prefer a fixed monthly bill, switch to the MiMo Token Plan template.

## Pricing details

MiMo is available two ways: pay-per-token at [xiaomimimo.com](https://xiaomimimo.com), or a subscription Token Plan (monthly credit pool, regional CN/SG/EU endpoints — use the `mimo-token` template). The 1T MoE architecture keeps per-token cost low because only 42B of the 1T parameters are active per request. Check xiaomimimo.com for current rates.

## Related providers

- [DeepSeek](/providers/deepseek/) - similar positioning, also pay-per-token
- [Kimi](/providers/kimi/) - Moonshot's agentic coding model
- [MiniMax](/providers/minimax/) - larger output window, higher context
