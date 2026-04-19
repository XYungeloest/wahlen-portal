import { KartenModul } from "@/components/maps/kartenmodul";
import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { parteiFarbenMap } from "@/lib/parteien";
import type { GeoFeatureCollection } from "@/lib/types";
import {
  getBezirke,
  getBundestagswahl2025,
  getBundestagswahlkreiseGeo,
  getMetadaten,
  getParteien,
} from "@/lib/wahldaten";

const BERLIN_GROUP_ID = "bwk-berlin-gesamt";

function aggregateBundestagMap(geo: GeoFeatureCollection, wahl: Awaited<ReturnType<typeof getBundestagswahl2025>>) {
  const berlinRows = wahl.ergebnisseWahlkreise.filter((entry) => entry.bezirkId === "berlin");
  const berlinIds = new Set(berlinRows.map((entry) => entry.wahlkreisId));

  const mapGeo: GeoFeatureCollection = {
    ...geo,
    features: geo.features.map((feature) => {
      const id = String(feature.properties.id ?? "");
      if (!berlinIds.has(id)) {
        return feature;
      }
      return {
        ...feature,
        properties: {
          ...feature.properties,
          mapGroupId: BERLIN_GROUP_ID,
          mapGroupName: "Berlin (aggregiert)",
        },
      };
    }),
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
  const [bezirke, geo, wahl, parteien, metadaten] = await Promise.all([
    getBezirke(),
    getBundestagswahlkreiseGeo(),
    getBundestagswahl2025(),
    getParteien(),
    getMetadaten(),
  ]);

  const partyColors = parteiFarbenMap(parteien);
  const { mapGeo, mapData } = aggregateBundestagMap(geo, wahl);

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
