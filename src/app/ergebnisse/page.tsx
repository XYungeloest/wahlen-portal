import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default function ErgebnissePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ergebnisse"
        description="Zentrale Übersicht der integrierten Wahlebenen. Jede Ergebnisseite verbindet Gesamtergebnis, Visualisierung, Karte und Gebietstabelle auf gemeinsamer Datengrundlage."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/ergebnisse/landtag/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Landtagswahl 2024</h2>
          <p className="mt-2 text-slate-700">Landesergebnis, Sitzverteilung, regionale Karte und tabellarische Gebietsauswertung in einer Ansicht.</p>
        </Link>
        <Link href="/ergebnisse/bundestag/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Bundestagswahl 2025</h2>
          <p className="mt-2 text-slate-700">Ostweites Gesamtergebnis, Direktmandat Ostdeutschland, Wahlkreiskarte und Gebietstabelle.</p>
        </Link>
      </div>
    </div>
  );
}
