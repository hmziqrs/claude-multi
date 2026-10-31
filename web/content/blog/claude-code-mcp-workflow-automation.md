---
title: "A Claude Code MCP workflow that actually runs"
description: "A concrete MCP setup for Claude Code: a working config, a terminal check, and the failures that break servers, tools, and auth."
date: 2026-05-27
updated: 2026-10-31
tags: [claude-code, mcp, workflow, automation]
---

MCP gets described as a capability. In practice it is a config file and a process. If the process does not start, the model has no tools, no matter how good the prompt is.

The Model Context Protocol is an open protocol for connecting a model to external tools and data. Anthropic donated it to the Linux Foundation's Agentic AI Foundation in December 2025, and the [spec](https://modelcontextprotocol.io/specification/) now lives under community maintainers. Claude Code is one client. claude-multi gives each provider instance its own Claude Code config directory, so each instance gets its own set of servers.

## Pick one loop

Start with a loop you already run by hand: read a ticket, find the code, change it, run the tests, open a PR, update the ticket. For this example the servers are GitHub and the local filesystem. The model reads the issue and the repo, edits files, runs the test command through the shell, and opens a PR. Slack and the issue tracker can wait until this loop works.

## The config

Put a `.mcp.json` at the repo root:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/you/src/app"]
    }
  }
}
```

Claude Code expands `${GITHUB_TOKEN}` from the environment it starts with. Do not put the literal token in a file you commit. Project scope is the right default for a token that can write to one repo.

For a server that should exist in every session, put the same `mcpServers` object in `~/.claude-<name>/settings.json`. claude-multi stores MCP config there, and it does not symlink MCP servers the way it symlinks plugins and skills. The [plugin and MCP docs](/docs/plugins-mcp/) cover the per-instance commands.

## The terminal check

claude-multi can check the structure of the config. The output looks like this:

```
$ claude-multi mcp verify glm

Verifying MCP configuration in 'glm'

Found 2 MCP server(s)
  • github: stdio
    Configuration looks valid
  • filesystem: stdio
    Configuration looks valid
```

That checks that every stdio server has a command and every HTTP or SSE server has a URL. It does not prove the process starts. Run the command by hand:

```
$ npx -y @modelcontextprotocol/server-github
```

If it exits with `MODULE_NOT_FOUND` or `command not found`, Claude Code will hit the same failure. Fix it outside Claude Code first. If it starts cleanly, it will wait for input; Ctrl-C is fine.

Then start the instance and look at what connected:

```
$ claude-glm
> /mcp
```

A trimmed view looks like this:

```
github      connected
filesystem  connected
```

The layout depends on the client version. What matters is `connected`.

## An example run

An example prompt:

```
> Read issue #482, find the handler that parses the webhook payload,
  add a null check, run the auth tests, and open a PR.
```

Claude Code calls `mcp__github__get_issue`, reads files through the filesystem server, runs the test command, and calls `mcp__github__create_pull_request`. You still review the diff. The gain is that the issue body, the file, and the PR live in one session instead of four browser tabs.

## Failure modes

### Server not starting

`command not found` usually means PATH. Claude Code inherits the PATH of the shell that launched it, and a GUI launch or a different terminal profile can have a shorter PATH than your interactive shell. Use an absolute path such as `/opt/homebrew/bin/npx`, or fix the PATH in the profile that launches the app.

Project-scoped servers from `.mcp.json` also need approval on first use. If `/mcp` shows `Pending approval`, start Claude Code interactively in that repo and approve the server. A headless run will not approve it for you.

`npx` also downloads the package on first run. That can take longer than the client's startup timeout, and a registry hiccup looks like a dead server. Install the package globally or pin a version so the first run is not a network request.

If the process starts and exits, run the command outside Claude Code and read stderr. A missing environment variable is the usual cause. The next most common is a relative path. A filesystem root such as `./src` resolves from where Claude Code started, not from the config file, so use an absolute path.

### Tool name collisions

Claude Code namespaces tools as `mcp__<server>__<tool>`, so two servers with different names can expose the same tool name without a conflict. The collision that bites is two configs registered under the same server name, usually one from a plugin and one from `settings.json`.

claude-multi checks plugin collisions on install. The manual check takes an instance and one or more plugin IDs:

```
claude-multi plugins check-collisions glm <plugin-id>
```

Keep one source for each server. If you need both, rename the server key in the config. The namespace follows the key, so `github-work` and `github-personal` can coexist while `github` twice cannot.

### Auth

In `.mcp.json`, `${GITHUB_TOKEN}` is expanded at load time. If the variable is empty, the server can still start and then fail every call with a 401. Check it in the same shell that launches Claude Code:

```
$ echo "${GITHUB_TOKEN:0:4}"
ghp_
```

Token scopes matter more than the token itself. A read-only token will list issues and fail on `create_pull_request`. Start with read access, confirm the tools you need, then add write access.

Values in `settings.json` are stored in the file, so a token there is only as safe as the file. Keep the directory private and set the file mode:

```
chmod 600 ~/.claude-glm/settings.json
```

For a remote server that uses OAuth, `/mcp` starts the browser flow. On a headless machine there may be no browser to open. Use a token header instead, or run the auth flow on a local machine and copy the resulting config.

## Keep the first config small

Two servers are enough to learn the failure modes. Every additional server adds tool definitions to the context and another process that can fail at startup. Add Jira, Sentry, or Slack only when the loop needs them.

That is also where claude-multi helps. A `claude-glm` instance can have a read-only GitHub token while `claude-sandbox` has no GitHub server at all. `claude-multi mcp copy` moves configs between instances, and `claude-multi mcp verify` checks the shape before you start a session.

The rest of the commands are in [/docs/plugins-mcp/](/docs/plugins-mcp/). The protocol details are in the [MCP spec](https://modelcontextprotocol.io/specification/), and Anthropic's [donation announcement](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation) explains the governance change.
