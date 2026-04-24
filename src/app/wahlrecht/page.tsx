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
        <p className="mt-3 text-slate-700">
          Die Landtagswahl wird im Portal bewusst als verständliches Listenwahlmodell dargestellt. Maßgeblich ist das landesweite
          Parteienergebnis; die regionale Karte dient der Orientierung, nicht der Mandatszuteilung.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>Eine Listenstimme pro wahlberechtigter Person.</li>
          <li>Sitzverteilung nach landesweitem Parteienergebnis (Sainte-Laguë/Schepers im Simulationsmodell).</li>
          <li>Landkreise werden als regionale Karte der stärksten Kräfte dargestellt.</li>
          <li>Regionale Prozentwerte werden nur angezeigt, wenn sie im Datensatz ausdrücklich vorliegen.</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Bundestagswahl</h2>
        <p className="mt-3 text-slate-700">
          Auch die Bundestagsansicht folgt einem vereinfachten Modell. Das Portal bildet keine vollständige reale Erst- und
          Zweitstimmenlogik ab, sondern stellt die simulierten Ergebnisse konsistent und transparent dar.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700">
          <li>Eine Listenstimme in der Ergebnisdarstellung des Portals.</li>
          <li>Ausweisung der stärksten Partei je Bundestagswahlkreis.</li>
          <li>Zusätzlich ein separates, ostweites Direktmandat.</li>
          <li>Das Direktmandat ist ein eigener Simulationsbaustein und wird nicht als Flächenlogik der Karte verwendet.</li>
        </ul>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Wahlberechtigung und Wählbarkeit</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">Wahlberechtigung</h3>
            <p className="mt-2 text-slate-700">
              Wahlberechtigt sind im Modell Personen mit Hauptwohnsitz im Freistaat Ostdeutschland, sofern sie die festgelegten
              Alters- und Statusvoraussetzungen erfüllen.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">Wählbarkeit</h3>
            <p className="mt-2 text-slate-700">
              Wählbar sind Personen, die die persönlichen Voraussetzungen des Simulationswahlrechts erfüllen und ordnungsgemäß
              vorgeschlagen wurden.
            </p>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Wahlgrundsätze</h2>
        <dl className="mt-3 grid gap-3 md:grid-cols-2">
          {[
            ["Allgemein", "Alle Wahlberechtigten können nach denselben Grundregeln teilnehmen."],
            ["Unmittelbar", "Die Stimme wirkt direkt auf das im Portal dargestellte Wahlergebnis."],
            ["Frei", "Die Wahlentscheidung darf nicht erzwungen oder beeinflusst werden."],
            ["Gleich", "Jede Stimme zählt im Modell mit gleichem Gewicht."],
            ["Geheim", "Individuelle Wahlentscheidungen werden nicht offengelegt."],
            ["Freies Mandat", "Gewählte sind nicht an Weisungen gebunden."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-lg border border-slate-200 bg-white p-4">
              <dt className="font-semibold text-slate-900">{title}</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700">{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Was bewusst nicht abgebildet wird</h2>
        <p className="mt-3 text-slate-700">
          Das Portal rekonstruiert kein reales deutsches Wahlrecht mit Überhangmandaten, Ausgleichsmandaten, komplizierter
          Wahlkreisverrechnung oder vollständigem Bundeswahlrechtsmodell. Wo rechtliche Details nicht festgelegt sind, werden
          einfache Modellannahmen genutzt und auf der Methodikseite offengelegt.
        </p>
      </section>

      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
