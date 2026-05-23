#!/usr/bin/env bun
// Extract the section for a given version from CHANGELOG.md.
// Usage: bun run scripts/extract-changelog.ts <version> [--out <path>]
//   - <version>: e.g. 0.5.6 (matches `## [0.5.6] - ...`)
//   - --out <path>: write to file (default: stdout)
// Exits non-zero if the section is not found.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const version = args[0];
const outIdx = args.indexOf("--out");
const outPath = outIdx !== -1 ? args[outIdx + 1] : null;

if (!version) {
  console.error("Usage: extract-changelog.ts <version> [--out <path>]");
  process.exit(2);
}

const changelog = readFileSync(resolve("CHANGELOG.md"), "utf8");
const lines = changelog.split("\n");

const headingRe = /^## \[([^\]]+)\]/;
let start = -1;
let end = lines.length;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line === undefined) continue;
  const m = line.match(headingRe);
  if (!m) continue;
  if (start === -1 && m[1] === version) {
    start = i;
    continue;
  }
  if (start !== -1) {
    end = i;
    break;
  }
}

if (start === -1) {
  console.error(`No CHANGELOG section found for version ${version}`);
  process.exit(1);
}

const section = lines
  .slice(start + 1, end)
  .join("\n")
  .replace(/^\n+/, "")
  .replace(/\n+$/, "") + "\n";

if (outPath) {
  writeFileSync(resolve(outPath), section);
} else {
  process.stdout.write(section);
}
