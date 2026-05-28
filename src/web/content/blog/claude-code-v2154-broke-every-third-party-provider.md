---
title: "Claude Code v2.1.154 Broke Every Third-Party Provider. Here's What Happened."
description: "On May 28, 2026, Anthropic shipped a Claude Code update that broke every non-Anthropic API provider within hours. A post-mortem on what went wrong, the fallout, and the compatibility safeguards we added to claude-multi."
date: 2026-05-28
tags: [Claude Code, post-mortem, third-party providers, compatibility, claude-multi]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/claude-code-v2154-broke-every-third-party-provider.mp3"
---

# Claude Code v2.1.154 Broke Every Third-Party Provider. Here's What Happened.

On May 28, 2026, Anthropic shipped Claude Code v2.1.154. Within hours, every non-Anthropic API provider stopped working. GLM, DeepSeek, MiniMax, Kimi, Qwen, MiMo -- all of them returned the same error:

```
API Error: 422 {"detail":[{"type":"literal_error","loc":["body","messages",1,"role"],
"msg":"Input should be 'user' or 'assistant'","input":"system",
"ctx":{"expected":"'user' or 'assistant'"}}]}
```

If you're using `claude-multi` to run Claude Code against a 3rd-party provider, you probably hit this.

## What changed

Claude Code v2.1.150 introduced a new Anthropic beta: `mid-conversation-system-2026-04-07`. It's been in every version since. This beta changes how Claude Code sends system instructions to the API.

Before, Claude Code used the top-level `system` parameter for system prompts. Every Anthropic-compatible API supports this:

```json
{
  "model": "claude-sonnet-4-20250514",
  "system": "You are a helpful assistant.",
  "messages": [
    {"role": "user", "content": "Hello"}
  ]
}
```

After the beta, Claude Code also sends system instructions as messages with `role: "system"` inside the `messages` array:

```json
{
  "model": "claude-sonnet-4-20250514",
  "system": "You are a helpful assistant.",
  "messages": [
    {"role": "user", "content": "Hello"},
    {"role": "system", "content": "Remember: be concise"},
    {"role": "assistant", "content": "Hi! How can I help?"}
  ]
}
```

The beta is opt-in via the `anthropic-beta` header. Claude Code enables it automatically for first-party API calls (api.anthropic.com). For third-party providers, it should be disabled. But the detection logic has a gap.

## Why providers reject it

The Anthropic Messages API spec allows `role: "system"` in the messages array when the beta header is present. Without the header, it's not valid. Most third-party providers implement the base spec without beta features. Their validators reject any role that isn't `"user"` or `"assistant"`, and return 422.

## Claude Code has a fallback -- but it's incomplete

Anthropic anticipated this. Claude Code has built-in retry logic that detects when a provider rejects the `mid-conversation-system` beta. When it catches the error, it removes the beta header and falls back to putting system instructions inside `<system-reminder>` blocks in user messages.

The detection function (minified, from the binary):

```javascript
function pP8(error) {
  if (!Yy) return false;
  if (!(error instanceof APIError) || error.status !== 400) return false;
  // ... pattern matching on error message
}
```

`error.status !== 400`. The fallback only triggers on HTTP 400. Third-party providers return HTTP 422 for validation errors. The retry logic never fires.

This is the bug. The beta feature itself is fine for first-party API. The error handling checks for one specific status code when providers use a different one for the same error.

## What actually happens

1. User runs `claude-glm` (or any claude-multi instance)
2. Claude Code detects it's using a third-party API
3. The `mid-conversation-system` beta should be disabled, but the detection has edge cases
4. Claude Code sends a request with `role: "system"` in the messages array
5. Provider returns HTTP 422
6. Claude Code's fallback checks `error.status !== 400` -- doesn't match 422
7. Error surfaces to the user
8. Conversation is dead

If the provider had returned 400 instead of 422, the fallback would have kicked in.

## How we fixed it in claude-multi

Three layers.

### Layer 1: Pin the Claude Code version

We maintain a pinned Claude Code installation at `~/.claude-multi/bin/`. All claude-multi instances use this instead of the global `claude` binary. Currently pinned to v2.1.153, the last version before the breakage.

```bash
npm install --prefix ~/.claude-multi/bin @anthropic-ai/claude-code@2.1.153
```

The `getClaudePath()` function checks this path first, before falling back to `which claude`.

### Layer 2: Disable auto-updates

We added `DISABLE_AUTOUPDATER=1` and `DISABLE_UPDATES=1` to every provider template's environment variables. Claude Code won't auto-update to a broken version.

From `src/templates.ts`:

```typescript
const PROVIDER_COMMON_ENV: Record<string, string> = {
  DISABLE_AUTOUPDATER: "1",
  DISABLE_UPDATES: "1",
};
```

These get merged into every instance's `settings.json` when created via a provider template.

### Layer 3: Doctor fix for existing instances

For instances created before the fix, we added a health check and repair system.

The health check detects two wrapper formats:

1. **Shell format** (current): `exec "/path/to/claude" "$@"`
2. **Node.js format** (legacy): `spawn("/path/to/claude", ...)`

Both get flagged as version issues. The fix regenerates wrappers as clean shell scripts pointing to the pinned binary.

```bash
# CLI
claude-multi doctor check   # show issues
claude-multi doctor fix     # auto-fix

# TUI
claude-multi  # press ! for health screen, then f to fix
```

The TUI shows a banner when version issues are detected:

```
⚠ 1 error, 2 warnings — press ! to review
  ⚠ Some instances use a Claude version incompatible with 3rd-party APIs. Press ! to auto-fix.
```

## What providers should do

Return HTTP 400, not 422, for message validation errors. Claude Code's existing fallback handles 400. This is the fastest path to compatibility without waiting for a Claude Code patch.

## What Anthropic should do

Two things:

1. Broaden the status code check in the fallback logic. `error.status >= 400 && error.status < 500` instead of `error.status !== 400`.
2. Provide an env var to disable specific betas. `CLAUDE_CODE_DISABLE_MID_CONVERSATION_SYSTEM=1` would let users opt out without downgrading.

## The broader issue

This is the second time in recent months that a Claude Code update has broken third-party provider compatibility. The first was a change in how model names are validated. Anthropic tests against their own API, and third-party compatibility is incidental.

If you rely on third-party providers, pin your Claude Code version and disable auto-updates.

## TL;DR

- Claude Code v2.1.150+ sends `role: "system"` in the messages array (new beta feature)
- Third-party providers reject it with HTTP 422
- Claude Code's fallback only handles HTTP 400
- Fix: pin to v2.1.153, disable auto-updates, run `claude-multi doctor fix`
