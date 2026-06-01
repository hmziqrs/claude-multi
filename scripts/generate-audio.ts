import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, basename } from "path";

const BLOG_DIR = join(import.meta.dir, "../src/web/content/blog");
const OUTPUT_DIR = join(import.meta.dir, "../audio");
const API_URL = "http://localhost:8880/v1/audio/speech";
const VOICE = "af_heart";
const GITHUB_RAW = "https://raw.githubusercontent.com/hmziqrs/claude-multi/master/audio";

function stripMarkdown(content: string): string {
  return content
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*_]{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function injectAudioFrontmatter(raw: string, url: string): string {
  if (/^audio:/m.test(raw)) {
    return raw.replace(/^audio:.*$/m, `audio: "${url}"`);
  }
  return raw.replace(/^(---\n[\s\S]*?)(---)/, `$1audio: "${url}"\n$2`);
}

async function generateAudio(file: string) {
  const slug = basename(file, ".md").replace(/\.mdx$/, "");
  const outPath = join(OUTPUT_DIR, `${slug}.mp3`);

  const raw = await readFile(file, "utf-8");

  if (existsSync(outPath)) {
    console.log(`  skip  ${slug}`);
    return;
  }

  const text = stripMarkdown(raw);
  if (!text) {
    console.log(`  skip  ${slug} (empty)`);
    return;
  }

  console.log(`  gen   ${slug}`);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "kokoro", input: text, voice: VOICE }),
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);

  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));

  const audioUrl = `${GITHUB_RAW}/${slug}.mp3`;
  await writeFile(file, injectAudioFrontmatter(raw, audioUrl));

  console.log(`  done  ${slug} → ${audioUrl}`);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  try {
    await fetch("http://localhost:8880/health");
  } catch {
    console.error("kokoro server not running. Start it first:\n  bun run tts-server");
    process.exit(1);
  }

  const files = (await readdir(BLOG_DIR))
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => join(BLOG_DIR, f));

  console.log(`\nProcessing ${files.length} blog post(s)...\n`);
  for (const file of files) await generateAudio(file);

  // Tell the TTS server to unload the model and shut down
  try {
    await fetch("http://localhost:8880/shutdown");
    console.log("\nTTS server shut down, model unloaded.");
  } catch {
    // Server already gone, that's fine
    console.log("\nDone. (TTS server already stopped)");
  }
}

main().catch(console.error);
