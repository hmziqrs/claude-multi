# SEO Audit Report - claude-multi.hmziq.xyz

## Date: 2026-06-02

---

## Executive Summary

The claude-multi website has a solid technical foundation with clean HTML, proper canonical tags, consistent trailing-slash usage, and well-structured JSON-LD on marketing pages. The overall SEO health score is **52 out of 100**.

The site's biggest weaknesses are: (1) severe performance issues from a 715 KB Three.js bundle and render-blocking Firebase/Google Fonts on every page, (2) critically thin content on the docs landing page (41 words) and several other pages, (3) missing structured data on all docs pages (no JSON-LD emitted by Starlight), (4) a completely empty social sharing image strategy where every page shares one generic og-image.jpg and no page passes a custom ogImage prop, (5) no FAQPage schema on the FAQ section despite having 16 well-structured Q&A entries, and (6) zero competitive/comparison content targeting the highest-volume keywords in the niche (e.g., "claude code vs cursor", "claude squad alternative").

The writing quality across all pages is genuinely strong -- AI writing scores average 1.3/10, and the direct developer voice is a competitive advantage that should be preserved. The biggest opportunities are programmatic SEO: the templates.ts data file already contains everything needed to auto-generate provider-specific and model-specific landing pages that would capture long-tail search traffic currently going to manual Medium posts and Reddit threads.

## Overall Score: 52/100

| Category | Score | Weight |
|----------|-------|--------|
| Performance | 52/100 | 20% |
| Technical SEO | 72/100 | 15% |
| On-Page SEO | 45/100 | 20% |
| Content Quality | 82/100 | 15% |
| Structured Data | 55/100 | 10% |
| Social / OG | 40/100 | 5% |
| Competitive Positioning | 25/100 | 15% |

---

## Critical Issues

### 1. Three.js loads 715 KB on every marketing page

**Impact:** Massive LCP and FCP degradation. Pages that never render 3D content still download a 732 KB JavaScript chunk. This alone likely pushes LCP above the 2.5s "good" threshold and hurts Core Web Vitals rankings.

**Problem:** The dynamic import in `MarketingLayout.astro` fires on all pages regardless of whether `[data-three]` elements exist. The dist output confirms the chunk: `three.CuzN0wor.js` is 732,583 bytes.

**Fix:** Guard the Three.js import behind a DOM check. In `MarketingLayout.astro` around line 509, wrap the dynamic import:

```js
if (document.querySelector('[data-three]')) {
  const THREE = await import('three');
  // ... existing init code
}
```

This eliminates the download on pages without 3D elements. For pages that do use 3D, consider replacing Three.js with a lightweight CSS/SVG alternative since the 3D visuals are decorative.

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/layouts/MarketingLayout.astro`

---

### 2. Firebase Analytics loads synchronously, blocking First Contentful Paint

**Impact:** Blocks the parser during initial page load. The inline script at lines 142-158 of MarketingLayout.astro fires before any visual content renders, adding 150+ KB of synchronous network requests to the critical path from gstatic CDN.

**Fix:** Move the Firebase initialization to a deferred script. Replace the inline `<script is:inline type="module">` block (lines 142-158 in MarketingLayout.astro) with either:

```js
// Option A: requestIdleCallback
requestIdleCallback(() => { import('/scripts/firebase-init.js'); })

// Option B: defer at end of body
<script defer src="/scripts/firebase-init.js"></script>
```

The analytics do not need to load before the page is interactive.

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/layouts/MarketingLayout.astro`

---

### 3. Google Fonts CSS is render-blocking

**Impact:** Delayed First Meaningful Paint. Every page waits for the Google Fonts CSS to download and parse before rendering any text. Seven weight variants (400-800) are loaded but most pages only use 2-3.

**Fix:** Self-host the Inter and JetBrains Mono WOFF2 files. Place them in `/public/fonts/`, add preload hints in the `<head>`, and replace the Google Fonts `<link>` with a local `@font-face` declaration in `globals.css`. Only include the weights actually used (likely 400, 500, 700 for Inter; 400, 500 for JetBrains Mono). This eliminates cross-origin dependency and allows bundler hashing for long-term caching.

```html
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/Inter-Variable.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/JetBrainsMono-Variable.woff2">
```

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/layouts/MarketingLayout.astro`
- `/Users/hmziq/os/claude-multi/src/web/styles/globals.css`

---

### 4. Docs landing page has only 41 words of visible content

**Impact:** The docs homepage will not rank for any query. It provides zero semantic value to crawlers and bounces users who land there from search results. This is the second-most important page on the site after the homepage.

**Problem:** The entire file `/docs/index.md` is YAML frontmatter with zero Markdown body. Search engines cannot determine the page's topic.

**Fix:** Add substantive content to the docs landing page:
1. A 3-5 sentence intro paragraph explaining what claude-multi is
2. A features/benefits list with 4-6 concrete capabilities
3. A card grid linking to major doc sections (Getting Started, Usage, Configuration, Providers) with 1-sentence descriptions
4. Target 300+ words total
5. Add proper H2/H3 headings -- currently the page has only an H1

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/content/docs/docs/index.md`

---

### 5. No JSON-LD structured data on any docs pages

**Impact:** All 12 documentation pages miss rich result eligibility. The Getting Started page could show HowTo rich snippets; the FAQ pages could show FAQ rich snippets; the Troubleshooting page could show FAQ rich snippets. These are the pages most likely to rank for informational queries.

**Fix:** Create a Starlight head injection component or override the default Starlight layout to add JSON-LD. In `astro.config.mjs`, use Starlight's `head` prop or create a custom layout at `src/web/layouts/DocLayout.astro` that wraps Starlight's layout and injects structured data. At minimum:

- **BreadcrumbList** for all pages
- **HowTo** for getting-started
- **FAQPage** for troubleshooting

The FAQ pages already have the Q&A structure in `/src/web/pages/faq/[...slug].astro` -- add FAQPage schema there.

**Files:**
- `/Users/hmziq/os/claude-multi/astro.config.mjs`
- `/Users/hmziq/os/claude-multi/src/web/pages/faq/[...slug].astro`

---

### 6. All pages share a single generic og-image.jpg

**Impact:** Social sharing click-through rates are suppressed across all pages. Blog posts shared on Twitter/LinkedIn/Slack look identical to the homepage. Google Discover and social platforms deprioritize links without distinctive images. The baseline JPEG is also 149 KB -- converting to WebP would save ~60 KB.

**Problem:** No page in the entire project passes a custom `ogImage` prop to `MarketingLayout`. Blog posts, FAQ entries, docs pages all show the same social preview. A `grep -rn 'ogImage'` across all pages in `src/web/pages/` returns zero results.

