// Fetched at build time from blog.hmziq.rs so the author info stays in sync
// without manual copying. Astro pages are async, so top-level await here just
// resolves before any page renders.

const AUTHOR_API = 'https://blog.hmziq.rs/api/v1/author.json';

type Social = { platform: string; url: string };
type AuthorPayload = {
  author: {
    name: string;
    url: string;
    bio: string;
    email: string;
    twitterHandle: string;
    avatar: { light: string; dark: string };
    websites: { main: string; blog?: string };
    socials: Social[];
    sameAs: string[];
  };
};

const res = await fetch(AUTHOR_API);
if (!res.ok) {
  throw new Error(
    `Failed to fetch author info from ${AUTHOR_API}: ${res.status} ${res.statusText}`
  );
}
const payload = (await res.json()) as AuthorPayload;

const mainSite = payload.author.websites.main;

const socials: Social[] = [
  { platform: 'website', url: mainSite },
  ...payload.author.socials,
];

export const author = {
  ...payload.author,
  socials,
};

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
