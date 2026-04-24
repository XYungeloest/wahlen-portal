# Historische Wahldaten aus PDF- und Wiki-Endergebnissen

## Verwendete Quellen

Landtag:

- `wahlen ohne karte/Endergebnis_LTWOst1.wiki`
- `wahlen ohne karte/Endergebnis_LTWOst2.wiki`
- `wahlen ohne karte/Endergebnis_LTWOst3.pdf`
- `wahlen ohne karte/Endergebnis_LTWOst4.pdf`
- `LTWOst5_Endergebnis.pdf`
- `LTWOst6_Endergebnis.pdf`
- `LTWOst7_Endergebnis.pdf`

Bundestag:

- `wahlen ohne karte/Endergebnis_BTW2.wiki`
- `wahlen ohne karte/Endergebnis_BTW3.pdf`
- `wahlen ohne karte/Endergebnis_BTW4.pdf`
- `wahlen ohne karte/Endergebnis_BTW5.pdf`
- `BTW6_Endergebnis.pdf`
- `BTW7_Endergebnis.pdf`
- `BTW8_Endergebnis.pdf`

## Sicher übernommene Felder

Aus den Quellen wurden nur Felder übernommen, die eindeutig tabelliert oder ausdrücklich benannt waren:

- Wahlname
- Wahldatum
- Ordnungscode
- Wahlberechtigte
- abgegebene bzw. gültige Stimmen
- Wahlbeteiligung
- Stimmen je Partei
- Prozentwerte je Partei
- Sitzzahlen, sofern im PDF ausgewiesen
- Direktmandat Ostdeutschland, sofern über den Ost-Abschnitt oder die Zusammenfassung der Direktmandate eindeutig ableitbar

## Bundestag: verwendete Ost-Abschnitte

- `Endergebnis_BTW2.wiki`: Abschnitt `Ostdeutschland`
- `Endergebnis_BTW3.pdf`: Abschnitt `Landesergebnis Wahlkreis Ost`
- `Endergebnis_BTW4.pdf`: Abschnitt `Landesergebnis Wahlkreis Ost`
- `Endergebnis_BTW5.pdf`: Abschnitt `Landesergebnis Wahlkreis Ost`
- `BTW6_Endergebnis.pdf`: Abschnitt `Landesergebnis Wahlkreis Ost`
- `BTW7_Endergebnis.pdf`: Abschnitt `Wahlkreisergebnis Wahlkreis 02 - Ostdeutschland`
- `BTW8_Endergebnis.pdf`: Abschnitt `Wahlkreisergebnis Wahlkreis 02 – Ostdeutschland`

Die eigentliche Portalansicht für historische Bundestagsdaten basiert auf diesen Ost-Abschnitten, nicht auf dem vollständigen Bundesergebnis.

## Datenstruktur im Portal

Die historischen Datensätze liegen unter:

- `public/data/elections/landtag/2025-ltw5.json`
- `public/data/elections/landtag/2025-ltw6.json`
- `public/data/elections/landtag/2026-ltw7.json`
- `public/data/elections/bundestag/2025-btw6-ost.json`
- `public/data/elections/bundestag/2026-btw7-ost.json`
- `public/data/elections/bundestag/2026-btw8-ost.json`

Zusätzlich wurden die älteren Quellen ohne Kartenauflösung ergänzt:

- `public/data/elections/landtag/2024-ltw1.json`
- `public/data/elections/landtag/2024-ltw2.json`
- `public/data/elections/landtag/2024-ltw3.json`
- `public/data/elections/landtag/2025-ltw4.json`
- `public/data/elections/bundestag/2024-btw2-ost.json`
- `public/data/elections/bundestag/2024-btw3-ost.json`
- `public/data/elections/bundestag/2025-btw4-ost.json`
- `public/data/elections/bundestag/2025-btw5-ost.json`

Wichtige Felder:

- `summary.gesamtergebnis`: primärer Ergebnisblock für die Seite
- `summary.detailergebnisse`: getrennte, tabellarisch belastbare Ergebnisblöcke
- `summary.sitzverteilung`: nur dort gesetzt, wo das PDF Sitze ausweist
- `summary.direktmandat`: nur bei Bundestagsdatensätzen gesetzt
- `gebiete`: regionale Gebietssieger direkt im jeweiligen Wahldatensatz, ohne künstliche Regionalprozentwerte; bei Quellen ohne Kartenauflösung bleibt `gebiete` leer

