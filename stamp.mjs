// Run before publishing: node stamp.mjs
// 1. Checks what tends to break unnoticed: classes without CSS, missing
//    files, a start price that differs between calculator, page and Google.
// 2. Adds a version to the css/js links so phones cannot serve a stale
//    cached copy.
// Plain Node, no packages: runs the same on Windows, a Mac and in the cloud.
import fs from "fs";
import path from "path";
import crypto from "crypto";

const pages = ["index.html", "impressum.html", "datenschutz.html", "widerruf.html", "404.html"];

/* ---------------------------------------------------------------- check */

const problems = [];
const read = f => fs.readFileSync(f, "utf8");

// Tailwind here is precompiled (css/tailwind-utils.css): a utility class only
// works if it was in the markup when the file was built. One that is not
// there does nothing at all - in October 2026 a missing pb-[clamp(...)]
// glued the questions to the gift card. New styles belong in css/style.css.
const css = ["css/tailwind-utils.css", "css/tailwind-base.css", "css/style.css"].map(read).join("\n");

// class hooks for script or for rules on a parent; they need no CSS of their own
const HOOKS = new Set([
  "js-rv", "rv", "tile", "navlink", "menu-link", "group", "btn-sub", "opt-name", "opt-size",
  "opt-dot", "opt-sub", "opt-pcs", "qty-n", "qty-val", "hero-slide", "hero-cap", "hero-dot", "hero-dots",
  "gift-body", "more-title", "stat-sub", "step", "faq", "pol-body", "pol-key", "pol-title",
  "i-spark", "i-check", "i-num", "i-type", "hint-ring", "hint-ico", "hint-text", "hint-go", "hint-bar",
  "peek-card", "peek-label", "peek-check", "peek-title", "peek-bubble", "peek-how", "peek-live",
  "msg-ic", "msg-sum", "msg-auto", "msg-bubble", "l", "s", "core", "lp", "flower-bloom",
  "service-bloom", "showcase-bloom", "hero-pic-bloom", "sheet-body", "legal", "not-found",
  "legal-note", "!gap-0.5", "scroll-smooth", "antialiased",
]);

function selector(cls) {
  let out = ".";
  for (const ch of cls) {
    if (ch === ",") out += "\\2c ";
    else if ("[]().:/%!&#'*".includes(ch)) out += "\\" + ch;
    else out += ch;
  }
  return out;
}

function hasRule(cls) {
  const sel = selector(cls);
  let i = css.indexOf(sel);
  while (i !== -1) {
    const next = css[i + sel.length];
    if (!next || !/[A-Za-z0-9_\-\\]/.test(next)) return true;
    i = css.indexOf(sel, i + 1);
  }
  return false;
}

const missingClasses = new Map();
for (const page of pages) {
  const html = read(page);
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    for (const cls of m[1].split(/\s+/)) {
      if (!cls || HOOKS.has(cls) || hasRule(cls)) continue;
      if (!missingClasses.has(cls)) missingClasses.set(cls, page);
    }
  }
}
for (const [cls, page] of missingClasses) {
  problems.push(`Klasse ohne CSS: "${cls}" (${page}). Tailwind ist vorkompiliert, die Regel in css/style.css ergänzen.`);
}

// every local file the pages and styles point to
function localTarget(ref, base) {
  if (!ref || /^(https?:|mailto:|tel:|data:|#|javascript:)/i.test(ref)) return null;
  let p = ref.split("#")[0].split("?")[0];
  if (!p || p === "./" || p === "/") p = "index.html";
  return path.normalize(path.join(base, p));
}

const refs = [];
for (const page of pages) {
  // inline scripts build addresses at runtime, skip them
  const html = read(page).replace(/<script[\s\S]*?<\/script>/g, "");
  for (const m of html.matchAll(/\s(?:src|href|data-src|data-full)="([^"]+)"/g)) refs.push([m[1], ".", page]);
  for (const m of html.matchAll(/\s(?:srcset|data-srcset)="([^"]+)"/g)) {
    for (const part of m[1].split(",")) refs.push([part.trim().split(/\s+/)[0], ".", page]);
  }
  for (const m of html.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) refs.push([m[1], ".", page]);
}
for (const f of ["css/style.css", "fonts/fonts.css"]) {
  // embedded SVGs carry their own url(#...) references
  const text = read(f).replace(/url\((['"])data:[\s\S]*?\1\)/g, "");
  for (const m of text.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) refs.push([m[1], path.dirname(f), f]);
}
// built by main.js from the chosen amount
for (const v of ["50", "75", "100", "frei"]) refs.push([`brand_assets/gutschein-${v}.webp`, ".", "js/main.js"]);

const seen = new Set();
for (const [ref, base, from] of refs) {
  const target = localTarget(ref, base);
  if (!target || seen.has(target)) continue;
  seen.add(target);
  if (!fs.existsSync(target)) problems.push(`Datei fehlt: ${target} (verlinkt in ${from})`);
}

// the start price: calculator (shortest length + level 1, ranges count with
// their upper price), the hero and the data for Google must agree
const index = read("index.html");
const upper = v => Math.max(...String(v).split("-").map(Number));
const lens = [...index.matchAll(/data-len="([^"]+)"/g)].map(m => upper(m[1]));
const lvls = [...index.matchAll(/data-lvl="([^"]+)"/g)].map(m => upper(m[1]));
const start = Math.min(...lens) + Math.min(...lvls);
const hero = (index.match(/<span class="stat-pre">ab<\/span>(\d+)/) || [])[1];
const google = (index.match(/"priceRange":\s*"ab (\d+)/) || [])[1];
if (String(start) !== hero || String(start) !== google) {
  problems.push(`Startpreis passt nicht zusammen: Rechner ${start} €, Startseite ${hero} €, Google-Daten ${google} €.`);
}

// amounts the questions name must exist in the calculator
const faq = (index.match(/id="faq"[\s\S]*?<\/section>/) || [""])[0];
const calc = new Set([...index.matchAll(/data-(?:len|lvl|add|extra|solo)="([^"]+)"/g)]
  .flatMap(m => m[1].split("-").map(Number)));
for (const m of faq.matchAll(/(\d+)(?:&nbsp;|\s)€/g)) {
  if (!calc.has(Number(m[1]))) problems.push(`„Häufige Fragen“ nennen ${m[1]} €, der Preisrechner kennt den Betrag nicht.`);
}

if (problems.length) {
  console.log("PRÜFEN:");
  for (const p of problems) console.log("  - " + p);
} else {
  console.log(`Prüfung ok: Klassen, ${seen.size} Dateien, Startpreis ${start} € überall gleich.`);
}
console.log("");

/* ---------------------------------------------------------------- stamp */

const hash = f => crypto.createHash("md5")
  .update(fs.readFileSync(f)).digest("hex").slice(0, 8);

for (const page of pages) {
  if (!fs.existsSync(page)) continue;
  let s = fs.readFileSync(page, "utf8");

  // only stylesheets and scripts: the preloaded fonts must keep the exact
  // address fonts.css asks for, or the browser downloads them twice
  s = s.replace(/(href|src)="((?:css|js|fonts)\/[^"?]+\.(?:css|js))(?:\?v=[a-f0-9]+)?"/g,
    (m, attr, file) => `${attr}="${file}?v=${hash(file)}"`);

  fs.writeFileSync(page, s);
  console.log(page);
  console.log([...s.matchAll(/(?:css|js|fonts)\/[^"]+\.(?:css|js)\?v=[a-f0-9]+/g)].map(m => "  " + m[0]).join("\n"));
}
