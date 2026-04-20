import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default function KartePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kartenübersicht"
        description="Die eigenständigen Kartenseiten bleiben nur als schlanke Deep-Links erhalten. Die fachliche Hauptansicht liegt auf den integrierten Ergebnisseiten von Landtag und Bundestag."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/karte/landtag/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Karte Landtag</h2>
          <p className="mt-2 text-slate-700">Deep-Link zur integrierten Landtagsansicht mit amtlicher Geometrie, Filterung und Tabellenalternative.</p>
        </Link>
        <Link href="/karte/bundestag/" className="card block p-5 no-underline hover:border-slate-400">
          <h2 className="text-xl font-semibold text-[var(--color-primary)]">Karte Bundestag</h2>
          <p className="mt-2 text-slate-700">Deep-Link zur integrierten Bundestagsansicht mit offiziellen Wahlkreisen und separater Direktmandats-Ausweisung.</p>
        </Link>
      </div>
    </div>
  );
}
