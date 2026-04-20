import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default function KarteBundestagPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Karte Bundestagswahl"
        description="Die Wahlkreiskarte ist jetzt Teil der integrierten Ergebnisseite und bleibt dort mit Direktmandat, Datensatz-Auswahl und Gebietstabelle gekoppelt."
      />
      <section className="card p-5 text-slate-700">
        <p className="leading-7">
          Die frühere Einzelkarte bleibt als schlanker Deep-Link erhalten. Die fachliche Hauptansicht liegt jetzt auf der Ergebnisseite, damit Karte und Gesamtergebnis dieselbe Datenlogik teilen.
        </p>
        <Link
          href="/ergebnisse/bundestag/#karte"
          className="mt-4 inline-flex items-center rounded-full border border-[#0f5e68] bg-[#0f5e68] px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-[#124952]"
        >
          Zur integrierten Bundestagsansicht
        </Link>
      </section>
    </div>
  );
}
