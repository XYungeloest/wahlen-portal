# Historische Wahldaten aus PDF-Endergebnissen

## Verwendete PDFs

Landtag:

- `LTWOst5_Endergebnis.pdf`
- `LTWOst6_Endergebnis.pdf`
- `LTWOst7_Endergebnis.pdf`

Bundestag:

- `BTW6_Endergebnis.pdf`
- `BTW7_Endergebnis.pdf`
- `BTW8_Endergebnis.pdf`

## Sicher übernommene Felder

Aus den PDFs wurden nur Felder übernommen, die eindeutig tabelliert oder ausdrücklich benannt waren:

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

Wichtige Felder:

- `summary.gesamtergebnis`: primärer Ergebnisblock für die Seite
- `summary.detailergebnisse`: getrennte, tabellarisch belastbare Ergebnisblöcke
- `summary.sitzverteilung`: nur dort gesetzt, wo das PDF Sitze ausweist
- `summary.direktmandat`: nur bei Bundestagsdatensätzen gesetzt
- `gebiete: []`: die historischen JSON-Dateien bleiben frei von künstlichen Regionalprozenten
- manuelle Gebietssieger-Mappings: `public/data/mappings/landtag-gebietssieger.json` und `public/data/mappings/bundestag-gebietssieger.json`

## Manuelle Kartenbefüllung aus Referenzbildern

Die bereitgestellten Kartenbilder werden nur als visuelle Referenz genutzt. Sie werden nicht gerendert, nicht als Hintergrundbild eingebunden und nicht zur Laufzeit geladen.

Stattdessen enthält das Repository getrennte Mapping-Dateien:

- `public/data/mappings/landtag-gebietssieger.json`: Landkreis bzw. kreisfreie Stadt -> stärkste Partei für LTW 5, LTW 6 und LTW 7
- `public/data/mappings/bundestag-gebietssieger.json`: Bundestagswahlkreis -> stärkste Partei für BTW 6, BTW 7 und BTW 8

Beim Laden der Wahldatensätze ergänzt `src/lib/wahldaten.ts` diese Mapping-Layer um die Stammdaten aus `landkreise.json` bzw. `bundestagswahlkreise.json`. Die D3-Karten verwenden danach weiterhin die lokalen GeoJSON-Dateien.

Wichtig:

- Die Mappings enthalten keine regionalen Prozentwerte.
- Schraffuren aus den Referenzkarten werden als Gleichstand mehrerer stärkster Kräfte modelliert.
- Die Kartenansicht deaktiviert für diese Datensätze regionale Parteiergebnis-Metriken und weist transparent auf die Mapping-Quelle hin.

## Partei-Normierung

Im sichtbaren UI bleiben die aus den PDFs übernommenen Parteinamen erhalten, soweit sie fachlich klar lesbar sind.

Für Farben und Wiedererkennung nutzt das Portal vorsichtige Aliase, zum Beispiel:

- `CDP Ost` oder historische CDP-Varianten -> Farbwelt von `CPD Ost`
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
5. Referenzbild-Mappings besonders in kleinen Stadtgebieten und bei Schraffuren visuell gegenprüfen.
