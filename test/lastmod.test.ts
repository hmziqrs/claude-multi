import { describe, expect, test } from "bun:test";
import {
  getCommitDateForPaths,
  isGitAvailable,
  normalizeLastmod,
} from "../web/util/lastmod";

const gitAvailable = isGitAvailable();

describe("lastmod", () => {
  test.skipIf(!gitAvailable)("returns a YYYY-MM-DD date for package.json", () => {
    expect(getCommitDateForPaths(["package.json"])).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("normalizes date-only values", () => {
    expect(normalizeLastmod("2026-10-31\n")).toBe("2026-10-31");
  });

  test("rejects invalid dates", () => {
    expect(normalizeLastmod("2026-02-30")).toBeNull();
    expect(normalizeLastmod("not-a-date")).toBeNull();
    expect(normalizeLastmod("")).toBeNull();
  });
});
