---
title: "For students"
description: "Learn AI-assisted coding with free and cheap models. No credit card required for most providers, no complex setup."
slug: "students"
audience: "CS students, bootcamp attendees, and self-taught learners who want to try AI coding tools without spending money on the wrong model."
painPoints:
  - "Anthropic's API costs money you'd rather spend on coffee"
  - "You want to try AI coding but the setup guides assume you already know what an API key is"
  - "One wrong config change and your entire Claude setup breaks"
  - "You're learning three languages this semester and need different tools for each"
  - "Free tier limits mean you blow through your quota mid-assignment"
benefits:
  - "Start with free or cheap providers like DeepSeek, GLM, or Qwen — upgrade when you're ready"
  - "The TUI walks you through setup — no manual config editing, no terminal wizardry required"
  - "Break an instance? Delete it, create a new one. Your other instances are untouched"
  - "Learn how AI coding tools work across different models without committing to one"
  - "MIT licensed open source — read the code, learn from it, contribute back if you want"
recommendedProviders:
  - "DeepSeek"
  - "GLM"
  - "Qwen"
  - "Kimi"
order: 5
---

You're learning to code. You've heard about AI pair programming. The pricing page says $0.03 per thousand tokens and you have no idea if that's expensive or not.

Here's the thing: you don't need to start with the most expensive model.

## Start cheap, learn fast

DeepSeek, GLM, and Qwen all have free or very cheap tiers. They're good enough for learning — writing functions, debugging homework, understanding error messages. Create a `claude-deepseek` instance, use it for a week, see if AI-assisted coding clicks for you.

If it does, add another provider later. Your DeepSeek instance stays exactly as it is.

## The setup is two commands

```sh
bun add -g claude-multi
claude-multi
```

The TUI (that's the terminal menu) asks you a few questions: what do you want to name this instance, which provider, paste your API key. Arrow keys to move, enter to select. That's it.

If you mess something up, you can delete the instance and start over. No harm done. Your other instances — if you have any — don't care.

## Why multiple instances matter for learning

Different models have different strengths. One might be better at explaining concepts. Another might write cleaner code. A third might catch bugs the others miss.

Running multiple instances means you can ask the same question to two models and compare. That's not just practical — it teaches you how these tools actually work, what they're good at, where they hallucinate.

## You can read the source

claude-multi is open source. If you're curious how a CLI tool is built in TypeScript, or how terminal UIs work with Ink and React, the code is right there. A lot of students have told us they learned more from reading the source than from the tool itself.

## Where to go next

- [/docs/getting-started/](/docs/getting-started/): step-by-step install guide
- [/faq/how-to-install/](/faq/how-to-install/): troubleshooting if something goes wrong
- [/for/indie-developers/](/for/indie-developers/): once you start building real projects
