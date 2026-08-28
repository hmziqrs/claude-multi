import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { getSiteFooterHtml } from './src/web/util/site-footer-html';
import { latestVersion } from './src/web/util/changelog';
import { readdir, readFile, writeFile } from 'fs/promises';

const FOOTER_HTML = getSiteFooterHtml(latestVersion);

/**
 * Blog post slug -> ISO date, read from frontmatter at config load.
 * Used for sitemap <lastmod>; astro:content is not available in this file.
 */
const BLOG_DATES = new Map(
  readdirSync('./src/web/content/blog')
    .filter((f) => f.endsWith('.md'))
    .flatMap((f) => {
      const raw = readFileSync(join('./src/web/content/blog', f), 'utf-8');
      const date = raw.match(/^date:\s*(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, '');
      const parsed = date ? new Date(date) : null;
      if (!parsed || Number.isNaN(parsed.valueOf())) return [];
      return [[basename(f, '.md'), parsed.toISOString()]];
    })
);

/**
 * Astro integration: injects the site footer at body level for docs pages.
 * - Dev mode: handled by src/web/middleware.ts
 * - Static build: this integration's buildDone hook transforms HTML files
 */
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
  srcDir: './src/web',
  vite: {
    plugins: [tailwindcss(), serveLocalAudio()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three')) return 'three';
          },
        },
      },
    },
  },
  integrations: [
    injectSiteFooterIntegration(),
    icon({
      include: {
        'simple-icons': ['x', 'github', 'linkedin', 'telegram', 'reddit'],
        lucide: ['globe'],
      },
    }),
    sitemap({
      filter: (page) => !page.endsWith('/privacy/') && !page.endsWith('/terms/') && !page.endsWith('/feed.xml'),
      serialize(item) {
        // Only emit lastmod where a real modification date exists (blog frontmatter).
        // A synthetic build-time date on every URL makes crawlers distrust the field
        // site-wide, so pages without a known date get none.
        const slug = new URL(item.url).pathname.match(/^\/blog\/([^/]+)\/$/)?.[1];
        const date = slug && BLOG_DATES.get(slug);
        if (date) item.lastmod = date;
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
        Default: './src/web/layouts/StarlightLayout.astro',
        Header: './src/web/components/StarlightHeader.astro',
        Footer: './src/web/components/StarlightFooter.astro',
      },
      customCss: ['/src/web/styles/starlight.css'],
      lastUpdated: true,
      favicon: '/favicon.svg',
      // The site ships its own branded 404 at src/web/pages/404.astro;
      // disable Starlight's default /404 to avoid a route collision.
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
          tag: 'script',
          content: `requestIdleCallback(()=>{import('https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js').then(({initializeApp})=>{const c={apiKey:'AIzaSyDAdEgdNAke2wl0q4mBixEDMgQ21J7J71w',authDomain:'claude-multi.firebaseapp.com',projectId:'claude-multi',storageBucket:'claude-multi.firebasestorage.app',messagingSenderId:'961698441477',appId:'1:961698441477:web:2b9cfbd3d9a88149ee6f6c',measurementId:'G-0VRZJQKZT8'};const a=initializeApp(c);import('https://www.gstatic.com/firebasejs/12.13.0/firebase-analytics.js').then(({getAnalytics})=>{getAnalytics(a)})})});`,
        },
      ],
    }),
  ],
});
