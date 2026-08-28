// Renders src/web/og/og-image.html to public/og-image.jpg (1200x630). Run with: node src/web/og/render.mjs
import { chromium } from 'playwright';
import sharp from 'sharp';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { statSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const template = resolve(here, 'og-image.html');
const out = resolve(here, '../../../public/og-image.jpg');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await page.goto(pathToFileURL(template).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
const png = await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

await sharp(png)
  .resize(1200, 630, { fit: 'fill', kernel: 'lanczos3' })
  .jpeg({ quality: 85, chromaSubsampling: '4:4:4', mozjpeg: true })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(
  `${out}\n${meta.width}x${meta.height} ${meta.format} ${(statSync(out).size / 1024).toFixed(1)} KB`
);
