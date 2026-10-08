# Qualitätsbewertung – 8. Oktober 2026

Ausgangsstand: `23be58c3139d198f27367670184505b9c9e2f0b9` auf `main`.

Die Werte sind eine subjektive technische Einschätzung von 1–100, kein Lighthouse-Ergebnis
und keine Zertifizierung. Bewertet werden je Kategorie Zweckmäßigkeit, Klarheit,
Robustheit und Wartbarkeit. Vorher und nachher gelten dieselben Maßstäbe.
Ungeprüfte Eigenschaften erhalten keinen Bonus. 90+ würde zusätzlich bestandene reale
Browser-/Geräteprüfungen und weniger offene technische Schulden voraussetzen.

| Kategorie | Vorher | Nachher | Grundlage |
| --- | ---: | ---: | --- |
| Programmierung und Wartbarkeit | 68 | 82 | Anfrageoberfläche als eigenes Modul; deutlich weniger ungenutzter Code; dokumentierte Werkzeuge und Regressionstests. CSS bleibt teilweise redundant. |
| Funktionsrobustheit | 65 | 84 | Sichtbare Inhalte ohne JS, native Abschnittslinks, wahrheitsgemäße Kopierfehler, persistente Nachrichtenvorschau. Echte Mobilbrowser noch offen. |
| Design und Markenwirkung | 78 | 78 | Identität und Fotos erhalten; ruhigere Bedienung und neuer Dialog umgesetzt. Ohne visuelle Browserprüfung keine höhere Designbewertung. |
| Bedienung und Anfragen | 70 | 85 | Kein automatischer App-Wechsel/Countdown; explizite Kontaktwahl; Nachricht manuell kopierbar; E-Mail mit passendem Text. |
| Performance-Grundlage | 73 | 82 | Keine künstliche Ladepause; keine dauerhaften Cursor-/Marquee-/Parallax-Schleifen; deaktivierte Effektmodule entfernt. Keine gemessenen Core Web Vitals. |
| Barrierefreiheit | 76 | 84 | Skip-Link, sichtbare Inhalte bei JS-Ausfall, nativer Anfrage-Dialog, Statusmeldungen, Pause-Taste, versteckte Preisleiste nicht fokussierbar. Kontraste/Screenreader noch ungeprüft. |
| Sicherheit und Datenschutz | 83 | 83 | Keine neuen externen Dienste oder Datenspeicher. Vorschau sendet nichts. Öffentliche Repo-Inhalte und Kontosicherheit unverändert. Keine juristische Prüfung. |
| SEO und Livegang | 55 | 55 | Metadaten vorhanden; `noindex` und Entwurfshinweise bewusst erhalten, da sachliche Freigaben fehlen. Domain/HTTPS nicht live geprüft. |

## Änderungen

- Native URL-Anker und Scroll-Wiederherstellung bleiben erhalten.
- Inhalte sind unabhängig von der erfolgreichen JS-Initialisierung sichtbar.
- Anfragevorschau: Text, explizites Kopieren, korrekter Fehlerzustand, Instagram und E-Mail.
- Keine automatische Navigation und keine falsche Meldung „Kopiert“.
- Keine zusätzliche schwebende Hinweisblase; die Preisleiste bleibt erhalten.
- Ladeanimation, eigener Cursor, magnetische Buttons, Dauer-Parallax sowie ungenutzte Ranken/Blüten entfernt.
- Die verbleibende Slideshow lässt sich pausieren und stoppt bei verborgenem Tab.
- CSS/JS-Caches versioniert; Screenshot-Werkzeug portabel; Installationsstand im Lockfile.

## Durchgeführte Prüfung

Fünf bestandene DOM-Regressionsprüfungen mit Happy DOM:

1. Alle 16 Länge-/Level-Kombinationen, Extras, Mengenobergrenze und exklusives Soak Off.
2. Anfragevorschau mit passendem Preis, E-Mail-Text und erfolgreichem Kopieren.
3. Kopierfehler mit manueller Alternative statt falscher Erfolgsbestätigung.
4. Erhalt direkter Abschnittslinks und Pfeiltastensteuerung der Auswahl.
5. Statische Grundstruktur, Skip-Link, Skriptreihenfolge und lokale Dateiverweise.

Außerdem: JavaScript-Syntaxprüfung und `git diff --check`.

**Grenze:** Es konnten keine Browser-Screenshots erstellt werden. Der reguläre Chromium-Download
schlug fehl; eine lokal bereitgestellte Chromium-Binärdatei beendete sich beim Start mit SIGTRAP.
Deshalb sind responsive Darstellung, echte Browser-Clipboard-Berechtigungen, Instagram-App-Übergabe,
CSS-Kontraste und Ladezeiten nicht als bestanden ausgewiesen. DOM-Tests simulieren diese nicht vollständig.

## Noch offen

- Desktop sowie 320/390/768 px im Browser visuell prüfen, besonders den Anfrage-Dialog.
- Anfrage auf iPhone/Safari und Android testen; E-Mail-Client und Instagram öffnen.
- Tastatur, Screenreader, 200 % Zoom und Kontraste prüfen.
- CSS-Altlasten nach visueller Absicherung weiter zusammenführen.
- Livegang-Checkliste, Inhalte, Hosting/Domain und Rechtstexte abschließen.
