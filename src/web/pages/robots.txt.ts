import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site ?? 'https://claude-mutli.hmziq.xyz');

  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
`
  );
};
