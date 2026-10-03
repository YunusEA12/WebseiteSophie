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
- [ ] Domain `gerberxnails.de` verbinden (siehe Abschnitt „Domain bei IONOS“ unten)
- [ ] `node stamp.mjs` ausführen, dann committen und pushen
- [ ] Freie Termine: Google-Tabelle anlegen und als CSV im Web veröffentlichen; den Link trägt Claude in `tools/termine-quelle.txt` ein

## Domain bei IONOS

Kauf: nur die Domain. Kein Hosting, kein Baukasten, kein SSL-Zertifikat (HTTPS macht
GitHub kostenlos). Als Inhaberin Sophie eintragen. Bei `.de` sind die Daten von
Privatpersonen im öffentlichen Whois nicht sichtbar.

Verbinden (erst, wenn Impressum und Datenschutz ausgefüllt sind):

1. GitHub zuerst: Repository → Settings → Pages → Custom domain `gerberxnails.de`
   eintragen (legt die Datei `CNAME` an). Erst danach die DNS-Einträge setzen,
   so kann niemand die Domain zwischendurch für eine eigene Seite nutzen.
2. IONOS → Domains → `gerberxnails.de` → DNS: die vorhandenen A- und AAAA-Einträge
   für `@` (IONOS-Parkseite) löschen und diese setzen:

   | Typ | Hostname | Wert |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | AAAA | @ | 2606:50c0:8000::153 |
   | AAAA | @ | 2606:50c0:8001::153 |
   | AAAA | @ | 2606:50c0:8002::153 |
   | AAAA | @ | 2606:50c0:8003::153 |
   | CNAME | www | yunusea12.github.io |

   MX-Einträge (E-Mail) nicht anfassen. Keine IONOS-„Weiterleitung“ auf github.io
   benutzen, nur diese Einträge.
3. Warten, bis GitHub unter Settings → Pages „DNS check successful“ zeigt (Minuten
   bis wenige Stunden), dann „Enforce HTTPS“ anhaken.
4. Domain bei GitHub verifizieren: Profil → Settings → Pages → „Add a domain“; den
   angezeigten TXT-Eintrag bei IONOS anlegen.
5. Falls eine IONOS-E-Mail genutzt wird: im IONOS-Konto den
   Auftragsverarbeitungsvertrag (AVV) abschließen; Datenschutz Abschnitt 7 ergänzen.

## Sicherheit: die Konten schützen

Die Website selbst hat nichts, was man knacken könnte (kein Login, keine Datenbank,
keine Formulare). Angreifbar sind die Konten, über die sie läuft:

- [ ] GitHub-Konto (Yunus): Zwei-Faktor-Anmeldung an – wer das Konto hat, kann die Seite ändern
- [ ] Google-Konto mit der Termin-Tabelle: Zwei-Faktor an; Tabelle nur für Sophie (und Yunus)
      bearbeitbar, nie „Jeder mit dem Link kann bearbeiten“
- [ ] Instagram (Sophie): Zwei-Faktor an – alle Anfragen laufen dorthin
- [ ] IONOS-Konto: Zwei-Faktor an; automatische Verlängerung der Domain anlassen
- [ ] Im Impressum eine eigene Geschäfts-E-Mail nutzen (Spam-Roboter lesen sie mit)

## Nach dem Start

- [ ] Instagram-Bio: Link auf `https://gerberxnails.de/` und zusätzlich auf
      `https://gerberxnails.de/impressum.html` (Impressumspflicht)
- [ ] Vorschau testen: Link per Chat an sich selbst schicken und das Vorschaubild prüfen
