import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('astro config is missing `site`');

  const posts = await getCollection(
    'blog',
    (entry: CollectionEntry<'blog'>) => !entry.data.draft,
  );

  return rss({
    title: 'claude-multi Blog',
    description:
      'Run multiple Claude Code instances with different AI providers and isolated configurations',
    site: context.site,
    items: posts
      .toSorted(
        (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
          b.data.date.valueOf() - a.data.date.valueOf(),
      )
      .map((post: CollectionEntry<'blog'>) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: `/blog/${post.id}/`,
        categories: post.data.tags,
      })),
    customData: '<language>en-us</language>',
  });
}
