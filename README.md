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
    elections/
      landtag/
        2020.json
        2024.json
      bundestag/
        2021.json
        2025.json
    metadaten.json
  geo/
    bezirke.geojson
    landkreise-ost.geojson
    btw-wahlkreise-ost.geojson
```

## Neue Wahldaten ergänzen

1. JSON-Datei im passenden Ordner unter `public/data/elections/` ergänzen.
2. Konsistente `gebietId`-Werte zu `public/geo/landkreise-ost.geojson` oder `public/geo/btw-wahlkreise-ost.geojson` verwenden.
3. Falls sich die Geo-Basis ändert, `node scripts/prepare-map-data.mjs` ausführen.
4. Karten- und Ergebnisseiten prüfen.
5. Build prüfen mit `npm run build`.

Hinweis: Die Kartenbasis wird jetzt über `scripts/prepare-map-data.mjs` aus amtlichen Geodaten und lokalen Simulationsdatensätzen aufbereitet. Details stehen in [MAP_DATA_NOTES.md](/Users/petzke/wahlen-portal/MAP_DATA_NOTES.md).
Das frühere Script `scripts/generate-sim-data.mjs` ist für die neue Kartenbasis nicht mehr die fachliche Referenz.

## Seitenlogik

- `/ergebnisse/landtag/` und `/ergebnisse/bundestag/` sind die fachlichen Hauptseiten je Wahlebene.
- Dort sind Ergebnis, Visualisierung, Karte und Gebietstabelle zusammengeführt und nutzen dieselbe Datensatz-Auswahl.
- Die Seiten unter `/karte/landtag/` und `/karte/bundestag/` bleiben nur als schlanke Deep-Links auf die integrierten Ergebnisseiten bestehen.
- Karteninteraktion:
  - Hover und Tastaturfokus zeigen Gebietsinformationen.
  - Klick setzt einen kontrollierten Fokus auf ein Gebiet.
  - Ein Reset-Button hebt den Kartenfokus wieder auf.

## Modellhinweis

Das Portal bildet bewusst ein **vereinfachtes Simulationswahlmodell** ab und rekonstruiert kein vollständiges reales deutsches Wahlrecht.
