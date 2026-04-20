import { WahlErgebnisDashboard } from "@/components/content/wahl-ergebnis-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { parteiFarbenMap } from "@/lib/parteien";
import { getBezirke, getBundestagDatasets, getBundestagswahlkreiseGeo, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function BundestagErgebnissePage() {
  const [datasets, parteien, bezirke, geo, metadaten] = await Promise.all([
    getBundestagDatasets(),
    getParteien(),
    getBezirke(),
    getBundestagswahlkreiseGeo(),
    getMetadaten(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bundestagswahl"
        description="Integrierte Wahlebene mit Gesamtergebnis, Direktmandat Ostdeutschland, Wahlkreiskarte und tabellarischer Gebietsauswertung auf gemeinsamer Datengrundlage."
      />
      <WahlErgebnisDashboard
        typ="bundestag"
        datasets={datasets}
        bezirke={bezirke}
        geo={geo}
        partyColors={parteiFarbenMap(parteien)}
        globalSimulationHint={`${metadaten.portal.simulationshinweis} Die Karte nutzt reale Bundestagswahlkreise, weist das einzige Direktmandat Ostdeutschland aber bewusst separat aus und bildet kein vollständiges Bundeswahlrecht nach.`}
      />
    </div>
  );
}
