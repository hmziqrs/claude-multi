# Starlight Docs Site — Implementation Plan

## 1. Project Layout

Starlight lives at the project root, coexisting with the existing CLI source. Astro uses `src/content/` for its content collections; Bun builds from `src/` explicitly (`bun build src/cli.ts`). No overlap.

```
claude-multi/
├── src/                                   # existing CLI source (unchanged)
│   ├── cli.ts
│   ├── config.ts
│   ├── ...
│   └── ink/
│
├── src/content/                           # NEW — Starlight content collections
│   ├── content.config.ts
│   └── docs/
│       ├── index.md                       # landing page (splash template)
│       ├── getting-started.md             # install + quick start
│       ├── usage.md                       # full CLI command reference
│       ├── providers.md                   # provider template cards
│       ├── how-it-works.md                # architecture overview
│       ├── plugins-mcp.md                 # plugin/MCP subcommands
│       ├── configuration.md               # config.json schema reference
│       ├── changelog.md                   # from root CHANGELOG.md
│       └── development/
│           └── subagent-model-plan.md     # from docs/
│
├── src/assets/                            # NEW — processed assets (logos, images)
│   └── logo.svg                           # (optional)
│
├── src/styles/                            # NEW — custom CSS
│   └── custom.css                         # Starlight CSS variable overrides
│
├── public/                                # NEW — unprocessed static files
│   └── favicon.svg
│
├── astro.config.mjs                       # NEW
├── src/env.d.ts                           # NEW — Astro type reference
├── package.json                           # existing — add scripts + deps
└── ...
```

---

## 2. Dependencies

```bash
bun add astro @astrojs/starlight
```

| Package | Purpose |
|---------|---------|
| `astro` | Framework |
| `@astrojs/starlight` | Documentation theme |

No other packages needed. Search (Pagefind), code highlighting (Expressive Code), sitemap (built into Astro), and all docs components ship inside Starlight.

---

## 3. Configuration Files

### 3.1 `astro.config.mjs`

```mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://claudemutli.hmziq.xyz',
  base: '/docs',
  integrations: [
    starlight({
      title: 'claude-multi',
      description:
        'Manage multiple Claude Code instances with different AI providers and configurations',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/hmziqrs/claude-multi',
        },
      ],
      editLink: {
        baseUrl: 'https://github.com/hmziqrs/claude-multi/edit/main/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [{ slug: 'getting-started' }],
        },
        {
          label: 'Guides',
          items: [
            { slug: 'usage' },
            { slug: 'providers' },
            { slug: 'how-it-works' },
            { slug: 'plugins-mcp' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { slug: 'configuration' },
            { slug: 'changelog' },
          ],
        },
        {
          label: 'Development',
          collapsed: true,
          items: [
            { slug: 'development/subagent-model-plan' },
          ],
        },
      ],
      lastUpdated: true,
      favicon: '/favicon.svg',
    }),
  ],
});
```

Deploying to `claudemutli.hmziq.xyz/docs`. Astro uses `site` for sitemap/canonical URLs and `base` prefixes all asset and page paths. The `favicon` stays `/favicon.svg` — Astro prefixes it with `base` at build time.

### 3.2 `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema(),
  }),
};
```

### 3.3 `src/env.d.ts`

```ts
/// <reference types="astro/client" />
```

No changes to `tsconfig.json`. The existing config already has `moduleResolution: "bundler"` (Astro 5 requirement) and `module: "Preserve"` (Astro-compatible).

### 3.4 `package.json` — scripts to add

```json
{
  "scripts": {
    "docs:dev": "astro dev",
    "docs:build": "astro build",
    "docs:preview": "astro preview"
  }
}
```

---

## 4. Content Pages — Migration Map

| Source | Starlight page | Details |
|--------|---------------|---------|
| README hero + tagline | `index.md` | `template: splash` + `hero` frontmatter |
| README: Install + Quick Start | `getting-started.md` | `:::` asides for prerequisites |
| README: Usage block | `usage.md` | `<Tabs>` for interactive / CI mode examples |
| README: Provider Templates | `providers.md` | `<CardGrid>` + `<Card>` for GLM/MiniMax/DeepSeek |
| README: How It Works | `how-it-works.md` | Code blocks with filenames via Expressive Code |
| README: Plugins/MCP commands | `plugins-mcp.md` | Plugin/MCP subcommand reference |
| README: Configuration JSON | `configuration.md` | Config schema with JSON code blocks |
| root `CHANGELOG.md` | `changelog.md` | Move into docs tree |
| `docs/subagent-model-plan.md` | `development/subagent-model-plan.md` | Move into docs tree |

**9 pages total.** Root `README.md` stays as the npm readme — add a link to the docs site at the top. Root `CHANGELOG.md` is removed after migration.

---

## 5. Starlight Features to Leverage

| Feature | Use on |
|---------|--------|
| `template: splash` + hero | `index.md` landing page |
| `<CardGrid>` + `<Card>` | `providers.md` — GLM / MiniMax / DeepSeek |
| `<Tabs>` | `usage.md` — interactive vs non-interactive examples |
| `:::` asides (`:::caution`, `:::note`) | `getting-started.md` — prerequisites, tips |
| `<Badge>` | Sidebar for "New" indicators; `providers.md` labels |
| Expressive Code (filenames, highlights) | `how-it-works.md`, `usage.md`, `configuration.md` |
| Pagefind search | entire site — on by default |
| Edit link + `lastUpdated` | every page footer — on by default |

---

## 6. Example Frontmatter

`src/content/docs/index.md`:

```md
---
title: claude-multi
description: Manage multiple Claude Code instances with different AI providers
template: splash
hero:
  title: claude-multi
  tagline: One CLI to manage multiple Claude Code instances — each with its own provider, config, and history.
  actions:
    - text: Get Started
      link: /docs/getting-started/
      icon: right-arrow
    - text: GitHub
      link: https://github.com/hmziqrs/claude-multi
      icon: github
      variant: secondary
