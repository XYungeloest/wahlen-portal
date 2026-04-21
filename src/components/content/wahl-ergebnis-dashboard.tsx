"use client";

import { useMemo, useState } from "react";
import { ParteienBalken } from "@/components/charts/parteien-balken";
import { SitzHalbrund } from "@/components/charts/sitz-halbrund";
import { KartenModul } from "@/components/maps/kartenmodul";
import { formatDatum, formatProzent, formatZahl } from "@/lib/formatierung";
import type { Bezirk, ErgebnisBlock, GeoFeatureCollection, WahlDataset, WahlTyp } from "@/lib/types";

type Props = {
  typ: WahlTyp;
  datasets: WahlDataset[];
  bezirke: Bezirk[];
  geo: GeoFeatureCollection;
  partyColors: Record<string, string>;
  globalSimulationHint: string;
};

export function WahlErgebnisDashboard({ typ, datasets, bezirke, geo, partyColors, globalSimulationHint }: Props) {
  const defaultDatasetId = datasets.find((dataset) => dataset.gebiete.length > 0)?.id ?? datasets[0]?.id ?? "";
  const [datasetId, setDatasetId] = useState(defaultDatasetId);
  const currentDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === datasetId) ?? datasets[0],
    [datasetId, datasets],
  );

  const chartBlocks = useMemo<ErgebnisBlock[]>(() => {
    const detailBlocks = currentDataset.summary.detailergebnisse?.filter((block) => block.parteien.length > 0) ?? [];
    if (detailBlocks.length > 0) {
      return detailBlocks.slice().sort((left, right) => blockOrder(left, typ) - blockOrder(right, typ));
    }

    return [
      {
        id: "gesamt",
        label: typ === "landtag" ? "Landesweites Parteienergebnis" : "Ostweites Gesamtergebnis",
        stimmart: "gesamt" as const,
        parteien: Object.entries(currentDataset.summary.gesamtergebnis)
          .map(([name, prozent]) => ({
            name,
            stimmen: 0,
            prozent,
            sitze: currentDataset.summary.sitzverteilung?.[name],
          }))
          .sort((left, right) => right.prozent - left.prozent),
      },
    ];
  }, [currentDataset, typ]);

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
            <h2 className="mt-2 break-words text-3xl font-semibold text-[#15343d]">{currentDataset.label}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Wahltag: {formatDatum(currentDataset.datum)}.
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
          <StatTile
            label="Gebietsebene"
            value={typ === "landtag" ? "Landkreise und kreisfreie Städte" : "Bundestagswahlkreise"}
          />
        </div>
      </section>

      <KartenModul
        title={typ === "landtag" ? "Regionale Wahlkarte" : "Wahlkreiskarte"}
        bezirke={bezirke}
        geo={geo}
        datasets={datasets}
        datasetId={datasetId}
        onDatasetChange={setDatasetId}
        partyColors={partyColors}
        globalSimulationHint={globalSimulationHint}
      />

      <section className={`grid gap-6 ${chartBlocks.length > 1 ? "xl:grid-cols-2" : "xl:grid-cols-1"}`}>
        {chartBlocks.map((block) => (
          <ParteienBalken
            key={block.id}
            title={displayBlockTitle(block, typ)}
            subtitle={block.hinweis}
            data={displayParties(block)
              .map((entry) => ({
                name: displayEntryName(entry, block),
                value: entry.prozent,
                color: partyColors[entry.name] ?? partyColors[entry.normiertAuf ?? ""] ?? "#64748b",
              }))
              .sort((a, b) => b.value - a.value)}
          />
        ))}
      </section>
      {typ === "landtag" && seatItems.length > 0 ? (
          <SitzHalbrund
            title="Sitzverteilung im Landtag"
            totalSeats={currentDataset.summary.sitzeGesamt ?? 0}
            majority={currentDataset.summary.mehrheitsgrenze ?? 0}
            data={seatItems}
          />
      ) : null}

      {typ === "bundestag" && currentDataset.summary.direktmandat ? (
        <section className="rounded-[1.25rem] border border-[#d0ddd9] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Direktmandat Ostdeutschland</p>
                  <h3 className="mt-2 break-words text-lg font-semibold text-[#16343d]">{currentDataset.summary.direktmandat.kandidat}</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    {currentDataset.summary.direktmandat.partei} mit {formatProzent(currentDataset.summary.direktmandat.stimmenanteil)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{currentDataset.summary.direktmandat.hinweis}</p>
                </section>
      ) : null}

      <section className="rounded-[1.5rem] border border-[#cddcda] bg-white p-5 shadow-[0_18px_40px_rgba(0,38,46,0.06)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#14333d]">Tabellarische Ergebnisansicht</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Stimmen, Prozentwerte und gegebenenfalls Sitzzahlen aus derselben Datengrundlage wie die Visualisierungen.
            </p>
          </div>
          <p className="text-sm text-slate-500">Quelle: {currentDataset.metadaten.quelle}</p>
        </div>

        <div className="mt-5 space-y-6">
          {chartBlocks.map((block) => (
            <ErgebnisTabelle key={block.id} block={block} typ={typ} />
          ))}
        </div>
      </section>

      <GebietsTabelle
        areaLabel={typ === "landtag" ? "Landkreis / kreisfreie Stadt" : "Bundestagswahlkreis"}
        dataset={currentDataset}
      />
    </div>
  );
}

