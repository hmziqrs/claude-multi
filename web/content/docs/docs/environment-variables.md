---
title: Environment variables
description: "Runtime variables for claude-multi and the Claude Code env keys that provider templates write into each instance's settings.json."
---

## claude-multi runtime variables

These control claude-multi itself. Set them in your shell before launching.

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_MULTI_INK` | `true` | Set to `false` to use the simpler prompts-based UI instead of the Ink TUI |
| `CLAUDE_MULTI_HOME` | home directory | Base directory for central state. Health status and migration backups resolve under `$CLAUDE_MULTI_HOME/.claude-multi/` |
| `CLAUDE_MULTI_CLAUDE_PATH` | unset | Absolute path to the `claude` binary. Overrides the PATH lookup when wrappers are created or repaired. The file must exist |
| `CLAUDE_MULTI_UPDATE_CHECK` | `false` | Set to `true` to check for claude-multi and Claude Code updates on launch |

**Examples:**

```bash
# Use the simpler UI
CLAUDE_MULTI_INK=false claude-multi

# Point wrapper creation at a specific Claude Code install
CLAUDE_MULTI_CLAUDE_PATH=/opt/claude/bin/claude claude-multi add glm

# Store central state under a test directory
CLAUDE_MULTI_HOME=/tmp/test-env claude-multi doctor check
```

`CLAUDE_MULTI_HOME` does not move an instance's config directory. Each instance still lives at `~/.claude-<name>/` unless you pass `--config` to `add`. The instance registry still resolves from your home directory, so this variable is mainly useful for tests and isolated health or migration runs.

---

## Claude Code instance variables

These live in each instance's `settings.json` under the `env` key. Provider templates fill them in. You can edit them by hand or let `claude-multi doctor fix` refresh them from the current template.

### Core API variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_AUTH_TOKEN` | Bearer token for the `Authorization` header. Provider API keys go here | `sk-your-key-here` |
| `ANTHROPIC_BASE_URL` | Provider's Anthropic-compatible API endpoint | `https://api.deepseek.com/anthropic` |

### Model mapping variables

| Variable | Description | Maps to |
|----------|-------------|---------|
| `ANTHROPIC_MODEL` | Primary model for the session | The main conversation |
| `ANTHROPIC_SMALL_FAST_MODEL` | Deprecated. Use `ANTHROPIC_DEFAULT_HAIKU_MODEL` for the fast model | Superseded by `ANTHROPIC_DEFAULT_HAIKU_MODEL`; current templates do not write it |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Sonnet-tier model | Used when Claude Code requests a "sonnet" class model |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Opus-tier model | Used when Claude Code requests an "opus" class model |
| `ANTHROPIC_DEFAULT_FABLE_MODEL` | Fable-tier model | Used by the `fable` alias and automatic fallback. Without it, Claude Code asks the provider for `claude-fable-5-1`, which a third-party endpoint cannot serve |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Haiku-tier model | Used when Claude Code requests a "haiku" class model, and by most templates for the fast slot |

### Sub-agent, effort, and thinking variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_CODE_SUBAGENT_MODEL` | Default model for subagents, agent teams, and workflow agents. A per-invocation model or an agent definition's `model` field can override it | `deepseek-flash` |
| `CLAUDE_CODE_EFFORT_LEVEL` | Reasoning effort for the main model. Accepted values depend on the model | `low`, `medium`, `high`, `xhigh`, `max` |
| `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT` | Set to `1` to send the effort parameter for custom model IDs. Templates that set an effort level include it because Claude Code cannot infer effort support from a third-party model name | `1` |
| `MAX_THINKING_TOKENS` | Fixed thinking budget in tokens. Applies only to models that accept a budget; adaptive-reasoning models and providers that use an effort parameter can ignore it | `32000` |

### Output variables

Claude Code caps output at 128,000 tokens for an unrecognized model ID and defaults to 32,000 when the variable is unset. A model that lists a larger maximum output cannot exceed the Claude Code cap.

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Maximum response tokens | `128000` |

### Timeout and traffic variables

| Variable | Description | Example |
|----------|-------------|---------|
| `API_TIMEOUT_MS` | Time in milliseconds each request attempt has to receive response headers. It does not cap how long a streaming response runs | `3000000` |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | Disables nonessential traffic. The GLM and MiniMax templates set it to `1` | `1` |

### Context window and auto-compaction

Claude Code assumes a 200K context window for an unrecognized model ID. When the real window differs, tell Claude Code with the `[1m]` suffix on the model name or with `CLAUDE_CODE_MAX_CONTEXT_TOKENS`. Without that, compaction runs against the wrong window and the API call can fail mid-session.

