# Checkliste für den Livegang

Bis alles hier abgehakt ist, ist die Seite nur ein Entwurf. Solange Impressum und
Datenschutz Platzhalter enthalten, den provisorischen Link nicht öffentlich teilen
(z. B. nicht in die Instagram-Bio).

## Inhalte (von Sophie)

- [x] Name, Straße, Stadt (Stuttgart), keine Telefonnummer – eingetragen
- [ ] Wohnadresse im Impressum ersetzen (optional): Die Anschrift muss „ladungsfähig“ sein, also
      eine Adresse, unter der Sophie Post und Gerichtsschreiben tatsächlich erreichen.
      Am sichersten: c/o bei einer vertrauten Person, die Post für sie annimmt (schriftliche
      Empfangsvollmacht). Impressum-Services und virtuelle Büros sind umstritten: eRecht24 hält
      sie für nicht ladungsfähig (OLG München, 29 U 8/17), Anbieter berufen sich auf eine
      Empfangsvollmacht. Restrisiko: Abmahnung. Postfach geht nie. Dann in `impressum.html` und
      `widerruf.html` die Adresse austauschen. Bis dahin stehen Impressum, Datenschutz und
      Widerrufsbelehrung dauerhaft auf „noindex“, und die Startseite enthält die Adresse nicht.
- [x] Postleitzahl – eingetragen
- [x] E-Mail-Adresse (gerberxnails@gmx.de) – eingetragen
- [ ] „Gel-X“ ist eine eingetragene Marke (Aprés). Nutzt Sophie echte Aprés-Gel-X-Tips, darf
      sie so heißen. Nutzt sie eine andere Marke, auf „Soft-Gel-Tips“ umbenennen lassen.
- [ ] Startpreis: Die Seite sagt jetzt „ab 50 €“ (kürzeste Länge plus Level 1), weil der
      Preisrechner immer ein Level verlangt. Gibt es ein Set ganz ohne Design für 40 €, im
      Rechner eine Option „ohne Design“ ergänzen und den Startpreis zurücksetzen.
- [ ] W-IdNr. oder USt-IdNr. klären (Sophie wusste es nicht). Die W-IdNr. vergibt das
      Bundeszentralamt für Steuern seit Ende 2024 nach und nach automatisch; sie steht im ELSTER-
      Postfach oder in einem Brief und beginnt mit „DE“. Gibt es eine, im Impressum einen Abschnitt
      „Umsatzsteuer“ mit der Nummer ergänzen. Die normale Steuernummer gehört nicht hinein.
- [x] Ausfallgebühr: 30 % bei Absage unter 48 Std., 50 % ohne Absage – in AGB Punkt 3 und auf der Karte
- [ ] Gutscheine (Abschnitt auf der Seite, Bilder für 50/75/100 € und Wunschbetrag von Claude
      erstellt): Sophie bestätigt, dass sie Gutscheine verkauft, und wie bezahlt wird (bar oder
      Überweisung). Gültig bis 31.12. des dritten Jahres nach dem Kauf eintragen (gesetzliche
      Frist, nicht kürzer). Wird der Gutschein per DM verkauft, auch das Widerrufs-Bild mitschicken.
      Sagt Sophie nein: Abschnitt `#gutschein` und die beiden Menüpunkte „Gutschein“ entfernen.
- [ ] Danach: Hinweiskästen in `impressum.html` und `datenschutz.html` löschen
- [ ] `datenschutz.html`, Abschnitt 2: Hoster anpassen, falls die Seite nicht bei GitHub Pages bleibt
- [x] Preise bestätigt (Spannen mit dem oberen Preis; Charms „ab +1 €“ und 3D „ab +5 €“ je Stück, im Rechner 1 bis 10 Stück wählbar)
- [x] Fotos alle selbst gemacht
- [ ] Kundinnen der gezeigten Fotos kurz um Erlaubnis fragen (Hände ohne Gesicht sind meist
      unproblematisch, sicher ist sicher)
- [ ] Keine Kundentermine an Sonntagen und Feiertagen (Feiertagsgesetz BW) – auch nicht in
      Instagram-Stories anbieten. Termine werden nur auf Anfrage per DM vereinbart.
