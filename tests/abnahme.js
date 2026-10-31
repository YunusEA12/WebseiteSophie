// Abnahmetest: Preisrechner (alle 16 Kombinationen, Extras, Soak Off, Nachrichten),
// Tastatur (Gutschein, Fragen, AGB, Galerie, Menü, Sprung-Link) und Slideshow.
// Braucht Playwright und den lokalen Server: erst `node serve.mjs`, dann
// `node tests/abnahme.js` (in der Cloud: NODE_PATH=$(npm root -g) node tests/abnahme.js).
const { chromium } = require('playwright');
let fails = 0, passes = 0;
function ok(cond, msg) { if (cond) passes++; else { fails++; console.log('  FEHLER: ' + msg); } }

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const total = () => page.evaluate(() => (document.getElementById('total-pre').hidden ? '' : 'ab ') + document.getElementById('total').textContent.trim());
  const note = () => page.evaluate(() => document.querySelector('#calc-sum .calc-note').textContent);
  const msg = () => page.evaluate(() => document.getElementById('msg-bubble').innerText);
  const settle = () => page.waitForTimeout(260);

  // 1. alle 16 Kombinationen Länge x Level
  const lens = { 40: 'Kurz (S)', 45: 'Medium (M)', 50: 'Lang (L)', 60: 'Extra Lang (XL)' };
  const lvls = [10, 20, 30, 40];
  let combos = 0;
  for (const len of Object.keys(lens)) {
    for (const lvl of lvls) {
      await page.click(`[data-len="${len}"]`);
      await page.click(`[data-lvl="${lvl}"]`);
      await settle();
      const want = String(+len + lvl);
      const t = await total();
      ok(t === want, `Länge ${len} + Level ${lvl}: erwartet ${want}, angezeigt ${t}`);
      const m = await msg();
      ok(m.includes(`Länge: ${lens[len]} · ${len} €`) && m.includes(`Level ${lvl / 10} · ${lvl} €`) && m.includes(`Preis laut Rechner: ${want} €`),
         `Nachricht für ${len}+${lvl} stimmt nicht: ${m.replace(/\n/g, ' | ')}`);
      ok((await note()).startsWith('Endpreis') && (await note()).includes('2 bis 4'), `Hinweis bei festem Preis falsch (${len}+${lvl})`);
      combos++;
    }
  }
  console.log(`Kombinationen geprüft: ${combos}`);

  // 2. Extras: Fremdarbeit, Charms und 3D mit Stückzahl 1 bis 10
  await page.click('[data-len="40"]'); await page.click('[data-lvl="10"]');
  await page.click('[data-add="10"]'); await settle();
  ok(await total() === '60', 'Fremdarbeit: 50 + 10 = 60');
  await page.click('[data-add="10"]'); await settle();
  await page.click('[data-extra="1"]'); await settle();
  ok(await total() === 'ab 51', 'Ein Charm: ab 51, angezeigt ' + await total());
  ok((await note()).startsWith('Preis ab') && (await note()).includes('bestätigt Sophie'), 'Hinweis bei ab-Preis fehlt: ' + await note());
  const plus = page.locator('.opt-qty').first().locator('[data-step="1"]');
  for (let i = 0; i < 9; i++) await plus.click();
  await settle();
  ok(await plus.getAttribute('aria-disabled') === 'true', 'Plus ist bei 10 Charms gesperrt');
  await plus.evaluate(el => { el.click(); el.click(); });   // forced: must not go past 10
  await settle();
  ok(await total() === 'ab 60', 'Charms höchstens 10 Stück: ab 60, angezeigt ' + await total());
  ok((await msg()).includes('Große Charms (10 Stück) · ab 10 €'), 'Nachricht nennt 10 Charms nicht');
  await page.click('[data-extra="1"]'); await settle();
  await page.click('[data-extra="5"]'); await settle();
  const plus3d = page.locator('.opt-qty').nth(1).locator('[data-step="1"]');
  await plus3d.click(); await plus3d.click(); await settle();
  ok(await total() === 'ab 65', '3D 3 Stück: ab 65, angezeigt ' + await total());
  await page.click('[data-extra="5"]'); await settle();
  ok(await total() === '50' && (await note()).startsWith('Endpreis'), 'Nach Abwahl wieder 50 € und Endpreis');

  // 3. Nur Soak Off
  await page.click('[data-solo]'); await settle();
  ok(await total() === '20', 'Soak Off 20, angezeigt ' + await total());
  ok(await note() === 'Endpreis · Barzahlung', 'Soak-Off-Hinweis ohne Dauer: ' + await note());
  ok(await page.evaluate(() => document.querySelector('[data-len="45"]').disabled), 'Längen bei Soak Off gesperrt');
  ok((await msg()).includes('Soak Off'), 'Nachricht für Soak Off');
  await page.click('[data-solo]'); await settle();
  ok(await total() === '50', 'Soak Off aus: wieder 50');

  // 4. Tastatur: Gutschein-Auswahl mit Pfeiltasten
  await page.focus('[data-gift="50"]');
  await page.keyboard.press('ArrowRight');
  await settle();
  ok(await page.evaluate(() => document.querySelector('[data-gift="75"]').getAttribute('aria-checked') === 'true' && document.activeElement.getAttribute('data-gift') === '75'), 'Gutschein: Pfeil rechts wählt 75 €');
  ok(await page.evaluate(() => document.getElementById('gift-label').textContent.includes('75')), 'Gutschein-Knopf nennt 75 €');
  ok(await page.evaluate(() => document.querySelector('[data-gift="50"]').tabIndex === -1 && document.querySelector('[data-gift="75"]').tabIndex === 0), 'Gutschein: nur die Auswahl ist ein Tab-Stopp');

  // 5. Tastatur: Fragen auf- und zuklappen
  await page.focus('#faq details:nth-of-type(1) summary');
  await page.keyboard.press('Enter'); await settle();
  ok(await page.evaluate(() => document.querySelector('#faq details').open), 'Frage öffnet mit Enter');
  await page.keyboard.press('Space'); await settle();
  ok(await page.evaluate(() => !document.querySelector('#faq details').open), 'Frage schließt mit Leertaste');

  // 6. AGB-Fenster: öffnen, Escape, Fokus zurück
  await page.focus('#policy [data-open="dlg-policy"]');
  await page.keyboard.press('Enter'); await settle();
  ok(await page.evaluate(() => document.getElementById('dlg-policy').open), 'AGB öffnet per Tastatur');
  await page.keyboard.press('Escape'); await settle();
  ok(await page.evaluate(() => !document.getElementById('dlg-policy').open && document.activeElement.matches('[data-open="dlg-policy"]')), 'AGB: Escape schließt, Fokus zurück auf den Knopf');

  // 7. Galerie: öffnen, Pfeile, Escape, Fokus zurück
  await page.focus('.more-sets li:nth-child(1) .tile');
  await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  ok(await page.evaluate(() => document.getElementById('lightbox').classList.contains('on') && document.activeElement.id === 'lbClose'), 'Galerie öffnet, Fokus auf Schließen');
  await page.keyboard.press('ArrowRight'); await settle();
  await page.keyboard.press('Escape'); await settle();
  ok(await page.evaluate(() => !document.getElementById('lightbox').classList.contains('on') && document.activeElement.closest('.more-sets') !== null), 'Galerie: Escape schließt, Fokus zurück aufs Bild');

  // 8. Sprung-Link: erster Tab-Stopp, springt in den Inhalt
  const fresh = await ctx.newPage();
  await fresh.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await fresh.waitForTimeout(1200);
  await fresh.keyboard.press('Tab');
  ok(await fresh.evaluate(() => document.activeElement.classList.contains('skip-link')), 'Erster Tab-Stopp ist „Zum Inhalt springen“');
  await fresh.keyboard.press('Enter'); await fresh.waitForTimeout(400);
  ok(await fresh.evaluate(() => document.activeElement.id === 'top'), 'Sprung-Link setzt den Fokus in den Inhalt');
  await fresh.keyboard.press('Tab');
  ok(await fresh.evaluate(() => !document.activeElement.closest('header')), 'Nach dem Sprung geht Tab im Inhalt weiter, nicht in der Navigation');
  await fresh.close();

  // 9. Slideshow: nur das aktive Bild für Screenreader, Pause-Knopf
  const aria = await page.evaluate(() => {
    const s = [...document.querySelectorAll('.hero-slide')];
    return { hidden: s.filter(x => x.getAttribute('aria-hidden') === 'true').length, shown: s.filter(x => x.getAttribute('aria-hidden') === 'false').length,
             current: document.querySelectorAll('.hero-dot[aria-current="true"]').length };
  });
  ok(aria.shown === 1 && aria.hidden === 5 && aria.current === 1, 'Slideshow: ein Bild sichtbar für Screenreader ' + JSON.stringify(aria));
  await page.evaluate(() => document.querySelector('.hero-pause').click());
  ok(await page.evaluate(() => document.querySelector('.hero-pause').getAttribute('aria-label') === 'Diashow fortsetzen'), 'Pause-Knopf schaltet um');
  await page.evaluate(() => document.querySelector('.hero-pause').click());

  // 10. Menü am Handy: Escape gibt den Fokus zurück
  const m = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await m.newPage();
  await mp.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await mp.waitForTimeout(1200);
  await mp.focus('#burger'); await mp.keyboard.press('Enter'); await mp.waitForTimeout(400);
  ok(await mp.evaluate(() => document.getElementById('menu').classList.contains('open') && document.activeElement.classList.contains('menu-link')), 'Menü öffnet, Fokus im Menü');
  await mp.keyboard.press('Escape'); await mp.waitForTimeout(300);
  ok(await mp.evaluate(() => !document.getElementById('menu').classList.contains('open') && document.activeElement.id === 'burger'), 'Menü: Escape schließt, Fokus zurück');

  ok(errs.length === 0, 'Fehler in der Konsole: ' + errs.join(' | '));
  console.log(`\n${passes} bestanden, ${fails} fehlgeschlagen`);
  await b.close();
  process.exit(fails ? 1 : 0);
})();
