---
question: "Does it work on Windows?"
description: "Yes, wrapper scripts are generated as .cmd batch files on Windows, and the polyglot entry point works with Node.js on any platform."
category: "Compatibility"
order: 13
---

Yes. claude-multi works on Windows, macOS, and Linux. The CLI commands, the TUI, plugin and MCP management, and instance creation all behave the same across the three platforms.

## What's different on Windows

The only difference is the wrapper scripts claude-multi generates for each instance. On Unix they are plain shell scripts starting with `#!/bin/sh`. On Windows they are `.cmd` batch files that do the same job:

```batch
@echo off
REM Claude Multi - Wrapper for deepseek
set "CLAUDE_CONFIG_DIR=%USERPROFILE%\.claude-multi\deepseek"
"C:\path\to\claude.exe" %*
```

The mechanism is identical: set `CLAUDE_CONFIG_DIR` so Claude Code reads its config from the instance directory, then run the unmodified `claude` binary. On Windows that binary is `claude.cmd` or `claude.exe`, whichever Claude Code's installer placed in your `PATH`. claude-multi finds it the same way your terminal does.

## Installing on Windows

Use PowerShell or Command Prompt with the Node.js runtime you already have:

```powershell
npm install -g claude-multi
```

If you use Bun for Windows or Deno, those work too:

```powershell
bun add -g claude-multi
deno install -g -A -n claude-multi npm:claude-multi
```

After install, run `claude-multi` to open the TUI. The instance names you pick become commands like `claude-deepseek.cmd`, written to the global bin directory your package manager manages.

## `claude-<name>` not recognized

If Windows can't find the wrapper after you create an instance, the package manager's global bin directory is probably not on your `PATH`. For npm that directory is usually `%APPDATA%\npm`. Check it with:

```powershell
npm config get prefix
```

Make sure the returned path is in your user `PATH` environment variable, then open a new terminal. The health check (`!` from the main menu, or `claude-multi list`) will also flag a missing wrapper and tell you what's wrong.

## A note on line endings and shells

Git Bash, WSL, and Cygwin are common on Windows. claude-multi generates native `.cmd` wrappers, so calling `claude-deepseek` from a bash-style shell works because the shell hands off to `cmd.exe` for `.cmd` files. If you live entirely inside WSL, you are effectively on Linux, and claude-multi will generate Unix shell wrappers there instead.

## CI/CD testing

The project's CI runs install and execution tests on all three operating systems against all three runtimes (bun, node, deno). Windows is not an afterthought, it is in the matrix on every release. If a Windows-specific regression lands, the tests catch it before publish.

## More info

- [.github/workflows/test-install.yml](https://github.com/hmziqrs/claude-multi/blob/master/.github/workflows/test-install.yml): cross-platform test matrix
- [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts): `generateWindowsWrapperScript()` implementation
- [src/util/runtime.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/util/runtime.ts): platform-aware package manager detection
