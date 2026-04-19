import { PageHeader } from "@/components/layout/page-header";

export default function BarrierefreiheitPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Barrierefreiheit"
        description="Informationen zur digitalen Zugänglichkeit des Wahlportals nach dem angestrebten Standard WCAG 2.1 AA."
      />
      <section className="card p-5 text-slate-700">
        <ul className="list-disc space-y-2 pl-5">
          <li>Skip-Link und klare Tastaturfokussierung vorhanden.</li>
          <li>Diagramme werden durch tabellarische Alternativen ergänzt.</li>
          <li>Kontraststarke Farbpalette mit institutioneller Gestaltung.</li>
          <li>Alle Hauptfunktionen sind in responsiver Darstellung verfügbar.</li>
        </ul>
      </section>
    </div>
  );
}
