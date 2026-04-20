import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default function KartePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kartenübersicht"
        description="Interaktive SVG-Karten auf offizieller Geo-Datenbasis visualisieren Landtag und Bundestag mit waehlbaren Datensaetzen, Bezirksfiltern und barrierefreier Tabellenalternative."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/karte/landtag/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Karte Landtag</h2>
          <p className="mt-2 text-slate-700">Landkreise und kreisfreie Staedte auf amtlicher Geometrie mit Dataset-Auswahl, Legende und Tabellenansicht.</p>
        </Link>
        <Link href="/karte/bundestag/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Karte Bundestag</h2>
          <p className="mt-2 text-slate-700">Offizielle Bundestagswahlkreise 2025 mit separater Direktmandats-Ausweisung und waehlbarer Datengrundlage.</p>
        </Link>
      </div>
    </div>
  );
}
