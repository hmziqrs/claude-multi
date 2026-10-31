import { execFileSync } from "node:child_process";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function normalizeLastmod(value: string | null | undefined): string | null {
  const match = ISO_DATE.exec(value?.trim() ?? "");
  if (!match) return null;

  const canonical = `${match[1]}-${match[2]}-${match[3]}`;
  const parsed = new Date(`${canonical}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toISOString().slice(0, 10) === canonical ? canonical : null;
}

function gitDate(args: readonly string[], cwd: string): string | null {
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", ...args],
      { encoding: "utf8", cwd }
    );
    return normalizeLastmod(output);
  } catch {
    return null;
  }
}

export function getCommitDateForPaths(
  paths: readonly string[],
  cwd = process.cwd()
): string | null {
  return gitDate(["--", ...paths], cwd);
}

export function getLatestCommitDate(cwd = process.cwd()): string | null {
  return gitDate([], cwd);
}

export function isGitAvailable(cwd = process.cwd()): boolean {
  try {
    const output = execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      encoding: "utf8",
      cwd,
    });
    return output.trim() === "true";
  } catch {
    return false;
  }
}