**Fix:** Generate per-page OG images. The fastest approach: use `@vercel/og` or satori to auto-generate OG images at build time from each page's title and description. Create a reusable OG image generator endpoint at `/src/web/pages/og/[...slug].png.ts`. For blog posts specifically, pass the generated image URL via the `ogImage` prop. For docs pages, generate them in the Starlight head injection. Also convert `og-image.jpg` from 149 KB JPEG to WebP (expected ~90 KB).

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/layouts/MarketingLayout.astro`
- `/Users/hmziq/os/claude-multi/src/web/pages/blog/[...slug].astro`

---

## High-Impact Improvements

### 7. Missing FAQPage structured data on 16 FAQ pages

**Impact:** The FAQ section is the single biggest missed rich-snippet opportunity. Google shows FAQ expandable snippets directly in SERPs, which increases SERP real estate by ~100px and can double click-through rates. With 16 FAQ entries, this could produce FAQ rich results for dozens of long-tail queries.

**Fix:** In `/src/web/pages/faq/[...slug].astro`, add a `FAQPage` JSON-LD block to the `jsonLd` prop passed to the layout. Each FAQ entry already has a question title and answer body -- map them to `Question/Answer` schema pairs. On the FAQ index page (`/src/web/pages/faq/index.astro`), add a `FAQPage` schema with all 16 questions. Ensure the answer text uses the full rendered content, not just the short description (the current approach uses `entry.data.description` which is too brief).

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/pages/faq/[...slug].astro`
- `/Users/hmziq/os/claude-multi/src/web/pages/faq/index.astro`

---

### 8. Viewport meta tag missing `initial-scale=1`

**Impact:** Some mobile browsers (older Safari, Android Browser) default to a zoomed-out view without `initial-scale=1`, causing CLS issues and potentially failing Google's mobile-friendly test.

**Fix:** Change line 50 of `MarketingLayout.astro` from:

```html
<meta name="viewport" content="width=device-width" />
```

to:

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/layouts/MarketingLayout.astro`

---

### 9. 55 KB global CSS inlined into every HTML response

**Impact:** Every page loads 55 KB of non-cacheable inline CSS. The browser cannot cache this across navigations, so repeat visits re-download the same styles embedded in HTML. This includes CSS for 3D logo, terminal simulator, and all utility classes regardless of whether the current page uses them.

**Fix:** Replace the `<style is:global>@import '../styles/globals.css';</style>` block with a standard Astro CSS import: add `import '../styles/globals.css'` in the frontmatter section (after line 43). Astro will extract, hash, and cache this as a separate CSS file. For critical above-fold styles (~5 KB), keep them inline via a separate `critical.css` file.

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/layouts/MarketingLayout.astro`

---

### 10. Four Starlight docs pages are orphans with no cross-links

**Impact:** These pages have weak internal link equity and are invisible to users navigating via the marketing nav/footer. Search engines assign lower authority to pages with few internal links. The troubleshooting page is especially important for capturing error-based search queries.

The orphaned pages:
- `/docs/troubleshooting/`
- `/docs/changelog/`
- `/docs/contributing/`
- `/docs/development/subagent-model-plan/`

**Fix:** Add cross-links:
1. Link `/docs/troubleshooting/` from the FAQ index page and from relevant FAQ entries
2. Link `/docs/contributing/` from the About page and the footer
3. Link `/docs/changelog/` from the `/changelog/` page
4. Consider adding these to the MarketingLayout footer alongside Product/Resources/Community/Legal

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/pages/faq/index.astro`
- `/Users/hmziq/os/claude-multi/src/web/pages/about.astro`
- `/Users/hmziq/os/claude-multi/src/web/layouts/MarketingLayout.astro`

---

### 11. Changelog page has broken heading hierarchy

**Impact:** Search engines cannot parse the page structure to understand individual releases. Users searching for "claude-multi v0.7.0" or specific version changes will not find this page for those queries.

**Fix:** In `/src/web/pages/changelog.astro`:
1. Change the H1 from "What's new." to "claude-multi Changelog" or "Release History"
2. Ensure each version (v0.7.0, v0.6.5, etc.) renders as an H2 with a fragment anchor (`id="v0.7.0"`)
3. Expand the title tag from "Changelog - claude-multi" (25 chars) to "Changelog - claude-multi | Release History & Updates" (~55 chars)
4. Expand the meta description from 86 chars to 150-160

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/pages/changelog.astro`

---

### 12. Sitemap entries lack `<lastmod>` dates

**Impact:** Search engines cannot determine content freshness, reducing crawl efficiency for frequently updated pages (blog, changelog). The implicit sitemap dependency could break if Starlight changes its dependency tree.

**Fix:** In `astro.config.mjs`:
1. Add `import sitemap from '@astrojs/sitemap'` at the top
2. Add `sitemap()` to the integrations array
3. Add `@astrojs/sitemap` to `package.json` devDependencies

The Starlight config already has `lastUpdated: true` (line 95), so explicit sitemap configuration should pick up frontmatter dates for lastmod generation.

**Files:**
- `/Users/hmziq/os/claude-multi/astro.config.mjs`
- `/Users/hmziq/os/claude-multi/package.json`

---

### 13. About page H1 does not match navigation intent

**Impact:** Users clicking "About" in the nav see an H1 that reads like a marketing tagline ("One CLI. Every model."), not a page identifier. Search engines use the H1 to understand page topic and this provides no signal that it is an About page.

**Fix:** Either change the H1 to "About claude-multi: One CLI for every model" or add a visible eyebrow/label above the current H1 that reads "About". This aligns the nav link, URL, and heading for both users and search engines.

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/pages/about.astro`

---

### 14. RSS feed items lack full article content

**Impact:** Feed subscribers cannot read full articles in their reader without clicking through, reducing engagement. Feed validators flag missing elements. No audio enclosure metadata despite blog posts having audio URLs in frontmatter.

**Fix:** In `/src/web/pages/feed.xml.ts`:
1. Import rendered blog post HTML and add `content` field to each RSS item
2. Add `customData: '<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>'` to the channel
3. Add `xmlns:atom="http://www.w3.org/2005/Atom"` and `<atom:link href="...feed.xml" rel="self" type="application/rss+xml"/>`
4. Add `author` field (default "hmziqrs")
5. For posts with audio URLs, add `enclosure` with url, length, and `type="audio/mpeg"`

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/pages/feed.xml.ts`

---

### 15. Missing favicon.ico and theme-color meta tag

**Impact:** IE, older Edge, and some bookmarking tools show no favicon. Android Chrome cannot color the address bar without the theme-color meta tag, despite the webmanifest declaring `theme_color`.

