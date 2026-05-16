# Starlight Docs Site — Implementation Plan

## 1. Why Starlight

| Concern | Starlight's answer |
|---------|-------------------|
| **Framework** | Astro (framework-agnostic) — no Vue lock-in, use React for custom components |
| **Authoring** | Markdown/MDX/Markdoc — pick your flavor |
| **Built-in** | Sidebar nav, search (Pagefind), dark mode, code highlighting (Expressive Code), link cards, tabs, asides, badges, steps — zero plugins needed |
| **Package matching** | This project already uses React 19, so React components in MDX slots right in |
| **Deployment** | Static HTML output — deploy anywhere (GitHub Pages, Cloudflare Pages, Netlify) |
| **Version** | Latest: `@astrojs/starlight@0.39.2` |

---

## 2. Project Layout (coexisting with CLI source)

```
claude-multi/                        # existing root
├── src/                             # existing CLI source (TypeScript, Bun)
│   ├── cli.ts
│   ├── config.ts
│   ├── ...
│   └── ink/
│
├── src/content/                     # NEW — Starlight content
│   ├── content.config.ts            # content collection config
│   └── docs/                        # all doc pages (Markdown/MDX)
│       ├── index.md                 # landing page
│       ├── getting-started.md
│       ├── usage.md
│       ├── providers.md
│       ├── how-it-works.md
│       ├── configuration.md
│       ├── plugins-mcp.md
│       ├── changelog.md
│       └── development/
│           └── subagent-model-plan.md
│
├── src/assets/                      # NEW — static assets for docs
│   └── logo.svg                     # (optional)
│
├── src/styles/                      # NEW — custom CSS
│   └── custom.css                   # theme overrides if needed
│
├── public/                          # NEW
│   └── favicon.svg
│
├── astro.config.mjs                 # NEW — Astro + Starlight config
├── tsconfig.json                    # existing — may need adjustment
├── package.json                     # existing — add docs scripts + deps
└── ...
```

Key decision: Starlight lives at the project root. The existing `src/` for CLI code and the new `src/content/docs/` for Starlight coexist without conflict because Astro only looks at `src/content/` for its content collections, while Bun builds from `src/` explicitly via `bun build src/cli.ts`.

---

## 3. Dependencies to Add

