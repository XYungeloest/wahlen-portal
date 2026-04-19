import { KartenModul } from "@/components/maps/kartenmodul";
import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { parteiFarbenMap } from "@/lib/parteien";
import type { GeoFeatureCollection } from "@/lib/types";
import {
  getBezirke,
  getBundestagswahl2025,
  getBundestagswahlkreiseGeo,
  getLandkreiseGeo,
  getMetadaten,
  getParteien,
} from "@/lib/wahldaten";

const BERLIN_DISPLAY_ID = "bwk-berlin";

type Point = [number, number];
type Polygon = Point[][];

function getFeatureBox(features: GeoFeatureCollection["features"]) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const feature of features) {
    const polygons =
      feature.geometry.type === "Polygon"
        ? [feature.geometry.coordinates as number[][][]]
        : (feature.geometry.coordinates as number[][][][]);

    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const point of ring) {
          minX = Math.min(minX, point[0]);
          minY = Math.min(minY, point[1]);
          maxX = Math.max(maxX, point[0]);
          maxY = Math.max(maxY, point[1]);
        }
      }
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function transformPoint([x, y]: Point, scaleX: number, scaleY: number, offsetX: number, offsetY: number): Point {
  return [x * scaleX + offsetX, y * scaleY + offsetY];
}

function transformGeometry(
  geometry: GeoFeatureCollection["features"][number]["geometry"],
  scaleX: number,
  scaleY: number,
  offsetX: number,
  offsetY: number,
): GeoFeatureCollection["features"][number]["geometry"] {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: (geometry.coordinates as number[][][]).map((ring) =>
        ring.map((point) => transformPoint(point as Point, scaleX, scaleY, offsetX, offsetY)),
      ),
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: (geometry.coordinates as number[][][][]).map((polygon) =>
      polygon.map((ring) => ring.map((point) => transformPoint(point as Point, scaleX, scaleY, offsetX, offsetY))),
    ),
  };
}

