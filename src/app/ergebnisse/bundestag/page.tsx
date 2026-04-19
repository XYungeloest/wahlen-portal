import { ParteienBalken } from "@/components/charts/parteien-balken";
import { WahlkreisUebersicht } from "@/components/content/wahlkreis-uebersicht";
import { PageHeader } from "@/components/layout/page-header";
import { DatenTabelle } from "@/components/ui/datentabelle";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { formatDatum, formatProzent, formatZahl } from "@/lib/formatierung";
import { parteiFarbenMap } from "@/lib/parteien";
import { getBezirke, getBundestagswahl2025, getMetadaten, getParteien } from "@/lib/wahldaten";

export default async function BundestagErgebnissePage() {
  const [wahl, parteien, bezirke, metadaten] = await Promise.all([
    getBundestagswahl2025(),
    getParteien(),
    getBezirke(),
    getMetadaten(),
  ]);

  const colors = parteiFarbenMap(parteien);
  const ergebnisItems = Object.entries(wahl.gesamtergebnisOst)
    .map(([name, value]) => ({ name, value, color: colors[name] ?? "#64748b" }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ergebnisse Bundestagswahl 2025"
        description="Ostweites Gesamtergebnis, Wahlkreisergebnisse und separat ausgewiesenes Direktmandat Ostdeutschland."
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

      <ParteienBalken title="Ostweites Gesamtergebnis" data={ergebnisItems} />
      <DatenTabelle title="Tabellenalternative Gesamtergebnis" rows={ergebnisItems.map((item) => ({ name: item.name, value: item.value }))} />

      <section className="card border-l-4 border-[var(--color-primary)] p-4">
        <h3 className="text-lg font-semibold text-[var(--color-primary)]">Direktmandat Ostdeutschland</h3>
        <p className="mt-2 text-slate-800">
          <strong>{wahl.direktmandatOstdeutschland.kandidat}</strong> ({wahl.direktmandatOstdeutschland.partei}) mit{" "}
          <strong>{formatProzent(wahl.direktmandatOstdeutschland.stimmenanteil)}</strong>
        </p>
        <p className="mt-2 text-sm text-slate-700">{wahl.direktmandatOstdeutschland.hinweis}</p>
      </section>

      <section className="space-y-3">
        <h3 className="text-2xl font-semibold text-[var(--color-primary)]">Ergebnis nach Bundestagswahlkreisen</h3>
        <WahlkreisUebersicht bezirke={bezirke} ergebnisse={wahl.ergebnisseWahlkreise} />
      </section>

      <SimulationHinweis text={`${metadaten.portal.simulationshinweis} ${wahl.modellhinweis}`} />
    </div>
  );
}
