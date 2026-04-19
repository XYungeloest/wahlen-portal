import { KartenModul } from "@/components/maps/kartenmodul";
import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { parteiFarbenMap } from "@/lib/parteien";
import type { GeoFeatureCollection } from "@/lib/types";
import { getBezirke, getLandkreiseGeo, getLandtagswahl2024, getMetadaten, getParteien } from "@/lib/wahldaten";

function filterModeledCodesFromLandkreiseGeo(geo: GeoFeatureCollection): GeoFeatureCollection {
  return {
    ...geo,
    features: geo.features.map((feature) => {
      const sourceCodes = Array.isArray(feature.properties.sourceCodes) ? feature.properties.sourceCodes : null;
      const modeledCodes = Array.isArray(feature.properties.modellierteZuordnungCodes)
        ? feature.properties.modellierteZuordnungCodes
        : null;

      if (!sourceCodes?.length || !modeledCodes?.length || feature.geometry.type !== "MultiPolygon") {
        return feature;
      }

      const modeledCodeSet = new Set(modeledCodes.filter((code): code is string => typeof code === "string"));
      const keepIndexes = sourceCodes
        .map((code, index) => (typeof code === "string" && !modeledCodeSet.has(code) ? index : -1))
        .filter((index) => index >= 0);

      if (!keepIndexes.length || keepIndexes.length >= feature.geometry.coordinates.length) {
        // Keep geometry untouched when no reliable subset can be derived;
        // only clear modeled markers to avoid treating this feature as split in the map layer.
        return {
          ...feature,
          properties: {
            ...feature.properties,
            modellierteZuordnungCodes: [],
          },
        };
      }

      const coordinates = feature.geometry.coordinates as number[][][][];
      return {
        ...feature,
        properties: {
          ...feature.properties,
          sourceCodes: keepIndexes.map((index) => sourceCodes[index]),
          modellierteZuordnungCodes: [],
        },
        geometry: {
          ...feature.geometry,
          coordinates: keepIndexes.map((index) => coordinates[index]),
        },
      };
    }),
  };
}

export default async function KarteLandtagPage() {
  const [bezirke, geo, wahl, parteien, metadaten] = await Promise.all([
    getBezirke(),
    getLandkreiseGeo(),
    getLandtagswahl2024(),
    getParteien(),
    getMetadaten(),
  ]);

  const partyColors = parteiFarbenMap(parteien);
  const mapGeo = filterModeledCodesFromLandkreiseGeo(geo);
  const geoIds = new Set(mapGeo.features.map((feature) => String(feature.properties.id ?? "")));
  const mapData = wahl.ergebnisseLandkreise
    .filter((entry) => geoIds.has(entry.landkreisId))
    .map((entry) => ({
      id: entry.landkreisId,
      name: entry.landkreis,
      bezirkId: entry.bezirkId,
      bezirk: entry.bezirk,
      winner: entry.staerkstePartei,
      winnerPercent: entry.staerksteParteiProzent,
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karte Landtagswahl"
        description="D3-Karte auf Landkreisebene. Je Landkreis wird die stärkste Partei im vereinfachten Simulationsmodell dargestellt."
      />
      <KartenModul
        title="Stärkste Partei nach Landkreis"
        bezirke={bezirke}
        geo={mapGeo}
        partyColors={partyColors}
        firstColumnLabel="Landkreis / kreisfreie Stadt"
        data={mapData}
      />
      <SimulationHinweis text={`${metadaten.portal.simulationshinweis} ${wahl.modellhinweis}`} />
    </div>
  );
}
