import Link from "next/link";
import { Auszaehlungsstand } from "@/components/charts/auszaehlungsstand";
import { Schnellzugriffe } from "@/components/content/schnellzugriffe";
import { PageHeader } from "@/components/layout/page-header";
import { FaktenGrid } from "@/components/ui/fakten-grid";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { formatDatum, formatProzent, formatZahl } from "@/lib/formatierung";
import { getBundestagswahl2025, getLandtagswahl2024, getMetadaten } from "@/lib/wahldaten";

export default async function HomePage() {
  const [metadaten, landtag, bundestag] = await Promise.all([
    getMetadaten(),
    getLandtagswahl2024(),
    getBundestagswahl2025(),
  ]);

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
        description="Das offizielle Wahlportal des Landeswahlleiters bietet Ergebnisse, Karten, Methodik und Werkzeuge für die Politiksimulation des Freistaates Ostdeutschland."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="card p-5">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Landtagswahl 2024</h2>
          <p className="mt-2 text-sm text-slate-700">Wahldatum: {formatDatum(landtag.datum)}</p>
          <p className="mt-1 text-sm text-slate-700">Wahlbeteiligung: {formatProzent(landtag.wahlbeteiligung)}</p>
          <Link href="/ergebnisse/landtag/" className="mt-4 inline-block rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white no-underline hover:opacity-90">
            Ergebnisse zur Landtagswahl
          </Link>
        </article>

        <article className="card p-5">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Bundestagswahl 2025</h2>
          <p className="mt-2 text-sm text-slate-700">Wahldatum: {formatDatum(bundestag.datum)}</p>
          <p className="mt-1 text-sm text-slate-700">Wahlbeteiligung: {formatProzent(bundestag.wahlbeteiligung)}</p>
          <Link href="/ergebnisse/bundestag/" className="mt-4 inline-block rounded bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white no-underline hover:opacity-90">
            Ergebnisse zur Bundestagswahl
          </Link>
        </article>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-[var(--color-primary)]">Quick Facts</h2>
        <FaktenGrid facts={quickFacts} />
      </section>

      <Auszaehlungsstand startValue={89.2} />
      <Schnellzugriffe />
      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
