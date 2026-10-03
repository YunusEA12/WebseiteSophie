# Checkliste für den Livegang

Bis alles hier abgehakt ist, ist die Seite nur ein Entwurf. Solange Impressum und
Datenschutz Platzhalter enthalten, den provisorischen Link nicht öffentlich teilen
(z. B. nicht in die Instagram-Bio).

## Inhalte (von Sophie, siehe Liste „Was ich für deine Website von dir brauche“)

- [ ] `impressum.html`: alle rosa Platzhalter (`class="fill"`) ersetzen, Hinweiskasten löschen
- [ ] `datenschutz.html`: Verantwortliche, Aufsichtsbehörde eintragen, Hinweiskasten löschen
- [ ] `datenschutz.html`, Abschnitt 2: Hoster anpassen, falls die Seite nicht bei GitHub Pages bleibt
- [ ] Sophie ist mit den Preisen einverstanden: Spannen aus ihrer Liste stehen mit dem oberen
      Preis da (Kurz 40 €, Level 1 +10 €, Level 2 +20 €), nur Charms und 3D-Modellierung „ab“
- [ ] Impressum-Adresse geklärt: keine Wohnadresse nötig, aber eine Adresse, an der Post sie
      sicher erreicht (kein Postfach), z. B. Studio in Pforzheim oder Geschäftsadresse mit Postweiterleitung
- [ ] Sophie bestätigt: Fotos selbst gemacht, Kundinnen einverstanden
- [ ] Impressum und Datenschutz juristisch geprüft

## Technik

- [ ] In `index.html`, `impressum.html`, `datenschutz.html` die Zeile
      `<meta name="robots" content="noindex, nofollow">` samt Kommentar entfernen
- [ ] Domain `gerberxnails.de` auf den Hoster zeigen lassen; bei GitHub Pages eine
      Datei `CNAME` mit `gerberxnails.de` anlegen und „Enforce HTTPS“ aktivieren
- [ ] `node stamp.mjs` ausführen, dann committen und pushen
- [ ] Freie Termine: Google-Tabelle anlegen und als CSV im Web veröffentlichen; den Link trägt Claude in `tools/termine-quelle.txt` ein

## Sicherheit: die Konten schützen

Die Website selbst hat nichts, was man knacken könnte (kein Login, keine Datenbank,
keine Formulare). Angreifbar sind die Konten, über die sie läuft:

- [ ] GitHub-Konto (Yunus): Zwei-Faktor-Anmeldung an – wer das Konto hat, kann die Seite ändern
- [ ] Google-Konto mit der Termin-Tabelle: Zwei-Faktor an; Tabelle nur für Sophie (und Yunus)
      bearbeitbar, nie „Jeder mit dem Link kann bearbeiten“
- [ ] Instagram (Sophie): Zwei-Faktor an – alle Anfragen laufen dorthin
- [ ] Domain-Anbieter: Zwei-Faktor und Domain-Sperre an; die Domain zusätzlich bei GitHub
      verifizieren (Profil → Settings → Pages → „Add a domain“), damit sie niemand übernehmen kann
- [ ] Im Impressum eine eigene Geschäfts-E-Mail nutzen (Spam-Roboter lesen sie mit)

## Nach dem Start

- [ ] Instagram-Bio: Link auf `https://gerberxnails.de/` und zusätzlich auf
      `https://gerberxnails.de/impressum.html` (Impressumspflicht)
- [ ] Vorschau testen: Link per Chat an sich selbst schicken und das Vorschaubild prüfen
