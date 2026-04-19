import { KartenModul } from "@/components/maps/kartenmodul";
import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { parteiFarbenMap } from "@/lib/parteien";
import {
  getBezirke,
  getBundestagswahl2025,
  getBundestagswahlkreiseGeo,
  getMetadaten,
  getParteien,
} from "@/lib/wahldaten";

export default async function KarteBundestagPage() {
  const [bezirke, geo, wahl, parteien, metadaten] = await Promise.all([
    getBezirke(),
    getBundestagswahlkreiseGeo(),
    getBundestagswahl2025(),
    getParteien(),
    getMetadaten(),
  ]);

  const partyColors = parteiFarbenMap(parteien);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karte Bundestagswahl"
        description="D3-Karte der Bundestagswahlkreise mit Darstellung der stärksten Partei je Wahlkreis."
      />
      <KartenModul
        title="Stärkste Partei nach Bundestagswahlkreis"
        bezirke={bezirke}
        geo={geo}
        partyColors={partyColors}
        firstColumnLabel="Bundestagswahlkreis"
        data={wahl.ergebnisseWahlkreise.map((entry) => ({
          id: entry.wahlkreisId,
          name: entry.wahlkreis,
          bezirkId: entry.bezirkId,
          bezirk: entry.bezirk,
          winner: entry.staerkstePartei,
          winnerPercent: entry.staerksteParteiProzent,
        }))}
      />
      <SimulationHinweis text={`${metadaten.portal.simulationshinweis} ${wahl.modellhinweis}`} />
    </div>
  );
}
