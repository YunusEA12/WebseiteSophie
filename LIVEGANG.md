# Checkliste für den Livegang

Bis alles hier abgehakt ist, ist die Seite nur ein Entwurf. Solange Impressum und
Datenschutz Platzhalter enthalten, den provisorischen Link nicht öffentlich teilen
(z. B. nicht in die Instagram-Bio).

## Inhalte (von Sophie)

- [x] Name, Straße, Stadt (Stuttgart), keine Telefonnummer – eingetragen
- [ ] Postleitzahl zur Adresse (Impressum und Datenschutz Abschnitt 1)
- [ ] E-Mail-Adresse (Impressum und Datenschutz Abschnitt 1) – muss funktionieren; z. B.
      `kontakt@gerberxnails.de`, sobald die Domain samt Postfach gekauft ist
- [ ] USt-IdNr. oder W-IdNr. (beginnt mit „DE“, Schreiben vom Bundeszentralamt für Steuern) –
      gibt es keine, den Abschnitt „Umsatzsteuer“ im Impressum löschen
- [ ] Ausfallgebühr festlegen (30 % oder 50 %) und in AGB Punkt 3 eintragen
- [ ] Danach: Hinweiskästen in `impressum.html` und `datenschutz.html` löschen
- [ ] `datenschutz.html`, Abschnitt 2: Hoster anpassen, falls die Seite nicht bei GitHub Pages bleibt
- [x] Preise bestätigt (Spannen mit dem oberen Preis; Charms „ab +1 € pro Charm“)
- [x] Fotos alle selbst gemacht
- [ ] Kundinnen der gezeigten Fotos kurz um Erlaubnis fragen (Hände ohne Gesicht sind meist
      unproblematisch, sicher ist sicher)
- [ ] Keine Kundentermine an Sonntagen und Feiertagen (Feiertagsgesetz BW) – auch nicht in
      Instagram-Stories anbieten. Termine werden nur auf Anfrage per DM vereinbart.
- [x] Original-Fotos der Arbeiten (10 Stück, eingebaut)
- [ ] Porträt von Sophie in voller Qualität (das jetzige ist sehr klein)
- [ ] Länge und Level unter den Fotos von Sophie prüfen lassen (geschätzt)
- [ ] Impressum und Datenschutz juristisch geprüft

## Technik

- [ ] In `index.html`, `impressum.html`, `datenschutz.html` die Zeile
      `<meta name="robots" content="noindex, nofollow">` samt Kommentar entfernen
- [ ] Domain `gerberxnails.de` verbinden (siehe Abschnitt „Domain bei IONOS“ unten)
- [ ] `node stamp.mjs` ausführen, dann committen und pushen

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
- [ ] Instagram (Sophie): Zwei-Faktor an – alle Anfragen laufen dorthin
- [ ] IONOS-Konto: Zwei-Faktor an; automatische Verlängerung der Domain anlassen
- [ ] Im Impressum eine eigene Geschäfts-E-Mail nutzen (Spam-Roboter lesen sie mit)

## Nach dem Start

- [ ] Instagram-Bio: Link auf `https://gerberxnails.de/` und zusätzlich auf
      `https://gerberxnails.de/impressum.html` (Impressumspflicht)
- [ ] Vorschau testen: Link per Chat an sich selbst schicken und das Vorschaubild prüfen
