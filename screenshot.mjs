import { createRequire } from "module";
const require = createRequire(import.meta.url);
const puppeteer = require("C:/Users/yunus/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js");
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "temporary screenshots");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] ? `-${process.argv[3]}` : "";

// Auto-increment
let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}${label}.png`))) n++;
const outPath = path.join(dir, `screenshot-${n}${label}.png`);

const browser = await puppeteer.launch({
  headless: true,
  executablePath: "C:/Users/yunus/.cache/puppeteer/chrome/win64-146.0.7680.76/chrome-win64/chrome.exe",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});
const page = await browser.newPage();
const isMobile = process.argv[3]?.toLowerCase().includes("mobile") || process.argv[4] === "mobile";
const width = isMobile ? 390 : 1440;
const height = isMobile ? 844 : 900;
await page.setViewport({ width, height, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1 });

// Pre-set consent so banner never obscures hero
await page.evaluateOnNewDocument(() => {
  try { localStorage.setItem('gxn-consent', 'all'); } catch(e) {}
});

await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

// Dismiss cookie banner so it doesn't obscure the hero in screenshots
await page.evaluate(() => {
  const consentBtn = document.getElementById('consent-min') || document.getElementById('consent-all');
  if (consentBtn) consentBtn.click();
  document.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  if (typeof window.__revealAll === 'function') window.__revealAll();
});

// Smooth scroll to trigger any lazy elements and settle animations
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const step = 400;
    const timer = setInterval(() => {
      window.scrollBy(0, step);
      y += step;
      if (y >= document.body.scrollHeight) {
        clearInterval(timer);
        window.scrollTo(0, 0);
        setTimeout(resolve, 300);
      }
    }, 60);
  });
});

await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log("Screenshot saved:", outPath);

