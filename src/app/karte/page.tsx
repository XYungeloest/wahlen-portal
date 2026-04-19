import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default function KartePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kartenübersicht"
        description="Interaktive Karten visualisieren die stärksten Parteien je Landkreis (Landtag) bzw. je Bundestagswahlkreis (Bundestag)."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/karte/landtag/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Karte Landtag</h2>
          <p className="mt-2 text-slate-700">Landkreise als regionale Wahlkreisebene mit Bezirksfilter und Tooltip-Details.</p>
        </Link>
        <Link href="/karte/bundestag/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Karte Bundestag</h2>
          <p className="mt-2 text-slate-700">Bundestagswahlkreise mit stärkster Partei und tabellarischer Alternative.</p>
        </Link>
      </div>
    </div>
  );
}