Claude Code compresses older conversation history once usage crosses a share of the window. `CLAUDE_CODE_AUTO_COMPACT_WINDOW` sets the window used for that decision; it accepts values from 100,000 to 1,000,000. `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` sets the percentage that triggers compaction.

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_CODE_MAX_CONTEXT_TOKENS` | Context window override. Applies directly to unrecognized non-`claude-` IDs without `[1m]`; with `[1m]`, pair it with `CLAUDE_CODE_DISABLE_1M_CONTEXT=1`; for recognized IDs it needs `DISABLE_COMPACT` | `983616` for Qwen |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | Window used to decide when to compact, in tokens. Range is 100000 to 1000000 | `786432` for DeepSeek |
| `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | Percentage of the window that triggers compaction. It can only make compaction happen earlier; values above the default are ignored | `75` |

The templates set this window at or below the model's context limit. Values below 100,000 or above 1,000,000 are outside the supported range.

---

## Per-provider defaults

Each template writes its own base URL, model slots, timeout, and tuning values. This table matches `src/templates.ts` in 0.13.x.

| Template | Provider page | Base URL | Primary slot | Fable slot | Fast slot | Timeout |
|----------|---------------|----------|--------------|------------|-----------|---------|
| `glm` | [GLM](/providers/glm/) | `https://api.z.ai/api/anthropic` | `glm-5.3[1m]` | `glm-5.3[1m]` | `glm-5.3-flash[1m]` | `3000000` |
| `minimax` | [MiniMax](/providers/minimax/) | `https://api.minimax.io/anthropic` | `MiniMax-M3.1-Flash[1m]` | `MiniMax-M3.1-Flash[1m]` | `MiniMax-M3.1-Flash[1m]` | `3000000` |
| `deepseek` | [DeepSeek](/providers/deepseek/) | `https://api.deepseek.com/anthropic` | `deepseek-flash[1m]` | `deepseek-flash[1m]` | `deepseek-flash` | `3000000` |
| `mimo` | [Xiaomi MiMo](/providers/mimo/) | `https://api.xiaomimimo.com/anthropic` | `mimo-v2.6-pro[1m]` | `mimo-v2.6-pro[1m]` | `mimo-v2.6-flash[1m]` | `3000000` |
| `mimo-token` | [Xiaomi MiMo](/providers/mimo/) | `https://token-plan-cn.xiaomimimo.com/anthropic` | `mimo-v2.6-pro[1m]` | `mimo-v2.6-pro[1m]` | `mimo-v2.6-flash[1m]` | `3000000` |
| `kimi` | [Moonshot Kimi](/providers/kimi/) | `https://api.moonshot.ai/anthropic` | `kimi-k3.1-pro[1m]` | `kimi-k3.1-pro[1m]` | `kimi-k3.1-pro[1m]` | `3000000` |
| `qwen` | [Alibaba Qwen](/providers/qwen/) | `https://dashscope-intl.aliyuncs.com/apps/anthropic` | `qwen3.8-max` | `qwen3.8-max` | `qwen3.8-flash` | `3000000` |
| `qwen-coding` | [Alibaba Qwen](/providers/qwen/) | `https://coding-intl.dashscope.aliyuncs.com/apps/anthropic` | `qwen3.7-plus` | `qwen3.7-plus` | `qwen3.7-plus` | `3000000` |

The primary column shows `ANTHROPIC_MODEL`. The Fable column shows `ANTHROPIC_DEFAULT_FABLE_MODEL`. The fast column shows `ANTHROPIC_DEFAULT_HAIKU_MODEL`. Templates that set `CLAUDE_CODE_SUBAGENT_MODEL` point it at the fast model.

Every template maps the `fable` alias to its primary model. Claude Code otherwise resolves `fable` to `claude-fable-5-1`, and a third-party Anthropic-compatible endpoint rejects that ID.

Other defaults that differ by template:

