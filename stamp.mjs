// Adds a version to the css/js links so phones cannot serve a stale cached copy.
// Run before publishing: node stamp.mjs
import fs from "fs";
import crypto from "crypto";

const pages = ["index.html", "impressum.html", "datenschutz.html"];

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
