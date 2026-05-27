import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  site: 'https://claude-multi.hmziq.xyz',
  srcDir: './src/web',
  vite: {
    plugins: [tailwindcss()],
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
      customCss: ['/src/web/styles/starlight.css'],
      lastUpdated: true,
      favicon: '/favicon.svg',
    }),
  ],
});
