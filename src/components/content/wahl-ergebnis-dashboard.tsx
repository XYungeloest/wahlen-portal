"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ParteienBalken } from "@/components/charts/parteien-balken";
import { SitzHalbrund } from "@/components/charts/sitz-halbrund";
import { KartenModul, type MetricType } from "@/components/maps/kartenmodul";
import { formatDatum, formatProzent, formatZahl } from "@/lib/formatierung";
import type { Bezirk, ErgebnisBlock, GeoFeatureCollection, WahlDataset, WahlTyp } from "@/lib/types";

type Props = {
  typ: WahlTyp;
  datasets: WahlDataset[];
  bezirke: Bezirk[];
  geo: GeoFeatureCollection;
  partyColors: Record<string, string>;
};

export function WahlErgebnisDashboard({ typ, datasets, bezirke, geo, partyColors }: Props) {
  const defaultDatasetId = datasets.find((dataset) => dataset.gebiete.length > 0)?.id ?? datasets[0]?.id ?? "";
  const [datasetId, setDatasetId] = useState(defaultDatasetId);
  const [kartenBezirkId, setKartenBezirkId] = useState("alle");
  const [kartenMetric, setKartenMetric] = useState<MetricType>("winner");
  const [kartenPartyFilter, setKartenPartyFilter] = useState("alle");
  const currentDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === datasetId) ?? datasets[0],
    [datasetId, datasets],
  );
  const hasMapData = currentDataset.gebiete.length > 0;
  const hasRegionalWinnerPercent = currentDataset.gebiete.some((gebiet) => gebiet.staerksteParteiProzent > 0);
  const mapStatus = hasMapData
    ? typ === "landtag"
      ? "Landkreise und kreisfreie Städte"
      : "Bundestagswahlkreise"
    : "keine regionale Karte";
  const regionalValueStatus = hasMapData
    ? hasRegionalWinnerPercent
      ? "regionale Prozentwerte vorhanden"
      : "nur Gebietssieger ausgewiesen"
    : "keine Gebietsdaten";

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
        .map(([name, seats]) => ({
          name,
          seats,
          voteShare: currentDataset.summary.gesamtergebnis[name] ?? 0,
          color: partyColors[name] ?? "#64748b",
        }))
        .sort((a, b) => b.voteShare - a.voteShare || b.seats - a.seats),
    [currentDataset, partyColors],
  );

  return (
    <div className="space-y-6">
      <section className="card p-5">
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
              className="mt-1 w-full rounded-lg border border-[#c5d7d3] bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#0f766e]"
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
          <StatTile label="Wahlbeteiligung" value={formatMaybeProzent(currentDataset.wahlbeteiligung)} />
          <StatTile label="Wahlberechtigte" value={formatMaybeZahl(currentDataset.wahlberechtigte)} />
          <StatTile label="Gültige Stimmen" value={formatMaybeZahl(currentDataset.gueltigeStimmen)} />
          <StatTile label="Kartenstatus" value={mapStatus} />
        </div>

        <DataQualitySummary dataset={currentDataset} hasMapData={hasMapData} regionalValueStatus={regionalValueStatus} />
      </section>

      {hasMapData ? (
        <KartenModul
          title={typ === "landtag" ? "Regionale Wahlkarte" : "Wahlkreiskarte"}
          bezirke={bezirke}
          geo={geo}
          datasets={datasets}
          datasetId={datasetId}
          onDatasetChange={setDatasetId}
          bezirkId={kartenBezirkId}
          onBezirkChange={setKartenBezirkId}
          metric={kartenMetric}
          onMetricChange={setKartenMetric}
          partyFilter={kartenPartyFilter}
          onPartyFilterChange={setKartenPartyFilter}
          partyColors={partyColors}
        />
      ) : (
        <NoMapDataNotice typ={typ} />
      )}

      {hasMapData ? (
        <BezirksUebersicht
          dataset={currentDataset}
          bezirke={bezirke}
          partyColors={partyColors}
          activeBezirkId={kartenBezirkId}
          onBezirkSelect={setKartenBezirkId}
        />
      ) : null}

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

      {/* <DatasetComparison currentDataset={currentDataset} datasets={datasets} partyColors={partyColors} /> */}

      {typ === "landtag" && seatItems.length > 0 ? (
        <SitzHalbrund
          title="Sitzverteilung im Landtag"
          totalSeats={currentDataset.summary.sitzeGesamt ?? 0}
          majority={currentDataset.summary.mehrheitsgrenze ?? 0}
          data={seatItems}
        />
      ) : null}

      {typ === "bundestag" && currentDataset.summary.direktmandat ? (
        <DirektmandatCard direktmandat={currentDataset.summary.direktmandat} />
      ) : null}

      <section className="card p-5">
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
        bezirke={bezirke}
        bezirkId={kartenBezirkId}
        partyFilter={kartenPartyFilter}
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

function formatMaybeProzent(value: number) {
  return value > 0 ? formatProzent(value) : "nicht ausgewiesen";
}

function formatMaybeZahl(value: number) {
  return value > 0 ? formatZahl(value) : "nicht ausgewiesen";
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#d4e2de] bg-white px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold text-[#15343d]">{value}</p>
    </div>
  );
}