| Template | Output and reasoning defaults |
|----------|-------------------------------|
| `glm` | `CLAUDE_CODE_AUTO_COMPACT_WINDOW=1000000`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000`, `CLAUDE_CODE_EFFORT_LEVEL=high`, `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`, `MAX_THINKING_TOKENS=8000`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` |
| `minimax` | `CLAUDE_CODE_AUTO_COMPACT_WINDOW=524288`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000`, `CLAUDE_CODE_EFFORT_LEVEL=max`, `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` |
| `deepseek` | `CLAUDE_CODE_AUTO_COMPACT_WINDOW=786432`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000`, `CLAUDE_CODE_EFFORT_LEVEL=max`, `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`, `MAX_THINKING_TOKENS=32000` |
| `mimo` | `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000` |
| `mimo-token` | `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000` |
| `kimi` | `CLAUDE_CODE_AUTO_COMPACT_WINDOW=1000000`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000`, `CLAUDE_CODE_EFFORT_LEVEL=max`, `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`, `MAX_THINKING_TOKENS=16000` |
| `qwen` | `CLAUDE_CODE_MAX_CONTEXT_TOKENS=983616`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=75`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000`, `MAX_THINKING_TOKENS=16000` |
| `qwen-coding` | `CLAUDE_CODE_MAX_CONTEXT_TOKENS=983616`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=75`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS=128000`, `MAX_THINKING_TOKENS=16000` |

The `mimo-token` base URL depends on the region you picked at creation. `cn` uses `token-plan-cn.xiaomimimo.com`, `sgp` uses `token-plan-sgp.xiaomimimo.com`, and `ams` uses `token-plan-ams.xiaomimimo.com`. All three keep the `/anthropic` path.

## Template status

The 0.13.x templates match the current vendor model lists as of 2026-11-03. The notes below cover plan coverage and model availability where they affect a slot.

### Alibaba Qwen

The `qwen` template maps `qwen3.8-max` to the primary, opus, and fable slots, `qwen3.7-plus` to sonnet, and `qwen3.8-flash` to haiku and subagents. It sets `CLAUDE_CODE_MAX_CONTEXT_TOKENS=983616` and compacts at 75 percent. It does not set an effort level, so the provider default applies.

The `qwen-coding` template uses `qwen3.7-plus` in every slot. The Coding Plan includes Qwen3.7-Plus but not Qwen3.8-Max or Qwen3.8-Flash. That is a plan limit, not an endpoint limit. If the plan rejects requests above 200K, lower `CLAUDE_CODE_MAX_CONTEXT_TOKENS` to `200000`.

`qwen3-coder-next` and `qwen3-coder-plus` are absent from the current Anthropic-compatible model matrix. Only `qwen3-coder-flash` remains as a legacy Coder model.

### MiniMax

The `minimax` template uses `MiniMax-M3.1-Flash[1m]` in every slot, including Fable and subagents, with a 524288 auto-compact window. It sets effort to `max` and adds `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`. M3 is the previous generation and remains available. MiniMax says a Pro model will follow, but no ID or date is published.

### DeepSeek

The `deepseek` template uses `deepseek-flash[1m]` for primary, opus, sonnet, and Fable, and `deepseek-flash` for haiku and subagents, with a 786432 auto-compact window. It sets effort to `max` and adds `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`. `deepseek-flash` serves V4.1-Flash-1017. `deepseek-v4-pro` is V4-Pro-0813, the previous generation, and remains available as an optional model. There is no released V4.1 Pro.

DeepSeek's Anthropic endpoint ignores `budget_tokens`, so `MAX_THINKING_TOKENS=32000` is a client-side hint, not a provider budget. Thinking depth follows `CLAUDE_CODE_EFFORT_LEVEL`.

### Xiaomi MiMo

The `mimo` and `mimo-token` templates use `mimo-v2.6-pro[1m]` for primary, opus, sonnet, and Fable, and `mimo-v2.6-flash[1m]` for haiku and subagents. Both models have a 1M context window and 128K output. The templates do not set an effort level. See [Xiaomi MiMo](/providers/mimo/) for setup details.

### Moonshot Kimi

The `kimi` template uses `kimi-k3.1-pro[1m]` in every slot, including Fable. Standard speed is the default. Highspeed is optional and costs more per token. It sets effort to `max` and adds `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`. Kimi always thinks and has no thinking-budget parameter, so `MAX_THINKING_TOKENS=16000` is only a client hint. See [Moonshot Kimi](/providers/kimi/) for setup details.

### GLM

The `glm` template maps `glm-5.3[1m]` to the primary, opus, sonnet, and Fable slots and `glm-5.3-flash[1m]` to haiku. It sets effort to `high` and adds `CLAUDE_CODE_ALWAYS_ENABLE_EFFORT=1`. Z.ai's current default configuration maps opus, sonnet, and haiku to `glm-5.3-flash[1m]`; the template keeps the manual split so the main slots use the flagship model. GLM-5-Turbo is not a Coding Plan model and is not a template tier.

If you created an instance before 0.13.0, run `claude-multi doctor check`, then `claude-multi doctor fix`. The sync updates model slots and known legacy defaults while keeping your API key and custom values.

## Where to set variables

claude-multi variables go in your shell profile (`.zshrc`, `.bashrc`, `.profile`) or in the environment before you run `claude-multi`.

Instance variables go in `~/.claude-<name>/settings.json` under `env`. The provider template fills them when you create the instance, and they apply to that instance only. They do not affect other instances or your default `~/.claude` setup. See [Configuration](/docs/configuration/) for the file layout and [Plugins and MCP](/docs/plugins-mcp/) for MCP server settings.

Reviewed 2026-11-03

## Related

- [Configuration](/docs/configuration/)
- [Plugins and MCP](/docs/plugins-mcp/)
- [Troubleshooting](/docs/troubleshooting/)
- [Providers](/providers/)
