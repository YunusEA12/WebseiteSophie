// Screenshot of the local site: node screenshot.mjs http://localhost:3000 [label] [mobile]
// Saved to "temporary screenshots/screenshot-N[-label].png" (counts up, never overwrites).
//
// Uses Playwright where it is installed (cloud sessions, a Mac), otherwise the
// Puppeteer setup on Yunus' Windows PC. Other paths for that one can be set with
// PUPPETEER_PATH and CHROME_PATH.
import { createRequire } from "module";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "temporary screenshots");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3] ? `-${process.argv[3]}` : "";
const isMobile = process.argv[3]?.toLowerCase().includes("mobile") || process.argv[4] === "mobile";
const width = isMobile ? 390 : 1440;
const height = isMobile ? 844 : 900;

let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}${label}.png`))) n++;
const outPath = path.join(dir, `screenshot-${n}${label}.png`);

function loadPlaywright() {
  try { return require("playwright"); } catch (e) { /* not local */ }
  try {
    const globalRoot = execSync("npm root -g", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    return require(path.join(globalRoot, "playwright"));
  } catch (e) { return null; }
}

async function openPage() {
  const pw = loadPlaywright();
  if (pw) {
    const browser = await pw.chromium.launch();
    const context = await browser.newContext({
      viewport: { width, height }, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1,
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    return { browser, page };
  }
  const puppeteer = require(process.env.PUPPETEER_PATH ||
    "C:/Users/yunus/AppData/Local/Temp/puppeteer-test/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js");
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH ||
      "C:/Users/yunus/.cache/puppeteer/chrome/win64-146.0.7680.76/chrome-win64/chrome.exe",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, isMobile, hasTouch: isMobile, deviceScaleFactor: isMobile ? 2 : 1 });
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  return { browser, page };
}

const { browser, page } = await openPage();

// Reveal everything that normally animates in on scroll, and load every
// picture: a full-page shot does not scroll, lazy images would stay empty
await page.evaluate(() => {
  document.querySelectorAll('img[loading="lazy"]').forEach(img => { img.loading = "eager"; });
  document.querySelectorAll(".fade-up").forEach(el => el.classList.add("visible"));
  if (typeof window.__revealAll === "function") window.__revealAll();
});

// Scroll through once to settle anything that waits for its turn
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const timer = setInterval(() => {
      window.scrollBy(0, 400);
      y += 400;
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
