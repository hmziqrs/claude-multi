import rss from '@astrojs/rss';
import { getCollection, type CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('missing site');
  const posts = await getCollection('blog', (e: CollectionEntry<'blog'>) => !e.data.draft);
  return rss({
    title: 'claude-multi Blog',
    description: 'Build notes from working on claude-multi, posts on running multiple Claude Code instances side by side, and the occasional rant about provider plumbing.',
    site: context.site,
    items: posts.toSorted((a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) => b.data.date.valueOf() - a.data.date.valueOf()).map((post: CollectionEntry<'blog'>) => {
      const item: Record<string, unknown> = { title: post.data.title, pubDate: post.data.date, description: post.data.description, link: '/blog/' + post.id + '/', categories: post.data.tags, author: 'hmziqrs' };
      if (post.data.audio) { item.enclosure = { url: 'https://claude-multi.hmziq.xyz/audio/' + post.data.audio, length: 0, type: 'audio/mpeg' }; }
      return item;
    }),
    customData: '<language>en-us</language><lastBuildDate>' + 'undefined' + '</lastBuildDate><atom:link href="' + context.site + 'feed.xml" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>',
  });
}
