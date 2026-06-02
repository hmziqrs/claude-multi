import { defineMiddleware } from 'astro:middleware';
import { getSiteFooterHtml } from './util/site-footer-html';
import { latestVersion } from './util/changelog';

const footerHtml = getSiteFooterHtml(latestVersion);

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();

  // Only transform HTML docs pages
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const html = await response.text();

  // Only inject on Starlight docs pages (skip marketing pages which have their own footer)
  if (!html.includes('class="page')) return new Response(html, response);

  const injected = html.replace('</body>', `${footerHtml}\n</body>`);
  return new Response(injected, response);
});
