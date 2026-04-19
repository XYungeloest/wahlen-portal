import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { getMetadaten } from "@/lib/wahldaten";

export default async function DirekteDemokratiePage() {
  const metadaten = await getMetadaten();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Direkte Demokratie (Art. 71 bis 73)"
        description="Bürgernahe Übersicht zu Volksantrag, Volksbegehren und Volksentscheid im Simulationskontext des Freistaates Ostdeutschland."
      />

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Prozessfluss</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
          <li>Volksantrag: Einreichung mit erforderlicher Unterstützerzahl.</li>
          <li>Volksbegehren: Formelle Prüfung und Unterschriftensammlung.</li>
          <li>Volksentscheid: Abstimmung durch die Wahlberechtigten.</li>
        </ol>
        <div className="mt-4 rounded border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Ausschlussbereiche</p>
          <p className="mt-1">Abgaben-, Besoldungs- und Haushaltsgesetze sind von direktdemokratischen Verfahren ausgeschlossen.</p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">FAQ</h2>
        <div className="mt-3 space-y-3 text-slate-700">
          <p>
            <strong>Wer kann unterstützen?</strong> Wahlberechtigte Personen mit Hauptwohnsitz im Freistaat Ostdeutschland.
          </p>
          <p>
            <strong>Wer prüft die Zulässigkeit?</strong> Der Landeswahlleiter mit den zuständigen Landesstellen im Simulationsmodell.
          </p>
          <p>
            <strong>Wann ist ein Volksentscheid erfolgreich?</strong> Wenn die im Modell definierte Mehrheit und das erforderliche Quorum erreicht sind.
          </p>
        </div>
      </section>

      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
