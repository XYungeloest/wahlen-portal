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

const BERLIN_GROUP_ID = "bwk-berlin-gesamt";

type Point = [number, number];
type Ring = Point[];
type Polygon = Ring[];

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

function polygonCentroid(polygon: Polygon): Point {
  const outer = polygon[0] ?? [];
  if (outer.length < 2) {
    return [0, 0];
  }

  let areaSum = 0;
  let centerX = 0;
  let centerY = 0;

  for (let index = 0; index < outer.length - 1; index += 1) {
    const [x1, y1] = outer[index];
    const [x2, y2] = outer[index + 1];
    const cross = x1 * y2 - x2 * y1;
    areaSum += cross;
    centerX += (x1 + x2) * cross;
    centerY += (y1 + y2) * cross;
  }

  if (Math.abs(areaSum) < 0.0001) {
    const total = outer.length || 1;
    const sums = outer.reduce<[number, number]>((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
    return [sums[0] / total, sums[1] / total];
  }

  const factor = 1 / (3 * areaSum);
  return [centerX * factor, centerY * factor];
}

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

function filterInsetPolygons(
  geometry: GeoFeatureCollection["features"][number]["geometry"],
): GeoFeatureCollection["features"][number]["geometry"] {
  const polygons =
    geometry.type === "Polygon"
      ? [geometry.coordinates as number[][][]]
      : (geometry.coordinates as number[][][][]);

  if (polygons.length <= 1) {
    return geometry;
  }

  const areas = polygons.map((polygon) => polygonArea(polygon as Polygon));
  const primaryIndex = areas.reduce((bestIndex, area, index, list) => (area > list[bestIndex] ? index : bestIndex), 0);
  const primaryCentroid = polygonCentroid(polygons[primaryIndex] as Polygon);
  const keepThreshold = 550;

  const keptPolygons = polygons.filter((polygon, index) => {
    if (index === primaryIndex) {
      return true;
    }
    const centroid = polygonCentroid(polygon as Polygon);
    return Math.hypot(centroid[0] - primaryCentroid[0], centroid[1] - primaryCentroid[1]) <= keepThreshold;
  });

  if (keptPolygons.length === 1) {
    return {
      type: "Polygon",
      coordinates: keptPolygons[0],
    };
  }

  return {
    type: "MultiPolygon",
    coordinates: keptPolygons,
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

  const bundestagReference = bundestagGeo.features.filter((feature) => String(feature.properties.bezirkId ?? "") !== "berlin");
  const landkreisReference = landkreiseGeo.features.filter((feature) => String(feature.properties.id ?? "") !== "lk-001-berlin");
  if (!bundestagReference.length || !landkreisReference.length) {
    return berlinLandkreis.geometry;
  }

  const bundestagBox = getFeatureBox(bundestagReference);
  const landkreisBox = getFeatureBox(landkreisReference);
  const scaleX = bundestagBox.width / landkreisBox.width;
  const scaleY = bundestagBox.height / landkreisBox.height;
  const offsetX = bundestagBox.minX - landkreisBox.minX * scaleX;
  const offsetY = bundestagBox.minY - landkreisBox.minY * scaleY;

  return transformGeometry(berlinLandkreis.geometry, scaleX, scaleY, offsetX, offsetY);
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
      ...geo.features
        .filter((feature) => String(feature.properties.bezirkId ?? "") !== "berlin")
        .map((feature) => ({
          ...feature,
          geometry: filterInsetPolygons(feature.geometry),
        })),
      ...(berlinGeometry
        ? [
            {
              type: "Feature" as const,
              properties: {
                id: BERLIN_GROUP_ID,
                name: "Berlin (aggregiert)",
                bezirkId: "berlin",
                bezirk: "Berlin",
                source: "landkreise.geojson (Darstellungsgeometrie)",
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
          id: BERLIN_GROUP_ID,
          name: "Berlin (aggregiert)",
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
