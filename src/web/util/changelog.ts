import raw from '../../../CHANGELOG.md?raw';

export type Item = { text: string; subItems: string[] };
export type Section = { label: string; items: Item[] };
export type Release = { version: string; date: string; sections: Section[] };

export function parseChangelog(text: string): Release[] {
  const releases: Release[] = [];
  const lines = text.split('\n');
  let release: Release | null = null;
  let section: Section | null = null;
  let lastItem: Item | null = null;

  for (const line of lines) {
    const verMatch = line.match(/^## \[([^\]]+)\]\s*-\s*(.+)$/);
    if (verMatch) {
      if (release) releases.push(release);
      release = { version: verMatch[1], date: verMatch[2], sections: [] };
      section = null;
      lastItem = null;
      continue;
    }
    const secMatch = line.match(/^### (.+)$/);
    if (secMatch && release) {
      section = { label: secMatch[1], items: [] };
      release.sections.push(section);
      lastItem = null;
      continue;
    }
    const topLi = line.match(/^- (.+)$/);
    if (topLi && section) {
      lastItem = { text: topLi[1], subItems: [] };
      section.items.push(lastItem);
      continue;
    }
    const subLi = line.match(/^\s{2,}- (.+)$/);
    if (subLi && lastItem) {
      lastItem.subItems.push(subLi[1]);
      continue;
    }
  }
  if (release) releases.push(release);
  return releases;
}

export const releases = parseChangelog(raw);
export const latestRelease = releases[0];
export const latestVersion = latestRelease?.version ?? '0.0.0';

export function summarizeRelease(r: Release) {
  return {
    added: (r.sections.find((s) => s.label === 'Added')?.items.length ?? 0) +
           (r.sections.find((s) => s.label === 'Features')?.items.length ?? 0),
    changed: r.sections.find((s) => s.label === 'Changed')?.items.length ?? 0,
    fixed: r.sections.find((s) => s.label === 'Fixed')?.items.length ?? 0,
    tests: r.sections.find((s) => s.label === 'Tests')?.items.length ?? 0,
  };
}

export function latestHighlight(): string {
  const r = latestRelease;
  if (!r) return 'new release';
  const added = r.sections.find((s) => s.label === 'Added') ?? r.sections.find((s) => s.label === 'Features');
  if (!added || added.items.length === 0) return 'new release';
  const first = added.items[0].text;
  const boldMatch = first.match(/\*\*([^*]+)\*\*/);
  const headline = (boldMatch ? boldMatch[1] : first.split(':')[0].split('.')[0]).trim();
  return headline.toLowerCase();
}
