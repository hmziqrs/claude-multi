---
question: "Does claude-multi cost anything?"
description: "claude-multi is free and open-source (MIT). You only pay your provider for API usage, the tool itself takes no cut."
category: "Pricing"
order: 11
---

claude-multi is free. It's MIT-licensed, published on npm, and takes no commission or cut from your API usage. The only cost is what your provider charges you for tokens.

## Where the money goes

When you run `claude-deepseek`, you're hitting DeepSeek's API directly. When you run `claude-glm`, you're hitting GLM's API directly. claude-multi doesn't sit in the middle, it just configures which endpoint Claude Code talks to.

So your bill depends on:
- Which provider you're using
- How many tokens you consume
- That provider's pricing model (pay-per-token vs. subscription)

## Comparing providers

That's actually one of the reasons claude-multi exists, you can A/B providers on the same task and see which gives you the best results per dollar. Some providers like DeepSeek and MiMo are significantly cheaper per token than Anthropic. Others like Kimi or Qwen offer subscription plans with credit pools.

Check the [providers docs](/docs/providers/) for the full list with model details.

## What about Claude Code itself?

Claude Code (the `@anthropic-ai/claude-code` package) is also free. It's Anthropic's open-source CLI. You pay for API access, not the tool.

## More info

- [/docs/providers/](/docs/providers/): full provider comparison
- [/blog/five-new-provider-templates/](/blog/five-new-provider-templates/): provider pricing context
- [/blog/claude-code-co-engineer-and-claude-multi/](/blog/claude-code-co-engineer-and-claude-multi/): cost optimization with LLM routing