function DataQualitySummary({
  dataset,
  hasMapData,
  regionalValueStatus,
}: {
  dataset: WahlDataset;
  hasMapData: boolean;
  regionalValueStatus: string;
}) {
  return (
    <section className="mt-5 rounded-lg border border-[#d5e3df] bg-[#f7fbfa] p-4 text-sm text-slate-700" aria-label="Datenstand und Quelle">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Datenstand und Quelle</p>
          <p className="mt-2 leading-6">
            Datenstand: <strong>{dataset.datenstand}</strong>. Quelle: <strong>{dataset.metadaten.quelle}</strong>
          </p>
          <p className="mt-2 leading-6">
            Regionale Darstellung: {hasMapData ? regionalValueStatus : "für diesen Datensatz nicht verfügbar"}.{" "}
            {hasMapData && regionalValueStatus === "nur Gebietssieger ausgewiesen"
              ? "Es werden keine regionalen Prozentwerte konstruiert."
              : null}
          </p>
        </div>
        <Link
          href="/methodik/"
          className="inline-flex items-center justify-center rounded-lg border border-[#9dbdc0] bg-white px-4 py-2 text-sm font-medium text-[#184650] no-underline transition hover:border-[#0f5e68] hover:bg-[#eef6f5]"
        >
          Methodik öffnen
        </Link>
      </div>
    </section>
  );
}

function DirektmandatCard({ direktmandat }: { direktmandat: NonNullable<WahlDataset["summary"]["direktmandat"]> }) {
  return (
    <section className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Direktmandat Ostdeutschland</p>
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="break-words text-xl font-semibold text-[#16343d]">{direktmandat.kandidat}</h3>
          <p className="mt-1 text-sm text-slate-700">
            {direktmandat.partei} mit {formatProzent(direktmandat.stimmenanteil)}
          </p>
        </div>
        <p className="text-sm font-medium text-slate-600">{direktmandat.mandatName}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{direktmandat.hinweis}</p>
    </section>
  );
}

function NoMapDataNotice({ typ }: { typ: WahlTyp }) {
  return (
    <section className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Regionale Karte</p>
      <h3 className="mt-2 text-xl font-semibold text-[#14333d]">Für diesen Datensatz nicht verfügbar</h3>
      <p className="mt-3 text-sm leading-7 text-slate-700">
        Die Quelle enthält keine belastbare regionale Kartenauflösung für{" "}
        {typ === "landtag" ? "Landkreise und kreisfreie Städte" : "Bundestagswahlkreise"}. Deshalb wird keine künstliche
        Gebietsverteilung ergänzt.
      </p>
      <p className="mt-3 rounded-lg border border-[#d5e3df] bg-white p-3 text-sm leading-6 text-slate-700">
        Die Ergebnisdaten bleiben als aggregierte Tabellen- und Diagrammansicht verfügbar.
      </p>
    </section>
  );
}

