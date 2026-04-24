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
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: "1. Volksantrag",
              text: "Bürgerinnen und Bürger reichen ein Anliegen mit der erforderlichen Unterstützerzahl ein. Inhalt und formale Zulässigkeit werden geprüft.",
            },
            {
              title: "2. Volksbegehren",
              text: "Nach Zulassung folgt eine geregelte Sammlung weiterer Unterstützungen. Das Verfahren macht sichtbar, ob das Anliegen landesweit tragfähig ist.",
            },
            {
              title: "3. Volksentscheid",
              text: "Erreicht das Begehren die festgelegten Anforderungen, entscheiden die Wahlberechtigten in einer Abstimmung über die Vorlage.",
            },
          ].map((step) => (
            <article key={step.title} className="rounded-xl border border-[#d5e3df] bg-white p-4">
              <h3 className="font-semibold text-[#14333d]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{step.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-4 rounded border border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-semibold">Ausschlussbereiche</p>
          <p className="mt-1">Abgaben-, Besoldungs- und Haushaltsgesetze sind von direktdemokratischen Verfahren ausgeschlossen.</p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Rollen im Verfahren</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">Initiative</h3>
            <p className="mt-2 text-slate-700">
              Die Initiative formuliert den Gegenstand, sammelt Unterstützung und trägt die politische Verantwortung für die Vorlage.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-semibold text-slate-900">Landeswahlleitung</h3>
            <p className="mt-2 text-slate-700">
              Die Landeswahlleitung veröffentlicht Fristen, koordiniert Prüfungen und stellt Zwischenergebnisse sowie amtliche
              Bekanntmachungen bereit.
            </p>
          </div>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Verfahrensstand transparent machen</h2>
        <p className="mt-3 text-slate-700">
          Für spätere Ausbaustufen eignet sich eine Statusanzeige mit Phase, Fristen, zuständiger Stelle und nächstem Schritt. Das
          Portal sollte dabei klar zwischen Simulation, Modellannahme und veröffentlichtem Verfahrensstand unterscheiden.
        </p>
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
          <p>
            <strong>Werden echte Unterschriften verarbeitet?</strong> Nein. Das Portal arbeitet ohne Datenbank und ohne personenbezogene
            Verfahrensdaten.
          </p>
          <p>
            <strong>Warum stehen keine konkreten Quoren auf dieser Seite?</strong> Nicht festgelegte juristische Details werden nicht
            nachträglich realrechtlich erfunden, sondern nur als transparente Modellannahme ergänzt, wenn sie für eine Darstellung nötig sind.
          </p>
        </div>
      </section>

      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
