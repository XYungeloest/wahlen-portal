# Karten- und Wahldaten

Diese V1 ersetzt die frueheren schematischen Kartenflaechen durch lokal abgelegte, oeffentliche Geo- und Wahlgrundlagen.

## Quellen

- Bundestagswahlkreise 2025:
  - Quelle: Die Bundeswahlleiterin, Wahlkreiseinteilung fuer die Wahl zum 21. Deutschen Bundestag
  - Datei: `btw25_geometrie_wahlkreise_vg250_shp.zip`
  - URL: `https://bundeswahlleiterin.de/bundestagswahlen/2025/wahlkreiseinteilung/downloads.html`
- Wahlkreis-Gemeinde-Zuordnung 2025:
  - Quelle: Die Bundeswahlleiterin
  - Datei: `btw25_wkr_gemeinden_20241130_utf8.csv`
  - URL: `https://bundeswahlleiterin.de/bundestagswahlen/2025/wahlkreiseinteilung/downloads.html`
- Verwaltungsgrenzen fuer Landkreise, kreisfreie Staedte und Gemeinden:
  - Quelle: Bundesamt fuer Kartographie und Geodaesie, `VG250 31.12.`
  - Datei: `vg250_12-31.utm32s.shape.ebenen.zip`
  - URL: `https://gdz.bkg.bund.de/index.php/default/digitale-geodaten/verwaltungsgebiete/verwaltungsgebiete-1-250-000-stand-31-12-vg250-31-12.html`

## Aufbereitung

- Das Script [prepare-map-data.mjs](/Users/petzke/wahlen-portal/scripts/prepare-map-data.mjs) liest die amtlichen Shapefiles aus `scripts/_cache`.
- Fuer die Landtagskarte wird `VG250_KRS` auf die ostdeutschen Laender Berlin, Brandenburg, Mecklenburg-Vorpommern, Sachsen, Sachsen-Anhalt und Thueringen gefiltert.
- Fuer Hoyerswerda wird zusaetzlich die Gemeindegrenze aus `VG250_GEM` eingebunden, weil die kanonische Portalgliederung Hoyerswerda separat fuehrt.
- Fuer die Bundestagskarte werden die offiziellen Wahlkreise 2025 der Bundeswahlleiterin auf dasselbe Gebiet gefiltert.
- Geometrien werden pro amtlicher Kennung zusammengefuehrt und als lokale GeoJSON-Dateien mit gerundeten Koordinaten geschrieben.

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
  - Beispiel: `lk-12060` fuer Barnim.
  - Hoyerswerda nutzt als dokumentierte Ausnahme die Gemeinde-AGS `14625240` und damit `lk-14625240`.
- Bundestag:
  - `gebietId` basiert auf der amtlichen Wahlkreisnummer als `wk-<dreistellig>`.
  - Beispiel: `wk-064` fuer `Cottbus – Spree-Neisse`.
- Bezirke:
  - Landkreise und kreisfreie Staedte werden direkt den Portalbezirken zugeordnet.
  - Bundestagswahlkreise werden fuer Filter- und Orientierungsebene ueber die dominante Gemeindeanzahl je Portalbezirk zugeordnet.
  - Fuer einzelne Grenzfaelle existieren dokumentierte manuelle Overrides in `public/data/mappings/bundestagswahlkreise-bezirke.json`.

## Dokumentierte manuelle Ergaenzungen

- Hoyerswerda:
  - Die Portal-Spezifikation fuehrt Hoyerswerda als eigene Einheit.
  - Die V1 verwendet dafuer bewusst die amtliche Gemeindegrenze aus `VG250_GEM`.
  - Bautzen bleibt in der BKG-Kreisgeometrie erhalten; die kleine Ueberlagerung ist in der aktuellen V1 dokumentiert.
- Fehlende Landkreise in der kanonischen Bezirksliste:
  - Die in `docs/WAHLGEBIETE_UND_BEZIRKE.md` nicht explizit aufgefuehrten Kreise Erzgebirgskreis, Mittelsachsen, Meissen und Soemmerda wurden der fachlich naheliegenden Bezirksebene Sachsen bzw. Thueringen zugeordnet.
  - Diese Ergaenzung ist notwendig, damit das ostdeutsche Gebiet vollstaendig und ohne weisse Flaechen auf offiziellen Geodaten dargestellt werden kann.

## Neue Wahldatensaetze ergaenzen

1. Neue Wahldatei im passenden Ordner unter `public/data/elections/landtag/` oder `public/data/elections/bundestag/` anlegen.
2. Struktur der vorhandenen Dateien beibehalten:
   - `id`, `label`, `datum`, `typ`, `gebietsebene`
   - `summary`
   - `gebiete` mit `gebietId`, `bezirkId`, `ergebnisse`, `staerkstePartei`, `wahlbeteiligung`
3. Die `gebietId` muss exakt zu den IDs in `public/geo/landkreise-ost.geojson` bzw. `public/geo/btw-wahlkreise-ost.geojson` passen.
4. Fuer neue Vergleichslogik optional `vergleichswerte` je Gebiet setzen.
5. Nach Datenaenderungen `npm run build` ausfuehren.

## Geo-Basis aktualisieren

1. Amtliche Quelldateien nach `scripts/_cache/downloads/` laden und nach `scripts/_cache/extracted/` entpacken.
2. `node scripts/prepare-map-data.mjs` ausfuehren.
3. Geaenderte GeoJSON-, Mapping- und Election-Dateien pruefen.
4. Build mit `npm run build` validieren.
