import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    icon({
      include: {
        'simple-icons': ['x', 'github', 'linkedin', 'telegram', 'reddit'],
        lucide: ['globe'],
      },
    }),
    sitemap(),
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
            { slug: 'docs/providers' },
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
            { slug: 'docs/changelog' },
          ],
        },
        {
          label: 'Development',
          collapsed: true,
          items: [
            { slug: 'docs/contributing' },
            { slug: 'docs/development/subagent-model-plan' },
          ],
        },
      ],
      components: {
        Default: './src/web/layouts/StarlightLayout.astro',
      },
      customCss: ['/src/web/styles/starlight.css'],
      lastUpdated: true,
      favicon: '/favicon.svg',
      head: [
        {
          tag: 'meta',
          attrs: { name: 'theme-color', content: '#0c0c0f' },
        },
      ],
    }),
  ],
});
