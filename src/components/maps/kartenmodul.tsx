"use client";

import { interpolateRgb } from "d3-interpolate";
import { useMemo, useState } from "react";
import { Wahlkarte } from "@/components/maps/wahlkarte";
import { formatDatum, formatProzent } from "@/lib/formatierung";
import { filterGeoByBezirk } from "@/lib/geografie";
import type { Bezirk, GeoFeatureCollection, WahlDataset } from "@/lib/types";

type Props = {
  title: string;
  areaLabel: string;
  bezirke: Bezirk[];
  geo: GeoFeatureCollection;
  datasets: WahlDataset[];
  datasetId?: string;
  onDatasetChange?: (nextValue: string) => void;
  partyColors: Record<string, string>;
  globalSimulationHint: string;
};

type MetricType = "winner" | "turnout" | "party";

export function KartenModul({
  title,
  areaLabel,
  bezirke,
  geo,
  datasets,
  datasetId: controlledDatasetId,
  onDatasetChange,
  partyColors,
  globalSimulationHint,
}: Props) {
  const defaultDatasetId = datasets.find((dataset) => dataset.gebiete.length > 0)?.id ?? datasets[0]?.id ?? "";
  const [uncontrolledDatasetId, setUncontrolledDatasetId] = useState<string>(defaultDatasetId);
  const [bezirkId, setBezirkId] = useState<string>("alle");
  const [metric, setMetric] = useState<MetricType>("winner");
  const [party, setParty] = useState<string>("Volksfront");
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
  const currentPartyColor = partyColors[party] ?? "#0f766e";

  const metricValues = useMemo(() => {
    if (metric === "winner") {
      return [];
    }
    return filteredRows.map((row) => (metric === "turnout" ? row.wahlbeteiligung : row.ergebnisse[party] ?? 0));
  }, [filteredRows, metric, party]);

  const minMetricValue = metricValues.length > 0 ? Math.min(...metricValues) : 0;
  const maxMetricValue = metricValues.length > 0 ? Math.max(...metricValues) : 100;

  const areasById = useMemo(() => {
    return Object.fromEntries(
      filteredRows.map((row) => {
        const metricValue = metric === "turnout" ? row.wahlbeteiligung : row.ergebnisse[party] ?? 0;
        const fill =
          metric === "winner"
            ? partyColors[row.staerkstePartei] ?? "#94a3b8"
            : scaleColor(metricValue, minMetricValue, maxMetricValue, metric === "turnout" ? "#d7f0ea" : "#f3ede6", metric === "turnout" ? "#0f766e" : currentPartyColor);

        const metricLabel =
          metric === "winner"
            ? `Stärkste Partei: ${row.staerkstePartei} (${formatProzent(row.staerksteParteiProzent)})`
            : metric === "turnout"
              ? `Wahlbeteiligung: ${formatProzent(row.wahlbeteiligung)}`
              : `${party}: ${formatProzent(metricValue)}`;

        return [
          row.gebietId,
          {
            id: row.gebietId,
            name: row.gebietName,
            fill,
            headline: metricLabel,
            detail: `Bezirk ${row.bezirk}. Stärkste Partei ${row.staerkstePartei} mit ${formatProzent(row.staerksteParteiProzent)}.`,
            ariaLabel: `${row.gebietName}, Bezirk ${row.bezirk}. ${metricLabel}. Stärkste Partei ${row.staerkstePartei} mit ${formatProzent(row.staerksteParteiProzent)}.`,
          },
        ];
      }),
    );
  }, [currentPartyColor, filteredRows, maxMetricValue, metric, minMetricValue, party, partyColors]);

  const partiesInDataset = useMemo(() => {
    const keys = new Set<string>();
    for (const row of currentDataset?.gebiete ?? []) {
      for (const key of Object.keys(row.ergebnisse)) {
        if (key !== "Sonstige") {
          keys.add(key);
        }
      }
    }
    return Array.from(keys).sort((left, right) => left.localeCompare(right, "de"));
  }, [currentDataset]);

  const legendItems = useMemo(() => {
    if (metric !== "winner") {
      return [];
    }
    const presentParties = new Set(filteredRows.map((row) => row.staerkstePartei));
    return Array.from(presentParties)
      .sort((left, right) => left.localeCompare(right, "de"))
      .map((name) => ({ name, color: partyColors[name] ?? "#94a3b8" }));
  }, [filteredRows, metric, partyColors]);

  if (!currentDataset) {
    return null;
  }

  return (
    <div className="space-y-5">
      <section id="karte" className="rounded-[1.75rem] border border-[#c4d6d2] bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(235,246,242,0.96))] p-5 shadow-[0_24px_54px_rgba(0,38,46,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#25515c]">{title}</p>
            <h2 className="mt-2 break-words text-2xl font-semibold text-[#14333d]">{currentDataset.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Datensatz vom {formatDatum(currentDataset.datum)}. Geo-Basis: {currentDataset.metadaten.geobasis}. Quelle: {currentDataset.metadaten.quelle}.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[28rem]">
            <StatCard label="Wahlbeteiligung" value={formatProzent(currentDataset.wahlbeteiligung)} />
            <StatCard label="Gebietsebene" value={currentDataset.gebietsebene === "landkreis" ? "Landkreise / kreisfreie Städte" : "Bundestagswahlkreise"} />
            <StatCard label="Gebiete" value={hasRegionalData ? String(filteredRows.length) : "keine Regionaldaten"} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-4">
          <SelectField
            label="Datensatz"
            value={datasetId}
            onChange={setDatasetId}
            options={datasets.map((dataset) => ({ value: dataset.id, label: `${dataset.label} (${formatDatum(dataset.datum)})` }))}
          />
          <SelectField
            label="Metrik"
            value={metric}
            disabled={!hasRegionalData}
            onChange={(nextValue) => setMetric(nextValue as MetricType)}
            options={[
              { value: "winner", label: "Stärkste Partei" },
              { value: "turnout", label: "Wahlbeteiligung" },
              { value: "party", label: "Parteiergebnis" },
            ]}
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
            label="Partei"
            value={party}
            disabled={!hasRegionalData || metric !== "party"}
            onChange={setParty}
            options={partiesInDataset.map((entry) => ({ value: entry, label: entry }))}
          />
        </div>

        {hasRegionalData ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Wahlkarte title={title} geo={filteredGeo} areasById={areasById} />

            <div className="space-y-4">
              <LegendCard
                metric={metric}
                legendItems={legendItems}
                minValue={minMetricValue}
                maxValue={maxMetricValue}
                partyColor={currentPartyColor}
                party={party}
              />

              {currentDataset.summary.direktmandat ? (
                <section className="rounded-[1.25rem] border border-[#d0ddd9] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Direktmandat Ostdeutschland</p>
                  <h3 className="mt-2 break-words text-lg font-semibold text-[#16343d]">{currentDataset.summary.direktmandat.kandidat}</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {currentDataset.summary.direktmandat.partei} mit {formatProzent(currentDataset.summary.direktmandat.stimmenanteil)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{currentDataset.summary.direktmandat.hinweis}</p>
                </section>
              ) : null}

              <InfoCard currentDataset={currentDataset} globalSimulationHint={globalSimulationHint} />
            </div>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="rounded-[1.5rem] border border-[#c8d8d5] bg-[linear-gradient(180deg,rgba(241,248,246,0.95),rgba(251,253,252,1))] p-5 shadow-[0_20px_45px_rgba(0,51,61,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Historischer PDF-Datensatz</p>
              <h3 className="mt-2 text-xl font-semibold text-[#14333d]">Keine Kartenansicht für diesen Datensatz</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Der importierte Datensatz basiert unmittelbar auf dem amtlichen PDF-Endergebnis. In der Quelle sind nur aggregierte Gesamtwerte enthalten; eine künstliche Verteilung auf Landkreise oder Bundestagswahlkreise wird bewusst nicht ergänzt.
              </p>
              <div className="mt-4 rounded-[1.1rem] border border-[#d5e3df] bg-white p-4 text-sm leading-6 text-slate-700">
                <p>
                  Quelle: <strong>{currentDataset.metadaten.pdfDatei ?? currentDataset.metadaten.quelle}</strong>
                </p>
                {currentDataset.metadaten.ordnungscode ? (
                  <p className="mt-2">
                    Ordnungscode: <strong>{currentDataset.metadaten.ordnungscode}</strong>
                  </p>
                ) : null}
                <p className="mt-2">Für eine interaktive Karte bitte einen Datensatz mit regionaler Gebietsebene auswählen.</p>
              </div>
            </section>

            <div className="space-y-4">
              {currentDataset.summary.direktmandat ? (
                <section className="rounded-[1.25rem] border border-[#d0ddd9] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Direktmandat Ostdeutschland</p>
                  <h3 className="mt-2 break-words text-lg font-semibold text-[#16343d]">{currentDataset.summary.direktmandat.kandidat}</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {currentDataset.summary.direktmandat.partei} mit {formatProzent(currentDataset.summary.direktmandat.stimmenanteil)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{currentDataset.summary.direktmandat.hinweis}</p>
                </section>
              ) : null}

              <InfoCard currentDataset={currentDataset} globalSimulationHint={globalSimulationHint} />
            </div>
          </div>
        )}
      </section>

      {hasRegionalData ? (
        <section className="rounded-[1.5rem] border border-[#cddcda] bg-white p-5 shadow-[0_18px_40px_rgba(0,38,46,0.06)]" aria-label="Tabellarische Kartenalternative">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-[#14333d]">Tabellenalternative</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Barrierefreie Alternative zur Kartenansicht mit denselben Filtereinstellungen.</p>
            </div>
            <p className="text-sm text-slate-500">Aktive Metrik: {metric === "winner" ? "Stärkste Partei" : metric === "turnout" ? "Wahlbeteiligung" : `Parteiergebnis ${party}`}</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="table-basic">
              <caption className="sr-only">Tabellarische Kartenalternative</caption>
              <thead>
                <tr>
                  <th scope="col">{areaLabel}</th>
                  <th scope="col">Bezirk</th>
                  <th scope="col">Stärkste Partei</th>
                  <th scope="col">Wahlbeteiligung</th>
                  <th scope="col">{metric === "party" ? party : metric === "turnout" ? "Wahlbeteiligung" : "Spitzenwert"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const metricValue = metric === "turnout" ? row.wahlbeteiligung : metric === "party" ? row.ergebnisse[party] ?? 0 : row.staerksteParteiProzent;
                  return (
                    <tr key={row.gebietId}>
                      <th scope="row">{row.gebietName}</th>
                      <td>{row.bezirk}</td>
                      <td>{row.staerkstePartei}</td>
                      <td className="font-mono-data">{formatProzent(row.wahlbeteiligung)}</td>
                      <td className="font-mono-data">{formatProzent(metricValue)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
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
        className="mt-1 w-full rounded-2xl border border-[#c5d7d3] bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 focus:border-[#0f766e]"
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
    <div className="rounded-[1.15rem] border border-[#d6e3df] bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-[#14333d]">{value}</p>
    </div>
  );
}

function LegendCard({
  metric,
  legendItems,
  minValue,
  maxValue,
  partyColor,
  party,
}: {
  metric: MetricType;
  legendItems: Array<{ name: string; color: string }>;
  minValue: number;
  maxValue: number;
  partyColor: string;
  party: string;
}) {
  return (
    <section className="rounded-[1.25rem] border border-[#d0ddd9] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Legende</p>
      {metric === "winner" ? (
        <div className="mt-3 space-y-2">
          {legendItems.map((item) => (
            <div key={item.name} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="mt-0.5 h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
              <span className="break-words">{item.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="h-3 rounded-full" style={{ background: `linear-gradient(90deg, ${metric === "turnout" ? "#d7f0ea" : "#f3ede6"}, ${partyColor})` }} />
          <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <span>{formatProzent(minValue)}</span>
            <span className="min-w-0 break-words text-center">{metric === "turnout" ? "Wahlbeteiligung" : party}</span>
            <span>{formatProzent(maxValue)}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function InfoCard({ currentDataset, globalSimulationHint }: { currentDataset: WahlDataset; globalSimulationHint: string }) {
  return (
    <section className="rounded-[1.25rem] border border-[#d0ddd9] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Simulationshinweis</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{globalSimulationHint}</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{currentDataset.metadaten.simulationshinweis}</p>
    </section>
  );
}
