---
title: Environment variables
description: Environment variable reference for claude-multi and provider configuration
---

## claude-multi runtime variables

These control claude-multi itself. Set them in your shell before launching.

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_MULTI_INK` | `true` | Set to `false` to use the simpler prompts-based UI instead of the Ink TUI |
| `CLAUDE_MULTI_HOME` | `~` | Override the base directory for config storage. claude-multi looks for `config.json` at `$CLAUDE_MULTI_HOME/.claude-multi/` |
| `CLAUDE_MULTI_UPDATE_CHECK` | `false` | Set to `true` to check for claude-multi and Claude Code updates on launch |

**Example:**

```bash
# Use the simpler UI
CLAUDE_MULTI_INK=false claude-multi

# Store config in a custom location
CLAUDE_MULTI_HOME=/tmp/test-env claude-multi add test --provider deepseek --api-key sk-...
```

---

## Claude Code instance variables

These live in each instance's `settings.json` under the `env` key. Provider templates fill them in when you create the instance.

### Core API variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_AUTH_TOKEN` | API key for the provider | `sk-your-key-here` |
| `ANTHROPIC_BASE_URL` | Provider's Anthropic-compatible API endpoint | `https://api.deepseek.com/anthropic` |

### Model mapping variables

| Variable | Description | Maps to |
|----------|-------------|---------|
| `ANTHROPIC_MODEL` | Primary model | Claude Code's internal opus slot |
| `ANTHROPIC_SMALL_FAST_MODEL` | Fast/cheap model for quick tasks | Claude Code's internal haiku slot |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet-tier model | Used when Claude Code requests a "sonnet" class model |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus-tier model | Used when Claude Code requests an "opus" class model |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku-tier model | Used when Claude Code requests a "haiku" class model |

### Sub-agent variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Model used by sub-agents for background tasks, exploration, and code review | `deepseek-v4-flash` |
| `CLAUDE_CODE_EFFORT_LEVEL` | Reasoning effort level for the main model | `low`, `medium`, `high`, `max` |

### Timeout

| Variable | Description | Example |
|----------|-------------|---------|
| `API_TIMEOUT_MS` | Request timeout in milliseconds | `600000` |

### Context window / auto-compaction variables

Claude Code compresses older conversation history once usage crosses a share of the context window, instead of failing when the model hits its token limit. It assumes a 200K window by default, so a provider with a smaller real window needs these overrides. Without them, compaction runs too late and the API call fails mid-session.

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | The model's actual context window size, in tokens | `131072` (Qwen's 128K) |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Percentage of the window that triggers compaction | `75` |

Models that match or exceed the 200K default, like GLM-5.3 with its 1M window, use a `[1m]` suffix on the model name instead, so you do not need an override.

---

## Per-provider defaults

Each provider template sets these variables to its own values.

### GLM (`glm`)

```json
{
  "ANTHROPIC_AUTH_TOKEN": "",
  "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
  "API_TIMEOUT_MS": "3000000",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-5-turbo",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5.3-flash[1m]",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.3[1m]",
  "ANTHROPIC_MODEL": "glm-5.3[1m]",
  "ANTHROPIC_SMALL_FAST_MODEL": "glm-5-turbo",
  "ENABLE_THINKING": "true",
  "REASONING_EFFORT": "high",
  "MAX_THINKING_TOKENS": "8000",
  "ENABLE_STREAMING": "true",
  "MAX_OUTPUT_TOKENS": "128000"
}
```

The `glm` template maps opus to `glm-5.3[1m]`, sonnet to `glm-5.3-flash[1m]`, and haiku/small-fast to `glm-5-turbo` (200K). Both `glm-5.3[1m]` and the flash variant use the `[1m]` suffix for their 1M context window; GLM-5.3-Flash is natively multimodal with 3x the GLM-5.3 quota on the Coding Plan. Requests for `glm-5.2` or `glm-5.1` are automatically routed to `glm-5.3` on the Coding Plan endpoint, so existing configs keep working.

### MiniMax (`minimax`)

```json
{
  "ANTHROPIC_BASE_URL": "https://api.minimax.io/anthropic",
  "ANTHROPIC_MODEL": "MiniMax-M3",
  "ANTHROPIC_SMALL_FAST_MODEL": "MiniMax-M3",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "MiniMax-M3",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "MiniMax-M3",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "MiniMax-M3",
  "CLAUDE_CODE_SUBAGENT_MODEL": "MiniMax-M3",
  "CLAUDE_CODE_EFFORT_LEVEL": "max"
}
```

### DeepSeek (`deepseek`)

```json
{
  "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
  "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
  "ANTHROPIC_SMALL_FAST_MODEL": "deepseek-v4-flash",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-flash",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
  "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-v4-flash",
  "CLAUDE_CODE_EFFORT_LEVEL": "max",
  "API_TIMEOUT_MS": "600000"
}
```

### Xiaomi MiMo (`mimo`)

```json
{
  "ANTHROPIC_BASE_URL": "https://api.xiaomimimo.com/anthropic",
  "ANTHROPIC_MODEL": "mimo-v2.5-pro",
  "ANTHROPIC_SMALL_FAST_MODEL": "mimo-v2.5",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "mimo-v2.5",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "mimo-v2.5-pro",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "mimo-v2.5",
  "API_TIMEOUT_MS": "600000"
}
```

The `mimo-token` template uses the same models but a different base URL (`token-plan-cn.xiaomimimo.com`). Replace it with your regional endpoint from the subscription console.

### Moonshot Kimi (`kimi`)

```json
{
  "ANTHROPIC_BASE_URL": "https://api.moonshot.ai/anthropic",
  "ANTHROPIC_MODEL": "kimi-k2.6",
  "ANTHROPIC_SMALL_FAST_MODEL": "kimi-k2.5",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "kimi-k2.6",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "kimi-k2.7-code",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "kimi-k2.5",
  "API_TIMEOUT_MS": "600000"
}
```

### Alibaba Qwen (`qwen`)

```json
{
  "ANTHROPIC_BASE_URL": "https://dashscope-intl.aliyuncs.com/apps/anthropic",
  "ANTHROPIC_MODEL": "qwen3-coder-next",
  "ANTHROPIC_SMALL_FAST_MODEL": "qwen3-coder-flash",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "qwen3-coder-plus",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "qwen3-coder-next",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "qwen3-coder-flash",
  "API_TIMEOUT_MS": "600000"
}
```

The `qwen-coding` template uses the same models but a different base URL (`coding-intl.dashscope.aliyuncs.com`).

---

## Where to set variables

**claude-multi variables:** Set in your shell profile (`.zshrc`, `.bashrc`, `.profile`) or export them before running `claude-multi`.

**Instance variables:** Edit `~/.claude-<name>/settings.json` directly, or let the provider template fill them in when you create the instance. They apply to that instance only and do not affect other instances or your default `~/.claude` setup.
