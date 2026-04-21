"use client";

import { interpolateRgb } from "d3-interpolate";
import { useMemo, useState } from "react";
import { Wahlkarte } from "@/components/maps/wahlkarte";
import { formatDatum, formatProzent } from "@/lib/formatierung";
import { filterGeoByBezirk } from "@/lib/geografie";
import type { Bezirk, GeoFeatureCollection, WahlDataset } from "@/lib/types";

type Props = {
  title: string;
  bezirke: Bezirk[];
  geo: GeoFeatureCollection;
  datasets: WahlDataset[];
  datasetId?: string;
  onDatasetChange?: (nextValue: string) => void;
  partyColors: Record<string, string>;
};

type MetricType = "winner" | "turnout";

export function KartenModul({
  title,
  bezirke,
  geo,
  datasets,
  datasetId: controlledDatasetId,
  onDatasetChange,
  partyColors,
}: Props) {
  const defaultDatasetId = datasets.find((dataset) => dataset.gebiete.length > 0)?.id ?? datasets[0]?.id ?? "";
  const [uncontrolledDatasetId, setUncontrolledDatasetId] = useState<string>(defaultDatasetId);
  const [bezirkId, setBezirkId] = useState<string>("alle");
  const [metric, setMetric] = useState<MetricType>("winner");
  const datasetId = controlledDatasetId ?? uncontrolledDatasetId;

  const setDatasetId = (nextValue: string) => {
    onDatasetChange?.(nextValue);
    if (!onDatasetChange) {
      setUncontrolledDatasetId(nextValue);
    }
  };

  const currentDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === datasetId) ?? datasets[0],
    [datasetId, datasets],
  );

  const hasRegionalData = (currentDataset?.gebiete.length ?? 0) > 0;

  const filteredRows = useMemo(
    () =>
      currentDataset
        ? currentDataset.gebiete
            .filter((gebiet) => (bezirkId === "alle" ? true : gebiet.bezirkId === bezirkId))
            .sort((left, right) => left.gebietName.localeCompare(right.gebietName, "de"))
        : [],
    [bezirkId, currentDataset],
  );

  const filteredGeo = useMemo(
    () => (hasRegionalData ? filterGeoByBezirk(geo, bezirkId) : { ...geo, features: [] }),
    [bezirkId, geo, hasRegionalData],
  );

  const metricValues = useMemo(() => {
    if (metric === "winner") {
      return [];
    }
    return filteredRows.map((row) => row.wahlbeteiligung);
  }, [filteredRows, metric]);

  const minMetricValue = metricValues.length > 0 ? Math.min(...metricValues) : 0;
  const maxMetricValue = metricValues.length > 0 ? Math.max(...metricValues) : 100;

  const areasById = useMemo(() => {
    return Object.fromEntries(
      filteredRows.map((row) => {
        const metricValue = row.wahlbeteiligung;
        const winners = row.staerksteParteien?.length ? row.staerksteParteien : [row.staerkstePartei];
        const winnerLabel = winners.join(" / ");
        const winnerPercentLabel = row.staerksteParteiProzent > 0 ? ` (${formatProzent(row.staerksteParteiProzent)})` : "";
        const patternId = metric === "winner" && winners.length > 1 ? `tie-${winners.map(slugify).join("-")}` : undefined;
        const patternColors =
          metric === "winner" && winners.length > 1
            ? ([partyColors[winners[0]] ?? "#94a3b8", partyColors[winners[1]] ?? "#334155"] as [string, string])
            : undefined;
        const fill =
          metric === "winner"
            ? partyColors[winners[0]] ?? "#94a3b8"
            : scaleColor(metricValue, minMetricValue, maxMetricValue, "#d7f0ea", "#0f766e");

        const metricLabel =
          metric === "winner"
            ? `${winners.length > 1 ? "Gleichstand stärkste Kräfte" : "Stärkste Partei"}: ${winnerLabel}${winnerPercentLabel}`
            : `Wahlbeteiligung: ${formatProzent(row.wahlbeteiligung)}`;
        const history = datasets
          .filter((dataset) => dataset.id !== currentDataset.id && dataset.datum < currentDataset.datum && dataset.gebietsebene === currentDataset.gebietsebene)
          .sort((left, right) => right.datum.localeCompare(left.datum))
          .flatMap((dataset) => {
            const historicalRow = dataset.gebiete.find((gebiet) => gebiet.gebietId === row.gebietId);
            if (!historicalRow) {
              return [];
            }

            if (metric === "turnout") {
              return [{
                id: dataset.id,
                label: dataset.label,
                datum: formatDatum(dataset.datum),
                value: `Wahlbeteiligung: ${formatProzent(historicalRow.wahlbeteiligung)}`,
                color: scaleColor(historicalRow.wahlbeteiligung, minMetricValue, maxMetricValue, "#d7f0ea", "#0f766e"),
              }];
            }

            const historicalWinners = historicalRow.staerksteParteien?.length
              ? historicalRow.staerksteParteien
              : [historicalRow.staerkstePartei];
            const historicalWinnerLabel = historicalWinners.join(" / ");
            const historicalPercentLabel =
              historicalRow.staerksteParteiProzent > 0 ? ` (${formatProzent(historicalRow.staerksteParteiProzent)})` : "";

            return [{
              id: dataset.id,
              label: dataset.label,
              datum: formatDatum(dataset.datum),
              value: `${historicalWinnerLabel}${historicalPercentLabel}`,
              color: partyColors[historicalWinners[0]] ?? "#94a3b8",
              colors:
                historicalWinners.length > 1
                  ? ([partyColors[historicalWinners[0]] ?? "#94a3b8", partyColors[historicalWinners[1]] ?? "#334155"] as [string, string])
                  : undefined,
            }];
          });

        return [
          row.gebietId,
          {
            id: row.gebietId,
            name: row.gebietName,
            fill,
            patternId,
            patternColors,
            headline: metricLabel,
            detail: `Bezirk ${row.bezirk}.`,
            ariaLabel: `${row.gebietName}, Bezirk ${row.bezirk}.`,
            history,
          },
        ];
      }),
    );
  }, [currentDataset, datasets, filteredRows, maxMetricValue, metric, minMetricValue, partyColors]);

  const legendItems = useMemo(() => {
    if (metric !== "winner") {
      return [];
    }
    const presentParties = new Map<string, { name: string; color: string; colors?: [string, string] }>();
    for (const row of filteredRows) {
      const winners = row.staerksteParteien?.length ? row.staerksteParteien : [row.staerkstePartei];
      const name = winners.join(" / ");
      presentParties.set(name, {
        name,
        color: partyColors[winners[0]] ?? "#94a3b8",
        colors:
          winners.length > 1
            ? ([partyColors[winners[0]] ?? "#94a3b8", partyColors[winners[1]] ?? "#334155"] as [string, string])
            : undefined,
      });
    }
    return Array.from(presentParties.values()).sort((left, right) => left.name.localeCompare(right.name, "de"));
  }, [filteredRows, metric, partyColors]);

  if (!currentDataset) {
    return null;
  }

  return (
    <div className="space-y-5">
      <section id="karte" className="card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#25515c]">{title}</p>
            <h2 className="mt-2 break-words text-2xl font-semibold text-[#14333d]">Interaktive Karte der stärksten Kraft</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Datensatz vom {formatDatum(currentDataset.datum)}. <br></br>Geo-Basis: {currentDataset.metadaten.geobasis}.<br></br>Quelle: {currentDataset.metadaten.quelle}.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:min-w-[24rem] xl:min-w-[30rem]">
            <StatCard label="Gebietsebene" value={currentDataset.gebietsebene === "landkreis" ? "Landkreise / kreisfreie Städte" : "Bundestagswahlkreise"} />
            <StatCard label="Gebiete" value={hasRegionalData ? String(filteredRows.length) : "keine Regionaldaten"} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <SelectField
            label="Datensatz"
            value={datasetId}
            onChange={setDatasetId}
            options={datasets.map((dataset) => ({ value: dataset.id, label: `${dataset.label}` }))}
          />
          <SelectField
            label="Bezirk"
            value={bezirkId}
            disabled={!hasRegionalData}
            onChange={setBezirkId}
            options={[
              { value: "alle", label: "Alle Bezirke" },
              ...bezirke.map((bezirk) => ({ value: bezirk.id, label: bezirk.name })),
            ]}
          />
          <SelectField
            label="Metrik"
            value={metric}
            disabled={!hasRegionalData}
            onChange={(nextValue) => setMetric(nextValue as MetricType)}
            options={[
              { value: "winner", label: "Stärkste Partei" },
              { value: "turnout", label: "Wahlbeteiligung" },
            ]}
          />
          
        </div>

        {hasRegionalData ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Wahlkarte title={title} geo={filteredGeo} areasById={areasById} preserveFullExtent={bezirkId !== "alle"} />

            <div className="space-y-4">
              <LegendCard
                metric={metric}
                legendItems={legendItems}
                minValue={minMetricValue}
                maxValue={maxMetricValue}
              />

              {currentDataset.summary.direktmandat ? (
                <section className="rounded-xl border border-[#d0ddd9] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Direktmandat Ostdeutschland</p>
                  <h3 className="mt-2 break-words text-lg font-semibold text-[#16343d]">{currentDataset.summary.direktmandat.kandidat}</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {currentDataset.summary.direktmandat.partei} mit {formatProzent(currentDataset.summary.direktmandat.stimmenanteil)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{currentDataset.summary.direktmandat.hinweis}</p>
                </section>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="rounded-xl border border-[#c8d8d5] bg-white p-5 shadow-[0_10px_24px_rgba(0,43,49,0.045)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Datensatz ohne regionale Karte</p>
              <h3 className="mt-2 text-xl font-semibold text-[#14333d]">Keine Kartenansicht für diesen Datensatz</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Für diesen Datensatz liegen keine belastbaren Gebietssieger oder regionalen Ergebniswerte vor. Eine künstliche Verteilung auf Landkreise oder Bundestagswahlkreise wird bewusst nicht ergänzt.
              </p>
              <div className="mt-4 rounded-lg border border-[#d5e3df] bg-white p-4 text-sm leading-6 text-slate-700">
                <p>
                  Quelle: <strong>{currentDataset.metadaten.pdfDatei ?? currentDataset.metadaten.quelle}</strong>
                </p>
                <p className="mt-2">Für eine interaktive Karte bitte einen Datensatz mit regionaler Gebietsebene auswählen.</p>
              </div>
            </section>

            <div className="space-y-4">
              {currentDataset.summary.direktmandat ? (
                <section className="rounded-xl border border-[#d0ddd9] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Direktmandat Ostdeutschland</p>
                  <h3 className="mt-2 break-words text-lg font-semibold text-[#16343d]">{currentDataset.summary.direktmandat.kandidat}</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {currentDataset.summary.direktmandat.partei} mit {formatProzent(currentDataset.summary.direktmandat.stimmenanteil)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{currentDataset.summary.direktmandat.hinweis}</p>
                </section>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function scaleColor(value: number, min: number, max: number, start: string, end: string) {
  if (max <= min) {
    return end;
  }
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return interpolateRgb(start, end)(t);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (nextValue: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <label className="block min-w-0 text-sm font-medium text-slate-700">
      {label}
      <select
            className="mt-1 w-full rounded-lg border border-[#c5d7d3] bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#0f766e]"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[#d6e3df] bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#25515c]">{label}</p>
      <p className="mt-2 break-words text-base font-semibold leading-6 text-[#14333d]">{value}</p>
    </div>
  );
}

function LegendCard({
  metric,
  legendItems,
  minValue,
  maxValue,
}: {
  metric: MetricType;
  legendItems: Array<{ name: string; color: string; colors?: [string, string] }>;
  minValue: number;
  maxValue: number;
}) {
  return (
    <section className="rounded-xl border border-[#d0ddd9] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Legende</p>
      {metric === "winner" ? (
        <div className="mt-3 space-y-2">
          {legendItems.map((item) => (
            <div key={item.name} className="flex items-start gap-3 text-sm text-slate-700">
                <span
                  className="mt-0.5 h-3.5 w-5 rounded-sm border border-slate-300 flex-shrink-0"
                  style={{
                    background: item.colors ? `repeating-linear-gradient(45deg, ${item.colors[0]} 0 6px, ${item.colors[1]} 6px 12px)` : item.color,
                  }}
                  aria-hidden="true"
                />
              <span className="break-words">
                {item.name}
                {item.colors ? <span className="block text-xs leading-5 text-slate-500">Gleichstand, gleich breite Streifen</span> : null}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="h-3 rounded-full" style={{ background: "linear-gradient(90deg, #d7f0ea, #0f766e)" }} />
          <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <span>{formatProzent(minValue)}</span>
            <span className="min-w-0 break-words text-center">Wahlbeteiligung</span>
            <span>{formatProzent(maxValue)}</span>
          </div>
        </div>
      )}
    </section>
  );
}