**Fix:**
1. Generate `favicon.ico` (16x16, 32x32, 48x48) from the existing `/public/favicon-32x32.png` and place it at `/public/favicon.ico`
2. Add `<meta name="theme-color" content="#0c0c0f" />` to the `<head>` section of `MarketingLayout.astro`, near the other meta tags (around line 61)

**Files:**
- `/Users/hmziq/os/claude-multi/src/web/layouts/MarketingLayout.astro`

---

## Quick Wins

These can be completed in under 30 minutes each with no architectural changes.

| # | Issue | Fix |
|---|-------|-----|
| 1 | Viewport meta missing `initial-scale=1` | In `MarketingLayout.astro` line 50, change to `content="width=device-width, initial-scale=1"` |
| 2 | robots.txt missing Content-Type header | In `robots.txt.ts`, add `headers: { 'Content-Type': 'text/plain; charset=utf-8' }` to the Response constructor |
| 3 | About page BreadcrumbList has only 1 item ("Home") | Verify the `/about/` page is using MarketingLayout and the `pathSegments` logic is splitting correctly |
| 4 | Blog index has no introductory body text | Add 2-3 sentences of intro text in blog index below the H1, targeting keywords like "multi-provider Claude Code setup" |
| 5 | H1 and H4 heading hierarchy skips H3 on homepage | Change the step headings (H4 "Launch the TUI", H4 "Run your new alias") to H3 for proper hierarchical nesting |
| 6 | Starlight edit link points to "main" branch but repo uses "master" | In `astro.config.mjs` line 60, change `edit/main/` to `edit/master/` |
| 7 | SoftwareApplication price is "0" instead of "0.00" | In `MarketingLayout.astro` line 113, change `price: '0'` to `price: '0.00'` |
| 8 | Non-standard `pinterest:media` meta tag | Delete the line -- Pinterest uses `og:image` natively |
| 9 | Blog post cards lack author attribution | Add "by hmziqrs" alongside the date on each blog post card for E-E-A-T signals |
| 10 | Footer lists only 4 providers but product supports 8+ | Update the footer description to say "8+ AI providers" or list all current providers |

---

## Page-by-Page Audit Results

### Homepage: `/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | claude-multi: Run Claude Code across providers (46 chars) |
| Meta Description | Run multiple Claude Code instances with different AI providers and isolated configurations (90 chars) |
| Canonical | `https://claude-multi.hmziq.xyz/` |
| H1 | One harness for every Claude you run. |
| Word Count | 741 |
| Internal Links | 15 |
| External Links | 4 |
| Structured Data | SoftwareApplication, WebSite (SearchAction), BreadcrumbList |
| Images Without Alt | 0 |
| AI Writing Score | 3/10 |

**Heading Structure:**

```
H1: One harness for every Claude you run.
  H2: One command. Any runtime.
  H2: For when one model isn't enough.
    H3: Many providers, one harness
    H3: Isolated configs
    H3: Plugin sync
    H3: Real Claude underneath
    H3: Local credentials
  H2: Ready for every model.
    H3: Anthropic
    H3: GLM Coding Plan
    H3: MiniMax
    H3: DeepSeek
    H3: Xiaomi MiMo
    H3: Moonshot Kimi
    H3: Alibaba Qwen
  H2: Two steps. No flags to remember.
    H4: Launch the TUI          <-- should be H3
    H4: Run your new alias      <-- should be H3
  H2: The TUI does everything.
  H2: Run every Claude. Conflict-free.
```

**Open Graph Tags:**

| Property | Value |
|----------|-------|
| og:title | claude-multi: Run Claude Code across providers |
| og:description | Run multiple Claude Code instances with different AI providers and isolated configurations |
| og:type | website |
| og:url | `https://claude-multi.hmziq.xyz/` |
| og:image | `https://claude-multi.hmziq.xyz/og-image.jpg` (1200x630, JPEG) |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| medium | Title tag is 46 chars -- brand name at start pushes keyword further right | Test keyword-first order: "Run Claude Code Across Providers \| claude-multi" |
| low | Meta description is 90 chars, under 150-160 recommended limit | Expand to include CTA: "Free & open source. One-command install." |
| medium | Viewport meta missing `initial-scale=1` | Update to `width=device-width, initial-scale=1` |
| medium | No in-page images -- zero image alt text issues but also no image search indexing | Add a TUI screenshot with descriptive alt text |
| low | H1 contains a line break which may render oddly in some search snippets | Use CSS for visual line breaks instead of actual newlines |
| medium | No favicon.ico detected | Generate from existing favicon-32x32.png |
| info | Cache-control is `max-age=0, must-revalidate` -- never cached | Set reasonable max-age (e.g., 3600) for static homepage |
| info | Footer lists only 4 providers but body shows 7+ | Update to "8+ AI providers" |
| info | Heading hierarchy skips H2 to H4 in quick-start section | Change H4 step headings to H3 |

---

### About Page: `/about/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | About claude-multi: open-source CLI for managing Claude Code instances (69 chars) |
| Meta Description | Why claude-multi exists, how isolated configs with shared plugins work, and which providers are supported. (97 chars) |
| Canonical | `https://claude-multi.hmziq.xyz/about/` |
| H1 | One CLI. Every model. |
| Word Count | 485 |
| Internal Links | 18 |
| External Links | 5 |
| Structured Data | SoftwareApplication, BreadcrumbList |
| AI Writing Score | 2/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| high | H1 does not contain "About" -- disconnects from nav link intent | Update to "About claude-multi: One CLI for every model" |
| medium | Title is 69 chars, may truncate. Near display limit. | Shorten to under 60 chars |
| medium | Meta description is 97 chars, under recommended 150-160 | Expand with a CTA and key differentiator |
| low | Word count is 485 -- on lower end for About page (target 600-1000+) | Add origin story, community highlights, roadmap |
| low | BreadcrumbList has only 1 item ("Home") instead of Home > About | Fix breadcrumb generation for /about/ path |
| medium | Viewport meta missing `initial-scale=1` | Update viewport meta tag |

---

### Blog Index: `/blog/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | claude-multi Blog - AI Assistant & Multi-Agent Workflows (56 chars) |
| Meta Description | Build notes from working on claude-multi, posts on running multiple Claude Code instances side by side, and the occasional rant about provider plumbing. (153 chars) |
| Canonical | `https://claude-multi.hmziq.xyz/blog/` |
| H1 | Writing about claude-multi. |
| Word Count | 620 |
| Internal Links | 22 |
| External Links | 10 |
| Structured Data | SoftwareApplication, BreadcrumbList |
| AI Writing Score | 2/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| critical | og:image is generic site-wide image, not blog-specific | Create a dedicated blog OG image with blog branding |
| warning | No introductory body text between H1 and post list | Add 2-3 sentences targeting "multi-provider Claude Code setup" keywords |
| warning | Tags displayed as plain text hashtags with no link functionality | Make tags clickable links leading to filtered views |
| warning | 13 blog posts on one page with no pagination | Implement pagination or "Load more" with rel=next/prev |
| info | RSS feed link is present -- good | No action needed |
| info | Missing Blog and BlogPosting schemas | Add Blog schema wrapping the page |

