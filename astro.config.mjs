import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { getSiteFooterHtml } from './web/util/site-footer-html';
import { latestVersion } from './web/util/changelog';
import { getCommitDateForPaths, getLatestCommitDate } from './web/util/lastmod';
import {
  DEFAULT_DESC,
  DEFAULT_OG_IMAGE_ALT as OG_IMAGE_ALT,
  SITE_URL,
} from './web/util/seo';
import { readdir, readFile, writeFile } from 'fs/promises';

const FOOTER_HTML = getSiteFooterHtml(latestVersion);

const LAST_RESORT_LASTMOD = '2026-11-03';
const LATEST_REPO_LASTMOD = getLatestCommitDate() ?? LAST_RESORT_LASTMOD;

function readFrontmatterDate(raw, field) {
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const value = frontmatter.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))?.[1];
  if (!value) return null;
  const parsed = new Date(value.trim().replace(/^["']|["']$/g, ''));
  return Number.isNaN(parsed.valueOf()) ? null : parsed.toISOString();
}

function buildLastmodMap(dir, prefix, getDate) {
  const map = new Map();
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const raw = readFileSync(join(dir, file), 'utf-8');
    const date = getDate(raw);
    if (date) map.set(`${prefix}/${basename(file, '.md')}/`, date);
  }
  return map;
}

const STATIC_PATHS = {
  '/': [
    'web/pages/index.astro',
    'web/components/Hero.astro',
    'web/components/Features.astro',
    'web/components/Providers.astro',
    'web/components/Install.astro',
  ],
  '/about/': ['web/pages/about.astro'],
  '/blog/': ['web/pages/blog/index.astro'],
  '/changelog/': ['CHANGELOG.md', 'web/pages/changelog.astro'],
  '/faq/': ['web/content/faq', 'web/pages/faq/index.astro'],
  '/providers/': ['web/content/providers', 'web/pages/providers/index.astro'],
  '/docs/': ['web/content/docs/docs/index.md'],
  '/docs/configuration/': ['web/content/docs/docs/configuration.md'],
  '/docs/environment-variables/': ['web/content/docs/docs/environment-variables.md'],
  '/docs/getting-started/': ['web/content/docs/docs/getting-started.md'],
  '/docs/how-it-works/': ['web/content/docs/docs/how-it-works.md'],
  '/docs/plugins-mcp/': ['web/content/docs/docs/plugins-mcp.md'],
  '/docs/troubleshooting/': ['web/content/docs/docs/troubleshooting.md'],
  '/docs/usage/': ['web/content/docs/docs/usage.md'],
};

const STATIC_LASTMOD = new Map(
  Object.entries(STATIC_PATHS).map(([pathname, paths]) => [
    pathname,
    getCommitDateForPaths(paths) ?? LATEST_REPO_LASTMOD,
  ])
);

const LASTMOD_BY_PATH = new Map([
  ...buildLastmodMap(
    './web/content/blog',
    '/blog',
    (raw) => readFrontmatterDate(raw, 'updated') ?? readFrontmatterDate(raw, 'date')
  ),
  ...buildLastmodMap(
    './web/content/providers',
    '/providers',
    (raw) => readFrontmatterDate(raw, 'updated') ?? LATEST_REPO_LASTMOD
  ),
]);

function injectSiteFooterIntegration() {
  return {
    name: 'inject-site-footer',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const distDir = dirname(dir.pathname || dir);
        await injectFooterInDir(distDir);
      },
    },
  };
}

async function injectFooterInDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await injectFooterInDir(fullPath);
    } else if (entry.name.endsWith('.html')) {
      const html = await readFile(fullPath, 'utf-8');
      if (!html.includes('class="page') || html.includes('class="site-footer')) continue;
      const injected = html.replace('</body>', `${FOOTER_HTML}\n</body>`);
      await writeFile(fullPath, injected);
    }
  }
}