- [x] Original-Fotos der Arbeiten (10 Stück, eingebaut)
- [x] Porträt von Sophie (eingebaut, eng um das Gesicht zugeschnitten)
- [x] Foto für Level 1 (Classic Red)
- [x] Länge und Level unter den Fotos – von Sophie korrigiert
- [x] Gel-Auffüllen kostet wie Gel-X
- [x] Instagram: Nachrichtenanfragen von allen erlaubt
- [x] iPhone-Test: Instagram öffnet sich, Einfügen klappt
- [x] Rechtliche Gegenprüfung (Oktober 2026). Ergebnis:
      Widerrufsrecht gilt bei Buchung per DM; die Ausfallgebühr greift nur, wenn die Kundin nicht
      innerhalb von 14 Tagen nach der Buchung widerruft. Widerrufsbutton: gilt nur für Verträge,
      die über die eigene Website oder App geschlossen werden, also nicht für Buchung per DM.
      Auftragsverarbeitung: am saubersten mit einem deutschen Hoster (siehe „Hosting“ unten).
- [ ] Jede Terminbestätigung per DM so schicken (die Kundin antwortet mit „Ja“), dazu das Bild
      der Widerrufsbelehrung (widerruf-fuer-dm.jpg, von Claude erstellt; nach einer Adressänderung neu erstellen lassen) mitsenden:
      „Dein Termin am … um … ist bestätigt 💅
      Set: … · Preis: … € (bar)
      Adresse: …
      Es gelten meine Studio Policy und AGB: https://gerberxnails.de/#agb
      Die Widerrufsbelehrung schicke ich dir als Bild mit.
      Bitte bestätige kurz mit Ja: Ich möchte, dass die Behandlung zum vereinbarten Termin
      stattfindet, auch wenn die Widerrufsfrist dann noch läuft. Mir ist bekannt, dass mein
      Widerrufsrecht erlischt, sobald die Behandlung vollständig erbracht ist.“

- [ ] GitHub-Projekt auf „privat“ stellen, sobald die Seite bei IONOS liegt (oder GitHub Pro
      nutzen): Alte Versionen im Projekt enthalten noch den früheren Terminkalender.

## Technik

- [ ] Nur in `index.html` die Zeile `<meta name="robots" content="noindex, nofollow">` samt
      Kommentar entfernen. Impressum, Datenschutz und Widerruf bleiben auf „noindex“, damit die
      Wohnadresse nicht über Suchmaschinen auffindbar ist.
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

- [ ] Instagram-Bio (bis zu 5 Links möglich): `https://gerberxnails.de/`,
      `https://gerberxnails.de/impressum.html` und `https://gerberxnails.de/datenschutz.html`.
      Ein geschäftliches Profil braucht Impressum und Datenschutzerklärung in höchstens zwei
      Klicks; Abschnitt 7 der Datenschutzerklärung deckt das Instagram-Profil ab.
- [ ] Vorschau testen: Link per Chat an sich selbst schicken und das Vorschaubild prüfen
- [ ] Google Search Console (kostenlos, ohne Tracking auf der Seite): Domain per TXT-Eintrag bei
      IONOS bestätigen, `https://gerberxnails.de/sitemap.xml` einreichen. Zeigt, ob Google die
      Seite gefunden hat, mit welchen Suchbegriffen sie erscheint und ob es Fehler gibt.
- [ ] Nach 1 bis 2 Wochen: bei Google „gerberxnails“ suchen und PageSpeed Insights mit der
      echten Domain laufen lassen
- [ ] Echte Geräte: iPhone Safari, Instagram-interner Browser (Link aus einer DM), wenn möglich
      ein Android-Handy

## Pflege (laufend)

- [ ] Neue Sets alle paar Monate als Fotos tauschen (Claude macht daraus die kleinen Web-Versionen)
- [ ] Preise sofort anpassen, wenn sie sich ändern (Preisrechner, Startseite, Nachrichtentexte)
- [ ] Urlaub oder Pausen kurz auf der Seite und in der Instagram-Story nennen
- [ ] Vor Weihnachten und Muttertag die Gutscheine in Stories zeigen
- [ ] Einmal im Jahr die Rechtstexte prüfen lassen und den „Stand“ in der Datenschutzerklärung anpassen
- [ ] Nach den ersten 4 Wochen: Welche Fragen kommen in den DMs immer wieder? Die Antwort gehört auf die Seite.
