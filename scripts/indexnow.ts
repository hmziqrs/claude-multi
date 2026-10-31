#!/usr/bin/env bun

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = "https://claude-multi.hmziq.xyz";
const HOST = new URL(SITE).hostname;
const KEY = "99bd2e387b40513790cd63f0e90ef9bd";
const KEY_PATH = join(process.cwd(), "dist", `${KEY}.txt`);
const SITEMAP_PATH = join(process.cwd(), "dist", "sitemap-0.xml");
const ENDPOINT = "https://api.indexnow.org/indexnow";

if (!existsSync(KEY_PATH)) {
  console.error(`IndexNow key file is missing from the build: ${KEY_PATH}`);
  process.exit(1);
}

const keyFile = readFileSync(KEY_PATH, "utf8").trim();
if (keyFile !== KEY) {
  console.error("IndexNow key file does not match the configured key.");
  process.exit(1);
}

if (!existsSync(SITEMAP_PATH)) {
  console.error(`Sitemap is missing from the build: ${SITEMAP_PATH}`);
  process.exit(1);
}

const sitemap = readFileSync(SITEMAP_PATH, "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .filter((url): url is string => Boolean(url));

if (urls.length === 0) {
  console.error("No URLs found in the sitemap.");
  process.exit(1);
}

if (process.argv.includes("--dry-run")) {
  console.log(`IndexNow dry run: ${urls.length} URLs`);
  for (const url of urls) console.log(url);
  process.exit(0);
}

const keyLocation = `${SITE}/${KEY}.txt`;

async function waitForKeyFile(): Promise<void> {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const response = await fetch(keyLocation, { cache: "no-store" });
      if (response.ok && (await response.text()).trim() === KEY) return;
    } catch {
      // The deploy may still be propagating, so retry below.
    }
    if (attempt < 10) await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw new Error(`IndexNow key file is not live at ${keyLocation}`);
}

await waitForKeyFile();

const payload = {
  host: HOST,
  key: KEY,
  keyLocation,
  urlList: urls,
};

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(payload),
});

const body = await response.text();
console.log(`IndexNow submitted ${urls.length} URLs: ${response.status} ${response.statusText}`);
if (body) console.log(body);

if (response.status >= 400) {
  process.exit(1);
}
