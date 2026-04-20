"use client";

import { useMemo, useState } from "react";
import { ParteienBalken } from "@/components/charts/parteien-balken";
import { SitzHalbrund } from "@/components/charts/sitz-halbrund";
import { KartenModul } from "@/components/maps/kartenmodul";
import { formatDatum, formatProzent, formatZahl } from "@/lib/formatierung";
import type { Bezirk, GeoFeatureCollection, WahlDataset, WahlTyp } from "@/lib/types";

type Props = {
  typ: WahlTyp;
  datasets: WahlDataset[];
  bezirke: Bezirk[];
  geo: GeoFeatureCollection;
  partyColors: Record<string, string>;
  globalSimulationHint: string;
};

export function WahlErgebnisDashboard({ typ, datasets, bezirke, geo, partyColors, globalSimulationHint }: Props) {
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? "");
  const currentDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === datasetId) ?? datasets[0],
    [datasetId, datasets],
  );

  const ergebnisItems = useMemo(
    () =>
      Object.entries(currentDataset.summary.gesamtergebnis)
        .map(([name, value]) => ({ name, value, color: partyColors[name] ?? "#64748b" }))
        .sort((a, b) => b.value - a.value),
    [currentDataset, partyColors],
  );

  const seatItems = useMemo(
    () =>
      Object.entries(currentDataset.summary.sitzverteilung ?? {})
        .map(([name, seats]) => ({ name, seats, color: partyColors[name] ?? "#64748b" }))
        .sort((a, b) => b.seats - a.seats),
    [currentDataset, partyColors],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[1.6rem] border border-[#cbdcd7] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,248,244,0.96))] p-5 shadow-[0_22px_50px_rgba(0,38,46,0.08)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#25515c]">
              {typ === "landtag" ? "Landtagswahl" : "Bundestagswahl"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-[#15343d]">{currentDataset.label}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Wahltag {formatDatum(currentDataset.datum)}. Datengrundlage und Kartenansicht sind in dieser Seite zusammengeführt; Karte, Tabellen und Kennzahlen greifen auf denselben Datensatz zu.
            </p>
          </div>

          <label className="block min-w-[18rem] text-sm font-medium text-slate-700">
            Datensatz auswählen
            <select
              className="mt-1 w-full rounded-2xl border border-[#c5d7d3] bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#0f766e]"
              value={datasetId}
              onChange={(event) => setDatasetId(event.target.value)}
            >
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.label} ({formatDatum(dataset.datum)})
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Wahlbeteiligung" value={formatProzent(currentDataset.wahlbeteiligung)} />
          <StatTile label="Wahlberechtigte" value={formatZahl(currentDataset.wahlberechtigte)} />
          <StatTile label="Gültige Stimmen" value={formatZahl(currentDataset.gueltigeStimmen)} />
          <StatTile label="Gebietsebene" value={typ === "landtag" ? "Landkreise und kreisfreie Städte" : "Bundestagswahlkreise"} />
        </div>
      </section>

      <div className={`grid gap-6 ${typ === "landtag" ? "xl:grid-cols-2" : "xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]"}`}>
        <ParteienBalken title={typ === "landtag" ? "Landesweites Parteienergebnis" : "Ostweites Gesamtergebnis"} data={ergebnisItems} />

        {typ === "landtag" ? (
          <div className="space-y-6">
            <SitzHalbrund
              title="Sitzverteilung im Landtag"
              totalSeats={currentDataset.summary.sitzeGesamt ?? 0}
              majority={currentDataset.summary.mehrheitsgrenze ?? 0}
              data={seatItems}
            />
            {currentDataset.summary.regierungsoption ? (
              <section className="card p-4">
                <h3 className="text-lg font-semibold text-[var(--color-primary)]">Regierungsoption (Simulation)</h3>
                <p className="mt-2 text-slate-700">
                  {currentDataset.summary.regierungsoption.koalition.join(" + ")} erreichen zusammen{" "}
                  <strong>{currentDataset.summary.regierungsoption.sitze}</strong> Sitze und damit{" "}
                  {currentDataset.summary.regierungsoption.mehrheitsfaehig ? "eine" : "keine"} Mehrheit.
                </p>
              </section>
            ) : null}
          </div>
        ) : (
          <section className="card p-5">
            <h3 className="text-lg font-semibold text-[var(--color-primary)]">Direktmandat Ostdeutschland</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              <strong>{currentDataset.summary.direktmandat?.kandidat}</strong> ({currentDataset.summary.direktmandat?.partei}) mit{" "}
              <strong>{formatProzent(currentDataset.summary.direktmandat?.stimmenanteil ?? 0)}</strong>
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-700">{currentDataset.summary.direktmandat?.hinweis}</p>
          </section>
        )}
      </div>

      <KartenModul
        title={typ === "landtag" ? "Regionale Wahlkarte" : "Wahlkreiskarte"}
        areaLabel={typ === "landtag" ? "Landkreis / kreisfreie Stadt" : "Bundestagswahlkreis"}
        bezirke={bezirke}
        geo={geo}
        datasets={datasets}
        datasetId={datasetId}
        onDatasetChange={setDatasetId}
        partyColors={partyColors}
        globalSimulationHint={globalSimulationHint}
      />
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[#d4e2de] bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[#15343d]">{value}</p>
    </div>
  );
}
