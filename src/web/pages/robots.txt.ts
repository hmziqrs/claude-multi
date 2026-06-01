import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL('sitemap-index.xml', site ?? 'https://claude-multi.hmziq.xyz');
  return new Response(
    'User-agent: *\nAllow: /\nDisallow: /audio/\n\nSitemap: ' + sitemapURL.href + '\n',
    { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=14400' } }
  );
};