function serveLocalAudio() {
  return {
    name: 'serve-local-audio',
    configureServer(server) {
      server.middlewares.use('/audio', (req, res, next) => {
        const filePath = join(process.cwd(), 'audio', req.url.replace(/^\//, ''));
        try {
          const data = readFileSync(filePath);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.end(data);
        } catch {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  site: 'https://claude-multi.hmziq.xyz',
  srcDir: './web',
  vite: {
    plugins: [tailwindcss(), serveLocalAudio()],
  },
  integrations: [
    injectSiteFooterIntegration(),
    icon({
      iconDir: './web/icons',
      include: {
        'simple-icons': ['x', 'github', 'linkedin', 'telegram', 'reddit'],
        lucide: ['globe'],
      },
    }),
    sitemap({
      filter: (page) => !page.endsWith('/privacy/') && !page.endsWith('/terms/') && !page.endsWith('/feed.xml'),
      serialize(item) {
        const pathname = new URL(item.url).pathname.replace(/\/?$/, '/');
        item.lastmod =
          LASTMOD_BY_PATH.get(pathname) ??
          STATIC_LASTMOD.get(pathname) ??
          LATEST_REPO_LASTMOD;
        return item;
      },
    }),
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
        baseUrl: 'https://github.com/hmziqrs/claude-multi/edit/master/',
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
            { label: 'Providers', link: '/providers/' },
            { slug: 'docs/how-it-works' },
            { slug: 'docs/plugins-mcp' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { slug: 'docs/configuration' },
            { slug: 'docs/environment-variables' },
            { slug: 'docs/troubleshooting' },
          ],
        },
        {
          label: 'Development',
          collapsed: true,
          items: [
            {
              label: 'Contributing',
              link: 'https://github.com/hmziqrs/claude-multi/blob/master/CONTRIBUTING.md',
              attrs: { target: '_blank', rel: 'noopener' },
            },
          ],
        },
      ],
      components: {
        Default: './web/layouts/StarlightLayout.astro',
        Header: './web/components/StarlightHeader.astro',
        Footer: './web/components/StarlightFooter.astro',
      },
      customCss: ['/web/styles/starlight.css'],
      lastUpdated: true,
      favicon: '/favicon.svg',
      disable404Route: true,
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#0c0c0f' },
        },
        {
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/fonts/InterVariable.woff2' },
        },
        {
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: '/fonts/JetBrainsMonoVariable.woff2' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:site_name', content: 'claude-multi' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: 'https://claude-multi.hmziq.xyz/og-image.jpg' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:width', content: '1200' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:height', content: '630' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:type', content: 'image/jpeg' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:alt', content: OG_IMAGE_ALT },
        },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'claude-multi',
            url: SITE_URL,
            description: DEFAULT_DESC,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'macOS, Linux, Windows',
            offers: { '@type': 'Offer', price: '0.00', priceCurrency: 'USD' },
            author: { '@type': 'Person', name: 'hmziqrs', url: 'https://hmziq.rs' },
            license: 'https://opensource.org/licenses/MIT',
            codeRepository: 'https://github.com/hmziqrs/claude-multi',
            programmingLanguage: 'TypeScript',
            installUrl: 'https://www.npmjs.com/package/claude-multi',
          }),
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:site', content: '@hmziqrs' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:creator', content: '@hmziqrs' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: 'https://claude-multi.hmziq.xyz/og-image.jpg' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image:alt', content: OG_IMAGE_ALT },
        },
        {
          tag: 'script',
          content: `requestIdleCallback(()=>{import('https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js').then(({initializeApp})=>{const c={apiKey:'AIzaSyDAdEgdNAke2wl0q4mBixEDMgQ21J7J71w',authDomain:'claude-multi.firebaseapp.com',projectId:'claude-multi',storageBucket:'claude-multi.firebasestorage.app',messagingSenderId:'961698441477',appId:'1:961698441477:web:2b9cfbd3d9a88149ee6f6c',measurementId:'G-0VRZJQKZT8'};const a=initializeApp(c);import('https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js').then(({getAnalytics})=>{getAnalytics(a)})})});`,
        },
      ],
    }),
  ],
});
