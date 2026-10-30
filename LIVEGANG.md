# Livegang: Anleitung und Checkliste

**Kurz:** Die Website ist fertig. Für den Start fehlen nur noch die Domain und ein
paar Antworten von Sophie.

| | |
| --- | --- |
| Kosten | nur die Domain, **ca. 5 € pro Jahr**. Hosting (GitHub Pages) und HTTPS sind kostenlos. |
| Zeitaufwand | ca. 30 Minuten, danach bis zu ein paar Stunden warten, bis die Domain überall bekannt ist |
| Was nicht nötig ist | Webhosting-Paket, Homepage-Baukasten, SSL-Zertifikat, Cookie-Banner, E-Mail-Paket |

Die Website liegt bei GitHub Pages im Projekt `YunusEA12/WebseiteSophie`. Was auf `main`
landet, ist nach ein bis zwei Minuten online. Vorläufige Adresse:
<https://yunusea12.github.io/WebseiteSophie/>. Sie bleibt bis zum Livegang für Google
gesperrt („noindex“), also noch nicht öffentlich teilen.

---

## Schritt 1: Mit Sophie klären

- [ ] **W-IdNr. oder USt-IdNr.?** Die Wirtschafts-Identifikationsnummer vergibt das
      Bundeszentralamt für Steuern seit Ende 2024 nach und nach automatisch; sie steht im
      ELSTER-Postfach oder in einem Brief und beginnt mit „DE“. Gibt es eine, gehört sie ins
      Impressum (die Stelle ist in `impressum.html` markiert). Gibt es keine, ist nichts zu tun.
      Die normale Steuernummer gehört nicht ins Impressum.
- [ ] **„Gel-X“** ist eine eingetragene Marke (Aprés). Nutzt Sophie echte Aprés-Gel-X-Tips,
      darf es so heißen. Sonst überall auf „Soft-Gel-Tips“ umbenennen lassen.
- [ ] **Gutscheine:** Verkauft Sophie sie wirklich, und wie wird bezahlt (bar oder
      Überweisung)? Gültig bis 31.12. des dritten Jahres nach dem Kauf (gesetzliche Frist,
      nicht kürzer). Wird ein Gutschein per DM verkauft, auch das Widerrufs-Bild mitschicken.
      Sagt Sophie nein: Abschnitt `#gutschein` und die Menüpunkte „Gutschein“ entfernen lassen.
- [ ] **Startpreis:** Die Seite sagt „ab 50 €“ (kürzeste Länge plus Level 1). Gibt es ein Set
      ganz ohne Design für 40 €, im Rechner eine Option „ohne Design“ ergänzen lassen.
- [ ] **Fotos:** Die Kundinnen auf den gezeigten Fotos kurz um Erlaubnis fragen (Hände ohne
      Gesicht sind meist unproblematisch, sicher ist sicher).
- [ ] **Adresse im Impressum** (optional ersetzen): Die Anschrift muss „ladungsfähig“ sein, also
      eine Adresse, unter der Sophie Post und Gerichtsschreiben tatsächlich erreichen. Am
      sichersten: c/o bei einer vertrauten Person, die Post annimmt (schriftliche
      Empfangsvollmacht). Impressum-Services und virtuelle Büros sind umstritten (eRecht24 hält sie
      für nicht ladungsfähig, OLG München 29 U 8/17), ein Postfach geht nie. Bei einem Wechsel
      Adresse in `impressum.html` und `widerruf.html` tauschen und das Widerrufs-Bild neu
      erstellen lassen. Impressum, Datenschutz und Widerruf bleiben dauerhaft auf „noindex“, die
      Startseite nennt nur die Stadt.

## Schritt 2: Domain kaufen (ca. 5 € pro Jahr)

