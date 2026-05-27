---
question: "Does it work on Windows?"
description: "Yes, wrapper scripts are generated as .cmd batch files on Windows, and the polyglot entry point works with Node.js on any platform."
category: "Compatibility"
order: 13
---

Yes. claude-multi works on Windows, macOS, and Linux.

## What's different on Windows

The only difference is the wrapper scripts. On Unix they're shell scripts (`#!/bin/sh`), on Windows they're `.cmd` batch files:

```batch
@echo off
REM Claude Multi - Wrapper for deepseek
set "CLAUDE_CONFIG_DIR=%USERPROFILE%\.claude-multi\deepseek"
"C:\path\to\claude.exe" %*
```

Same mechanism, different syntax. The CLI, TUI, and all commands work identically across platforms.

## CI/CD testing

The project's CI runs install and execution tests on all three platforms (Linux, macOS, Windows) with all three runtimes (bun, node, deno). So Windows isn't an afterthought, it's tested on every release.

## More info

- [.github/workflows/test-install.yml](https://github.com/hmziqrs/claude-multi/blob/master/.github/workflows/test-install.yml): cross-platform test matrix
- [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts): `generateWindowsWrapperScript()` implementation
- [src/util/runtime.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/runtime.ts): platform-aware package manager detection
