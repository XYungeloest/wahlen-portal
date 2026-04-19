import { Koalitionsrechner } from "@/components/charts/koalitionsrechner";
import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { parteiFarbenMap } from "@/lib/parteien";
import { getLandtagswahl2024, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function KoalitionsrechnerPage() {
  const [wahl, parteien, metadaten] = await Promise.all([getLandtagswahl2024(), getParteien(), getMetadaten()]);
  const partyColors = parteiFarbenMap(parteien);

  const partySeats = Object.entries(wahl.sitzverteilung)
    .map(([name, seats]) => ({
      name,
      seats,
      color: partyColors[name] ?? "#64748b",
    }))
    .sort((a, b) => b.seats - a.seats);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Koalitionsrechner"
        description="Interaktives Werkzeug zur Berechnung von Koalitionsoptionen auf Basis der simulierten Sitzverteilung im Landtag."
      />
      <Koalitionsrechner parties={partySeats} majority={wahl.mehrheitsgrenze} />
      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
