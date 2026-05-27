# Marketing Page — Implementation Plan

## 1. Architecture

**Current:** All pages under `/docs` via `base: '/docs'` in Astro config.

**Target:** Marketing page at `/` and docs at `/docs/`.

**Approach:** Remove `base`, nest docs content one level deeper, add a standalone Astro page for marketing.

```
Before                               After
─────────────────────────────────────────────────────────────
base: '/docs'                        base: (none)

src/content/docs/                    src/content/docs/
├── index.md            →           ├── docs/             ← all docs live here now
├── getting-started.md  →           │   ├── index.md      (docs landing)
├── usage.md            →           │   ├── getting-started.md
├── ...                 →           │   ├── ...
└── development/        →           │   └── development/
    └── subagent-model-plan.md →    │       └── subagent-model-plan.md
                                    │
                                    src/pages/
                                    └── index.astro        ← marketing page at /
```

**How Starlight handles it:** Starlight's `docsLoader()` routes files based on their path within `src/content/docs/`. Nesting under `docs/` makes all routes naturally land at `/docs/` — no `base` needed.

```
File                                     → Route
src/content/docs/docs/index.md           → /docs/
src/content/docs/docs/getting-started.md → /docs/getting-started/
src/pages/index.astro                    → /
```

---

## 2. Changes Required

### 2.1 `astro.config.mjs`

- Remove `base: '/docs'` (only change — `site` is already the root domain)
- Update all sidebar `slug` values to include `docs/` prefix

```diff
- base: '/docs',
+ // base removed entirely
```

> `site`, `favicon`, `editLink`, `social`, and `lastUpdated` stay exactly as-is. Edit links auto-adjust because Starlight appends the new `docs/<slug>.md` path after `editLink.baseUrl`.

Sidebar slugs:
```diff
- { slug: 'getting-started' }
+ { slug: 'docs/getting-started' }
```

### 2.2 File moves

```
src/content/docs/index.md              → src/content/docs/docs/index.md
src/content/docs/getting-started.md    → src/content/docs/docs/getting-started.md
src/content/docs/usage.md              → src/content/docs/docs/usage.md
src/content/docs/providers.md          → src/content/docs/docs/providers.md
src/content/docs/how-it-works.md       → src/content/docs/docs/how-it-works.md
src/content/docs/plugins-mcp.md        → src/content/docs/docs/plugins-mcp.md
src/content/docs/configuration.md      → src/content/docs/docs/configuration.md
src/content/docs/changelog.md          → src/content/docs/docs/changelog.md
src/content/docs/development/          → src/content/docs/docs/development/
```

### 2.3 No changes to content files

All frontmatter (hero links, internal references) stays the same. With `base` removed, `/docs/getting-started/` is the actual route — it was correct before and remains correct now.

### 2.4 `package.json` homepage

```diff
- "homepage": "https://claude-mutli.hmziq.xyz/docs"
+ "homepage": "https://claude-mutli.hmziq.xyz"
```

---

## 3. Marketing Page Design

### 3.1 File: `src/pages/index.astro`

This is a standalone Astro page, NOT part of Starlight's docs collection. It lives outside Starlight's sidebar/chrome — a fully custom marketing page with its own layout.

```astro
---
import Layout from '../layouts/MarketingLayout.astro';
---

<Layout>
  <!-- Hero -->
  <section>...</section>
  <!-- Features -->
  <section>...</section>
  <!-- Providers -->
  <section>...</section>
  <!-- CTA -->
  <section>...</section>
</Layout>
```

### 3.2 Sections

| Section | Content |
|---------|---------|
| **Hero** | Logo, tagline, "Get Started" CTA → `/docs/getting-started/`, "GitHub" secondary CTA |
| **Features** | 3-column grid: Multi-provider, Isolated configs, Plugin sync — each with icon + description |
| **Providers** | GLM, MiniMax, DeepSeek badges/cards showing supported models |
| **Quick Example** | Terminal code block showing `claude-multi add glm --provider glm --api-key "..."` |
| **CTA** | "Ready to manage multiple Claude instances?" → link to docs |
| **Footer** | GitHub link, MIT license |

### 3.3 Styling & Visual Effects

**Accent color:** Lime (`#a3e635`) with `#84cc16` hover. The marketing page uses standalone CSS (no access to Starlight `--sl-*` variables since it's outside Starlight's pipeline).

**Three.js background:** A `<canvas>` element behind the hero renders 18 floating wireframe geometric shapes (icosahedrons, octahedrons, torus knots, tetrahedrons) in semi-transparent lime (`0xa3e635`, opacity 0.12). The camera gently orbits. The canvas is `position: fixed`, `pointer-events: none`, `z-index: 0` — purely decorative, no interaction overlap.

**Glow effects:** Lime glow on feature icons (`drop-shadow`), CTA section background gradient, and primary button `box-shadow` for a cohesive neon aesthetic.

### 3.4 Layout component: `src/layouts/MarketingLayout.astro`

The layout contains all CSS in a `<style is:global>` block, a `<canvas id="three-bg">` element, and a `<script>` block that initializes Three.js via dynamic `import('three')` (bundled by Vite).

---

## 4. Route Map (final)

| URL | Source | Layout |
|-----|--------|--------|
| `/` | `src/pages/index.astro` | Marketing layout |
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
