# Starlight Docs Site — Implementation Plan

## 1. Project Layout

Starlight lives at the project root, coexisting with the existing CLI source. Astro uses `src/content/` for its content collections; Bun builds from `src/` explicitly (`bun build src/cli.ts`). No overlap.

Docs pages are nested under `src/content/docs/docs/` to naturally route at `/docs/` without needing Astro's `base` option. The marketing page at `src/pages/index.astro` serves the domain root `/`.

```
claude-multi/
├── src/                                   # existing CLI source (unchanged)
│   ├── cli.ts
│   ├── config.ts
│   └── ink/
│
├── src/content/                           # Starlight content collections
│   ├── content.config.ts
│   └── docs/
│       └── docs/                          # all docs live here → /docs/
│           ├── index.md                   # docs landing (splash template)
│           ├── getting-started.md
│           ├── usage.md
│           ├── providers.md
│           ├── how-it-works.md
│           ├── plugins-mcp.md
│           ├── configuration.md
│           ├── changelog.md
│           └── development/
│               └── subagent-model-plan.md
│
├── src/pages/                             # standalone Astro pages
│   └── index.astro                        # marketing page at /
│
├── src/layouts/                           # Astro layouts
│   └── MarketingLayout.astro
│
├── src/styles/                            # custom CSS overrides
│   └── custom.css
│
├── public/                                # unprocessed static files
│   └── favicon.svg
│
├── astro.config.mjs
├── src/env.d.ts
├── package.json
└── ...
```

**Route map:**

| URL | Source | Layout |
|-----|--------|--------|
| `/` | `src/pages/index.astro` | MarketingLayout |
| `/docs/` | `src/content/docs/docs/index.md` | Starlight splash |
| `/docs/getting-started/` | `src/content/docs/docs/getting-started.md` | Starlight default |
| `/docs/usage/` | `src/content/docs/docs/usage.md` | Starlight default |
| `/docs/providers/` | `src/content/docs/docs/providers.md` | Starlight default |
| `/docs/how-it-works/` | `src/content/docs/docs/how-it-works.md` | Starlight default |
| `/docs/plugins-mcp/` | `src/content/docs/docs/plugins-mcp.md` | Starlight default |
| `/docs/configuration/` | `src/content/docs/docs/configuration.md` | Starlight default |
| `/docs/changelog/` | `src/content/docs/docs/changelog.md` | Starlight default |
| `/docs/development/subagent-model-plan/` | `src/content/docs/docs/development/subagent-model-plan.md` | Starlight default |

---

## 2. Dependencies

```bash
bun add astro @astrojs/starlight
```

| Package | Purpose |
|---------|---------|
| `astro` | Framework (v6.x) |
| `@astrojs/starlight` | Documentation theme (v0.39.x) |

No other packages needed for docs. Search (Pagefind), code highlighting (Expressive Code), and sitemap ship inside Starlight.

---

## 3. Configuration Files

### 3.1 `astro.config.mjs`

```mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://claude-multi.hmziq.xyz',
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
          items: [{ slug: 'docs/getting-started' }],
        },
        {
          label: 'Guides',
          items: [
            { slug: 'docs/usage' },
            { slug: 'docs/providers' },
            { slug: 'docs/how-it-works' },
            { slug: 'docs/plugins-mcp' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { slug: 'docs/configuration' },
            { slug: 'docs/changelog' },
          ],
        },
        {
          label: 'Development',
          collapsed: true,
          items: [
            { slug: 'docs/development/subagent-model-plan' },
          ],
        },
      ],
      lastUpdated: true,
      favicon: '/favicon.svg',
    }),
  ],
});
```

> **No `base` field.** Docs route at `/docs/` because pages are nested inside `src/content/docs/docs/`. The marketing page at `src/pages/index.astro` handles `/`. No need for Astro's `base` prefix — clean, simple routing.

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

No changes to `tsconfig.json`. The existing config already has `moduleResolution: "bundler"` (Astro requirement) and `module: "Preserve"` (Astro-compatible).