---

### FAQ Index: `/faq/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | FAQ - claude-multi \| Frequently Asked Questions |
| Meta Description | Common questions about claude-multi: installation, providers, plugin syncing, MCP servers, troubleshooting, and more. (117 chars) |
| Canonical | `https://claude-multi.hmziq.xyz/faq/` |
| H1 | Frequently asked questions. |
| Word Count | 623 |
| Internal Links | 46 |
| External Links | 9 |
| Structured Data | SoftwareApplication, BreadcrumbList |
| AI Writing Score | 1/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| medium | Missing FAQPage structured data (JSON-LD) | Add FAQPage schema with each Q&A entry as Question/Answer pairs |
| medium | Low word count (623) for FAQ hub with 13 articles | Add expanded intro content or brief answer text below each question |
| low | Meta description is 117 chars -- slightly short | Expand to ~150 chars with stronger CTA |
| low | Viewport meta missing `initial-scale=1` | Update viewport meta tag |
| info | FAQ entries use `## Related questions` + `## More info` identically on every entry | Vary heading styles to reduce mechanical feel |

---

### Changelog: `/changelog/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Changelog - claude-multi (25 chars) |
| Meta Description | Release history for claude-multi: every feature, fix, and change from v0.1 to today (86 chars) |
| Canonical | `https://claude-multi.hmziq.xyz/changelog/` |
| H1 | What's new. |
| Word Count | 3,653 |
| Internal Links | 27 |
| External Links | 6 |
| Structured Data | SoftwareApplication, BreadcrumbList |
| AI Writing Score | 2/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| high | Heading hierarchy broken -- past releases rendered as non-semantic elements | Use H2 for each version with fragment anchors |
| medium | H1 is vague ("What's new.") and does not include product name | Change to "claude-multi Changelog" or "Release History" |
| medium | Title is only 25 chars (recommended 50-60) | Expand: "Changelog - claude-multi \| Release History & Updates" |
| medium | Meta description is 86 chars (recommended 150-160) | Expand with CTA and version coverage |
| medium | og:image is generic site-wide image | Create changelog-specific social card |
| low | 59 `<strong>` tags -- high density may dilute semantic weight | Review bold usage; only apply to significant items |
| low | No images on the page | Consider adding screenshots for major releases |

---

### Privacy Policy: `/privacy/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Privacy Policy - claude-multi (29 chars) |
| Meta Description | How the claude-multi marketing site handles your data. Firebase Analytics, cookies, third-party services, and how to opt out. The CLI itself collects no data. (168 chars) |
| H1 | Privacy Policy. |
| Word Count | 680 |
| AI Writing Score | 1/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| medium | Title is 29 chars, below recommended 50-60 | Expand: "Privacy Policy - claude-multi Data & Cookie Practices" |
| low | Meta description is 168 chars, slightly above 150-160 | Trim to fit display limit |
| low | H1 has trailing period | Remove for cleaner screen reader output |
| low | Viewport meta missing `initial-scale=1` | Update viewport meta tag |

---

### Terms of Use: `/terms/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Terms of Use - claude-multi (27 chars) |
| Meta Description | Terms of use for the claude-multi open-source CLI and website. MIT license, no warranty, third-party provider responsibility, and trademark notice. (147 chars) |
| H1 | Terms of Use. |
| Word Count | 565 |
| AI Writing Score | 1/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| medium | Title is 27 chars, well below 50-60 recommended | Expand: "Terms of Use for claude-multi CLI and Website" |
| medium | BreadcrumbList name is "Terms" but page title uses "Terms of Use" | Update breadcrumb name to match |
| low | Meta description is 147 chars -- just under ideal 150-160 | Extend by 3-13 chars |
| low | Viewport meta missing `initial-scale=1` | Update viewport meta tag |

---

### Docs Landing Page: `/docs/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Documentation \| claude-multi (28 chars) |
| Meta Description | Manage multiple Claude Code instances with different AI providers and configurations (84 chars) |
| H1 | claude-multi |
| Word Count | **41** |
| Internal Links | 2 |
| Structured Data | **None** |
| AI Writing Score | 1/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| critical | Only 41 words of visible content -- zero body text | Add 300+ words: intro, features, card grid linking to doc sections |
| critical | No og:image -- social shares show no preview image | Add branded og:image for docs |
| critical | Twitter Card missing image, title, and description | Add twitter:image, twitter:title, twitter:description |
| high | Title is 28 chars, generic "Documentation" wastes SEO real estate | Rewrite: "claude-multi - Run Multiple Claude Code Instances \| Docs" |
| high | H1 is just "claude-multi" -- same as site title | Change to descriptive heading like "Run Multiple Claude Code Instances" |
| high | No structured data at all | Add SoftwareApplication, TechArticle, or HowTo schema |
| medium | Meta description is 84 chars (recommended 150-160) | Expand with features and CTA |
| medium | Only 2 internal links -- too sparse for topic authority | Add card grid linking to major doc sections |

---

### Getting Started: `/docs/getting-started/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Getting Started \| claude-multi (27 chars) |
| Meta Description | Install and configure claude-multi (33 chars) |
| H1 | Getting Started |
| Word Count | 285 |
| Structured Data | **None** |
| AI Writing Score | 2/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| medium | Meta description is only 33 chars | Expand to 120-160 chars |
| medium | No og:image -- social shares show no preview | Add og:image and twitter:image |
| medium | No structured data | Add HowTo schema for installation steps |
| low | Title is 27 chars -- could be more descriptive | Expand: "Getting Started with claude-multi \| Install & Setup Guide" |
| low | Word count is 285 -- thin for a getting started guide | Add explanatory text between steps |

---

### Usage: `/docs/usage/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Usage \| claude-multi (20 chars) |
| Meta Description | Full CLI command reference (26 chars) |
| H1 | Usage |
| Word Count | 811 |
| Structured Data | **None** |
| AI Writing Score | 1/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| high | No og:image or twitter:image | Add branded social sharing image |
| high | No structured data | Add TechArticle or HowTo schema |
| medium | Title is 20 chars, no descriptive keywords | Expand: "Usage Guide - CLI Commands for claude-multi" |
| medium | Meta description is 26 chars | Expand to 120-160 chars with keywords |
| medium | og:title is just "Usage" without site name suffix | Set to "Usage \| claude-multi" |

---

