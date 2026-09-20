---
title: "Xiaomi MiMo Provider for Claude Code"
description: "Run Claude Code with MiMo-V2.5-Pro and MiMo-V2.5 via xiaomimimo.com. 1T parameter MoE model, 1M context, pay-per-token pricing with a token plan option."
provider: "mimo"
tagline: "1T MoE model billed on 42B active parameters"
setupCommand: "claude-multi add mimo"
useCases:
  - "Coding work where per-token cost is the constraint"
  - "Large-scale refactoring and code generation"
  - "Agentic workflows with extended tool use"
  - "Teams working to a tight API budget"
pricing: "Pay-per-token via xiaomimimo.com"
order: 4
---

MiMo-V2.5-Pro is a 1 trillion parameter mixture-of-experts model with 42B active parameters and a 1M token context window. Only the active parameters are billed, which keeps the per-token cost low. The Anthropic-compatible endpoint drops straight into Claude Code.

## Model specs

| Role | Model | Parameters | Context | Max Output |
|------|-------|------------|---------|------------|
| Primary (Opus/Sonnet) | MiMo-V2.5-Pro | 1T MoE (42B active) | 1M | 128K |
| Fast (Haiku) | MiMo-V2.5 | 310B MoE (15B active) | 1M | 128K |

V2.5-Pro handles the heavy reasoning. V2.5 runs background tasks, subagent calls, and quick edits at lower cost. The template maps each one to its role for you.

Thinking mode is enabled by default.

## Setup

1. Create an account at [xiaomimimo.com](https://xiaomimimo.com) and generate an API key
2. Run the setup command:

```sh
claude-multi add mimo
```

3. Paste your API key when prompted

The template sets the base URL, model mappings, and thinking parameters. That's the whole setup.

## Token Plan alternative

Xiaomi also sells a subscription Token Plan with a monthly credit pool. If you want a predictable monthly cost, use the `mimo-token` template instead. Token Plan runs on different regional endpoints (CN, SG, EU), so after setup, edit `~/.claude-<name>/settings.json` and replace `ANTHROPIC_BASE_URL` with the endpoint from your subscription console.

## When to pick MiMo

Pick MiMo when per-token cost is what you are optimizing for. The 1M context window handles large codebases, and MoE billing means you pay for the 42B active parameters rather than the full trillion.

If you would rather have a fixed monthly bill, switch to the MiMo Token Plan template.

## Pricing details

MiMo comes two ways: pay-per-token at [xiaomimimo.com](https://xiaomimimo.com), or a subscription Token Plan (monthly credit pool, regional CN/SG/EU endpoints, the `mimo-token` template). The 1T MoE architecture keeps the per-token cost low because only 42B of the 1T parameters are active per request. xiaomimimo.com has current rates.

## Related providers

- [DeepSeek](/providers/deepseek/) - also pay-per-token, 1M context
- [Kimi](/providers/kimi/) - Moonshot's coding models, built for tool use
- [MiniMax](/providers/minimax/) - same 1M context, 512K output
