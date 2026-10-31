---
title: "A reproducible LLM routing setup for Claude Code"
description: "A shell router for claude-multi, a worked cost example with current DeepSeek, MiniMax, and GLM prices, and why routing between cheap models saves little."
date: 2026-05-27
updated: 2026-10-31
tags: [llm-cost, routing, claude-code, deepseek, minimax, glm]
---

Running every Claude Code call through a flagship model is expensive. The part people skip is the measurement: routing only saves money if the cheap model finishes the task, and if you count the time you spend redoing its work.

A router can be a product, a proxy, or a shell function. The shell version is easiest to audit, and it fits claude-multi because every instance is already a command.

## The setup

```sh
npm install -g claude-multi
claude-multi add deepseek
claude-multi add minimax
claude-multi add glm
```

Each command prompts for an API key and writes a separate config directory. You get `claude-deepseek`, `claude-minimax`, and `claude-glm`.

Add a function to `~/.zshrc` or `~/.bashrc`:

```sh
cc() {
  case "$1" in
    cheap) shift; claude-deepseek "$@" ;;
    mid)   shift; claude-minimax "$@" ;;
    hard)  shift; claude-glm "$@" ;;
    *) echo "usage: cc {cheap|mid|hard} [claude args]"; return 1 ;;
  esac
}
```

Reload the shell and use it:

```sh
cc cheap -p "rename getUser to fetchUser in src/api.ts"
cc mid
cc hard
```

With no extra args, `cc mid` starts an interactive session. With `-p`, it runs a one-shot prompt. Everything after the tier goes to the underlying command.

The shipped DeepSeek template already pins `deepseek-flash[1m]` in the main slots, so the cheap branch uses it as is. MiniMax defaults to `MiniMax-M3.1-Flash[1m]`, and GLM defaults to `glm-5.3[1m]`. The shell function does not change any model IDs.

## The routing rule

Route by the cost of a wrong answer, not by prompt length. A long prompt that asks for a rename is cheap work. A short prompt that asks why the auth service deadlocks is hard work.

The cheap tier covers renames, formatting, commit messages, test scaffolding, log reading, and docs edits. The answer is easy to check.

The mid tier covers a scoped feature, a single-module refactor, or a review with the diff attached. The blast radius is one file or one package.

The hard tier covers cross-service debugging, schema migrations, architecture, and anything where a wrong answer costs more than the tokens.

If you want automatic classification, use a router and log its decisions. The shell function is manual on purpose. You see the tier in the command and can change it on the next turn.

## Worked example

Assume 300M input tokens and 30M output tokens per month. That is a heavy solo workload or a small team, not a measurement. All prices are per 1M tokens, from the vendor pages linked below.

All [Opus 4.7](https://platform.claude.com/docs/en/about-claude/pricing): 300 x $5 + 30 x $25 = $1,500 + $750 = $2,250.

Split the same volume:

- 80% DeepSeek Flash, off-peak: 240M input, 24M output. 240 x $0.15 + 24 x $0.60 = $36.00 + $14.40 = $50.40.
- 10% MiniMax M3.1 Flash: 30M input, 3M output. 30 x $0.15 + 3 x $0.60 = $4.50 + $1.80 = $6.30.
- 10% GLM-5.3 on the Lite plan: $18 for the month, assuming the volume fits the 2,000 credits per 5 hours and 10,000 per week limits.

Total: $74.70, or about 97% less than all Opus. The arithmetic is real. The split is an assumption. If 30% of your work is hard, or if the cheap model needs two attempts on half the tasks, the number moves.

At these rates, the split is not the cheapest option in the table. All MiniMax M3.1 Flash for the same month is 300 x $0.15 + 30 x $0.60 = $45.00 + $18.00 = $63.00. All DeepSeek Flash off-peak is the same $63.00. The three-way split costs $11.70 more than either one. The GLM Lite subscription is the reason: $18 fixed for 10% of the volume, against $6.30 for the same tokens on MiniMax or DeepSeek. The large saving came from leaving Opus, not from routing among three cheap options.

## When routing is not worth it

If your default is already a cheap model, the remaining gap is small. DeepSeek Flash off-peak and MiniMax M3.1 Flash both list $0.15 input and $0.60 output per 1M tokens. Routing between them buys nothing on price. It changes the model, the context behavior, and the failure modes, and it adds a config and a decision.

Long context is flat on M3.1 Flash and DeepSeek Flash, but not on every model. M3, the previous MiniMax generation, costs $0.60 input and $2.40 output above 512K input tokens, double its short tier. A 700K-token request on M3 does not get the headline rate. If you route long requests to a tiered model, the savings estimate is wrong.

Cache locality matters more than the list price. A stable prefix that is cached on one provider is cheap to reuse. Moving the same prefix to another provider starts the cache over. If 90% of your input is cache reads, compare cache rates and cache behavior, not the input rate.

A subscription needs volume. GLM Lite is $18 per month. At 3M input and 0.3M output, GLM-5.3 pay-as-you-go costs $5.52 at $1.40 input and $4.40 output, so the plan does not pay for itself at that volume. At 30M input and 3M output, the same rates come to $55.20, and the plan is the cheaper route if the quota caps fit.

Rework is the hidden cost. A cheap answer that needs a second pass can cost more than the expensive first pass. Count attempts as well as tokens. Latency works the same way: a cheaper model that queues or streams slowly can cost more in wall-clock time than it saves.

## How to check it

Claude Code reports session cost with `/cost`. Run a week of tasks, record the tier, and note whether the first answer survived review. If a tier needs a second attempt more than a quarter of the time, move that task class up. If the hard tier sits idle, drop the subscription or route it per task.

Do not trust a single week. Prompt mix changes, and a model update can change the answer quality without changing the price.

## What the savings depend on

Routing is a decision you make per task. The savings depend on the default you are leaving. At current prices, the gap between Opus and a cheap model is large, and the gap between two cheap models is close to zero. If you are already on MiniMax M3.1 Flash or DeepSeek Flash, routing is a quality and latency decision, not a cost one. The measurement in this post is a model, not a bill. Run your own week before you build a router around it.

Prices:

- [DeepSeek API pricing](https://api-docs.deepseek.com/quick_start/pricing/): Flash off-peak $0.15 input / $0.60 output, Pro off-peak $0.66 / $1.98. Peak is double.
- [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview): M3.1 Flash $0.15 / $0.60 flat, cache read $0.015. M3 $0.30 / $1.20 up to 512K input, $0.60 / $2.40 above it, cache read $0.06.
- [GLM Coding Plan](https://docs.z.ai/devpack/overview): Lite $18 per month, with 2,000 credits per 5 hours and 10,000 per week. The [GLM-5.3 post](/blog/glm-5-3-coding-plan/) has the credit formula.
- [GLM API pricing](https://docs.z.ai/guides/overview/pricing): GLM-5.3 at $1.40 input / $4.40 output per 1M. The GLM template uses the Coding Plan endpoint, not this route.

For the instance commands, see [/docs/usage/](/docs/usage/). For current model mappings, see [/providers/](/providers/).