### Providers: `/docs/providers/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Providers \| claude-multi |
| Meta Description | AI provider templates and configuration (37 chars) |
| H1 | Providers |
| Word Count | 290 |
| Structured Data | **None** |
| AI Writing Score | 2/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| high | Meta description is only 37 chars | Expand to 140-160 chars with provider names |
| medium | No og:image | Add og:image and twitter:image |
| medium | Title is generic "Providers" -- no search-intent keywords | Rewrite: "AI Provider Templates & API Endpoints \| claude-multi Docs" |
| medium | Word count is 290 -- thin for organic search | Add intro paragraph and per-provider guidance |
| high | Cache-Control `max-age=0, must-revalidate` -- never cached | Set longer max-age for infrequently updated docs |

---

### How It Works: `/docs/how-it-works/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | How It Works \| claude-multi (26 chars) |
| Meta Description | Architecture and design overview (32 chars) |
| H1 | How It Works |
| Word Count | 581 |
| Structured Data | **None** |
| AI Writing Score | 2/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| high | H2 "On this page" appears before H1 in DOM | Ensure H1 is the first heading in document |
| high | Meta description is 32 chars | Expand to 150-160 chars |
| high | No og:image or twitter:image | Add social sharing image |
| medium | No structured data | Add HowTo or Article schema |
| medium | Title is 26 chars | Expand with keywords: "How claude-multi Works: Architecture & Instance Isolation" |

---

### Configuration: `/docs/configuration/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Configuration \| claude-multi (28 chars) |
| Meta Description | Configuration file schema reference (37 chars) |
| H1 | Configuration |
| Word Count | 581 |
| Internal Links | 47 |
| Structured Data | **None** |
| AI Writing Score | 1/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| high | Missing og:image | Add og:image and twitter:image |
| high | No structured data | Add TechArticle schema |
| medium | Meta description is 37 chars | Expand to 120-155 chars |
| medium | Missing twitter:title, twitter:description, twitter:image | Add Twitter Card meta tags |
| medium | Horizontal scroll on mobile (375px viewport) | Fix overflow on code blocks and tables |
| medium | 59/61 tap targets smaller than 48x48px on mobile | Increase tap target sizes in sidebar |

---

### Troubleshooting: `/docs/troubleshooting/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Troubleshooting \| claude-multi (30 chars) |
| Meta Description | Common issues and how to fix them (31 chars) |
| H1 | Troubleshooting |
| Word Count | 785 |
| Internal Links | 50 |
| Structured Data | **None** |
| AI Writing Score | 2/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| medium | Meta description is 31 chars | Expand to 120-160 chars with specific error keywords |
| medium | Twitter Card tags are incomplete | Add twitter:title, twitter:description, twitter:image |
| medium | No og:image | Add social sharing image |
| medium | No structured data -- could use FAQPage schema | Add FAQPage or HowTo JSON-LD for each troubleshooting section |
| low | Title is 30 chars | Expand: "Troubleshooting claude-multi Issues \| Fixes & Solutions" |

---

### Contributing: `/docs/contributing/`

| Metric | Value |
|--------|-------|
| HTTP Status | 200 |
| Title Tag | Contributing \| claude-multi (25 chars) |
| Meta Description | Development setup and contribution guide (39 chars) |
| H1 | Contributing |
| Word Count | 615 |
| Internal Links | 51 |
| Structured Data | **None** |
| AI Writing Score | 2/10 |

**Issues Found:**

| Severity | Issue | Suggestion |
|----------|-------|------------|
| high | H2 "On this page" appears before H1 in DOM | Reorder DOM so H1 comes first |
| high | og:image is empty | Add relevant og:image meta tag |
| high | twitter:title and twitter:description are empty | Populate Twitter Card tags |
| medium | Meta description is 39 chars | Expand to 120-155 chars |
| medium | Title is 25 chars | Expand to 50-60 chars |
| low | Edit page link points to "main" branch but repo uses "master" | Fix Starlight edit URL config |

---

## Content Quality & AI Writing Assessment

### Overall Content Quality

The writing quality across the entire site is a genuine competitive advantage. AI writing scores average **1.3/10** across all audited pages, which is exceptionally low (good). The direct developer voice -- short sentences, second-person imperative, no filler -- reads as authentic and builds trust with the target audience.

### AI Writing Scores by Page

| Page | AI Score | Notes |
|------|----------|-------|
| Homepage (`index.astro`) | 0/10 | Clean technical landing page copy |
| About (`about.astro`) | 1/10 | Two minor rule-of-three patterns, both natural |
| FAQ Index (`faq/index.astro`) | 1.5/10 | Structural monotony across entries, bold-colon lists |
| Blog Index (`blog/index.astro`) | 1/10 | Listing page, minimal prose to evaluate |
| Changelog (`changelog.astro`) | 2/10 | Data-driven template, almost zero authored prose |
| Docs Index (`index.md`) | 0/10 | Zero body content to evaluate |
| Getting Started | 1/10 | Bold overuse on wizard step labels |
| Usage | 0/10 | Clean reference documentation |
| Providers | 0.5/10 | Table-driven, minimal prose |
| How It Works | 1/10 | Clean, technical, direct |
| Configuration | 1/10 | Reference material, minimal prose |
| Troubleshooting | 0/10 | Action-oriented, zero filler |
| Contributing | 1/10 | Standard developer docs |
| Plugins & MCP | 1/10 | Clean technical reference |
| Environment Variables | 1/10 | Table-heavy reference |
| Blog: Claude Code co-engineer | 1/10 | Among the cleanest prose audited |
| Blog: MCP workflow | 1/10 | Title case headings only issue |
| Blog: Five new providers | 3/10 | Rule-of-three overuse, bold-label repetition |
| Blog: Inside every menu | 1.5/10 | 7 emoji in prose bold labels, bold-colon density |
| Blog: MiniMax M3 | 2/10 | 7 rule-of-three instances, bold-label repetition |
| Blog: New LLM frontier | 2/10 | Mechanical section uniformity, rule-of-three |
| Blog: Cost optimization | 2/10 | Bold-period list pattern, "meaningfully" hedging |
| Blog: v0.6.3 release | 0/10 | Release notes, reads as human developer writing |
| Blog: v0.6.4 release | 2/10 | Three title-case headings only issue |
| Blog: v0.6.5 release | 2/10 | Virtually no AI patterns |
| Blog: v0.7.0 release | 1/10 | Strong first-person voice |

### Key Findings

**Strengths to preserve:**
- Short, declarative sentence structure
- Second-person imperative voice
- First-person narrative in blog posts
- No em dash overuse (most pages have 0)
- No AI vocabulary words ("delve", "landscape", "tapestry", "vibrant", "showcase" all absent)
- No promotional language or significance inflation
- Technical specificity with real file paths, commands, and model names

