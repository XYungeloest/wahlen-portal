import { Schnellzugriffe } from "@/components/content/schnellzugriffe";
import { WahlTeaser } from "@/components/content/wahl-teaser";
import { PageHeader } from "@/components/layout/page-header";
import { FaktenGrid } from "@/components/ui/fakten-grid";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { formatDatum, formatProzent, formatZahl } from "@/lib/formatierung";
import { parteiFarbenMap } from "@/lib/parteien";
import { getBundestagDatasets, getLandtagDatasets, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function HomePage() {
  const [metadaten, landtagDatasets, bundestagDatasets, parteien] = await Promise.all([
    getMetadaten(),
    getLandtagDatasets(),
    getBundestagDatasets(),
    getParteien(),
  ]);

  const partyColors = parteiFarbenMap(parteien);
  const landtag = landtagDatasets[0];
  const bundestag = bundestagDatasets[0];

  const quickFacts = [
    { label: "Wahlberechtigte", value: formatZahl(metadaten.quickfacts.wahlberechtigte) },
    { label: "Wahlbeteiligung (Referenz)", value: formatProzent(metadaten.quickfacts.aktuelleWahlbeteiligungReferenz) },
    { label: "Letzter Wahltermin", value: formatDatum(metadaten.quickfacts.letzteWahl) },
    { label: "Nächster fiktiver Wahltermin", value: formatDatum(metadaten.quickfacts.naechsteWahl) },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Wahlen im Freistaat Ostdeutschland"
        description="Das offizielle Wahlportal des Landeswahlleiters bündelt Ergebnisse, Karten und Methodik für die Politiksimulation des Freistaates Ostdeutschland in datengetriebener Form."
      />

      <FaktenGrid facts={quickFacts} />

      <section className="grid gap-5 xl:grid-cols-2">
        <WahlTeaser
          eyebrow="Wahlebene 1"
          title={landtag.label}
          date={landtag.datum}
          turnout={landtag.wahlbeteiligung}
          description="Landesergebnis, Sitzverteilung und regionale Auswertung der stärksten Partei nach Landkreisen und kreisfreien Städten."
          href="/ergebnisse/landtag/"
          cta="Zum vollständigen Ergebnis"
          chartTitle="Führende Parteien"
          chartData={Object.entries(landtag.summary.gesamtergebnis)
            .map(([name, value]) => ({ name, value, color: partyColors[name] ?? "#64748b" }))
            .sort((a, b) => b.value - a.value)}
        />

        <WahlTeaser
          eyebrow="Wahlebene 2"
          title={bundestag.label}
          date={bundestag.datum}
          turnout={bundestag.wahlbeteiligung}
          description="Ostweites Gesamtergebnis, offizielle Wahlkreiskarte und Sieger des Direktmandats Ostdeutschland."
          href="/ergebnisse/bundestag/"
          cta="Mehr Informationen"
          chartTitle="Führende Parteien"
          chartData={Object.entries(bundestag.summary.gesamtergebnis)
            .map(([name, value]) => ({ name, value, color: partyColors[name] ?? "#64748b" }))
            .sort((a, b) => b.value - a.value)}
        />
      </section>
      <Schnellzugriffe />
      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
