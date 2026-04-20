import { KartenModul } from "@/components/maps/kartenmodul";
import { PageHeader } from "@/components/layout/page-header";
import { parteiFarbenMap } from "@/lib/parteien";
import { getBezirke, getLandkreiseGeo, getLandtagDatasets, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function KarteLandtagPage() {
  const [bezirke, geo, datasets, parteien, metadaten] = await Promise.all([
    getBezirke(),
    getLandkreiseGeo(),
    getLandtagDatasets(),
    getParteien(),
    getMetadaten(),
  ]);

  const partyColors = parteiFarbenMap(parteien);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Karte Landtagswahl"
        description="Amtliche Kreis- und Stadtgeometrien fuer den Freistaat Ostdeutschland mit waehlbarer Datengrundlage, Bezirksfilter, Legende und tabellarischer Alternative."
      />
      <KartenModul
        title="Landtagskarte"
        areaLabel="Landkreis / kreisfreie Stadt"
        bezirke={bezirke}
        geo={geo}
        datasets={datasets}
        partyColors={partyColors}
        globalSimulationHint={`${metadaten.portal.simulationshinweis} Die Landtagskarte nutzt Landkreise und kreisfreie Staedte als regionale Wahlkreisebene; Bezirke dienen nur der Orientierung und Filterung.`}
      />
    </div>
  );
}