**Patterns to watch:**
- Rule-of-three appears in some blog posts (up to 7 instances in one post)
- Bold-colon inline header lists are overused in some FAQ and blog entries
- Title case headings appear in some blog posts (should use sentence case)
- Structural monotony across all 16 FAQ entries (identical section layout)

---

## Technical SEO Findings

### robots.txt Implementation (Score: 55/100)

| Severity | Issue | Fix |
|----------|-------|-----|
| medium | Missing Content-Type header in Response | Add `headers: { 'Content-Type': 'text/plain; charset=utf-8' }` |
| medium | No Disallow rules for non-SEO paths | Add Disallow for /audio/, /api/, etc. |
| info | No AI bot exclusion rules (GPTBot, CCBot, etc.) | Add if content should not be used for AI training |
| info | Allow: / is redundant (default behavior) | Can remove for simplicity |
| info | Sitemap references sitemap-index.xml correctly | No action needed |
| info | 4-hour cache is appropriate for rarely-changing file | No action needed |

### Sitemap Configuration (Score: 82/100)

| Severity | Issue | Fix |
|----------|-------|-----|
| low | @astrojs/sitemap not explicitly imported or registered | Add `import sitemap from '@astrojs/sitemap'` and add to integrations array |
| medium | Sitemap entries lack `<lastmod>` dates | Verify sitemap integration picks up frontmatter dates |
| info | Single sitemap-0.xml with 48 URLs is valid | No action needed |
| info | Package.json does not list @astrojs/sitemap as direct dependency | Add to devDependencies |

### JSON-LD Structured Data (Score: 82/100)

| Severity | Issue | Fix |
|----------|-------|-----|
| warning | WebSite SearchAction uses outdated URL template format | Update to EntryPoint pattern |
| warning | BlogPosting missing `dateModified` property | Add dateModified (use datePublished as fallback) |
| warning | BlogPosting missing `image` property | Add image URL for rich result eligibility |
| warning | FAQPage schema uses short description as answer text | Use full rendered content instead |
| info | SoftwareApplication on every page may be misleading | Consider limiting to homepage and docs only |
| info | BreadcrumbList on homepage has single item | Skip rendering on homepage |
| info | SoftwareApplication price "0" should be "0.00" | Update price string |

### Open Graph & Twitter Cards (Score: 82/100)

| Severity | Issue | Fix |
|----------|-------|-----|
| medium | No page passes a custom ogImage -- all use default | Generate per-page OG images |
| low | og:image:type hardcoded to image/jpeg regardless of file | Derive MIME type dynamically or enforce JPEG only |
| low | twitter:image:alt uses page title, not image description | Add optional ogImageAlt prop |
| info | pinterest:media meta tag is non-standard and dead weight | Remove -- Pinterest uses og:image natively |
| info | twitter:site and twitter:creator hardcoded to @hmziqrs | Consider making twitter:creator a prop for guest authors |

### Performance (Score: 52/100)

| Severity | Issue | Impact | Fix |
|----------|-------|--------|-----|
| high | Three.js 715 KB loads on every page | Massive LCP/FCP degradation | Guard import behind `[data-three]` DOM check |
| high | Firebase Analytics ~150 KB loads synchronously in `<head>` | Blocks parser before FCP | Defer with `requestIdleCallback` or move to end of body |
| high | Google Fonts CSS is render-blocking | 2 extra round trips before text renders | Self-host WOFF2 files with preload hints |
| medium | No font preloading configured | Late font discovery, delayed FMP | Add `<link rel="preload" as="font">` hints |
| medium | No Cache-Control headers configured | Static assets never cached long-term | Add `public/_headers` file for Cloudflare Pages |
| medium | No service worker for offline/PWA | No repeat-visit caching | Add Workbox-based service worker |
| medium | No image optimization pipeline | og-image.jpg is 149 KB baseline JPEG | Convert to WebP, use Astro `<Image>` component |
| medium | 55 KB global CSS inlined into every HTML | Non-cacheable, adds 55 KB to every response | Use Astro CSS import for extraction and hashing |

### URL Structure & Internal Linking (Score: 82/100)

| Severity | Issue | Fix |
|----------|-------|-----|
| high | Four docs pages are orphans (no cross-links from marketing site) | Add cross-links from FAQ, About, and footer |
| medium | Nav includes "Providers" as separate top-level item alongside "Docs" | Keep as shortcut but consider labeling clarification |
| low | Docs pages use Starlight layout, visually disconnected from marketing site | Add shared header component to Starlight layout |
| info | All internal links consistently use trailing slashes | Correctly implemented, no action needed |
| info | All pages reachable within 2 clicks from homepage | Excellent click depth, no action needed |

### RSS Feed & llms.txt (Score: 82/100)

| Severity | Issue | Fix |
|----------|-------|-----|
| medium | RSS items lack `<content:encoded>` | Import rendered HTML and add to each item |
| medium | No `<lastBuildDate>` in RSS channel | Add via `customData` option |
| low | RSS items lack `<author>` field | Add author string to blog collection schema |
| low | No `llms-full.txt` companion file | Create with full documentation content |
| low | `llms.txt` is static and will drift from codebase | Convert to dynamic endpoint |
| info | Blog posts have audio URLs but RSS lacks enclosures | Add `enclosure` property for posts with audio |

### Web Manifest & Favicon (Score: 72/100)

| Severity | Issue | Fix |
|----------|-------|-----|
| medium | Missing favicon.ico file | Generate multi-size ICO from existing PNG |
| medium | Missing `<meta name="theme-color">` in HTML head | Add `<meta name="theme-color" content="#0c0c0f" />` |
| low | Missing maskable icon in webmanifest | Add 512x512 maskable PNG with safe zone padding |
| low | Webmanifest lacks description and categories | Add for improved PWA install experience |

---

## Competitive Analysis

### Direct Competitors

| Competitor | Strengths | Weaknesses | Keyword Overlap |
|------------|-----------|------------|-----------------|
| **Claude Squad** (smtg-ai) | Most direct competitor; git worktree isolation; background tasks; Go binary with Homebrew | Requires tmux; no multi-provider config; no plugin/MCP sync; no TUI for creation | "claude squad", "manage multiple claude code instances", "claude squad alternative" |
| **Claude Code Agent Teams** (Anthropic) | Official Anthropic feature; automated orchestration; shared task list | Experimental only; Anthropic-only; very high token use; max 3-5 teammates | "claude code agent teams", "multiple claude agents collaborate" |
| **Aider** | 44K+ GitHub stars; multi-model support; voice-to-code; 100+ languages | Single session only; no provider isolation; requires Python | "aider ai coding", "aider vs claude code" |
| **Cursor** | Massive brand; full IDE; multi-model; SOC 2 certified | Closed source, paid; full IDE replacement; no multi-instance config | "cursor vs claude code", "cursor AI coding" |
| **claude-code-router** (musistudio) | Focused provider switching; lightweight | Small project; no TUI; no plugin management | "claude code router", "claude code multi provider" |
| **cc-compatible-models** (Alorse) | Comprehensive provider guide | Documentation only, not a tool; manual env var editing | "claude code compatible models" |
| **GitButler** | Automatic branch management; lifecycle hooks; by Scott Chacon | Requires GitButler client; not multi-provider focused | "parallel claude code sessions" |

