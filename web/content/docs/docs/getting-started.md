---
title: Getting started
description: Install claude-multi, add your first provider instance, verify the wrapper, and launch an isolated Claude Code session on macOS, Linux, or Windows.
---

Applies to claude-multi 0.13.x.

## Prerequisites

You need two things:

1. Claude Code installed globally
2. A JavaScript runtime: Node.js 22+ or Bun 1+

If you don't have Claude Code yet:

```bash
npm install -g @anthropic-ai/claude-code
```

## Install claude-multi

Pick whichever package manager you already use:

```bash
# Bun
bun add -g claude-multi

# npm
npm install -g claude-multi

# pnpm
pnpm add -g claude-multi
```

The `claude-multi` launcher is a short shell script. It finds Bun or Node and runs the CLI with the first runtime available. It does not bundle a runtime.

## Windows install and PATH

The install commands are the same in PowerShell. Claude Code and claude-multi both need to be on `PATH`.

The `claude-multi` launcher is a POSIX shell script, so Windows needs an `sh` on `PATH` (Git Bash provides one). The generated `claude-<name>.cmd` wrappers do not need it.

The generated wrapper is a `.cmd` file, and its directory depends on the package manager:

| Package manager | Wrapper directory |
|-----------------|-------------------|
| npm | `%APPDATA%\npm` |
| pnpm | `%APPDATA%\npm` |
| Bun | `%USERPROFILE%\.bun\bin` |

If `claude-glm` is not found after creation, add the directory to your user `PATH` and open a new terminal:

```powershell
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$userPath;$env:APPDATA\npm", "User")
```

Replace `$env:APPDATA\npm` with `$env:USERPROFILE\.bun\bin` if you installed with Bun.

If wrapper creation cannot find `claude`, set `CLAUDE_MULTI_CLAUDE_PATH` to the full path of `claude.exe` or `claude.cmd` before you run `claude-multi add`:

```powershell
$env:CLAUDE_MULTI_CLAUDE_PATH = "C:\Users\you\AppData\Roaming\npm\claude.cmd"
claude-multi add glm
```

## Create your first instance

Launch the interactive TUI:

```bash
claude-multi
```

Select **Add new instance** and follow the wizard:

1. Pick a short instance name like `glm` or `deepseek`. This becomes your command (`claude-glm`, `claude-deepseek`).
2. Pick a provider template from the list, or choose `None / Custom` for manual setup.
3. If you chose the MiMo Token Plan template, pick a region: `cn`, `sgp`, or `ams`.
4. Paste your API key. The input is masked and the key is stored in the instance's `settings.json`.
5. Accept the default paths: `~/.claude-<name>/` for config, and `~/.local/bin/claude-<name>` for the wrapper on macOS and Linux.
6. Choose what to copy from your default `~/.claude`: nothing, settings, selected plugins, or everything.
7. If you chose to copy plugins or all files, choose a sync mode: `auto`, `half-manual`, or `full-manual`.

Choosing All files copies `~/.claude/settings.json` including its `env` block. If you also picked a provider template, the template replaces the provider keys, but other env entries remain. Review `~/.claude-<name>/settings.json` after creation if you do not want the instance to inherit them.

When the wizard finishes:

```
✓ Instance 'deepseek' created successfully!
  Binary: /Users/you/.local/bin/claude-deepseek
  Config: /Users/you/.claude-deepseek
```

Run it:

```bash
claude-deepseek
```

You now have a Claude Code session connected to DeepSeek with its own isolated config. It is the same `claude` binary, pointed at a different provider.

## CLI quick start

You can also create instances from the command line instead of the TUI:

```bash
claude-multi add deepseek --provider deepseek --api-key sk-your-key --skip-prompts
claude-multi add glm --provider glm --api-key your-zai-key --skip-prompts
```

`--provider` requires `--api-key`. Without the key, the command exits with an error instead of prompting.

Run the instances:

```bash
claude-deepseek
claude-glm
```

## Verify the install

List the instances:

```bash
claude-multi list
```

Expected output for one instance:

```
Found 1 instance(s):

● glm
  Binary:  /Users/you/.local/bin/claude-glm
  Config:  /Users/you/.claude-glm
  Created: 10/31/2026, 10:00:00 AM
  Provider: glm
  Sync mode: Auto-sync (symlink dirs)
  Version:  0.13.1
```

The date format follows your locale. Then check that the wrapper reaches Claude Code:

```bash
claude-glm --version
```

The output is Claude Code's version, in the form `2.x.x (Claude Code)`. claude-multi does not change that number. To check the claude-multi version itself:

```bash
claude-multi --version
```

It prints `0.13.1` on this release.

## Add `~/.local/bin` to your PATH

On macOS and Linux, if `claude-<name>` isn't found after creation, your global binary directory probably isn't on `PATH`. Add it once:

```bash
# zsh (macOS default)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

The wrapper defaults to `~/.local/bin/claude-<name>` on macOS and Linux. The creation output and `claude-multi list` print the actual path, including a custom `--binary` value.

## Uninstall and rollback

Remove one instance:

```bash
claude-multi remove glm
```

This removes the registry entry and deletes the wrapper. It leaves `~/.claude-glm/` on disk and prints the path. Delete it yourself when you no longer need its history or settings:

```bash
rm -rf ~/.claude-glm
```

On Windows:

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude-glm"
```

Remove the package with the same manager you used to install it:

```bash
# npm
npm uninstall -g claude-multi

# Bun
bun remove -g claude-multi

# pnpm
pnpm remove -g claude-multi
```

After removing every instance, you can delete the central state:

```bash
rm -rf ~/.claude-multi
```

That directory holds the registry, health status, and up to three migration backup sets. Deleting it does not touch `~/.claude` or any `~/.claude-<name>/` directory.

To roll back to an earlier claude-multi release, install a specific version:

```bash
npm view claude-multi versions
npm install -g claude-multi@<version>
```

Downgrading the CLI does not downgrade instance config. Back up `~/.claude-multi/` and the affected `~/.claude-<name>/settings.json` files before you try. Migration backups live in `~/.claude-multi/backups/`, and claude-multi keeps the newest three.

## What's next

- [Providers](/providers/): full list of provider templates and model mappings
- [Usage](/docs/usage/): all CLI commands and flags
- [Plugins and MCP](/docs/plugins-mcp/): manage plugins and MCP servers across instances
- [Configuration](/docs/configuration/): settings file reference
- [Troubleshooting](/docs/troubleshooting/): PATH, auth, symlink, and migration fixes

Reviewed 2026-10-31

## Related

- [Documentation overview](/docs/)
- [Usage](/docs/usage/)
- [Configuration](/docs/configuration/)
- [Troubleshooting](/docs/troubleshooting/)
