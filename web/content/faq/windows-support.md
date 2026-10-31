---
question: "Does it work on Windows?"
description: "Yes. On Windows claude-multi writes .cmd batch files instead of shell wrappers, and the polyglot entry point works across Bun, Node.js, and Deno."
category: "Compatibility"
order: 13
---

Yes. claude-multi works on Windows, macOS, and Linux. The CLI and TUI are platform-neutral, and instance creation follows the same steps. The wrapper scripts are the main difference.

#### What's different on Windows

On Unix the wrappers are shell scripts that start with `#!/bin/sh`. On Windows they are `.cmd` batch files:

```batch
@echo off

set "CLAUDE_CONFIG_DIR=%USERPROFILE%\.claude-deepseek"
"C:\path\to\claude.cmd" %*
```

The mechanism is the same: set `CLAUDE_CONFIG_DIR` so Claude Code reads its config from `%USERPROFILE%\.claude-deepseek`, then run the unmodified `claude` binary. On Windows that binary is `claude.cmd` or `claude.exe`, whichever Claude Code's installer put in your `PATH`. claude-multi finds it with `where claude`.

#### Installing on Windows

Use PowerShell or Command Prompt with the runtime you already have:

```powershell
npm install -g claude-multi
```

Bun and Deno work too:

```powershell
bun add -g claude-multi
deno install -g -A -n claude-multi npm:claude-multi
```

After install, run `claude-multi` to open the TUI. Instance names become commands such as `claude-deepseek.cmd`, written to your package manager's global bin directory.

#### `claude-<name>` not recognized

If Windows cannot find the wrapper after you create an instance, the global bin directory is probably not on `PATH`. For npm it is usually `%APPDATA%\npm`. Check it with:

```powershell
npm config get prefix
```

Add the returned path to your user `PATH`, then open a new terminal. The health check (`!` from the main menu, or `claude-multi doctor check`) also flags a missing wrapper.

#### Git Bash, WSL, and Cygwin

claude-multi writes native `.cmd` wrappers, so calling `claude-deepseek` from Git Bash or Cygwin still works; the shell hands off to `cmd.exe` for `.cmd` files. Inside WSL, claude-multi sees Linux and writes Unix shell wrappers instead.

#### CI testing

CI runs install and smoke tests on Windows, macOS, and Linux for Bun, Node.js, and Deno on pull requests that touch the CLI, packaging, or the workflow file.

The cross-platform matrix is in [.github/workflows/test-install.yml](https://github.com/hmziqrs/claude-multi/blob/master/.github/workflows/test-install.yml). Wrapper generation is in [src/wrapper.ts](https://github.com/hmziqrs/claude-multi/blob/master/src/wrapper.ts).
