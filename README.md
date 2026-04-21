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

## Lokale Entwicklung

```bash
npm install
npm run dev
```

App lokal: `http://localhost:3000`

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
    mappings/
      landkreise-bezirke.json
      bundestagswahlkreise-bezirke.json
      landtag-gebietssieger.json
      bundestag-gebietssieger.json
    elections/
      landtag/
        2020.json
        2024.json
        2025-ltw5.json
        2025-ltw6.json
        2026-ltw7.json
      bundestag/
        2021.json
        2025.json
        2025-btw6-ost.json
        2026-btw7-ost.json
        2026-btw8-ost.json
    metadaten.json
  geo/
    bezirke.geojson
    landkreise-ost.geojson
    btw-wahlkreise-ost.geojson
```

## Neue Wahldaten ergänzen

1. JSON-Datei im passenden Ordner unter `public/data/elections/` ergänzen.
2. Konsistente `gebietId`-Werte zu `public/geo/landkreise-ost.geojson` oder `public/geo/btw-wahlkreise-ost.geojson` verwenden.
3. Für reine Referenzbild-Karten keine Prozentwerte erfinden, sondern Gebietssieger in `public/data/mappings/landtag-gebietssieger.json` oder `public/data/mappings/bundestag-gebietssieger.json` pflegen.
4. Falls sich die Geo-Basis ändert, `node scripts/prepare-map-data.mjs` ausführen.
5. Karten- und Ergebnisseiten prüfen.
6. Build prüfen mit `npm run build`.

Hinweis: Die Kartenbasis wird jetzt über `scripts/prepare-map-data.mjs` aus amtlichen Geodaten und lokalen Simulationsdatensätzen aufbereitet. Details stehen in [MAP_DATA_NOTES.md](/Users/petzke/wahlen-portal/MAP_DATA_NOTES.md).
Das frühere Script `scripts/generate-sim-data.mjs` ist für die neue Kartenbasis nicht mehr die fachliche Referenz.

Für historische PDF-Importe gilt zusätzlich:

1. Nur Werte übernehmen, die im PDF-Endergebnis eindeutig ausgewiesen sind.
2. Kein `gebiete`-Raster mit künstlichen Regionalprozenten erfinden, wenn die Quelle nur aggregierte Gesamtwerte enthält.
3. Bei Bundestagswahlen den ostdeutschen Abschnitt als Primärquelle verwenden.
4. Optionale Metadaten wie `ordnungscode`, `pdfDatei` und `summary.detailergebnisse` mitführen.
5. Referenzkarten werden als manuelle Gebietssieger-Mappings geführt; die Website rendert weiterhin GeoJSON/D3 und zeigt keine Kartenbilder an.

Details zur Herkunft und Struktur stehen in [HISTORICAL_DATA_NOTES.md](/Users/petzke/wahlen-portal/HISTORICAL_DATA_NOTES.md).

## Seitenlogik

- `/ergebnisse/landtag/` und `/ergebnisse/bundestag/` sind die fachlichen Hauptseiten je Wahlebene.
- Dort sind Ergebnis, Visualisierung, Karte und Gebietstabelle zusammengeführt und nutzen dieselbe Datensatz-Auswahl.
- Historische PDF-Datensätze können über manuelle Gebietssieger-Mappings eine Karte anzeigen; regionale Prozentwerte bleiben dabei transparent leer.
- Die Seiten unter `/karte/landtag/` und `/karte/bundestag/` bleiben nur als schlanke Deep-Links auf die integrierten Ergebnisseiten bestehen.
- Karteninteraktion:
  - Hover und Tastaturfokus zeigen Gebietsinformationen.
  - Klick setzt einen kontrollierten Fokus auf ein Gebiet.
  - Ein Reset-Button hebt den Kartenfokus wieder auf.
- Bundestagsseiten sortieren Ergebnisblöcke als Erststimme links und Zweitstimme rechts. Erststimmen werden als Kandidatenname mit Partei in Klammern angezeigt.

## Modellhinweis

Das Portal bildet bewusst ein **vereinfachtes Simulationswahlmodell** ab und rekonstruiert kein vollständiges reales deutsches Wahlrecht.
