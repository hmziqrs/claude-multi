---
title: "claude-multi drops Deno support"
description: "Why claude-multi removed the Deno install path, how the shell launcher blocked it, and how to move to Node.js 22+ or Bun 1+."
date: 2026-10-31
updated: 2026-10-31
tags: [claude-code, deno, node, bun, providers]
---

claude-multi no longer supports Deno. Version 0.13.0 removed Deno from the install docs, the launcher, and CI. Version 0.13.1 removed the last runtime-specific code paths. The package now targets Node.js 22 or newer, or Bun 1 or newer. Instance storage and isolation are unchanged.

## What changed

Deno is no longer an advertised install path. The install section lists npm, pnpm, and Bun. The `claude-multi` bin has no Deno branch; it finds `build/cli.js` and execs Bun or Node. CI no longer runs a Deno job.

The 0.13.1 cleanup removed Deno from package-manager detection, the version and upgrade commands, and the Windows wrapper path lookup. There is no dormant Deno branch left to test or maintain.

Existing instances are not part of this change. Their configs stay at `~/.claude-<name>/`, and their wrappers keep pointing at those directories.

The [changelog](/changelog/) records the 0.13.0 removal and the 0.13.1 cleanup.

## Why the launcher could not stay

The `claude-multi` bin is `bin/claude-multi.js`. Despite the extension, it is a POSIX shell script. It starts with `#!/usr/bin/env sh`. It walks symlinks with `readlink`, resolves its own directory with `dirname` and `pwd`, points at `../build/cli.js`, then calls `exec bun "$CLI" "$@"` or `exec node "$CLI" "$@"`.

That works under npm, pnpm, and Bun because their shims honor the shebang. `deno install -g npm:claude-multi` takes a different route. It installs the package and runs its `bin` entry with the Deno runtime. Deno reads the file as JavaScript and stops at `while [ -L "$SCRIPT" ]; do`, which is shell syntax, not JavaScript.

The issue is not package resolution. It is what runs the bin. Deno can install the package, but it cannot execute this launcher.

A Deno-specific launcher would have meant a third runtime path to build, test, and document. The package now supports Node and Bun, and that is the whole runtime list.

The Deno announcement below is context, not the trigger. The launcher was already the wrong shape for `deno install -g` before October.

## The Deno project context

On 2026-10-09, Deno announced that the entire Deno team is joining Cloudflare. The [Deno post](https://deno.com/blog/cloudflare) sets out the support window. The runtime gets monthly releases with bug fixes and security updates for another year. After that year, Deno ends official development of the runtime. The code remains open source, and the post invites others to continue it.

Deno Deploy continues for six months before shutting down, which puts the shutdown around April 2027. JSR keeps operating, with its infrastructure moving to Cloudflare. The [Cloudflare post](https://blog.cloudflare.com/deno-joins-cloudflare/) describes the plan behind the move: merge celld and workerd, and make self-hosting workerd a supported way to run Workers applications.

The runtime did not stop on October 9. An existing Deno install keeps getting monthly fixes through the support year. The change in claude-multi is about which install paths this package advertises, not about whether Deno runs today.

## What is supported now

claude-multi supports two runtimes:

- Node.js 22 or newer
- Bun 1 or newer

npm, pnpm, and Bun are the install paths. pnpm is a package manager, not a runtime. An npm or pnpm install still needs Node 22 or newer on `PATH`. A Bun install can use the Bun runtime.

Node.js 22 is an LTS line, and Node 20 and earlier are end of life, per the [Node.js release schedule](https://nodejs.org/en/about/previous-releases). Bun 1 is the minimum in the package `engines` field. The [Bun docs](https://bun.com/docs) describe Bun as a runtime and package manager in one binary.

```bash
# npm
npm install -g claude-multi

# pnpm
pnpm add -g claude-multi

# Bun
bun add -g claude-multi
```

The [getting started guide](/docs/getting-started/) covers the full setup, including the Windows `PATH` notes.

## How to migrate

If you installed claude-multi through Deno, remove the old global entry:

```bash
deno uninstall -g claude-multi
```

If the command reports that nothing is installed, skip it. Then install with npm, pnpm, or Bun using one of the commands above.

Next, sync your instance templates:

```bash
claude-multi doctor fix
```

That runs any pending instance migrations, backs up the instance settings before writing, and preserves API keys and user-tuned values. It also repairs wrapper versions if Claude Code moved.

Run `claude-multi doctor check` first if you want to see the drift without changing anything.

Your instance data stays at `~/.claude-<name>/`. Each wrapper still sets `CLAUDE_CONFIG_DIR` to that directory, so `claude-glm` and `claude-deepseek` keep separate settings, onboarding state, and conversation history. The [provider pages](/providers/) list the current templates.

## What this means for the project

One fewer runtime path means one fewer install flow in CI, one fewer set of runtime-specific bug reports, and one less install path the docs have to qualify. The isolation model is unchanged. Instances are still directories, wrappers still point at them, and switching providers still means running a different command.

If you installed with npm, pnpm, or Bun, upgrade with `npm install -g claude-multi` (or `pnpm add -g claude-multi`, or `bun add -g claude-multi`), then run `claude-multi doctor fix`. If your last install came from Deno, run `deno uninstall -g claude-multi` first. Node.js 22+ and Bun 1+ are the supported runtimes, and the [changelog](/changelog/) records each release.
