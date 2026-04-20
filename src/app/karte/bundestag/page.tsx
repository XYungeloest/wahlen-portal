import { KartenModul } from "@/components/maps/kartenmodul";
import { PageHeader } from "@/components/layout/page-header";
import { parteiFarbenMap } from "@/lib/parteien";
import {
  getBezirke,
  getBundestagDatasets,
  getBundestagswahlkreiseGeo,
  getMetadaten,
  getParteien,
} from "@/lib/wahldaten";

export default async function KarteBundestagPage() {
  const [bezirke, geo, datasets, parteien, metadaten] = await Promise.all([
    getBezirke(),
    getBundestagswahlkreiseGeo(),
    getBundestagDatasets(),
    getParteien(),
    getMetadaten(),
  ]);

  const partyColors = parteiFarbenMap(parteien);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karte Bundestagswahl"
        description="Offizielle Bundestagswahlkreise 2025 fuer Ostdeutschland mit waehlbaren Datensaetzen, Bezirksfilter, Legende und separater Direktmandats-Ausweisung."
      />
      <KartenModul
        title="Bundestagskarte"
        areaLabel="Bundestagswahlkreis"
        bezirke={bezirke}
        geo={geo}
        datasets={datasets}
        partyColors={partyColors}
        globalSimulationHint={`${metadaten.portal.simulationshinweis} Die Karte nutzt reale Bundestagswahlkreise, weist das einzige Direktmandat Ostdeutschland aber bewusst separat aus und bildet kein vollstaendiges Bundeswahlrecht nach.`}
      />
    </div>
  );
}
