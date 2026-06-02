import type { APIRoute } from 'astro';

// Generate simple SVG-based OG images for each page
// Returns an SVG served as PNG for social media previews
export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug || 'home';
  const titleParam = url.searchParams.get('title') || 'claude-multi';
  const descParam = url.searchParams.get('desc') || '';

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0f"/>
      <stop offset="100%" stop-color="#111118"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a3e635"/>
      <stop offset="100%" stop-color="#bef264"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>
  <text x="80" y="120" font-family="system-ui, sans-serif" font-weight="800" font-size="72" fill="#f5f5f5">
    ${escapeXml(titleParam.length > 50 ? titleParam.slice(0, 47) + '...' : titleParam)}
  </text>
  <text x="80" y="200" font-family="system-ui, sans-serif" font-weight="400" font-size="32" fill="#a0a0a0">
    ${escapeXml(descParam.length > 80 ? descParam.slice(0, 77) + '...' : descParam)}
  </text>
  <text x="80" y="570" font-family="monospace" font-weight="600" font-size="28" fill="#a3e635">
    claude-multi
  </text>
  <rect x="80" y="585" width="200" height="3" rx="2" fill="#a3e635" opacity="0.4"/>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function getStaticPaths() {
  return [
    { params: { slug: 'home' } },
    { params: { slug: 'blog' } },
    { params: { slug: 'about' } },
    { params: { slug: 'faq' } },
    { params: { slug: 'changelog' } },
    { params: { slug: 'privacy' } },
    { params: { slug: 'terms' } },
  ];
}
