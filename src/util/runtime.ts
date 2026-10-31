declare const Bun: object | undefined;

export type PackageManager = "bun" | "pnpm" | "npm";

export function detectPackageManager(): PackageManager {
  if (typeof Bun !== "undefined") return "bun";
  if ((process.argv[1] ?? "").includes("pnpm")) return "pnpm";
  return "npm";
}
