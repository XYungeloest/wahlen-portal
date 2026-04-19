import { KartenModul } from "@/components/maps/kartenmodul";
import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { parteiFarbenMap } from "@/lib/parteien";
import { getBezirke, getLandkreiseGeo, getLandtagswahl2024, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function KarteLandtagPage() {
  const [bezirke, geo, wahl, parteien, metadaten] = await Promise.all([
    getBezirke(),
    getLandkreiseGeo(),
    getLandtagswahl2024(),
    getParteien(),
    getMetadaten(),
  ]);

  const partyColors = parteiFarbenMap(parteien);
  const geoIds = new Set(geo.features.map((feature) => String(feature.properties.id ?? "")));
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
        geo={geo}
        partyColors={partyColors}
        firstColumnLabel="Landkreis / kreisfreie Stadt"
        data={mapData}
      />
      <SimulationHinweis text={`${metadaten.portal.simulationshinweis} ${wahl.modellhinweis}`} />
    </div>
  );
}
