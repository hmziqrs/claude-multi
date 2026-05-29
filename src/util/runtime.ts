declare const Bun: object | undefined;
declare const Deno: object | undefined;

export type PackageManager = 'bun' | 'deno' | 'pnpm' | 'npm';

export function detectPackageManager(): PackageManager {
  if (typeof Bun !== 'undefined') return 'bun';
  if (typeof Deno !== 'undefined') return 'deno';
  if ((process.argv[1] ?? '').includes('pnpm')) return 'pnpm';
  return 'npm';
}
