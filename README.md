# gerberxnails

Statische Website für Sophies Nagelstudio: Portfolio, Preisrechner und persönliche Terminanfragen.
Die Website benötigt im Betrieb weder npm noch eine Datenbank. HTML, CSS, JS und Assets werden direkt veröffentlicht.

## Lokal arbeiten

Node.js ab Version 20 verwenden.

```sh
npm ci
npm start
```

Die Seite ist unter http://localhost:3000 erreichbar.

```sh
npm test
npx playwright install chromium
npm run screenshot -- http://localhost:3000 desktop
npm run screenshot -- http://localhost:3000 mobile
```

Die Tests nutzen Happy DOM: Sie prüfen echte HTML-Elemente, Preise, Auswahlzustände,
Tastaturereignisse und den Anfrageablauf. Sie ersetzen keine Browser-, Layout- oder Screenreaderprüfung.
Das Screenshot-Skript verwendet Playwright ohne benutzerspezifische Windows-Pfade.
Optional kann `BROWSER_EXECUTABLE_PATH` auf eine vorhandene Chromium-Installation zeigen.

## Struktur

- `index.html`: Inhalte und Preise in `data-len`, `data-lvl`, `data-extra`, `data-add`, `data-solo`.
- `js/main.js`: Preisrechner, Navigation, Galerie und verbleibende Interaktionen.
- `js/requests.js`: Anfragevorschau mit Kopierstatus, Instagram- und E-Mail-Link.
- `css/style.css`: bestehende Markengestaltung.
- `css/requests.css`: Anfragevorschau, Skip-Link und neue Bedienelemente.
- `tests/site.test.mjs`: Regressionstests.
- `QUALITY_REVIEW.md`: Bewertung und Grenzen der Prüfung.

## Veröffentlichen

`LIVEGANG.md` enthält die noch offenen Freigabepunkte. Die Suchmaschinen-Sperre und
Entwurfshinweise erst nach Klärung der Inhalte entfernen. Vor dem Commit:

```sh
npm test
npm run stamp
```

`stamp.mjs` aktualisiert die CSS- und JS-Versionskennungen auf allen HTML-Seiten.
Bei Preisänderungen Rechner und Anfrage gemeinsam prüfen. Keine Kundendaten,
Zugangsdaten oder privaten Terminlisten in dieses öffentliche Repository aufnehmen.