function blockOrder(block: ErgebnisBlock, typ: WahlTyp) {
  if (typ !== "bundestag") {
    return 0;
  }
  if (block.stimmart === "erststimme" || block.stimmart === "wahlkreisstimme") {
    return 0;
  }
  if (block.stimmart === "zweitstimme" || block.stimmart === "listenstimme") {
    return 1;
  }
  return 2;
}

function displayBlockTitle(block: ErgebnisBlock, typ: WahlTyp) {
  if (typ === "bundestag") {
    if (block.stimmart === "erststimme" || block.stimmart === "wahlkreisstimme") {
      return "Erststimme";
    }
    if (block.stimmart === "zweitstimme" || block.stimmart === "listenstimme") {
      return "Zweitstimme";
    }
  }
  return block.label;
}

function isCandidateVote(block: ErgebnisBlock) {
  return block.stimmart === "erststimme" || block.stimmart === "wahlkreisstimme";
}

function displayParties(block: ErgebnisBlock) {
  if (!isCandidateVote(block)) {
    return block.parteien;
  }
  return block.parteien.filter((entry) => Boolean(entry.kandidat));
}

function displayEntryName(entry: ErgebnisBlock["parteien"][number], block: ErgebnisBlock) {
  const partyLabel = entry.kurz ?? entry.name;
  if (isCandidateVote(block)) {
    return `${entry.kandidat} (${partyLabel})`;
  }
  return entry.kurz ? `${entry.name} (${entry.kurz})` : entry.name;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-[#d4e2de] bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-[#15343d]">{value}</p>
    </div>
  );
}

function ErgebnisTabelle({ block, typ }: { block: ErgebnisBlock; typ: WahlTyp }) {
  const hasSeats = block.parteien.some((entry) => typeof entry.sitze === "number");
  const hasVotes = block.parteien.some((entry) => entry.stimmen > 0);
  const candidateVote = isCandidateVote(block);

  return (
    <section>
      <div className="mb-3">
        <h4 className="text-lg font-semibold text-[#15343d]">{displayBlockTitle(block, typ)}</h4>
        {block.hinweis ? <p className="mt-1 text-sm leading-6 text-slate-600">{block.hinweis}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="table-basic">
          <thead>
            <tr>
              <th scope="col">{candidateVote ? "Kandidatur" : "Partei"}</th>
              {hasVotes ? <th scope="col">Stimmen</th> : null}
              <th scope="col">Prozent</th>
              <th scope="col">Partei</th>
              {!candidateVote ? <th scope="col">Kandidatur</th> : null}
              {hasSeats ? <th scope="col">Sitze</th> : null}
            </tr>
          </thead>
          <tbody>
            {displayParties(block)
              .slice()
              .sort((left, right) => right.prozent - left.prozent)
              .map((entry) => (
                <tr key={`${block.id}-${entry.name}`}>
                  <th scope="row" className="min-w-[14rem] break-words">
                    {displayEntryName(entry, block)}
                  </th>
                  {hasVotes ? <td className="font-mono-data">{entry.stimmen > 0 ? formatZahl(entry.stimmen) : "0"}</td> : null}
                  <td className="font-mono-data">{formatProzent(entry.prozent)}</td>
                  <td>{entry.kurz ?? entry.name}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GebietsTabelle({ areaLabel, dataset }: { areaLabel: string; dataset: WahlDataset }) {
  if (dataset.gebiete.length === 0) {
    return null;
  }

  const rows = dataset.gebiete.slice().sort((left, right) => {
    const districtCompare = left.bezirk.localeCompare(right.bezirk, "de");
    return districtCompare === 0 ? left.gebietName.localeCompare(right.gebietName, "de") : districtCompare;
  });

  return (
    <section className="rounded-[1.5rem] border border-[#cddcda] bg-white p-5 shadow-[0_18px_40px_rgba(0,38,46,0.06)]" aria-label="Tabellarische Kartenalternative">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#14333d]">Tabellenalternative zur Karte</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">Barrierefreie Gebietsliste aus derselben Datengrundlage wie die Kartenansicht.</p>
        </div>
        <p className="text-sm text-slate-500">Gebiete: {formatZahl(rows.length)}</p>
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
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.gebietId}>
                <th scope="row">{row.gebietName}</th>
                <td>{row.bezirk}</td>
                <td>{row.staerkstePartei}</td>
                <td className="font-mono-data">{formatProzent(row.wahlbeteiligung)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