### 3.4 `package.json` — scripts added

```json
{
  "scripts": {
    "docs:dev": "astro dev",
    "docs:build": "astro build",
    "docs:preview": "astro preview"
  },
  "homepage": "https://claude-multi.hmziq.xyz"
}
```

---

## 4. Content Pages — Migration Map

| Source | Starlight page | File path |
|--------|---------------|-----------|
| README hero + tagline | Docs landing | `src/content/docs/docs/index.md` |
| README: Install + Quick Start | Getting Started | `src/content/docs/docs/getting-started.md` |
| README: Usage block | Usage | `src/content/docs/docs/usage.md` |
| README: Provider Templates | Providers | `src/content/docs/docs/providers.md` |
| README: How It Works | How It Works | `src/content/docs/docs/how-it-works.md` |
| README: Plugins/MCP commands | Plugins & MCP | `src/content/docs/docs/plugins-mcp.md` |
| README: Configuration JSON | Configuration | `src/content/docs/docs/configuration.md` |
| root `CHANGELOG.md` | Changelog | `src/content/docs/docs/changelog.md` |
| `docs/subagent-model-plan.md` | Subagent Model Plan | `src/content/docs/docs/development/subagent-model-plan.md` |

**9 docs pages + 1 marketing page = 10 content pages total.** Root `README.md` stays as the npm readme. Root `CHANGELOG.md` can be removed after migration.

---

## 5. Starlight Features to Leverage

| Feature | Use on |
|---------|--------|
| `template: splash` + hero | `docs/index.md` docs landing |
| `<CardGrid>` + `<Card>` | `docs/providers.md` — GLM / MiniMax / DeepSeek |
| `<Tabs>` | `docs/usage.md` — interactive vs non-interactive examples |
| `:::` asides | `docs/getting-started.md` — prerequisites |
| `<Badge>` | Sidebar indicators, provider labels |
| Expressive Code | All code blocks with filenames/highlights |
| Pagefind search | Entire docs site |
| Edit link + `lastUpdated` | Every docs page footer |

---

## 6. Marketing Page

A standalone Astro page at `src/pages/index.astro` using `src/layouts/MarketingLayout.astro`. Fully separate from Starlight's chrome — custom dark-themed design with hero, features grid, provider cards, code example, and CTA section. Styled with standalone CSS (no Starlight `--sl-*` variable dependency since the marketing page is outside Starlight's pipeline).

---

## 7. Deployment

**Target:** `https://claude-multi.hmziq.xyz` (root domain).

The built output goes to `dist/`:
```
dist/
├── index.html                          ← marketing page (/)
├── favicon.svg
├── sitemap-index.xml
├── docs/
│   ├── index.html                      ← docs landing (/docs/)
│   ├── getting-started/index.html
│   ├── usage/index.html
│   ├── providers/index.html
│   ├── how-it-works/index.html
│   ├── plugins-mcp/index.html
│   ├── configuration/index.html
│   ├── changelog/index.html
│   └── development/
│       └── subagent-model-plan/index.html
├── 404.html
└── pagefind/                           ← search index (docs only)
```

### Cloudflare Pages

1. Dashboard → Workers & Pages → Create → Pages → Connect to Git
2. Build command: `bun run docs:build`
3. Output directory: `dist`
4. Environment variable: `BUN_VERSION` = `latest`
5. Custom domain: `claude-multi.hmziq.xyz`

### Generic static host

Deploy `dist/` to the web root. No subpath rewrites needed — all routes are at their natural paths.

---

## 9. What Stays Unchanged

| Area | Status |
|------|--------|
| CLI source (`src/cli.ts`, `src/config.ts`, ...) | Untouched |
| CLI build (`bun run build`, `bun run build:ink`) | Untouched |
| Tests (`bun test`) | Untouched |
| `README.md` | Kept as npm readme |
| `CHANGELOG.md` | Can be removed after moving content to docs |

---