### Keyword Gap Analysis

**High-priority keywords claude-multi should target but currently does not:**

| Keyword | Intent | Est. Volume | Difficulty | Priority |
|---------|--------|-------------|------------|----------|
| claude code vs cursor | Commercial | 10K-25K/mo | Medium-High | P0 |
| claude code vs copilot | Commercial | 8K-20K/mo | Medium-High | P0 |
| claude code pricing | Commercial | 10K-20K/mo | Medium | P0 |
| what is claude code | Informational | 10K-20K/mo | Medium-High | P0 |
| claude code vs windsurf | Commercial | 5K-15K/mo | Medium | P0 |
| claude code alternative | Commercial | 5K-12K/mo | Medium | P1 |
| claude code MCP server setup | Transactional | 3K-8K/mo | Low-Medium | P1 |
| claude code tutorial | Informational | 5K-10K/mo | Medium | P1 |
| claude code windows setup | Transactional | 3K-6K/mo | Low-Medium | P1 |
| best AI coding tools 2026 | Commercial | 8K-15K/mo | High | P1 |
| claude code custom API provider | Transactional | 2K-5K/mo | Low | P1 |
| claude code troubleshooting | Informational | 3K-6K/mo | Low | P2 |
| claude code multiple providers | Transactional | 500-2K/mo | Low | P3 |

### Content Opportunities

1. **Comparison page:** claude-multi vs claude-squad vs agent teams -- high search volume for "claude squad alternative"
2. **Step-by-step guide:** How to run Claude Code with DeepSeek/GLM/MiniMax/Kimi/Qwen/MiMo providers
3. **Tutorial:** Switch between AI providers in Claude Code without editing config files
4. **Guide:** Isolated Claude Code configs for personal vs work projects
5. **Provider-specific landing pages:** claude-multi for DeepSeek users, GLM users, MiniMax users (each provider has its own search audience)

### Recommended New Pages

| URL | Title | Target Keyword | Priority |
|-----|-------|----------------|----------|
| `/compare/claude-squad` | claude-multi vs Claude Squad: Which Multi-Instance Tool? | claude squad alternative | High |
| `/guides/multi-provider-setup` | How to Run Claude Code with Multiple AI Providers | run claude code with deepseek GLM minimax | High |
| `/guides/switch-providers` | Switch Between AI Providers Without Editing Config | claude code provider switch tool | High |
| `/compare/agent-teams` | claude-multi vs Agent Teams: Multi-Instance vs Multi-Agent | claude code agent teams vs multiple instances | Medium |
| `/providers/deepseek` | Run Claude Code with DeepSeek V4-Pro: Setup Guide | claude code deepseek setup | Medium |
| `/providers/glm` | Run Claude Code with GLM-5.1 via Z.ai: Setup Guide | claude code GLM setup | Medium |
| `/providers/minimax` | Run Claude Code with MiniMax M3: Free Setup Guide | claude code minimax setup free | Medium |
| `/guides/personal-work-isolation` | Separate Claude Code Configs for Personal and Work | multiple claude code accounts | Medium |

---

## Programmatic SEO Strategy

### Overview

Programmatic SEO strategy for claude-multi built on a hub-spoke architecture. Seven page types generated from structured data (provider templates, comparison matrices, glossary definitions, use-case specs, persona configs, integration manifests, and alternative tool profiles). Each page type has its own Astro content collection schema and a defined role in the internal link graph.

The primary data source is `ProviderTemplate` from `src/templates.ts`. The strategy is grounded in the existing plan at `docs/seo-pages-plan.md` and extends it with four new page types (personas, directory, glossary, integrations).

### Page Types

#### 1. Provider Pages (`/providers/<slug>/`)

**Priority:** Critical | **Estimated Pages:** 10

Auto-generated from templates.ts data. Each page targets the provider name + "Claude Code" queries.

**Template outline:**
- H1: "Use [Provider] with Claude Code"
- One-line install command: `claude-multi add <slug> --api-key`
- Stat row: model count, context window, base URL, plan type, max output tokens
- Setup card with copy-paste command
- Model matrix table auto-generated from template env vars
- Pricing/limits section with outbound link to provider pricing page
- "vs Anthropic" comparison strip (3-5 bullets, neutral tone)
- Troubleshooting accordion with top known issues
- FAQ block for rich snippet eligibility

**Example pages:**

| URL | Title | H1 |
|-----|-------|----|
| `/providers/deepseek/` | Use DeepSeek with Claude Code via claude-multi | Run Claude Code with DeepSeek-V4-Pro |
| `/providers/minimax/` | Use MiniMax M3 with Claude Code via claude-multi | Run Claude Code with MiniMax-M3 |
| `/providers/glm/` | Use GLM-5.1 with Claude Code via claude-multi | Run Claude Code with GLM Coding Plan |
| `/providers/qwen/` | Use Alibaba Qwen3-Coder with Claude Code via claude-multi | Run Claude Code with Qwen3-Coder-Next |
| `/providers/kimi/` | Use Moonshot Kimi K2.6 with Claude Code via claude-multi | Run Claude Code with Kimi K2.6 |

#### 2. Comparison Pages (`/compare/<slug-a>-vs-<slug-b>/`)

**Priority:** Critical | **Estimated Pages:** 15

Auto-generated from two ProviderTemplate records with manually written unique angle text.

**Template outline:**
- Side-by-side provider names + tagline "Both. One CLI."
- Quick verdict box (price/speed/quality winner)
- Spec table auto-generated from template data
- Per-dimension breakdown (pricing, context/output, benchmarks, latency, regions)
- "When to choose [A]" and "When to choose [B]" cards
- "Or use both" footer card as conversion hook

#### 3. Persona Pages (`/for/<slug>/`)

**Priority:** High | **Estimated Pages:** 5

Hand-written content targeting specific audience segments.

**Example pages:**
- `/for/indie-developers/` -- "Stop Paying Opus Prices for Side Projects"
- `/for/teams/` -- "Give Your Team a Model for Every Task"
- `/for/researchers/` -- "Benchmark Coding Models in Parallel"
- `/for/freelancers/` -- "Know What Your AI Coding Bill Will Be"

