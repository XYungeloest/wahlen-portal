import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default function KarteLandtagPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Karte Landtagswahl"
        description="Die Landtagskarte ist jetzt Teil der integrierten Ergebnisseite und nutzt dort dieselbe Datensatz-Auswahl wie Ergebnis, Sitzverteilung und Tabelle."
      />
      <section className="card p-5 text-slate-700">
        <p className="leading-7">
          Die regionale Kartenansicht wird nicht mehr als fachlich getrennte Hauptseite geführt. Dadurch bleiben Ergebnis, Karte und Gebietstabelle auf derselben Wahlebene konsistent.
        </p>
        <Link
          href="/ergebnisse/landtag/#karte"
          className="mt-4 inline-flex items-center rounded-full border border-[#0f5e68] bg-[#0f5e68] px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-[#124952]"
        >
          Zur integrierten Landtagsansicht
        </Link>
      </section>
    </div>
  );
}
