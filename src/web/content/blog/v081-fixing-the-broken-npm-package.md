---
title: "v0.8.1: Fixing the Broken npm Package"
description: "If you installed claude-multi globally and got Module not found, this is why. The CLI build and the docs site were both outputting to dist/. The docs won. Now they don't."
date: 2026-06-03
tags: [release, bugfix, build]
audio: "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio/v081-fixing-the-broken-npm-package.mp3"
---

# v0.8.1: Fixing the Broken npm Package

You installed `claude-multi` globally. You ran it. You got this:

```
error: Module not found "/Users/.../claude-multi/bin/../dist/cli.js"
```

That's not a missing dependency. The file was never there.

## Two builds, one directory

claude-multi has two build steps. The CLI compiles from TypeScript into a single JS bundle. The documentation site compiles from Astro into static HTML. We had both outputting into `dist/`.

The build script in `package.json`:

```json
"build": "bun build src/cli.ts --outdir dist --target node --format esm"
```

The docs build in `astro.config.mjs` uses Astro's default output directory, which is also `dist/`.

When the package got published, the `files` field said to include `dist/cli.js`. But `dist/` was full of HTML files from the docs build: `index.html`, `_astro/`, fonts, images, sitemap XML. The whole rendered site. No `cli.js` anywhere. The shell wrapper tried to load `$DIR/../dist/cli.js`, found HTML instead, and threw a module resolution error.

## The fix

Moved the CLI build output from `dist/` to `build/`. Three files changed in the source, two more in CI.

`package.json` now says `--outdir build` and lists `build/cli.js` in the `files` array. The shell wrapper in `bin/claude-multi.js` resolves `../build/cli.js` instead of `../dist/cli.js`. The CI workflows that verify the build artifact now check `build/cli.js`.

Astro keeps `dist/`. The CLI gets its own directory. They don't touch each other.

## Upgrading

If you're on 0.8.0 and hitting the error:

```
bun add -g claude-multi@0.8.1
```

The tarball now contains exactly seven files. No docs artifacts leaking in.

---

Full changelog: [CHANGELOG.md](https://github.com/hmziqrs/claude-multi/blob/master/CHANGELOG.md). Provider reference: [/docs/providers/](/docs/providers/).
