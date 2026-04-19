import { SitzHalbrund } from "@/components/charts/sitz-halbrund";
import { PageHeader } from "@/components/layout/page-header";
import { DatenTabelle } from "@/components/ui/datentabelle";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { parteiFarbenMap } from "@/lib/parteien";
import { getLandtagswahl2024, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function SitzverteilungPage() {
  const [wahl, parteien, metadaten] = await Promise.all([getLandtagswahl2024(), getParteien(), getMetadaten()]);
  const colors = parteiFarbenMap(parteien);

  const seatItems = Object.entries(wahl.sitzverteilung)
    .map(([name, seats]) => ({ name, seats, color: colors[name] ?? "#64748b" }))
    .sort((a, b) => b.seats - a.seats);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sitzverteilung"
        description="Halbkreis-Visualisierung der Landtagssitze mit Sortierung nach Fraktionsgröße und tabellarischer Alternative."
      />
      <SitzHalbrund title="Sitze im Landtag" totalSeats={wahl.sitzeGesamt} majority={wahl.mehrheitsgrenze} data={seatItems} />
      <DatenTabelle title="Sitzverteilung als Tabelle" unit="number" rows={seatItems.map((item) => ({ name: item.name, value: item.seats }))} />
      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
