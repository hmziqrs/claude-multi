<div align="center">

<img src="https://raw.githubusercontent.com/hmziqrs/claude-multi/master/public/favicon-animated.svg" width="256" height="256" alt="claude-multi logo">

<h1 align="center">claude-multi</h1>

<p align="center">
  Run multiple isolated Claude Code instances side by side. Each one gets its own provider, config directory, plugins, MCP servers, and <code>claude-&lt;name&gt;</code> command.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/claude-multi"><img src="https://img.shields.io/npm/v/claude-multi?style=flat-square" alt="npm version" /></a>
  <a href="https://github.com/hmziqrs/claude-multi/blob/master/LICENSE"><img src="https://img.shields.io/github/license/hmziqrs/claude-multi?style=flat-square" alt="license" /></a>
  <a href="https://github.com/hmziqrs/claude-multi"><img src="https://img.shields.io/github/stars/hmziqrs/claude-multi?style=flat-square" alt="GitHub stars" /></a>
</p>

---
</div>

## Demo

https://github.com/user-attachments/assets/790edd9c-6ee2-425a-952c-397ad047d653

---

## Why?

Claude Code is great. Switching between providers and model setups is not.

If you want to try GLM today and DeepSeek tomorrow, you usually end up editing `settings.json` by hand, juggling env vars, swapping keys, or maintaining a bunch of shell aliases nobody asked for.

The other option is each provider's own CLI tool. That sounds clean until you realize every tool has its own workflow, its own flags, its own way of doing things. Learning a new harness for every model gets old fast.

So I went the other way: keep one harness I already like, and put the providers behind it. It's still Claude Code under the hood, so `/loop`, `/goal`, skills, MCP servers, and plugins all keep working.

```bash
claude          # your normal setup
claude-glm      # GLM / Z.ai config
claude-deepseek # DeepSeek config
claude-minimax  # MiniMax config
```

---

## Install

Requires Node.js 18+ or Bun 1+, and Claude Code installed globally (`npm install -g @anthropic-ai/claude-code`).

```bash
bun add -g claude-multi
# or: npm install -g claude-multi
# or: pnpm add -g claude-multi
# or: deno install -g -A -n claude-multi npm:claude-multi
```

---

## Quick start

```bash
claude-multi
```

That's the only command to remember. Everything else happens in the terminal UI: pick Add new instance, and the wizard walks you through a name, a provider template, and an API key. When it finishes you have a `claude-<name>` command running real Claude Code against an isolated `~/.claude-<name>/` config.

Two things worth knowing:

- If the menu shows a `!` health hint, press `!` to see what's wrong and fix it.
- After upgrading claude-multi, run `claude-multi doctor check` to apply provider template updates. It backs up `settings.json` first and keeps any values you changed yourself.

Full documentation: **https://claude-multi.hmziq.xyz**

---

## Providers

| Provider | Endpoint | Template name |
|---|---|---|
| GLM Coding Plan | `api.z.ai` | `glm` |
| MiniMax | `api.minimax.io` | `minimax` |
| DeepSeek | `api.deepseek.com` | `deepseek` |
| Xiaomi MiMo | `api.xiaomimimo.com` | `mimo` |
| Xiaomi MiMo (Token Plan) | `token-plan-cn.xiaomimimo.com` | `mimo-token` |
| Moonshot Kimi | `api.moonshot.ai` | `kimi-k2.7-code, kimi-k2.6, kimi-k2.5` |
| Alibaba Qwen | `dashscope-intl.aliyuncs.com` | `qwen` |
| Alibaba Qwen Coding Plan | `coding-intl.dashscope.aliyuncs.com` | `qwen-coding` |

Templates write `ANTHROPIC_BASE_URL`, `ANTHROPIC_MODEL`, and related env vars into `~/.claude-<name>/settings.json`. Provider sync keeps values you changed yourself and restores model slots to the current template.

---

## How it works

Each instance is a config dir at `~/.claude-<name>/` plus a wrapper script at `~/.local/bin/claude-<name>` that sets `CLAUDE_CONFIG_DIR` and runs the unmodified `claude` binary. No fork, no patch. The instance registry lives in `~/.claude-multi/config.json`.

```js
#!/usr/bin/env bun
process.env.CLAUDE_CONFIG_DIR = "/Users/you/.claude-glm"
spawn("claude", process.argv.slice(2), { stdio: "inherit", env: process.env })
```

Auto-sync symlinks `plugins/` and `skills/` back to `~/.claude/`, so a plugin you install once shows up in every instance that opted in. Skip it (or toggle it later in the menu) if you want an instance fully independent.

---

## Troubleshooting

**`claude-<name>` command not found.** Your `~/.local/bin` probably isn't on `PATH`:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc
```

**Broken plugin or skill symlinks.** Pick Re-sync symlinks in the TUI.

**The Ink TUI renders wrong.** `CLAUDE_MULTI_INK=false claude-multi` gets you the plain prompts UI with the same flows.

---

## License

MIT. See [LICENSE](./LICENSE). Copyright (c) 2026 hmziqrs.
