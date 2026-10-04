// Holt Sophies Termin-Tabelle (Google Sheet, "Im Web veroeffentlichen" als CSV)
// und schreibt daraus termine.json fuer die Website.
//
// Laeuft als GitHub Action (.github/workflows/termine.yml), geht aber auch lokal:
//   node tools/termine-sync.mjs        (Link aus tools/termine-quelle.txt)
//
// Die Website selbst fragt Google nie an - Besucher laden nur termine.json von
// diesem Server. Die Datei wird nur neu geschrieben, wenn sich Termine geaendert
// haben; "stand" ist damit der Tag der letzten echten Aenderung.
//
// Erwartete Spalten (Gross-/Kleinschreibung egal, Reihenfolge egal):
//   Datum      15.10.2026 | 15.10. | 2026-10-15
//   Uhrzeit    9:30 | 09:30
//   Ort        Homestudio | Pforzheim   (leer = erster Ort aus termine.json)
//   Vergeben   Haekchen (TRUE/FALSE, WAHR/FALSCH) | ja/nein | x | vergeben/frei

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FILE = path.join(ROOT, "termine.json");

// Where the sheet lives: the repository variable TERMINE_CSV_URL if set,
// otherwise the first line of tools/termine-quelle.txt. A sheet published as
// CSV is public by design and holds only dates and times, so the link may
// sit in the repository - that way nobody has to touch the GitHub settings.
function sourceUrl() {
  if (process.env.TERMINE_CSV_URL) return process.env.TERMINE_CSV_URL.trim();
  const f = path.join(ROOT, "tools", "termine-quelle.txt");
  if (!fs.existsSync(f)) return "";
  const line = fs.readFileSync(f, "utf8").split(/\r?\n/).map(l => l.trim()).find(l => /^https:\/\//.test(l));
  return line || "";
}
const URL_ = sourceUrl();

if (!URL_) {
  console.log("Noch keine Tabelle verknuepft (tools/termine-quelle.txt) - nichts zu tun.");
  process.exit(0);
}

// ---------- CSV ----------
function parseCsv(text) {
  const first = text.split(/\r?\n/, 1)[0] || "";
  const sep = first.includes(";") && !first.includes(",") ? ";" : ",";
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.map(r => r.map(v => v.trim()));
}

// ---------- values ----------
const pad = n => String(n).padStart(2, "0");

function berlinToday() {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });
  return f.format(new Date()); // YYYY-MM-DD
}
const TODAY = berlinToday();

function parseDate(v) {
  let m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})?$/);
  if (m) {
    let y = m[3] ? +m[3] : +TODAY.slice(0, 4);
    if (y < 100) y += 2000;
    let iso = `${y}-${pad(m[2])}-${pad(m[1])}`;
    // "15.1." written in December means next January
    if (!m[3] && iso < TODAY && daysBetween(iso, TODAY) > 60) iso = `${y + 1}-${pad(m[2])}-${pad(m[1])}`;
    return iso;
  }
  return null;
}

function daysBetween(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
}

function parseTime(v) {
  const m = v.match(/^(\d{1,2})[:.](\d{2})/);
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return `${pad(m[1])}:${m[2]}`;
}

const TAKEN = /^(true|wahr|ja|j|x|1|vergeben|gebucht|belegt|voll)$/i;

// ---------- main ----------
const res = await fetch(URL_, { redirect: "follow" });
if (!res.ok) {
  console.error(`Tabelle nicht erreichbar: HTTP ${res.status}`);
  process.exit(1);
}
const rows = parseCsv(await res.text()).filter(r => r.some(Boolean));
if (!rows.length) {
  console.error("Die Tabelle ist leer.");
  process.exit(1);
}

const head = rows[0].map(h => h.toLowerCase());
const col = (...names) => head.findIndex(h => names.includes(h));
const C = {
  date: col("datum", "tag"),
  time: col("uhrzeit", "zeit"),
  place: col("ort", "studio"),
  taken: col("vergeben", "gebucht", "status", "belegt")
};
if (C.date < 0 || C.time < 0) {
  console.error(`Spalten "Datum" und "Uhrzeit" fehlen. Gefunden: ${rows[0].join(", ")}`);
  process.exit(1);
}

