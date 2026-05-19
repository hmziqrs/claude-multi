import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4323/changelog/';
const out = process.argv[3] || 'screenshots-review/changelog/before.png';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
// trigger any IntersectionObserver-based reveals by scrolling through the page
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
});
await page.waitForTimeout(500);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('shot', url, '->', out);