function polygonArea(polygon: Polygon) {
  const outer = polygon[0] ?? [];
  let area = 0;
  for (let index = 0; index < outer.length - 1; index += 1) {
    const [x1, y1] = outer[index];
    const [x2, y2] = outer[index + 1];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2;
}

function keepPrimaryPolygon(geometry: GeoFeatureCollection["features"][number]["geometry"]) {
  if (geometry.type === "Polygon") {
    return geometry;
  }

  const polygons = geometry.coordinates as number[][][][];
  if (polygons.length <= 1) {
    return geometry;
  }

  const largestIndex = polygons.reduce((bestIndex, polygon, index, list) => {
    return polygonArea(polygon as Polygon) > polygonArea(list[bestIndex] as Polygon) ? index : bestIndex;
  }, 0);

  return {
    type: "Polygon" as const,
    coordinates: polygons[largestIndex],
  };
}

function buildBerlinDisplayGeometry(
  bundestagGeo: GeoFeatureCollection,
  landkreiseGeo: GeoFeatureCollection,
): GeoFeatureCollection["features"][number]["geometry"] | null {
  const berlinLandkreis = landkreiseGeo.features.find((feature) => String(feature.properties.id ?? "") === "lk-001-berlin");
  if (!berlinLandkreis) {
    return null;
  }

  const berlinBundestagFeatures = bundestagGeo.features.filter((feature) => String(feature.properties.bezirkId ?? "") === "berlin");
  if (!berlinBundestagFeatures.length) {
    return berlinLandkreis.geometry;
  }

  const bundestagBerlinBox = getFeatureBox(berlinBundestagFeatures);
  const landkreisBerlinBox = getFeatureBox([berlinLandkreis]);
  if (!bundestagBerlinBox.width || !bundestagBerlinBox.height || !landkreisBerlinBox.width || !landkreisBerlinBox.height) {
    return berlinLandkreis.geometry;
  }

  const scaleX = bundestagBerlinBox.width / landkreisBerlinBox.width;
  const scaleY = bundestagBerlinBox.height / landkreisBerlinBox.height;
  const offsetX = bundestagBerlinBox.minX - landkreisBerlinBox.minX * scaleX;
  const offsetY = bundestagBerlinBox.minY - landkreisBerlinBox.minY * scaleY;

  const transformed = transformGeometry(berlinLandkreis.geometry, scaleX, scaleY, offsetX, offsetY);
  return keepPrimaryPolygon(transformed);
}

function aggregateBundestagMap(
  geo: GeoFeatureCollection,
  landkreiseGeo: GeoFeatureCollection,
  wahl: Awaited<ReturnType<typeof getBundestagswahl2025>>,
) {
  const berlinRows = wahl.ergebnisseWahlkreise.filter((entry) => entry.bezirkId === "berlin");
  const berlinGeometry = buildBerlinDisplayGeometry(geo, landkreiseGeo);

  const mapGeo: GeoFeatureCollection = {
    ...geo,
    features: [
      ...geo.features.filter((feature) => String(feature.properties.bezirkId ?? "") !== "berlin"),
      ...(berlinGeometry
        ? [
            {
              type: "Feature" as const,
              properties: {
                id: BERLIN_DISPLAY_ID,
                name: "Berlin",
                bezirkId: "berlin",
                bezirk: "Berlin",
                source: "landkreise.geojson (Berlin-Darstellungsgeometrie)",
              },
              geometry: berlinGeometry,
            },
          ]
        : []),
    ],
  };

  const nonBerlinData = wahl.ergebnisseWahlkreise
    .filter((entry) => entry.bezirkId !== "berlin")
    .map((entry) => ({
      id: entry.wahlkreisId,
      name: entry.wahlkreis,
      bezirkId: entry.bezirkId,
      bezirk: entry.bezirk,
      winner: entry.staerkstePartei,
      winnerPercent: entry.staerksteParteiProzent,
    }));

  const aggregatedPartyResult: Record<string, number> = {};
  for (const row of berlinRows) {
    for (const [partei, wert] of Object.entries(row.parteien)) {
      aggregatedPartyResult[partei] = (aggregatedPartyResult[partei] ?? 0) + wert;
    }
  }

  const divisor = Math.max(berlinRows.length, 1);
  for (const partei of Object.keys(aggregatedPartyResult)) {
    aggregatedPartyResult[partei] = Number((aggregatedPartyResult[partei] / divisor).toFixed(1));
  }

  const [winner, winnerPercent] = Object.entries(aggregatedPartyResult).sort((a, b) => b[1] - a[1])[0] ?? ["Volksfront", 0];

  const berlinData = berlinRows.length
    ? [
        {
          id: BERLIN_DISPLAY_ID,
          name: "Berlin",
          bezirkId: "berlin",
          bezirk: "Berlin",
          winner,
          winnerPercent,
        },
      ]
    : [];

  return {
    mapGeo,
    mapData: [...nonBerlinData, ...berlinData],
  };
}

export default async function KarteBundestagPage() {
  const [bezirke, geo, landkreiseGeo, wahl, parteien, metadaten] = await Promise.all([
    getBezirke(),
    getBundestagswahlkreiseGeo(),
    getLandkreiseGeo(),
    getBundestagswahl2025(),
    getParteien(),
    getMetadaten(),
  ]);

  const partyColors = parteiFarbenMap(parteien);
  const { mapGeo, mapData } = aggregateBundestagMap(geo, landkreiseGeo, wahl);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karte Bundestagswahl"
        description="D3-Karte der Bundestagswahlkreise mit Darstellung der stärksten Partei je Wahlkreis; Berlin wird aus Darstellungsgründen als ein Kartenobjekt zusammengefasst."
      />
      <KartenModul
        title="Stärkste Partei nach Bundestagswahlkreis"
        bezirke={bezirke}
        geo={mapGeo}
        partyColors={partyColors}
        firstColumnLabel="Bundestagswahlkreis"
        data={mapData}
      />
      <SimulationHinweis text={`${metadaten.portal.simulationshinweis} ${wahl.modellhinweis}`} />
    </div>
  );
}