const current = JSON.parse(fs.readFileSync(FILE, "utf8"));
const places = current.orte || [];
const defaultPlace = places[0] ? places[0].name : "";

// the place is shown as plain text on the site; keep it short and plain
const clean = v => String(v || "").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 30);

// No customer appointments on Sundays and public holidays in Baden-Wuerttemberg
// (Feiertagsgesetz) - such rows are skipped. The website filters them as well.
function easter(y) {   // Gauss/Meeus, Gregorian calendar
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  return new Date(Date.UTC(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1));
}
function isRestDay(iso) {
  const [y, mo, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCDay() === 0) return true;
  if (["01-01", "01-06", "05-01", "10-03", "11-01", "12-25", "12-26"].includes(iso.slice(5))) return true;
  const e = easter(y);
  return [-2, 1, 39, 50, 60].some(off => new Date(e.getTime() + off * 864e5).toISOString().slice(0, 10) === iso);
}

const termine = [];
const problems = [];
const restSkipped = [];
rows.slice(1).forEach((r, i) => {
  const datum = parseDate(r[C.date] || "");
  const zeit = parseTime(r[C.time] || "");
  if (!datum || !zeit) { problems.push(`Zeile ${i + 2}: "${r.join(" | ")}"`); return; }
  // keep the file small: anything older than a month is history
  if (daysBetween(datum, TODAY) > 31) return;
  if (isRestDay(datum)) { restSkipped.push(`${datum} ${zeit}`); return; }
  const ort = clean(C.place >= 0 && r[C.place]) || defaultPlace;
  if (ort && !places.some(p => p.name.toLowerCase() === ort.toLowerCase())) places.push({ name: ort, farbe: "gold" });
  const known = places.find(p => p.name.toLowerCase() === ort.toLowerCase());
  termine.push({ datum, zeit, ort: known ? known.name : ort, vergeben: C.taken >= 0 && TAKEN.test(r[C.taken] || "") });
});

if (problems.length) console.warn(`Uebersprungen (Datum oder Uhrzeit unlesbar):\n  ${problems.join("\n  ")}`);
if (restSkipped.length) console.warn(`Uebersprungen (Sonntag oder Feiertag in BW, keine Kundentermine):\n  ${restSkipped.join("\n  ")}`);
// a broken sheet must not wipe the calendar
if (!termine.length && rows.length > 1) {
  console.error("Keine einzige Zeile lesbar - termine.json bleibt unveraendert.");
  process.exit(1);
}

termine.sort((a, b) => (a.datum + a.zeit).localeCompare(b.datum + b.zeit));

const same = JSON.stringify(termine) === JSON.stringify(current.termine) &&
             JSON.stringify(places) === JSON.stringify(current.orte);
if (same) {
  console.log(`Keine Aenderung (${termine.length} Termine).`);
  process.exit(0);
}

const out = { stand: TODAY, orte: places, termine };
const lines = [
  "{",
  `  "stand": ${JSON.stringify(out.stand)},`,
  `  "orte": [`,
  out.orte.map(o => `    ${JSON.stringify(o).replace(/":/g, '": ').replace(/,"/g, ', "').replace(/^\{/, "{ ").replace(/\}$/, " }")}`).join(",\n"),
  "  ],",
  `  "termine": [`,
  out.termine.map(t => `    ${JSON.stringify(t).replace(/":/g, '": ').replace(/,"/g, ', "').replace(/^\{/, "{ ").replace(/\}$/, " }")}`).join(",\n"),
  "  ]",
  "}",
  ""
];
fs.writeFileSync(FILE, lines.join("\n"));
console.log(`termine.json aktualisiert: ${termine.length} Termine, davon ${termine.filter(t => !t.vergeben).length} frei.`);
