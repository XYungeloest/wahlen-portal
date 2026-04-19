# Wahlportal Freistaat Ostdeutschland

Produktionsnahe V1 des offiziellen Simulations-Wahlportals unter `wahlen.freistaat-ostdeutschland.de`.

## Stack

- Next.js 15 (App Router)
- Static Export (`output: "export"`)
- TypeScript
- Tailwind CSS 4
- D3.js
- Statische JSON- und GeoJSON-Daten im Repository
- Zielhosting: Cloudflare Pages

## Kartenbasis (SVG-Upgrade)

Die Karten wurden auf hochwertige, aus den bereitgestellten SVG-Quellen abgeleitete Geometrien umgestellt:

- `Wahlkreise.svg` -> Bundestagswahlkreis-Karte (nur Ostdeutschland)
- `Landkreise.svg` -> Landtags-Karte auf Landkreis-/kreisfreie-Stadt-Ebene (nur Ostdeutschland)

Zusätzlich wird eine statische Mapping-Datei erzeugt:

- `public/data/bundestagswahlkreis-mapping-2025.json`
  - enthält `id`, `nummer`, `name`, `bezirkId`, `shapeKey`
  - markiert gemischte Bezirkszuordnungen explizit

Die amtliche Referenz für Nummerierung/Namen der Bundestagswahlkreise 2025 ist die Bundeswahlleiterin:

- https://www.bundeswahlleiterin.de/bundestagswahlen/2025/wahlkreiseinteilung/downloads.html

## Lokale Entwicklung

```bash
npm install
npm run dev
```

App lokal: `http://localhost:3000`

Optional (nur bei Karten-Neugenerierung):

```bash
python3 scripts/build_svg_maps.py
```

Das Skript lädt amtliche Referenz-CSV-Dateien der Bundeswahlleiterin in `scripts/_cache/` und erzeugt daraus:

- `public/geo/landkreise.geojson`
- `public/geo/bundestagswahlkreise.geojson`
- `public/data/bundestagswahlkreise.json`
- `public/data/bundestagswahlkreis-mapping-2025.json`
- aktualisierte `public/data/bundestagswahl-2025.json` (Wahlkreis-Ebene)

## Build

```bash
npm run build
```

Der statische Export landet im Ordner `out/`.

## Deployment auf Cloudflare Pages

Empfohlene Einstellungen:

- Build command: `npm run build`
- Output directory: `out`
- Framework preset: `Next.js (Static HTML Export)`
- Node.js: 20
- Domain: `wahlen.freistaat-ostdeutschland.de`

Optional mit Wrangler (lokal):

```bash
npx wrangler pages deploy out
```

## Datenstruktur

```text
public/
  data/
    parteien.json
    bezirke.json
    landkreise.json
    bundestagswahlkreise.json
    bundestagswahlkreis-mapping-2025.json
    landtagswahl-2024.json
    bundestagswahl-2025.json
    metadaten.json
  geo/
    bezirke.geojson
    landkreise.geojson
    bundestagswahlkreise.geojson
```

## Neue Wahldaten ergänzen

1. JSON-Dateien in `public/data/` ergänzen oder aktualisieren.
2. Bei Änderungen an Kartengeometrien das SVG-Mapping neu erzeugen: `python3 scripts/build_svg_maps.py`.
3. Konsistente IDs zwischen Ergebnisdaten und `public/geo/*.geojson` sicherstellen.
4. Bei neuen Bundestagswahlkreisen zusätzlich `bundestagswahlkreis-mapping-2025.json` prüfen.
5. Seiten/Visualisierungen prüfen (Ergebnisse, Karten, Tabellenalternativen).
6. Build prüfen mit `npm run build`.

## Hinweise zu Modellannahmen in den Karten

- Es werden ausschließlich Ost-Gebiete dargestellt; westdeutsche Flächen werden bei der Extraktion verworfen.
- Die SVG-Pfade werden topologisch als Outer-/Hole-Ringe verarbeitet; dadurch werden Inset-/Loch-Artefakte reduziert.
- Für drei Wahlkreise mit gemischtem Bezirkszuschnitt wird ein primärer Bezirk gesetzt und die Mehrfachzuordnung im Mapping ausgewiesen.
- Berliner Inset-Dubletten aus der Bundestags-SVG werden automatisch entfernt; es bleibt die geographisch korrekte Berlin-Lage im Ost-Ausschnitt.
- Für Hoyerswerda wird eine modellierte flächige Teilgeometrie aus dem Bautzen-Polygon abgeleitet (keine Punktmarke); Bautzen erhält dafür eine korrespondierende Innenaussparung.
- Einzelne in der Simulation fehlende Zuschnitte werden transparent und nur auf Landkreisebene (nicht auf kreisfreie Städte) zugeschlagen; die betroffenen Codes sind als `modellierteZuordnungCodes` in `landkreise.geojson` dokumentiert.

Hinweis: Für die initiale V1 wurden konsistente Simulationsdaten über `scripts/generate-sim-data.mjs` erzeugt.

## Modellhinweis

Das Portal bildet bewusst ein **vereinfachtes Simulationswahlmodell** ab und rekonstruiert kein vollständiges reales deutsches Wahlrecht.
