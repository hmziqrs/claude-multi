---
title: Environment Variables
description: Environment variable reference for claude-multi and provider configuration
---

## claude-multi runtime variables

These control claude-multi's own behavior. Set them in your shell before launching.

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

These are set inside each instance's `settings.json` under the `env` key. Provider templates populate them automatically during instance creation.

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

---

## Per-provider defaults

Each provider template sets these variables with provider-specific values. Here's what each template configures:

### GLM (`glm`)

```json
{
  "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
  "ANTHROPIC_MODEL": "glm-5.1",
  "ANTHROPIC_SMALL_FAST_MODEL": "glm-5-turbo",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-5-turbo",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-5.1",
  "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-5-turbo",
  "CLAUDE_CODE_SUBAGENT_MODEL": "glm-5-turbo",
  "CLAUDE_CODE_EFFORT_LEVEL": "high"
}
```

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

The `mimo-token` template uses the same models but a different base URL (`token-plan-cn.xiaomimimo.com`). Replace with your regional endpoint from the subscription console.

### Moonshot Kimi (`kimi`)

```json
{
  "ANTHROPIC_BASE_URL": "https://api.moonshot.ai/anthropic",
  "ANTHROPIC_MODEL": "kimi-k2.6",
  "ANTHROPIC_SMALL_FAST_MODEL": "kimi-k2.5",
  "ANTHROPIC_DEFAULT_SONNET_MODEL": "kimi-k2.5",
  "ANTHROPIC_DEFAULT_OPUS_MODEL": "kimi-k2.6",
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

**Instance variables:** Edit `~/.claude-<name>/settings.json` directly, or let provider templates populate them during instance creation. These are set per-instance and don't affect other instances or your default `~/.claude` setup.
