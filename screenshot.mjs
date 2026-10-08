import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = (process.argv[3] || 'desktop').replace(/[^a-zA-Z0-9_-]/g, '-');
const mobile = label.toLowerCase().includes('mobile');
const dir = path.join(root, 'temporary screenshots');
fs.mkdirSync(dir, { recursive: true });
let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}-${label}.png`))) n++;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.BROWSER_EXECUTABLE_PATH ? { executablePath: process.env.BROWSER_EXECUTABLE_PATH } : {})
});
try {
  const page = await browser.newPage({
    viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 900 },
    isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1, reducedMotion: 'reduce'
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    if (window.__revealAll) window.__revealAll();
    document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = 'eager'; });
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
  });
  const output = path.join(dir, `screenshot-${n}-${label}.png`);
  await page.screenshot({ path: output, fullPage: true });
  console.log(output);
} finally { await browser.close(); }

