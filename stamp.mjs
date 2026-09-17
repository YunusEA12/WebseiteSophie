// Adds a version to the css/js links so phones cannot serve a stale cached copy.
// Run before publishing: node stamp.mjs
import fs from "fs";
import crypto from "crypto";

const html = "index.html";
let s = fs.readFileSync(html, "utf8");

const hash = f => crypto.createHash("md5")
  .update(fs.readFileSync(f)).digest("hex").slice(0, 8);

s = s.replace(/(href|src)="((?:css|js)\/[^"?]+)(?:\?v=[a-f0-9]+)?"/g,
  (m, attr, file) => `${attr}="${file}?v=${hash(file)}"`);

fs.writeFileSync(html, s);
console.log([...s.matchAll(/(?:css|js)\/[^"]+/g)].map(m => "  " + m[0]).join("\n"));
