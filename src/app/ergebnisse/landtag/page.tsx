import { WahlErgebnisDashboard } from "@/components/content/wahl-ergebnis-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { parteiFarbenMap } from "@/lib/parteien";
import { getBezirke, getLandkreiseGeo, getLandtagDatasets, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function LandtagErgebnissePage() {
  const [datasets, parteien, bezirke, geo, metadaten] = await Promise.all([
    getLandtagDatasets(),
    getParteien(),
    getBezirke(),
    getLandkreiseGeo(),
    getMetadaten(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Landtagswahl"
        description="Integrierte Wahlebene mit Landesergebnis, Sitzverteilung, regionaler Karte und tabellarischer Gebietsauswertung auf gemeinsamer Datengrundlage."
      />
      <WahlErgebnisDashboard
        typ="landtag"
        datasets={datasets}
        bezirke={bezirke}
        geo={geo}
        partyColors={parteiFarbenMap(parteien)}
        globalSimulationHint={`${metadaten.portal.simulationshinweis} Die Landtagskarte nutzt Landkreise und kreisfreie Städte als regionale Wahlkreisebene; Bezirke dienen der Orientierung und Filterung.`}
      />
    </div>
  );
}