## Datensätze ohne Karte

Die älteren Quellen im Ordner `wahlen ohne karte` enthalten keine belastbare Kartenbasis für die Portalebene. Deshalb gilt:

- `gebiete` bleibt leer
- der Kartenbereich wird bei Auswahl dieser Datensätze vollständig ausgeblendet
- Wahlbeteiligung, Wahlberechtigte oder Stimmen werden als `0` gespeichert, wenn sie in der Quelle nicht eindeutig ausgewiesen sind
- die UI zeigt solche Felder als `nicht ausgewiesen`

## Manuelle Kartenbefüllung aus Referenzbildern

Die bereitgestellten Kartenbilder werden nur als visuelle Referenz genutzt. Sie werden nicht gerendert, nicht als Hintergrundbild eingebunden und nicht zur Laufzeit geladen.

Die Gebietssieger sind direkt in den normalen Wahldatensätzen gepflegt:

- `public/data/elections/landtag/2025-ltw5.json`
- `public/data/elections/landtag/2025-ltw6.json`
- `public/data/elections/landtag/2026-ltw7.json`
- `public/data/elections/bundestag/2025-btw6-ost.json`
- `public/data/elections/bundestag/2026-btw7-ost.json`
- `public/data/elections/bundestag/2026-btw8-ost.json`

Die D3-Karten verwenden diese `gebiete`-Einträge zusammen mit den lokalen GeoJSON-Dateien. Es gibt dafür keinen separaten Mapping-Layer im Loader.

Wichtig:

- Die Gebietseinträge enthalten keine regionalen Prozentwerte.
- Schraffuren aus den Referenzkarten werden als Gleichstand mehrerer stärkster Kräfte modelliert.
- Falls später echte Gebietswerte vorliegen, können sie direkt in `ergebnisse` und `staerksteParteiProzent` ergänzt werden.

## Partei-Normierung

Im sichtbaren UI bleiben die aus den PDFs übernommenen Parteinamen erhalten, soweit sie fachlich klar lesbar sind.

Für Farben und Wiedererkennung nutzt das Portal vorsichtige Aliase, zum Beispiel:

- `PLA` -> Farbwelt von `LDP`
- `SGB` -> Farbwelt von `DEMOS Ost`
- `NFP`, `DHP` und `PATRIOTEN` -> Farbwelt von `Patrioten`
- `OiB` -> Ostpartei/Farbwelt von `DRiB`
- `CDP Ost` oder historische CDP-Varianten -> Farbwelt der `CDP Ost`
- DEMOS-Varianten -> Farbwelt von `DEMOS Ost`
- FRP-Varianten -> Farbwelt von `FRP`
- `DIE PATRIOTEN` / `Die ostdeutschen Patrioten` -> Farbwelt von `Patrioten`

Dokumentierte Sonderfälle:

- Das PDF `BTW6_Endergebnis.pdf` schreibt `Voksfront`; im Portal wird dies als `Volksfront` ausgegeben.
- Historische Namen wie `Bündnis Demokratie Europa an der Elbe` oder `Ostdeutschland in Bewegung` bleiben als eigene sichtbare Bezeichnungen erhalten.

## Keine nachträglichen Regionalprozente

Die historischen PDFs enthalten keine belastbare ostinterne Prozentauflösung für das Portalmodell. Deshalb gilt:

- keine erfundene Landkreisverteilung mit Prozentwerten für historische Landtage
- keine erfundene Aufteilung von Prozentwerten auf Bundestagswahlkreise für historische Ost-Datensätze
- Kartenfarben entstehen nur aus den manuell übertragenen Gebietssiegern

## Manuelle Kurzprüfung empfohlen

1. Datum und Ordnungscode je Datensatz gegen das jeweilige PDF gegenlesen.
2. Bei `BTW6_Endergebnis.pdf` die im PDF sichtbare Schreibweise `Voksfront` vs. Portalnormalisierung `Volksfront` kurz bewusst prüfen.
3. Prüfen, ob die historischen Datensätze in der Datensatz-Auswahl in der gewünschten Reihenfolge erscheinen.
4. Auf den Bundestagsseiten beide Balkendiagramme pro historischem Datensatz gegen den PDF-Abschnitt querlesen; Erststimme muss links, Zweitstimme rechts stehen.
5. Gebietssieger besonders in kleinen Stadtgebieten und bei Schraffuren visuell gegenprüfen.
