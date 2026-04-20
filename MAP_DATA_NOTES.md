# Karten- und Wahldaten

Diese V1 ersetzt die früheren schematischen Kartenflächen durch lokal abgelegte, öffentliche Geo- und Wahlgrundlagen.

## Quellen

- Bundestagswahlkreise 2025:
  - Quelle: Die Bundeswahlleiterin, Wahlkreiseinteilung für die Wahl zum 21. Deutschen Bundestag
  - Datei: `btw25_geometrie_wahlkreise_vg250_shp.zip`
  - URL: `https://bundeswahlleiterin.de/bundestagswahlen/2025/wahlkreiseinteilung/downloads.html`
- Wahlkreis-Gemeinde-Zuordnung 2025:
  - Quelle: Die Bundeswahlleiterin
  - Datei: `btw25_wkr_gemeinden_20241130_utf8.csv`
  - URL: `https://bundeswahlleiterin.de/bundestagswahlen/2025/wahlkreiseinteilung/downloads.html`
- Verwaltungsgrenzen für Landkreise, kreisfreie Städte und Gemeinden:
  - Quelle: Bundesamt für Kartographie und Geodäsie, `VG250 31.12.`
  - Datei: `vg250_12-31.utm32s.shape.ebenen.zip`
  - URL: `https://gdz.bkg.bund.de/index.php/default/digitale-geodaten/verwaltungsgebiete/verwaltungsgebiete-1-250-000-stand-31-12-vg250-31-12.html`

## Aufbereitung

- Das Script [prepare-map-data.mjs](/Users/petzke/wahlen-portal/scripts/prepare-map-data.mjs) liest die amtlichen Shapefiles aus `scripts/_cache`.
- Für die Landtagskarte wird `VG250_KRS` auf die ostdeutschen Länder Berlin, Brandenburg, Mecklenburg-Vorpommern, Sachsen, Sachsen-Anhalt und Thüringen gefiltert.
- Für Hoyerswerda wird zusätzlich die Gemeindegrenze aus `VG250_GEM` eingebunden, weil die kanonische Portalgliederung Hoyerswerda separat führt.
- Für die Bundestagskarte werden die offiziellen Wahlkreise 2025 der Bundeswahlleiterin auf dasselbe Gebiet gefiltert.
- Geometrien werden pro amtlicher Kennung zusammengeführt und als lokale GeoJSON-Dateien mit gerundeten Koordinaten geschrieben.

## Finale Dateistruktur

```text
public/
  data/
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
  geo/
    landkreise-ost.geojson
    btw-wahlkreise-ost.geojson
```

## ID- und Mapping-Logik

- Landtag:
  - `gebietId` basiert auf amtlichen Kreiskennungen als `lk-<AGS>`.
  - Beispiel: `lk-12060` für Barnim.
  - Hoyerswerda nutzt als dokumentierte Ausnahme die Gemeinde-AGS `14625240` und damit `lk-14625240`.
- Bundestag:
  - `gebietId` basiert auf der amtlichen Wahlkreisnummer als `wk-<dreistellig>`.
  - Beispiel: `wk-064` für `Cottbus – Spree-Neiße`.
- Bezirke:
  - Landkreise und kreisfreie Städte werden direkt den Portalbezirken zugeordnet.
  - Bundestagswahlkreise werden für Filter- und Orientierungsebene über die dominante Gemeindeanzahl je Portalbezirk zugeordnet.
  - Für einzelne Grenzfälle existieren dokumentierte manuelle Overrides in `public/data/mappings/bundestagswahlkreise-bezirke.json`.

## Dokumentierte manuelle Ergänzungen

- Hoyerswerda:
  - Die Portal-Spezifikation führt Hoyerswerda als eigene Einheit.
  - Die V1 verwendet dafür bewusst die amtliche Gemeindegrenze aus `VG250_GEM`.
  - Bautzen bleibt in der BKG-Kreisgeometrie erhalten; die kleine Überlagerung ist in der aktuellen V1 dokumentiert.
- Fehlende Landkreise in der kanonischen Bezirksliste:
  - Die in `docs/WAHLGEBIETE_UND_BEZIRKE.md` nicht explizit aufgeführten Kreise Erzgebirgskreis, Mittelsachsen, Meißen und Sömmerda wurden der fachlich naheliegenden Bezirksebene Sachsen bzw. Thüringen zugeordnet.
  - Diese Ergänzung ist notwendig, damit das ostdeutsche Gebiet vollständig und ohne weiße Flächen auf offiziellen Geodaten dargestellt werden kann.

## Neue Wahldatensätze ergänzen

1. Neue Wahldatei im passenden Ordner unter `public/data/elections/landtag/` oder `public/data/elections/bundestag/` anlegen.
2. Struktur der vorhandenen Dateien beibehalten:
   - `id`, `label`, `datum`, `typ`, `gebietsebene`
   - `summary`
   - `gebiete` mit `gebietId`, `bezirkId`, `ergebnisse`, `staerkstePartei`, `wahlbeteiligung`
3. Die `gebietId` muss exakt zu den IDs in `public/geo/landkreise-ost.geojson` bzw. `public/geo/btw-wahlkreise-ost.geojson` passen.
4. Für neue Vergleichslogik optional `vergleichswerte` je Gebiet setzen.
5. Nach Datenänderungen `npm run build` ausführen.

## Neue Seitenlogik

- Die fachlichen Hauptseiten liegen unter `/ergebnisse/landtag` und `/ergebnisse/bundestag`.
- Dort werden Ergebnis, Visualisierung, Karte und Gebietstabelle gemeinsam aus derselben Datensatz-Auswahl gespeist.
- Die früheren Kartenseiten unter `/karte/landtag` und `/karte/bundestag` bleiben nur als schlanke Deep-Link-Seiten erhalten und verweisen auf die integrierten Wahlebenen.
- Karteninteraktion:
  - Hover und Tastaturfokus zeigen Gebietsdaten an.
  - Klick setzt einen kontrollierten Fokus auf ein Gebiet.
  - Ein Reset-Button hebt den Fokus wieder auf.

## Geo-Basis aktualisieren

1. Amtliche Quelldateien nach `scripts/_cache/downloads/` laden und nach `scripts/_cache/extracted/` entpacken.
2. `node scripts/prepare-map-data.mjs` ausführen.
3. Geänderte GeoJSON-, Mapping- und Election-Dateien prüfen.
4. Build mit `npm run build` validieren.
