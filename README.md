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
2. Zugehörige Geometrien in `public/geo/` anpassen.
3. Bei größeren Änderungen konsistente IDs zwischen Ergebnisdaten und GeoJSON sicherstellen.
4. Seiten/Visualisierungen prüfen, falls neue Parteien oder Gebietseinheiten hinzugefügt wurden.
5. Build prüfen mit `npm run build`.

Hinweis: Für die initiale V1 wurden konsistente Simulationsdaten über `scripts/generate-sim-data.mjs` erzeugt.

## Modellhinweis

Das Portal bildet bewusst ein **vereinfachtes Simulationswahlmodell** ab und rekonstruiert kein vollständiges reales deutsches Wahlrecht.
