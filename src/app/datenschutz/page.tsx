import { PageHeader } from "@/components/layout/page-header";

export default function DatenschutzPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Datenschutz"
        description="Datenschutzhinweise für das statische Simulationsportal des Landeswahlleiters des Freistaates Ostdeutschland."
      />
      <section className="card space-y-3 p-5 text-slate-700">
        <p>
          Dieses Portal ist statisch aufgebaut. Es werden keine benutzerbezogenen Profildaten verarbeitet und keine externen
          Tracking-Dienste eingebunden.
        </p>
        <p>Server-Logdaten können im Rahmen des Hostings technisch erforderlich sein.</p>
        <p>Rechtsgrundlagen und Verantwortlichkeiten sind im Simulationskontext dargestellt.</p>
      </section>
    </div>
  );
}