**Empfehlung: [netcup](https://www.netcup.de)** (Karlsruhe). Eine `.de`-Domain kostet dort
regulär 0,42 € im Monat, also gut 5 € im Jahr, und das auch nach dem ersten Jahr.
Gleich günstig: [INWX](https://www.inwx.de) (Berlin). IONOS, Strato und Hostinger locken mit
1 € im ersten Jahr, danach kostet die Domain dort etwa 12 bis 16 € im Jahr. Vor dem Kauf immer
auf den **Verlängerungspreis** schauen. (Preise Stand Oktober 2026.)

1. Auf netcup.de `gerberxnails.de` suchen und **nur die Domain** bestellen. Kein Webhosting,
   kein SSL-Zertifikat, kein E-Mail-Paket: HTTPS macht GitHub kostenlos, E-Mail bleibt bei GMX.
2. Die Domain gehört Sophies Geschäft, also **Sophie als Domaininhaber** eintragen. Am
   einfachsten legt Sophie das Kundenkonto selbst an; die Einstellungen unten macht ihr zusammen.
3. Bei `.de` sind die Daten von Privatpersonen im öffentlichen Whois nicht sichtbar.
4. Automatische Verlängerung anlassen, sonst ist die Domain nach einem Jahr weg.

## Schritt 3: Domain mit der Website verbinden

Die Reihenfolge schützt davor, dass jemand die Domain zwischendurch für eine fremde
GitHub-Seite nutzt.

1. **Domain bei GitHub bestätigen:** Auf github.com oben rechts aufs Profilbild →
   **Settings** → links **Pages** → **Add a domain** → `gerberxnails.de`. GitHub zeigt einen
   TXT-Eintrag (Name wie `_github-pages-challenge-YunusEA12`, dazu ein Code). Diesen beim
   Domain-Anbieter unter DNS anlegen (siehe Punkt 3), dann bei GitHub auf **Verify** klicken.
2. **Domain im Projekt eintragen:** Projekt `WebseiteSophie` → **Settings** → **Pages** →
   **Custom domain**: `gerberxnails.de` → **Save**. GitHub legt dabei die Datei `CNAME` an.
   Ab jetzt leitet die vorläufige Adresse auf die Domain um; bis Punkt 3 wirkt, ist die Seite
   kurz nicht erreichbar.
3. **DNS beim Domain-Anbieter** (bei netcup: Kundenbereich → Domains → `gerberxnails.de` →
   DNS): vorhandene A- und AAAA-Einträge für `@` und `www` (Parkseite des Anbieters) löschen,
   dann diese anlegen:

   | Typ | Host | Wert |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | AAAA | @ | 2606:50c0:8000::153 |
   | AAAA | @ | 2606:50c0:8001::153 |
   | AAAA | @ | 2606:50c0:8002::153 |
   | AAAA | @ | 2606:50c0:8003::153 |
   | CNAME | www | yunusea12.github.io. |

   Den Punkt am Ende von `yunusea12.github.io.` mit eingeben, falls das Feld ihn annimmt.
   MX-Einträge (E-Mail) nicht anfassen. Keine „Weiterleitung“ des Anbieters auf github.io
   benutzen, nur diese Einträge.
4. Warten, bis GitHub unter Settings → Pages **„DNS check successful“** zeigt (Minuten bis
   wenige Stunden), dann **„Enforce HTTPS“** anhaken.
5. Testen: <https://gerberxnails.de> und <https://www.gerberxnails.de> öffnen. Beide zeigen die
   Seite mit Schloss-Symbol.

## Schritt 4: Für Google freischalten

- [ ] In `index.html` die Zeile `<meta name="robots" content="noindex, nofollow">` samt
      Kommentar darüber löschen, dann `node stamp.mjs`, committen, pushen. Oder Claude sagen:
      *„Die Domain läuft, schalte die Seite für Google frei.“*
      Impressum, Datenschutz und Widerruf bleiben auf „noindex“, damit die Wohnadresse nicht
      über Suchmaschinen auffindbar ist.
- [ ] [Google Search Console](https://search.google.com/search-console) (kostenlos, ohne
      Tracking auf der Seite): Property „Domain“ → `gerberxnails.de` → den angezeigten
      TXT-Eintrag beim Domain-Anbieter anlegen → bestätigen. Dann unter „Sitemaps“
      `https://gerberxnails.de/sitemap.xml` einreichen. Zeigt, ob Google die Seite gefunden hat,
      mit welchen Suchbegriffen sie erscheint und ob es Fehler gibt.

## Schritt 5: Nach dem Start

- [ ] **Instagram-Bio** (bis zu 5 Links): `https://gerberxnails.de/`,
      `https://gerberxnails.de/impressum.html` und `https://gerberxnails.de/datenschutz.html`.
      Ein geschäftliches Profil braucht Impressum und Datenschutzerklärung in höchstens zwei
      Klicks; Abschnitt 7 der Datenschutzerklärung deckt das Instagram-Profil ab.
- [ ] **Vorschau testen:** den Link per Chat an dich selbst schicken und das Vorschaubild prüfen.
- [ ] **Echte Geräte:** iPhone Safari, Instagram-interner Browser (Link aus einer DM öffnen),
      wenn möglich ein Android-Handy. Einmal den Preisrechner durchspielen und die Nachricht in
      Instagram einfügen.
- [ ] Nach 1 bis 2 Wochen: bei Google „gerberxnails“ suchen und
      [PageSpeed Insights](https://pagespeed.web.dev) mit der echten Domain laufen lassen.

## Bei jeder Buchung (Sophie)

- [ ] Terminbestätigung per DM nach der Vorlage in `fuer-sophie/terminbestaetigung.txt`
      schicken und das Bild `fuer-sophie/widerruf-fuer-dm.jpg` mitsenden. Die Kundin antwortet
      mit „Ja“. Das Bild ist die vorgeschriebene Widerrufsbelehrung, das „Ja“ die Zustimmung,
      dass der Termin schon in der 14-tägigen Widerrufsfrist stattfinden darf. Fehlt beides,
      kann eine Kundin unter Umständen noch bis zu einem Jahr später widerrufen und muss für
      eine schon gemachte Behandlung nichts zahlen.
- [ ] Keine Kundentermine an Sonntagen und Feiertagen (Feiertagsgesetz BW), auch nicht in
      Instagram-Stories anbieten. Termine nur auf Anfrage per DM.

## Sicherheit: die Konten schützen

Die Website selbst hat nichts, was man knacken könnte (kein Login, keine Datenbank, keine
Formulare). Angreifbar sind die Konten, über die sie läuft:

- [ ] GitHub-Konto (Yunus): Zwei-Faktor-Anmeldung an. Wer das Konto hat, kann die Seite ändern.
- [ ] Instagram (Sophie): Zwei-Faktor an. Alle Anfragen laufen dorthin.
- [ ] Konto beim Domain-Anbieter: Zwei-Faktor an, automatische Verlängerung an.

## Pflege (laufend)

- [ ] Neue Sets alle paar Monate als Fotos tauschen (Claude macht daraus die kleinen Web-Versionen).
- [ ] Preise sofort anpassen, wenn sie sich ändern (Preisrechner, Startseite, Nachrichtentexte).
- [ ] Urlaub oder Pausen kurz auf der Seite und in der Instagram-Story nennen.
- [ ] Vor Weihnachten und Muttertag die Gutscheine in Stories zeigen.
- [ ] Einmal im Jahr die Rechtstexte prüfen und den „Stand“ in der Datenschutzerklärung anpassen.
- [ ] Nach den ersten 4 Wochen: Welche Fragen kommen in den DMs immer wieder? Die Antwort gehört
      auf die Seite.

## Optional

- **GitHub-Projekt privat stellen.** Das Projekt ist öffentlich: Code, diese Notizen und der
  Verlauf (darin Sophies Adresse, die im Impressum ohnehin stehen muss, und der frühere
  Terminkalender) sind auf github.com für alle sichtbar. Auf der Website selbst erscheinen die
  Notizen nicht (siehe Technik). Ein privates Projekt kann GitHub Pages nur mit GitHub Pro
  (4 $ im Monat) veröffentlichen. Kostenlos geht es mit Cloudflare Pages: etwa 20 Minuten
  Einrichtung, die Domain zieht dafür zu Cloudflare-DNS um, und Abschnitt 2 der
  Datenschutzerklärung muss auf Cloudflare umgestellt werden. Claude kann dabei helfen.
- **E-Mail mit eigener Domain** (z. B. `hallo@gerberxnails.de`): nicht nötig. Wenn gewünscht,
  beim Domain-Anbieter ein E-Mail-Paket buchen, dort den Auftragsverarbeitungsvertrag (AVV)
  abschließen und Abschnitt 8 der Datenschutzerklärung anpassen. Eine eigene Geschäfts-Adresse
  hält die private GMX-Adresse aus dem Impressum.
- **Google-Unternehmensprofil** (Google Maps): bringt Sichtbarkeit bei „Nageldesign Stuttgart“,
  zeigt aber bei einem Studio, zu dem Kundinnen kommen, in der Regel die Adresse öffentlich an.
  Nur, wenn Sophie das möchte.

---

## Rechtliches: Ergebnis der Prüfung (Oktober 2026)

- Bei Buchung per DM gilt das Widerrufsrecht (14 Tage). Die Ausfallgebühr greift nur, wenn die
  Kundin nicht innerhalb von 14 Tagen nach der Buchung widerruft; deshalb das „Ja“ in der
  Terminbestätigung.
- Der neue Widerrufsbutton gilt nur für Verträge, die über die eigene Website oder App
  geschlossen werden, also nicht für Buchungen per DM.
- Hosting: GitHub Pages (Datenschutz Abschnitt 2). Zieht die Seite um, diesen Abschnitt anpassen.
  Mit einem Auftragsverarbeitungsvertrag am saubersten wäre ein deutscher Hoster oder
  Cloudflare (dort ist der AVV laut Bedingungen Teil jedes Tarifs, auch des kostenlosen).
- Die Seite setzt keine Cookies, speichert nichts im Browser und lädt nichts von Dritten.
  Deshalb gibt es keinen Cookie-Banner. Das muss so bleiben, solange die Datenschutzerklärung
  das sagt.

## Technik (für Claude und dich)

- **Was veröffentlicht wird:** GitHub baut die Seite mit Jekyll. `_config.yml` schließt alle
  Arbeitsdateien aus (`*.md`, `*.mjs`, `fuer-sophie/`, die großen Original-Bilder). Neue
  Notizen oder Skripte dort eintragen oder als `.md` / `.mjs` anlegen. Bis Oktober 2026 stand
  hier eine `.nojekyll`, und GitHub lieferte jede Datei aus, auch diese Checkliste.
- **Vor jedem Veröffentlichen** `node stamp.mjs` ausführen: hängt neue Versionsnummern an
  CSS und JS, damit Handys keine alte Fassung aus dem Zwischenspeicher zeigen.
- Ändert sich das kleine Skript im `<head>` von `index.html`, muss sein Hash in der
  Sicherheitsregel (`Content-Security-Policy`) mitgeändert werden, sonst läuft es nicht.
- Lokal ansehen: `node serve.mjs`, dann <http://localhost:3000>.
