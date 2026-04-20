import { Auszaehlungsstand } from "@/components/charts/auszaehlungsstand";
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
        description="Das offizielle Wahlportal des Landeswahlleiters bündelt Ergebnisse, Karten, Methodik und Werkzeuge für die Politiksimulation des Freistaates Ostdeutschland in datengetriebener Form."
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.8fr)]">
        <div className="rounded-[1.8rem] border border-[#c7d8d3] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(235,246,242,0.95))] p-6 shadow-[0_26px_60px_rgba(0,43,49,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#25515c]">Lagebild</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#14333d]">Ergebnisse und Karten auf gemeinsamer Datengrundlage</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
            Die beiden Wahlebenen Landtag und Bundestag werden im Portal integriert dargestellt. Karten, Tabellen, Gesamtergebnisse und methodische Hinweise greifen auf dieselben lokal hinterlegten Geo- und Wahldaten zu.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.2rem] border border-[#d6e3df] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Landtagswahl</p>
              <p className="mt-2 text-lg font-semibold text-[#16343d]">{landtag.label}</p>
              <p className="mt-1 text-sm text-slate-700">Wahlbeteiligung {formatProzent(landtag.wahlbeteiligung)}</p>
            </div>
            <div className="rounded-[1.2rem] border border-[#d6e3df] bg-white px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Bundestagswahl</p>
              <p className="mt-2 text-lg font-semibold text-[#16343d]">{bundestag.label}</p>
              <p className="mt-1 text-sm text-slate-700">Wahlbeteiligung {formatProzent(bundestag.wahlbeteiligung)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <FaktenGrid facts={quickFacts} />
        </div>
      </section>

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
          description="Ostweites Gesamtergebnis, offizielle Wahlkreiskarte und separat ausgewiesenes Direktmandat Ostdeutschland."
          href="/ergebnisse/bundestag/"
          cta="Mehr Informationen"
          chartTitle="Führende Parteien"
          chartData={Object.entries(bundestag.summary.gesamtergebnis)
            .map(([name, value]) => ({ name, value, color: partyColors[name] ?? "#64748b" }))
            .sort((a, b) => b.value - a.value)}
        />
      </section>

      <Auszaehlungsstand startValue={89.2} />
      <Schnellzugriffe />
      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
