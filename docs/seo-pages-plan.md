# SEO Pages Plan

Goal: rank for searches developers actually type when looking for "how do I use Claude Code with a non-Anthropic provider," and convert them into installs. Every page in this doc must satisfy three rules:

1. **Real search intent** — there must be a query a real person types that this page answers.
2. **Genuinely unique content** — no thin-page boilerplate Google demotes.
3. **Generatable from data we already have** — provider templates, CHANGELOG.md, or the source code. We should not maintain freeform prose.

Pages that fail any of those tests are listed at the end under "Pages NOT to build."

---

## Tier 1 — Highest ROI (build these first)

### 1. Per-provider landing pages

**Route:** `/providers/<name>/` — one per provider.
**Initial set:** `/providers/anthropic/`, `/providers/glm/`, `/providers/minimax/`, `/providers/deepseek/`

**Target queries**
- "GLM Claude Code"
- "DeepSeek CLI"
- "MiniMax M2 Claude Code"
- "Anthropic Claude Code multiple accounts"
- "how to use [provider] with Claude Code"

**Why it wins**
- Every provider name is a distinct keyword we currently dilute on a single `/docs/providers/` page.
- These searches indicate intent to install — the highest-converting traffic we can attract.
- Content is mechanical: pull from the provider template files; no prose maintenance burden.

