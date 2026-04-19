import { ParteienBalken } from "@/components/charts/parteien-balken";
import { SitzHalbrund } from "@/components/charts/sitz-halbrund";
import { LandkreisUebersicht } from "@/components/content/landkreis-uebersicht";
import { PageHeader } from "@/components/layout/page-header";
import { DatenTabelle } from "@/components/ui/datentabelle";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { formatDatum, formatProzent, formatZahl } from "@/lib/formatierung";
import { parteiFarbenMap } from "@/lib/parteien";
import { getBezirke, getLandtagswahl2024, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function LandtagErgebnissePage() {
  const [wahl, parteien, bezirke, metadaten] = await Promise.all([
    getLandtagswahl2024(),
    getParteien(),
    getBezirke(),
    getMetadaten(),
  ]);

  const colors = parteiFarbenMap(parteien);

  const ergebnisItems = Object.entries(wahl.landesergebnis)
    .map(([name, value]) => ({ name, value, color: colors[name] ?? "#64748b" }))
    .sort((a, b) => b.value - a.value);

  const seatItems = Object.entries(wahl.sitzverteilung)
    .map(([name, seats]) => ({ name, seats, color: colors[name] ?? "#64748b" }))
    .sort((a, b) => b.seats - a.seats);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ergebnisse Landtagswahl 2024"
        description="Landesweites Ergebnis, Sitzverteilung und regionale Auswertung der stärksten Partei auf Landkreisebene."
      />

      <section className="card p-5">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">{wahl.name}</h2>
        <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          <p>Wahldatum: {formatDatum(wahl.datum)}</p>
          <p>Wahlbeteiligung: {formatProzent(wahl.wahlbeteiligung)}</p>
          <p>Wahlberechtigte: {formatZahl(wahl.wahlberechtigte)}</p>
          <p>Gültige Stimmen: {formatZahl(wahl.gueltigeStimmen)}</p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ParteienBalken title="Landesweites Parteienergebnis" data={ergebnisItems} />
        <SitzHalbrund title="Sitzverteilung im Landtag" totalSeats={wahl.sitzeGesamt} majority={wahl.mehrheitsgrenze} data={seatItems} />
      </div>

      <DatenTabelle title="Tabellenalternative Parteienergebnis" rows={ergebnisItems.map((item) => ({ name: item.name, value: item.value }))} />

      <section className="card p-4">
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">Regierungsoption (Simulation)</h3>
        <p className="mt-2 text-slate-700">
          {wahl.regierungsoption.koalition.join(" + ")} erreichen zusammen <strong>{wahl.regierungsoption.sitze}</strong> Sitze und
          damit {wahl.regierungsoption.mehrheitsfaehig ? " eine " : " keine "}Mehrheit.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-2xl font-semibold text-[var(--color-primary)]">Stärkste Partei nach Landkreis</h3>
        <LandkreisUebersicht bezirke={bezirke} ergebnisse={wahl.ergebnisseLandkreise} />
      </section>

      <SimulationHinweis text={`${metadaten.portal.simulationshinweis} ${wahl.modellhinweis}`} />
    </div>
  );
}
