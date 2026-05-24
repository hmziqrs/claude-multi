// Mirrored from https://blog.hmziq.rs/api/v1/author.json so the build is
// deterministic. Refresh by re-running that endpoint and pasting the result.

export const author = {
  name: 'hmziqrs',
  url: 'https://hmziq.rs/',
  bio: '9 years building software. Full-stack engineer. Writing about programming, technology, and work.',
  email: 'hmziqrs@gmail.com',
  twitterHandle: 'hmziqrs',
  avatar: {
    light: 'https://blog.hmziq.rs/author-light.svg',
    dark: 'https://blog.hmziq.rs/author-dark.svg',
  },
  socials: [
    { platform: 'x', url: 'https://x.com/hmziqrs' },
    { platform: 'github', url: 'https://github.com/hmziqrs' },
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/hmziqrs' },
    { platform: 'telegram', url: 'https://t.me/hmziqrs' },
  ],
  sameAs: [
    'https://x.com/hmziqrs',
    'https://github.com/hmziqrs',
    'https://www.linkedin.com/in/hmziqrs',
    'https://t.me/hmziqrs',
  ],
} as const;

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
