import Link from "next/link";
import { Auszaehlungsstand } from "@/components/charts/auszaehlungsstand";
import { PageHeader } from "@/components/layout/page-header";

export default function WerkzeugePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Wahlwerkzeuge"
        description="Werkzeuge zur Visualisierung von Sitzverteilung, Koalitionsbildung und simuliertem Auszählungsstand."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/werkzeuge/koalitionsrechner/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Koalitionsrechner</h2>
          <p className="mt-2 text-slate-700">Sitze live summieren und auf Mehrheitsfähigkeit prüfen.</p>
        </Link>
        <Link href="/werkzeuge/sitzverteilung/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Sitzverteilung</h2>
          <p className="mt-2 text-slate-700">Halbkreis-Visualisierung und tabellarische Fraktionsübersicht.</p>
        </Link>
      </div>

      <Auszaehlungsstand startValue={91.8} />
    </div>
  );
}
