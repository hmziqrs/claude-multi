---
question: "Does claude-multi cost anything?"
description: "claude-multi is free and open-source (MIT). You pay your provider for model access. The tool takes no cut."
category: "Pricing"
order: 11
---

claude-multi is free. It is MIT-licensed, published on npm, and takes no cut of what you pay your provider. The only cost is what your provider charges for model access.

#### Where the money goes

When you run `claude-deepseek`, Claude Code talks to DeepSeek's API directly. When you run `claude-glm`, it talks to GLM's API directly. claude-multi configures which endpoint Claude Code uses. It does not proxy the request.

Your bill depends on the provider, the number of tokens you consume, and that provider's pricing model (pay per token or subscription).

#### Comparing providers

That is one reason to use claude-multi: you can run the same task against two providers and compare cost and output. The [providers page](/providers/) lists models and current pricing notes. DeepSeek and Xiaomi MiMo publish lower per-token list prices than Anthropic's Opus models. GLM and Qwen also sell coding plans alongside pay-as-you-go pricing.

#### What about Claude Code itself?

The `@anthropic-ai/claude-code` package is free to install. Anthropic charges for model access, either through a subscription or API billing. The CLI is not open source; claude-multi is.
