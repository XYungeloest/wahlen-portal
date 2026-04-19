import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { getMetadaten } from "@/lib/wahldaten";

export default async function WahlrechtPage() {
  const metadaten = await getMetadaten();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wahlrecht im Simulationsmodell"
        description="Transparente Darstellung des vereinfachten Wahlmodells für Landtagswahl und Bundestagswahl im Freistaat Ostdeutschland."
      />

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Landtagswahl</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>Eine Listenstimme pro wahlberechtigter Person.</li>
          <li>Sitzverteilung nach landesweitem Parteienergebnis (Sainte-Laguë/Schepers im Simulationsmodell).</li>
          <li>Landkreise werden als regionale Karte der stärksten Kräfte dargestellt.</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Bundestagswahl</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>Eine Listenstimme in der Ergebnisdarstellung des Portals.</li>
          <li>Ausweisung der stärksten Partei je Bundestagswahlkreis.</li>
          <li>Zusätzlich ein separates, ostweites Direktmandat.</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Wahlgrundsätze</h2>
        <p className="mt-3 text-slate-700">Allgemein, unmittelbar, frei, gleich und geheim. Das freie Mandat der Gewählten bleibt unberührt.</p>
        <p className="mt-2 text-slate-700">
          Wahlberechtigt und wählbar sind Personen nach den im Simulationskontext definierten Alters- und Wohnsitzvoraussetzungen.
        </p>
      </section>

      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
