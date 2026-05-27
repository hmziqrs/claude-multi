import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('astro config is missing `site`');

  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: 'claude-multi Blog',
    description:
      'Run multiple Claude Code instances with different AI providers and isolated configurations',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: `/blog/${post.id}/`,
        categories: post.data.tags,
      })),
    customData: '<language>en-us</language>',
  });
}