function BezirksUebersicht({
  dataset,
  bezirke,
  partyColors,
  activeBezirkId,
  onBezirkSelect,
}: {
  dataset: WahlDataset;
  bezirke: Bezirk[];
  partyColors: Record<string, string>;
  activeBezirkId: string;
  onBezirkSelect: (nextValue: string) => void;
}) {
  const cards = useMemo(
    () =>
      bezirke
        .map((bezirk) => {
          const gebiete = dataset.gebiete.filter((gebiet) => gebiet.bezirkId === bezirk.id);
          const winnerCounts = new Map<string, number>();
          for (const gebiet of gebiete) {
            for (const winner of getGebietWinners(gebiet)) {
              winnerCounts.set(winner, (winnerCounts.get(winner) ?? 0) + 1);
            }
          }
          const leadingParty = Array.from(winnerCounts.entries()).sort((left, right) => right[1] - left[1])[0];

          return {
            ...bezirk,
            gebiete: gebiete.length,
            leadingParty: leadingParty?.[0] ?? "nicht ausgewiesen",
            leadingCount: leadingParty?.[1] ?? 0,
          };
        })
        .filter((bezirk) => bezirk.gebiete > 0),
    [bezirke, dataset],
  );

  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="card p-5" aria-label="Bezirksübersicht">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Regionale Orientierung</p>
          <h3 className="mt-2 text-xl font-semibold text-[#14333d]">Bezirke im Datensatz</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Kompakte Übersicht der Bezirke mit Gebietszahl und häufigster stärkster Partei.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-[#b8cfca] bg-white px-4 py-2 text-sm font-medium text-[#184650] transition hover:border-[#0f5e68] hover:bg-[#eef6f5]"
          onClick={() => onBezirkSelect("alle")}
        >
          Alle Bezirke anzeigen
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((bezirk) => {
          const active = activeBezirkId === bezirk.id;
          return (
            <button
              key={bezirk.id}
              type="button"
              className={`rounded-xl border p-4 text-left transition ${
                active
                  ? "border-[#0f5e68] bg-[#eef8f6] shadow-[0_10px_24px_rgba(0,43,49,0.08)]"
                  : "border-[#d5e3df] bg-white hover:border-[#9dbdc0] hover:bg-[#f8fbfa]"
              }`}
              onClick={() => onBezirkSelect(bezirk.id)}
              aria-pressed={active}
            >
              <p className="text-sm font-semibold text-[#14333d]">{bezirk.name}</p>
              <p className="mt-1 text-xs text-slate-600">Hauptstadt: {bezirk.hauptstadt}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-700">
                <span
                  className="h-3 w-3 rounded-full flex-shrink-0 border border-white shadow"
                  style={{ backgroundColor: partyColors[bezirk.leadingParty] ?? "#64748b" }}
                  aria-hidden="true"
                />
                <span>
                  {bezirk.leadingParty} in {formatZahl(bezirk.leadingCount)} von {formatZahl(bezirk.gebiete)} Gebieten
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DatasetComparison({
  currentDataset,
  datasets,
  partyColors,
}: {
  currentDataset: WahlDataset;
  datasets: WahlDataset[];
  partyColors: Record<string, string>;
}) {
  const previousDataset = useMemo(() => {
    const comparable = datasets
      .filter((dataset) => dataset.id !== currentDataset.id && dataset.gebietsebene === currentDataset.gebietsebene)
      .slice()
      .sort((left, right) => new Date(left.datum).getTime() - new Date(right.datum).getTime());
    const currentTime = new Date(currentDataset.datum).getTime();
    return comparable.filter((dataset) => new Date(dataset.datum).getTime() <= currentTime).at(-1) ?? comparable.at(-1);
  }, [currentDataset, datasets]);

  if (!previousDataset) {
    return null;
  }

  const parties = Array.from(
    new Set([...Object.keys(currentDataset.summary.gesamtergebnis), ...Object.keys(previousDataset.summary.gesamtergebnis)]),
  )
    .map((party) => ({
      party,
      current: currentDataset.summary.gesamtergebnis[party] ?? 0,
      previous: previousDataset.summary.gesamtergebnis[party] ?? 0,
      seatsCurrent: currentDataset.summary.sitzverteilung?.[party],
      seatsPrevious: previousDataset.summary.sitzverteilung?.[party],
    }))
    .sort((left, right) => right.current - left.current)
    .slice(0, 6);

  const turnoutDelta = currentDataset.wahlbeteiligung - previousDataset.wahlbeteiligung;

  return (
    <section className="card p-5" aria-label="Vergleich mit vorherigem Datensatz">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Vergleich</p>
          <h3 className="mt-2 text-xl font-semibold text-[#14333d]">Gegenüber {previousDataset.label}</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Veränderung der zentralen Ergebniswerte gegenüber dem nächstliegenden älteren Datensatz.
          </p>
        </div>
        <p className="font-mono-data text-sm text-slate-600">
          Wahlbeteiligung: {formatSignedPercent(turnoutDelta)}
        </p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="table-basic">
          <caption className="sr-only">Vergleich der Parteienergebnisse</caption>
          <thead>
            <tr>
              <th scope="col">Partei</th>
              <th scope="col">Aktuell</th>
              <th scope="col">Vergleich</th>
              <th scope="col">Veränderung</th>
              {currentDataset.summary.sitzverteilung ? <th scope="col">Sitze</th> : null}
            </tr>
          </thead>
          <tbody>
            {parties.map((entry) => (
              <tr key={entry.party}>
                <th scope="row">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full border border-white shadow"
                      style={{ backgroundColor: partyColors[entry.party] ?? "#64748b" }}
                      aria-hidden="true"
                    />
                    {entry.party}
                  </span>
                </th>
                <td className="font-mono-data">{formatProzent(entry.current)}</td>
                <td className="font-mono-data">{formatProzent(entry.previous)}</td>
                <td className="font-mono-data">{formatSignedPercent(entry.current - entry.previous)}</td>
                {currentDataset.summary.sitzverteilung ? (
                  <td className="font-mono-data">
                    {entry.seatsCurrent ?? "-"}
                    {typeof entry.seatsCurrent === "number" && typeof entry.seatsPrevious === "number"
                      ? ` (${formatSignedNumber(entry.seatsCurrent - entry.seatsPrevious)})`
                      : ""}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ErgebnisTabelle({ block, typ }: { block: ErgebnisBlock; typ: WahlTyp }) {
  const hasVotes = block.parteien.some((entry) => entry.stimmen > 0);
  const candidateVote = isCandidateVote(block);
  const showPartyColumn = candidateVote;

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
              {showPartyColumn ? <th scope="col">Partei</th> : null}
              {hasVotes ? <th scope="col">Stimmen</th> : null}
              <th scope="col">Prozent</th>
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
                  {showPartyColumn ? <td>{entry.kurz ?? entry.name}</td> : null}
                  {hasVotes ? <td className="font-mono-data">{entry.stimmen > 0 ? formatZahl(entry.stimmen) : "0"}</td> : null}
                  <td className="font-mono-data">{formatProzent(entry.prozent)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GebietsTabelle({
  areaLabel,
  dataset,
  bezirke,
  bezirkId,
  partyFilter,
}: {
  areaLabel: string;
  dataset: WahlDataset;
  bezirke: Bezirk[];
  bezirkId: string;
  partyFilter: string;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeSearch(query);
  const selectedBezirk = bezirke.find((bezirk) => bezirk.id === bezirkId);
  const allRows = useMemo(
    () =>
      dataset.gebiete.slice().sort((left, right) => {
        const districtCompare = left.bezirk.localeCompare(right.bezirk, "de");
        return districtCompare === 0 ? left.gebietName.localeCompare(right.gebietName, "de") : districtCompare;
      }),
    [dataset],
  );
  const rows = allRows.filter((row) => {
    const winners = getGebietWinners(row);
    const matchesBezirk = bezirkId === "alle" || row.bezirkId === bezirkId;
    const matchesParty = partyFilter === "alle" || winners.includes(partyFilter);
    const searchable = normalizeSearch([row.gebietName, row.officialName, row.bezirk, row.staerkstePartei, ...winners].filter(Boolean).join(" "));
    const matchesQuery = normalizedQuery.length === 0 || searchable.includes(normalizedQuery);
    return matchesBezirk && matchesParty && matchesQuery;
  });

  if (dataset.gebiete.length === 0) {
    return null;
  }

  const activeFilters = [
    selectedBezirk ? `Bezirk ${selectedBezirk.name}` : "alle Bezirke",
    partyFilter !== "alle" ? `Partei ${partyFilter}` : "alle Parteien",
  ].join(", ");

  return (
    <section className="card p-5" aria-label="Tabellarische Kartenalternative">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#14333d]">Tabellenalternative zur Karte</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Barrierefreie Gebietsliste aus derselben Datengrundlage wie die Kartenansicht, synchron zu Bezirks- und Parteifilter.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Angezeigt: {formatZahl(rows.length)} von {formatZahl(allRows.length)}
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block text-sm font-medium text-slate-700">
          Gebietstabelle durchsuchen
          <input
            className="mt-1 w-full rounded-lg border border-[#c5d7d3] bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#0f766e]"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${areaLabel} oder Bezirk eingeben`}
          />
        </label>
        <p className="rounded-lg border border-[#d5e3df] bg-[#f7fbfa] px-3 py-2 text-sm text-slate-600">
          Kartenfilter: {activeFilters}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="table-basic">
          <caption className="sr-only">Tabellarische Kartenalternative</caption>
          <thead>
            <tr>
              <th scope="col">{areaLabel}</th>
              <th scope="col">Bezirk</th>
              <th scope="col">Stärkste Partei</th>
              <th scope="col">Anteil stärkste Partei</th>
              <th scope="col">Wahlbeteiligung</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.gebietId}>
                  <th scope="row">{row.gebietName}</th>
                  <td>{row.bezirk}</td>
                  <td>{getGebietWinners(row).join(", ")}</td>
                  <td className="font-mono-data">{row.staerksteParteiProzent > 0 ? formatProzent(row.staerksteParteiProzent) : "nicht ausgewiesen"}</td>
                  <td className="font-mono-data">{formatProzent(row.wahlbeteiligung)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Keine passenden Gebiete für Suche und aktive Kartenfilter gefunden.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getGebietWinners(row: WahlDataset["gebiete"][number]) {
  return row.staerksteParteien && row.staerksteParteien.length > 0 ? row.staerksteParteien : [row.staerkstePartei];
}

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("de")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—−]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSignedPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatProzent(value)}`;
}

function formatSignedNumber(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}
