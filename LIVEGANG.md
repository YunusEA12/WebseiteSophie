# Checkliste für den Livegang

Bis alles hier abgehakt ist, ist die Seite nur ein Entwurf. Solange Impressum und
Datenschutz Platzhalter enthalten, den provisorischen Link nicht öffentlich teilen
(z. B. nicht in die Instagram-Bio).

## Inhalte (von Sophie, siehe Liste „Was ich für deine Website von dir brauche“)

- [ ] `impressum.html`: alle rosa Platzhalter (`class="fill"`) ersetzen, Hinweiskasten löschen
- [ ] `datenschutz.html`: Verantwortliche, Aufsichtsbehörde eintragen, Hinweiskasten löschen
- [ ] `datenschutz.html`, Abschnitt 2: Hoster anpassen, falls die Seite nicht bei GitHub Pages bleibt
- [ ] `index.html`: WhatsApp-Nummer statt `wa.me/49XXXXXXXXXX`
- [ ] Ab-Preis geklärt (Set ohne Design ab 35 € oder ab 40 €)
- [ ] Sophie bestätigt: Fotos selbst gemacht, Kundinnen einverstanden
- [ ] Impressum und Datenschutz juristisch geprüft

## Technik

- [ ] In `index.html`, `impressum.html`, `datenschutz.html` die Zeile
      `<meta name="robots" content="noindex, nofollow">` samt Kommentar entfernen
- [ ] Domain `gerberxnails.de` auf den Hoster zeigen lassen; bei GitHub Pages eine
      Datei `CNAME` mit `gerberxnails.de` anlegen und „Enforce HTTPS“ aktivieren
- [ ] `node stamp.mjs` ausführen, dann committen und pushen
- [ ] Freie Termine: Google-Tabelle einrichten, Variable `TERMINE_CSV_URL` setzen

## Nach dem Start

- [ ] Instagram-Bio: Link auf `https://gerberxnails.de/impressum.html` (Impressumspflicht)
- [ ] Vorschau testen: Link in WhatsApp an sich selbst schicken