#### 4. Alternative Pages (`/alternatives/<slug>/`)

**Priority:** High | **Estimated Pages:** 6

Honest comparison with competing tools.

**Example pages:**
- `/alternatives/cursor/` -- "Considering Switching from Cursor?"
- `/alternatives/aider/` -- "Considering Switching from Aider?"
- `/alternatives/openrouter/` -- "Considering Switching from OpenRouter?"
- `/alternatives/continue/` -- "Considering Switching from Continue?"

#### 5. Glossary Pages (`/glossary/<slug>/`)

**Priority:** High | **Estimated Pages:** 15

Short-form definitions targeting featured snippets.

**Example pages:**
- `/glossary/mcp-server/` -- "What is an MCP Server?"
- `/glossary/provider-template/` -- "What is a Provider Template?"
- `/glossary/llm-routing/` -- "What is LLM Routing?"
- `/glossary/context-window/` -- "What is a Context Window in LLMs?"
- `/glossary/auto-compaction/` -- "What is Auto-Compaction in Claude Code?"

#### 6. Use Case Pages (`/use-cases/<slug>/`)

**Priority:** High | **Estimated Pages:** 8

Problem-solution narratives with concrete code blocks.

**Example pages:**
- `/use-cases/cost-optimization/` -- "Stop Paying Flagship Prices for Simple Tasks"
- `/use-cases/multi-model-code-review/` -- "Run Code Reviews Across Multiple AI Models"
- `/use-cases/byo-api-key/` -- "Use Your Own API Keys, Control Your Own Bill"
- `/use-cases/isolated-experiments/` -- "Spin Up Disposable Instances, Test Without Risk"

#### 7. Integration Pages (`/integrations/<slug>/`)

**Priority:** Medium | **Estimated Pages:** 10

MCP server and plugin integration guides.

**Example pages:**
- `/integrations/context7/` -- "Use Context7 Documentation Lookup in Claude Code"
- `/integrations/playwright/` -- "Browser Automation in Claude Code with Playwright"
- `/integrations/github/` -- "Manage GitHub Repos Directly from Claude Code"

### Internal Linking Plan

Hub-spoke model with three hub tiers:

**Tier 1 Hubs** (accumulate authority, link outward):
- `/providers/` index links to all `/providers/<slug>/` pages and top 4 comparison pages
- `/use-cases/` index links to all `/use-cases/<slug>/` pages
- `/glossary/` index links to all `/glossary/<slug>/` pages

**Tier 2 Hubs** (distribute authority, link both directions):
- `/compare/` pages link to both provider pages they compare, plus relevant use-case and glossary pages
- `/for/` pages link to 3-5 provider pages and 2-3 use-case pages
- `/alternatives/` pages link to relevant provider pages and getting-started guide

**Cross-linking Rules:**
1. Every page links to at least 2 other SEO pages (not just docs)
2. Every page links to `/docs/getting-started/` as the conversion endpoint
3. Comparison pages always link to both provider pages they compare
4. Provider pages link to all comparison pages that feature them
5. Glossary pages cross-link to related glossary terms (3-5 links each)
6. Use-case pages link to the provider pages for providers they use
7. Footer nav updated to include `/providers/` and `/glossary/` links
8. BreadcrumbList structured data on every nested page
9. Related pages section at the bottom of every SEO page (3-5 links)

---

## Prioritized Action Plan

### Phase 1 -- Critical Performance Fixes (Week 1)

1. Guard Three.js import behind `[data-three]` DOM check in `MarketingLayout.astro` to eliminate 715 KB download on pages without 3D elements
2. Defer Firebase Analytics to post-load using `requestIdleCallback` or move to end of body
3. Fix viewport meta to include `initial-scale=1`
4. Convert inline global CSS to Astro CSS import for cacheability

**Expected impact:** These four changes alone should improve LCP by 1-3 seconds.

### Phase 2 -- Structured Data & Social (Week 2)

1. Add FAQPage JSON-LD to the FAQ index and all 16 individual FAQ pages
2. Add BreadcrumbList and HowTo/TechArticle schema to all docs pages via Starlight head injection
3. Add BlogPosting schema with image and dateModified to blog post template
4. Fix the WebSite SearchAction to use EntryPoint pattern
5. Create per-blog-post OG images using satori or @vercel/og
6. Convert og-image.jpg to WebP
7. Add theme-color meta tag and generate favicon.ico

### Phase 3 -- Content Depth (Week 3)

1. Expand `/docs/index.md` from 41 words to 300+ words with intro paragraph, feature highlights, and doc section links
2. Expand all short meta descriptions:
   - `docs/getting-started`: 33 chars to 150-160
   - `docs/usage`: 26 chars to 150-160
   - `docs/providers`: 37 chars to 150-160
   - `docs/configuration`: 37 chars to 150-160
   - `docs/how-it-works`: 32 chars to 150-160
   - `docs/troubleshooting`: 31 chars to 150-160
3. Fix changelog page heading hierarchy so each version is an H2
4. Add intro text to blog index
5. Fix About page H1 to include "About" context

### Phase 4 -- Self-Host Fonts & Caching (Week 4)

1. Self-host Inter and JetBrains Mono WOFF2 files, replace Google Fonts link with local `@font-face` + preload hints
2. Add Cache-Control headers via `public/_headers` file for Cloudflare Pages: immutable for `_astro/*` assets, 3600 for HTML
3. Move Firebase config to `import.meta.env.PUBLIC_FIREBASE_CONFIG`
4. Fix RSS feed: add `content:encoded`, `lastBuildDate`, `author`, Atom namespace, and audio enclosures

### Phase 5 -- Programmatic SEO Buildout (Weeks 5-8)

1. Auto-generate 8 provider landing pages from templates.ts data at `/providers/<name>/`
2. Auto-generate 12 model landing pages at `/models/<model-name>/`
3. Create `/compare/models/` interactive comparison tool
4. Build 3 competitor comparison pages (vs claude-squad, vs agent-teams, vs worktrees)
5. Create 3 multi-provider guide pages
6. Build 5 tutorial/how-to pages for ecosystem topics
7. Add internal cross-links from marketing pages to orphaned docs pages (troubleshooting, contributing, changelog)

### Phase 6 -- Distribution & Authority (Ongoing)

1. Submit claude-multi to GitHub awesome-claude-code lists and curated collections
2. Engage on Reddit r/ClaudeAI and r/ClaudeCode threads about multi-instance management
3. Reach out to YouTube tutorial creators for claude-multi demos
4. Comment on Medium blog posts about multi-provider setup with claude-multi as the automated solution
5. Publish 2 blog posts per release focusing on comparison content and migration guides