**Content blocks**
- Hero: "Use [Provider] with Claude Code" + one-line install command
- Stat row: model count, context window, base URL, license/pricing tier
- Setup card: copy-paste `claude-multi add` command with provider's `--api-key` flag
- Model matrix table (auto-generated from template)
- Pricing/limits section (link out — we don't maintain prices)
- "vs Anthropic" comparison strip (3-5 bullets, neutral)
- Troubleshooting accordion (top 3 known issues per provider)
- FAQ block (3-5 Q&A — feeds Google's FAQ rich snippet)
- CTA to `/docs/getting-started/`

**Data source:** `src/templates/<provider>.ts` (or wherever provider templates live in the CLI).
**Effort:** ~1 day to scaffold + a generator script; subsequent providers cost minutes.

---

### 2. Provider comparison pages

**Route:** `/compare/<a>-vs-<b>/` — pairwise.
**Initial set:** the 3-4 highest-volume queries:
- `/compare/glm-vs-anthropic/`
- `/compare/deepseek-vs-anthropic/`
- `/compare/minimax-vs-glm/`
- `/compare/deepseek-vs-glm/`

**Target queries**
- "GLM vs Claude" — high commercial intent
- "DeepSeek vs Claude pricing"
- "MiniMax M2 vs GLM 5"

**Why it wins**
- Comparison searches have unusually high CTR and intent — Google surfaces them prominently.
- We have a unique angle: we don't pick a winner. Every comparison ends with "use both via claude-multi." This is a defensible position vs. provider-published comparisons that are always biased.

**Content blocks**
- Hero: side-by-side provider logos + headline ("Both. Via one CLI.")
- Quick verdict box (3 lines: who wins on price/speed/quality)
- Spec table (auto-generated)
- Per-dimension breakdown sections: pricing, context window, coding ability, latency, regional availability
- "When to choose [A]" and "When to choose [B]" cards (genuine recommendation, no shilling)
- "Or use both" footer card — the conversion hook
- Internal links to each provider's landing page

**Effort:** content shell is 90% reusable. Build once, fill in deltas.

---

### 3. Use-case landing pages

**Route:** `/use-cases/<scenario>/`

**Initial set:**
- `/use-cases/cost-optimization/` — "use the cheap model for grep, premium model for refactors"
- `/use-cases/agentic-workflows/` — running multiple models in parallel for verification
- `/use-cases/byo-api-key/` — keeping costs predictable with your own keys

**Target queries**
- "reduce Claude Code costs"
- "Claude Code with cheaper model"
- "Claude Code multi-agent"
- "Claude Code own API key"

**Why it wins**
- Captures problem-aware traffic (people who know they have a pain but don't know about us)
- Each page solves a real concrete pain and ends with `claude-multi add` as the answer

**Content blocks**
- The problem (relatable opener)
- The conventional approach + why it sucks
- The claude-multi approach (with code blocks)
- Real numbers / cost comparison if possible
- Setup walkthrough
- Related pages

**Effort:** ~3-4 hours each. Higher writing burden than templated pages, so only build what you can write authentically.

---

## Tier 2 — Worth building once Tier 1 is shipped

### 4. Alternatives/migration pages

**Route:** `/alternatives/<tool>/` and `/from/<tool>/`

**Candidates:**
- `/alternatives/aider/` — "claude-multi vs Aider"
- `/alternatives/cursor-cli/`
- `/alternatives/continue/`
- `/from/openrouter/` — "switching from OpenRouter to claude-multi"

**Target queries**
- "[competitor] alternative"
- "[competitor] vs Claude Code"

**Why it wins:** people searching for a competitor by name are mid-purchase. Catching them with a fair comparison can flip them.

**Risk:** must be honest. Bias gets penalized by both readers and (increasingly) Google's helpful-content updates.

---

### 5. Plugin/MCP catalog page

**Route:** `/plugins/` (browsable index) + `/plugins/<name>/` per plugin

**Target queries**
- "Claude Code plugins"
- "Claude Code MCP servers"
- "[plugin name] Claude"

**Why it wins:** plugin discovery is currently a docs-buried activity. A catalog page is the highest-bandwidth way to surface what claude-multi installs / supports.

**Content per plugin page:**
- What it does (1-2 sentences)
- Install command via claude-multi
- Required env vars
- Link to source repo

**Source:** generated from `installed_plugins.json` v2 schema you already maintain.

---

### 6. Tutorial / cookbook pages

**Route:** `/cookbook/<recipe>/`

**Candidates that match real search intent:**
- `/cookbook/multi-model-code-review/` — Sonnet writes, Haiku reviews
- `/cookbook/cheap-grep-premium-refactor/` — DeepSeek for search, Claude for changes
- `/cookbook/isolated-experiment/` — spin up disposable instance, test plugin, throw away

Each must be a real, working workflow you've actually used — not aspirational fiction.

**Effort:** real writing required. Build only what's authentic.

---

### 7. Glossary / "what is" pages

**Route:** `/glossary/<term>/` or `/what-is/<term>/`

**Candidates:**
- `/what-is/claude-code/` — for people who haven't heard of CC yet
- `/what-is/mcp/`
- `/what-is/skill/` (Claude Skills, currently rising in search volume)

**Why it wins:** definition queries are high-volume, easy to rank for, and let you control how a concept is framed (with you positioned in the answer).

**Content shape:** definition (50 words) → short explanation (200 words) → how it relates to claude-multi → links to deeper reading. Aim for featured-snippet eligibility.

---

## Tier 3 — Maybe; only if there's a real reason

### 8. Status / system page

**Route:** `/status/`

Only build if/when you have actual infrastructure to monitor. As a static-site tool there isn't much. Skip until needed.

### 9. Roadmap

**Route:** `/roadmap/`

Useful for credibility ("they're actively building this"). But only if you commit to keeping it current. A stale roadmap is worse than no roadmap.

### 10. Acknowledgements / Sponsors

**Route:** `/credits/` or `/sponsors/`

Build when there's something real to acknowledge.

---

## Pages NOT to build

These look tempting but are net-negative under modern Google ranking:

- `/blog/` — only if you commit to publishing real, original posts. An empty or sparsely-updated blog signals abandonment. Don't seed it with one "welcome" post.
- `/team/` — single-maintainer projects don't need this. The About page already covers it.
- `/contact/` — redundant with footer links. Adds a page Google will see as low-value.
- `/faq/` — generic FAQ pages are weak signals. Put FAQ blocks inside relevant pages (provider pages, use-case pages) where they reinforce intent.
- `/testimonials/` — without real testimonials this is empty. With fabricated ones it's harmful.
- `/press/` — only if there's actual press.
- `/showcase/` — only if you have permission and real examples.

---

## Build order (recommended)

1. **Provider pages (4)** → instant SEO surface area, highest intent match
2. **Top 2 comparison pages** → high-CTR queries
3. **Plugin catalog** → reuses data, surfaces existing value
4. **1-2 use-case pages** that you can write authentically
5. **Re-evaluate.** Look at Google Search Console data before building more.

Most of the rest can wait until traffic data tells you what's missing.

---

## Implementation notes

- All new pages should reuse `MarketingLayout` and existing utilities (`glass`, `eyebrow`, `gradient-text`, etc.) for visual cohesion.
- Generate provider/plugin pages with `getStaticPaths` from the template/plugin data — avoid hand-maintaining N nearly-identical files.
- Every page needs a unique `title` + `description` prop on the layout (already supported).
- Every page must internally link to ≥2 other pages on the site — strengthens crawl graph and topic authority.
- Use semantic HTML (`<article>`, `<section>`, proper `h1`/`h2` order) — Google's parsers reward structure.
- Add `application/ld+json` structured data for SoftwareApplication on `/`, FAQPage on pages with FAQ blocks, BreadcrumbList on every nested page.
- Consider an RSS feed for `/changelog/` (Astro can generate this) — gives feed readers and Google a strong signal of freshness.

---

## Tracking

After shipping each batch:
- Submit updated `sitemap-index.xml` to Google Search Console.
- Wait 2-4 weeks for indexing.
- Use GSC's Performance report to see which queries each page is appearing for.
- Promote the pages that already get impressions but low CTR by improving their meta description and title.
- Kill or merge pages that get zero impressions after 60 days.