---

```

`src/content/docs/getting-started.md`:

```md
---
title: Getting Started
description: Install and configure claude-multi
---

:::caution[Prerequisites]
Requires **Node.js >= 18** and **@anthropic-ai/claude-code >= 2.0.0** installed globally.
:::

## Installation

```bash
npm install -g claude-multi
```

## Quick Start

...
```

---

## 7. Deployment

**Target:** `https://claudemutli.hmziq.xyz/docs`

The built output goes to `dist/`. Astro produces fully static HTML/CSS/JS — deploy via any static host that supports custom domains and subpath routing.

### Cloudflare Pages (recommended)

1. Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. Build command: `bun run docs:build`
3. Output directory: `dist`
4. Environment variable: `BUN_VERSION` = `latest`
5. Custom domain: `claudemutli.hmziq.xyz`
6. Set a **redirect rule** so `/docs/*` serves from the Pages deployment root:
   - If deploying the entire site at the domain root, set `base: ''` and no redirect needed
   - If using a single Pages project for `/docs`, add a redirect: `/docs/* → /*` or use Cloudflare Workers to strip the `/docs` prefix

> Alternative: Build _without_ `base` in `astro.config.mjs` and serve the entire site at a dedicated subdomain (e.g. `docs.claudemutli.hmziq.xyz`). This avoids subpath routing entirely.

### Generic static host (nginx, Caddy, Vercel, Netlify)

1. Run `bun run docs:build` → `dist/`
2. Upload `dist/` contents, served at `/docs`
3. Configure your server to serve `dist/` under the `/docs` path prefix
4. Config must have `base: '/docs'` and `site: 'https://claudemutli.hmziq.xyz'`
5. Set `homepage` in `package.json` to `https://claudemutli.hmziq.xyz/docs`

---

## 8. Implementation Checklist

### Phase 1 — Scaffold
- [ ] `bun add astro @astrojs/starlight`
- [ ] Create `astro.config.mjs`
- [ ] Create `src/content.config.ts`
- [ ] Create `src/env.d.ts`
- [ ] Create `src/content/docs/` directory
- [ ] Create `public/` directory with `favicon.svg`
- [ ] Add `docs:dev`, `docs:build`, `docs:preview` to `package.json` scripts
- [ ] Run `bun run docs:dev` — verify site loads at `http://localhost:4321`

### Phase 2 — Content
- [ ] `index.md` — splash landing page with hero
- [ ] `getting-started.md` — install + quick start
- [ ] `usage.md` — CLI command reference with tabs
- [ ] `providers.md` — provider cards
- [ ] `how-it-works.md` — architecture overview
- [ ] `plugins-mcp.md` — plugin/MCP command reference
- [ ] `configuration.md` — config schema reference
- [ ] `changelog.md` — move from `CHANGELOG.md`; remove root copy
- [ ] `development/subagent-model-plan.md` — move from `docs/`

### Phase 3 — Verify
- [ ] `bun run docs:build` succeeds with no errors
- [ ] `bun run docs:preview` — verify search, dark mode, code highlighting
- [ ] Verify edit links resolve to correct GitHub file paths
- [ ] Verify mobile layout in browser dev tools

### Phase 4 — Deploy
- [ ] Verify `site` and `base` in `astro.config.mjs` match `https://claudemutli.hmziq.xyz/docs`
- [ ] Build: `bun run docs:build`
- [ ] Deploy `dist/` to `claudemutli.hmziq.xyz/docs`
- [ ] Update `package.json` `homepage` to docs site URL

---

## 9. What Stays Unchanged

| Area | Status |
|------|--------|
| CLI source (`src/cli.ts`, `src/config.ts`, ...) | Untouched |
| CLI build (`bun run build`, `bun run build:ink`) | Untouched |
| Tests (`bun test`) | Untouched |
| `README.md` | Kept as npm readme (add docs site link) |
| `CHANGELOG.md` | Moved into `src/content/docs/`; root file removed |

---

## 10. Estimated Effort

| Phase | Time |
|-------|------|
| Scaffold | 5 min |
| Content | 30–45 min |
| Verify | 10 min |
| Deploy | 10 min |
| **Total** | **~1 hour** |