Run with Bun (the project's package manager):

```bash
bun add astro @astrojs/starlight
```

| Package | Purpose |
|---------|---------|
| `astro` | Astro framework |
| `@astrojs/starlight` | Documentation theme |

**Total new dependencies:** 2 packages (Astro 5 + Starlight 0.39). No other plugins needed — search (Pagefind), code highlighting (Expressive Code), and all docs components ship inside Starlight.

---

## 4. Configuration Files

### 4.1 `astro.config.mjs` (new, at root)

```mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://hmziqrs.github.io/claude-multi',
  integrations: [
    starlight({
      title: 'claude-multi',
      description:
        'Manage multiple Claude Code instances with different AI providers and configurations',
      logo: {
        src: './src/assets/logo.svg',  // optional
      },
      social: {
        github: 'https://github.com/hmziqrs/claude-multi',
      },
      editLink: {
        baseUrl:
          'https://github.com/hmziqrs/claude-multi/edit/main/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { slug: 'getting-started' },
          ],
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

### 4.2 `src/content.config.ts` (new)

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

### 4.3 `package.json` scripts (additions)

```json
{
  "scripts": {
    "docs:dev": "astro dev",
    "docs:build": "astro build",
    "docs:preview": "astro preview"
  }
}
```

### 4.4 `tsconfig.json` adjustment

Astro 5 requires `moduleResolution: "bundler"` (already set) and `"astro"` in types. Add:

```json
{
  "compilerOptions": {
    "types": ["bun-types", "astro/client"]
  }
}
```

Optionally add `src/env.d.ts`:
```ts
/// <reference path="../.astro/types.d.ts" />
```

---

## 5. Content Pages — Migration Map

| README section | Starlight page | Notes |
|---|---|---|
| Title + "Why?" | `index.md` (landing) | Use `template: splash` + hero frontmatter |
| Installation + Quick Start | `getting-started.md` | |
| Full Usage block | `usage.md` | Break into subsections per command group |
| Provider Templates table | `providers.md` | Use Starlight `<CardGrid>` for provider cards |
| "How It Works" | `how-it-works.md` | Wrapper scripts, instance creation flow |
| Configuration (JSON block) | `configuration.md` | Config schema reference |
| Plugins/MCP commands | `plugins-mcp.md` | New page for plugin & MCP management |
| CHANGELOG.md (root) | `changelog.md` | Mirror existing changelog |
| docs/subagent-model-plan.md | `development/subagent-model-plan.md` | Move into docs tree |

**Total: 9 pages** (~7 from README sections + changelog + existing plan doc)

---

## 6. Starlight Features to Leverage

| Feature | Where | Why |
|---------|-------|-----|
| **CardGrid + Cards** | `providers.md` | Visual cards for GLM/MiniMax/DeepSeek |
| **Tabs** | `usage.md` | Show interactive vs non-interactive commands side by side |
| **Code (Expressive Code)** | Everywhere | Filename headers, line highlighting for code blocks |
| **Badges** | Sidebar, `providers.md` | "GLM", "MiniMax" badges on provider entries |
| **Asides** | `getting-started.md` | "Requires Node.js >= 18" as a caution aside |
| **Pagefind search** | Entire site | Zero-config full-text search |
| **Edit link** | Every page footer | Links back to GitHub for community contributions |
| **Last updated** | Every page footer | Git-based timestamps |

---

## 7. Deployment Options

### Recommended: GitHub Pages

```bash
# Add to .github/workflows/deploy-docs.yml
name: Deploy Docs
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
```

Set Astro `site` to `https://hmziqrs.github.io/claude-multi` and `base` to `/claude-multi`.

### Alternative: Cloudflare Pages

Even simpler — connect the repo, set build command to `bun run docs:build`, output dir to `dist/`.

---

## 8. Implementation Checklist

- [ ] **Phase 1 — Scaffold**
  - [ ] `bun add astro @astrojs/starlight`
  - [ ] Create `astro.config.mjs`
  - [ ] Create `src/content.config.ts`
  - [ ] Create `src/content/docs/` directory
  - [ ] Create `public/` with favicon
  - [ ] Add `docs:dev`, `docs:build`, `docs:preview` scripts to `package.json`
  - [ ] Verify `bun run docs:dev` starts and serves a blank docs site

- [ ] **Phase 2 — Content**
  - [ ] `src/content/docs/index.md` — landing page with splash template + hero
  - [ ] `src/content/docs/getting-started.md` — install + quick start
  - [ ] `src/content/docs/usage.md` — full CLI reference with tabs
  - [ ] `src/content/docs/providers.md` — provider cards
  - [ ] `src/content/docs/how-it-works.md` — architecture
  - [ ] `src/content/docs/plugins-mcp.md` — plugin/MCP commands
  - [ ] `src/content/docs/configuration.md` — config reference
  - [ ] `src/content/docs/changelog.md` — from `CHANGELOG.md`
  - [ ] `src/content/docs/development/subagent-model-plan.md` — moved from `docs/`

- [ ] **Phase 3 — Polish**
  - [ ] Add logo (reuse existing or create SVG)
  - [ ] Custom CSS if needed (brand colors matching project)
  - [ ] Verify search works (`bun run docs:build && bun run docs:preview`)
  - [ ] Verify dark mode toggle works
  - [ ] Verify all code blocks highlight correctly
  - [ ] Verify edit links point to correct GitHub paths
  - [ ] Test mobile responsive layout

- [ ] **Phase 4 — Deploy**
  - [ ] Create GitHub Actions workflow for docs deployment
  - [ ] Set `site` and `base` in `astro.config.mjs`
  - [ ] Push and verify deployment
  - [ ] Update `package.json` `homepage` field to docs site URL

---

## 9. What Stays Unchanged

- **CLI source** (`src/cli.ts`, `src/config.ts`, etc.) — untouched
- **CLI build** (`bun run build`, `bun run build:ink`) — untouched
- **Tests** (`bun test`) — untouched
- **Existing README.md** — kept as-is (npm readme), or redirected to docs site with a link

---

## 10. Estimated Effort

| Phase | Time |
|-------|------|
| Scaffold | 5 min |
| Content migration | 30–45 min |
| Polish | 15 min |
| Deployment | 10 min |
| **Total** | **~1 hour** |
