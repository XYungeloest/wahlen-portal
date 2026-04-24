"use client";

import { interpolateRgb } from "d3-interpolate";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Wahlkarte, type KartenFlaeche } from "@/components/maps/wahlkarte";
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
  bezirkId: string;
  onBezirkChange: (nextValue: string) => void;
  metric: MetricType;
  onMetricChange: (nextValue: MetricType) => void;
  partyFilter: string;
  onPartyFilterChange: (nextValue: string) => void;
  partyColors: Record<string, string>;
};

export type MetricType = "winner" | "turnout";

type SearchOption = {
  id: string;
  label: string;
  officialName?: string;
  bezirk: string;
  bezirkId: string;
  nummer?: string;
  normalizedLabel: string;
  normalizedSearch: string;
  normalizedTerms: string[];
};

export function KartenModul({
  title,
  bezirke,
  geo,
  datasets,
  datasetId,
  onDatasetChange,
  bezirkId,
  onBezirkChange,
  metric,
  onMetricChange,
  partyFilter,
  onPartyFilterChange,
  partyColors,
}: Props) {
  const defaultDatasetId = datasets.find((dataset) => dataset.gebiete.length > 0)?.id ?? datasets[0]?.id ?? "";
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const currentDatasetId = datasetId ?? defaultDatasetId;

  const currentDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === currentDatasetId) ?? datasets[0],
    [currentDatasetId, datasets],
  );

  const hasRegionalData = (currentDataset?.gebiete.length ?? 0) > 0;

  const geoMetaById = useMemo(
    () =>
      Object.fromEntries(
        geo.features.map((feature) => {
          const id = String(feature.properties.id ?? "");
          return [
            id,
            {
              officialName:
                typeof feature.properties.officialName === "string"
                  ? feature.properties.officialName
                  : typeof feature.properties.name === "string"
                    ? feature.properties.name
                    : undefined,
              nummer: typeof feature.properties.nummer === "string" ? feature.properties.nummer : undefined,
            },
          ];
        }),
      ),
    [geo.features],
  );

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

  const winnerPartyOptions = useMemo(() => {
    const parties = new Set<string>();
    for (const row of filteredRows) {
      const winners = row.staerksteParteien?.length ? row.staerksteParteien : [row.staerkstePartei];
      winners.forEach((winner) => parties.add(winner));
    }
    return Array.from(parties).sort((left, right) => left.localeCompare(right, "de"));
  }, [filteredRows]);

  const searchOptions = useMemo<SearchOption[]>(() => {
    if (!currentDataset) {
      return [];
    }

    return currentDataset.gebiete
      .map((row) => {
        const geoMeta = geoMetaById[row.gebietId];
        const officialName = row.officialName ?? geoMeta?.officialName;
        const nummer = geoMeta?.nummer;
        const searchTerms = [row.gebietName, officialName, row.bezirk, nummer].filter(Boolean) as string[];

        return {
          id: row.gebietId,
          label: row.gebietName,
          officialName,
          bezirk: row.bezirk,
          bezirkId: row.bezirkId,
          nummer,
          normalizedLabel: normalizeSearchValue(row.gebietName),
          normalizedTerms: searchTerms.map((term) => normalizeSearchValue(term)),
          normalizedSearch: normalizeSearchValue(searchTerms.join(" ")),
        };
      })
      .sort((left, right) => left.label.localeCompare(right.label, "de"));
  }, [currentDataset, geoMetaById]);

  useEffect(() => {
    if (metric !== "winner" && partyFilter !== "alle") {
      onPartyFilterChange("alle");
    }
  }, [metric, onPartyFilterChange, partyFilter]);

  useEffect(() => {
    if (partyFilter !== "alle" && !winnerPartyOptions.includes(partyFilter)) {
      onPartyFilterChange("alle");
    }
  }, [onPartyFilterChange, partyFilter, winnerPartyOptions]);

  useEffect(() => {
    if (focusedId && !currentDataset?.gebiete.some((row) => row.gebietId === focusedId)) {
      setFocusedId(null);
    }
  }, [currentDataset, focusedId]);

  useEffect(() => {
    if (focusedId && !filteredRows.some((row) => row.gebietId === focusedId)) {
      setFocusedId(null);
    }
  }, [filteredRows, focusedId]);

  const metricValues = useMemo(() => {
    if (metric === "winner") {
      return [];
    }
    return filteredRows.map((row) => row.wahlbeteiligung);
  }, [filteredRows, metric]);

  const minMetricValue = metricValues.length > 0 ? Math.min(...metricValues) : 0;
  const maxMetricValue = metricValues.length > 0 ? Math.max(...metricValues) : 100;

  const filteredPartyMatchCount = useMemo(() => {
    if (metric !== "winner" || partyFilter === "alle") {
      return filteredRows.length;
    }
    return filteredRows.filter((row) => {
      const winners = row.staerksteParteien?.length ? row.staerksteParteien : [row.staerkstePartei];
      return winners.includes(partyFilter);
    }).length;
  }, [filteredRows, metric, partyFilter]);

  const areasById = useMemo<Record<string, KartenFlaeche>>(() => {
    return Object.fromEntries(
      filteredRows.map((row) => {
        const metricValue = row.wahlbeteiligung;
        const winners = row.staerksteParteien?.length ? row.staerksteParteien : [row.staerkstePartei];
        const winnerLabel = winners.join(" / ");
        const winnerPercentLabel = row.staerksteParteiProzent > 0 ? ` (${formatProzent(row.staerksteParteiProzent)})` : "";
        const matchesPartyFilter = metric !== "winner" || partyFilter === "alle" || winners.includes(partyFilter);
        const patternId =
          metric === "winner" && winners.length > 1 && matchesPartyFilter
            ? `tie-${winners.map(slugify).join("-")}`
            : undefined;
        const patternColors =
          metric === "winner" && winners.length > 1 && matchesPartyFilter
            ? ([partyColors[winners[0]] ?? "#94a3b8", partyColors[winners[1]] ?? "#334155"] as [string, string])
            : undefined;
        const fill =
          metric === "winner"
            ? matchesPartyFilter
              ? partyColors[winners[0]] ?? "#94a3b8"
              : "#d6dde3"
            : scaleColor(metricValue, minMetricValue, maxMetricValue, "#d7f0ea", "#0f766e");
        const detailParts = [`Bezirk ${row.bezirk}.`, `Wahlbeteiligung: ${formatProzent(row.wahlbeteiligung)}.`];

        if (metric === "winner" && row.staerksteParteiProzent <= 0) {
          detailParts.push("Regionaler Prozentwert der stärksten Partei: nicht ausgewiesen.");
        }

        if (metric === "winner" && partyFilter !== "alle" && !matchesPartyFilter) {
          detailParts.push(`Im aktiven Parteienfilter wird dieses Gebiet visuell zurückgenommen.`);
        }

        const metricLabel =
          metric === "winner"
            ? `${winners.length > 1 ? "Gleichstand stärkste Kräfte" : "Stärkste Partei"}: ${winnerLabel}${winnerPercentLabel}`
            : `Wahlbeteiligung: ${formatProzent(row.wahlbeteiligung)}`;
        const history = datasets
          .filter(
            (dataset) =>
              dataset.id !== currentDataset.id &&
              dataset.datum < currentDataset.datum &&
              dataset.gebietsebene === currentDataset.gebietsebene,
          )
          .sort((left, right) => right.datum.localeCompare(left.datum))
          .flatMap((dataset) => {
            const historicalRow = dataset.gebiete.find((gebiet) => gebiet.gebietId === row.gebietId);
            if (!historicalRow) {
              return [];
            }

            if (metric === "turnout") {
              return [
                {
                  id: dataset.id,
                  label: dataset.label,
                  datum: formatDatum(dataset.datum),
                  value: `Wahlbeteiligung: ${formatProzent(historicalRow.wahlbeteiligung)}`,
                  color: scaleColor(historicalRow.wahlbeteiligung, minMetricValue, maxMetricValue, "#d7f0ea", "#0f766e"),
                },
              ];
            }

            const historicalWinners = historicalRow.staerksteParteien?.length
              ? historicalRow.staerksteParteien
              : [historicalRow.staerkstePartei];
            const historicalWinnerLabel = historicalWinners.join(" / ");
            const historicalPercentLabel =
              historicalRow.staerksteParteiProzent > 0 ? ` (${formatProzent(historicalRow.staerksteParteiProzent)})` : "";

            return [
              {
                id: dataset.id,
                label: dataset.label,
                datum: formatDatum(dataset.datum),
                value: `${historicalWinnerLabel}${historicalPercentLabel}`,
                color: partyColors[historicalWinners[0]] ?? "#94a3b8",
                colors:
                  historicalWinners.length > 1
                    ? ([partyColors[historicalWinners[0]] ?? "#94a3b8", partyColors[historicalWinners[1]] ?? "#334155"] as [
                        string,
                        string,
                      ])
                    : undefined,
              },
            ];
          });

        return [
          row.gebietId,
          {
            id: row.gebietId,
            name: row.gebietName,
            fill,
            patternId,
            patternColors,
            opacity: metric === "winner" && partyFilter !== "alle" && !matchesPartyFilter ? 0.3 : 1,
            headline: metricLabel,
            detail: detailParts.join(" "),
            ariaLabel: `${row.gebietName}, Bezirk ${row.bezirk}. ${metricLabel}`,
            history,
          },
        ];
      }),
    );
  }, [currentDataset, datasets, filteredRows, maxMetricValue, metric, minMetricValue, partyColors, partyFilter]);

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

  const handleMetricChange = (nextValue: string) => {
    const nextMetric = nextValue as MetricType;
    onMetricChange(nextMetric);
    if (nextMetric !== "winner") {
      onPartyFilterChange("alle");
    }
  };

  const handleSearchSelect = (option: SearchOption) => {
    if (bezirkId !== "alle" && option.bezirkId !== bezirkId) {
      onBezirkChange("alle");
    }
    setFocusedId(option.id);
  };

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
              Datensatz vom {formatDatum(currentDataset.datum)}. <br></br>Geo-Basis: {currentDataset.metadaten.geobasis}.
              <br></br>Quelle: {currentDataset.metadaten.quelle}.
            </p>
          </div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:min-w-[24rem] xl:min-w-[30rem]">
            <StatCard
              label="Gebietsebene"
              value={currentDataset.gebietsebene === "landkreis" ? "Landkreise / kreisfreie Städte" : "Bundestagswahlkreise"}
            />
            <StatCard label="Gebiete" value={hasRegionalData ? String(filteredRows.length) : "keine Regionaldaten"} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField
            label="Datensatz"
            value={currentDatasetId}
            disabled={!onDatasetChange}
            onChange={(nextValue) => onDatasetChange?.(nextValue)}
            options={datasets.map((dataset) => ({ value: dataset.id, label: `${dataset.label}` }))}
          />
          <SelectField
            label="Bezirk"
            value={bezirkId}
            disabled={!hasRegionalData}
            onChange={onBezirkChange}
            options={[
              { value: "alle", label: "Alle Bezirke" },
              ...bezirke.map((bezirk) => ({ value: bezirk.id, label: bezirk.name })),
            ]}
          />
          <SelectField
            label="Metrik"
            value={metric}
            disabled={!hasRegionalData}
            onChange={handleMetricChange}
            options={[
              { value: "winner", label: "Stärkste Partei" },
              { value: "turnout", label: "Wahlbeteiligung" },
            ]}
          />
          <SelectField
            label="Parteifilter"
            value={partyFilter}
            disabled={!hasRegionalData || metric !== "winner"}
            onChange={onPartyFilterChange}
            options={[
              { value: "alle", label: "Alle Parteien" },
              ...winnerPartyOptions.map((party) => ({ value: party, label: party })),
            ]}
          />
        </div>

        {hasRegionalData ? (
          <>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <AreaSearchCombobox
                label={currentDataset.gebietsebene === "landkreis" ? "Suche nach Landkreis oder Stadt" : "Suche nach Wahlkreis"}
                placeholder={
                  currentDataset.gebietsebene === "landkreis"
                    ? "Landkreis oder kreisfreie Stadt eingeben"
                    : "Wahlkreisname oder Nummer eingeben"
                }
                options={searchOptions}
                resetKey={`${currentDatasetId}-${currentDataset.gebietsebene}`}
                onSelect={handleSearchSelect}
              />

              {metric === "winner" && partyFilter !== "alle" ? (
                <section className="rounded-xl border border-[#d0ddd9] bg-[#f6fbfa] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Parteifilter aktiv</p>
                  <p className="mt-2 text-sm font-semibold text-[#14333d]">{partyFilter}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {filteredPartyMatchCount} von {filteredRows.length} Gebieten bleiben im aktuellen Kartenausschnitt hervorgehoben.
                  </p>
                </section>
              ) : (
                <div />
              )}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <Wahlkarte
                title={title}
                geo={filteredGeo}
                areasById={areasById}
                preserveFullExtent={bezirkId !== "alle"}
                focusedId={focusedId}
                onFocusedIdChange={setFocusedId}
              />

              <div className="space-y-4">
                <LegendCard metric={metric} legendItems={legendItems} minValue={minMetricValue} maxValue={maxMetricValue} />

                {currentDataset.summary.direktmandat ? <DirektmandatKartenHinweis /> : null}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <section className="rounded-xl border border-[#c8d8d5] bg-white p-5 shadow-[0_10px_24px_rgba(0,43,49,0.045)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Datensatz ohne regionale Karte</p>
              <h3 className="mt-2 text-xl font-semibold text-[#14333d]">Keine Kartenansicht für diesen Datensatz</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Für diesen Datensatz liegen keine belastbaren Gebietssieger oder regionalen Ergebniswerte vor. Eine künstliche
                Verteilung auf Landkreise oder Bundestagswahlkreise wird bewusst nicht ergänzt.
              </p>
              <div className="mt-4 rounded-lg border border-[#d5e3df] bg-white p-4 text-sm leading-6 text-slate-700">
                Für eine interaktive Karte bitte einen Datensatz mit regionaler Gebietsebene auswählen. Die aggregierten Ergebnisse
                bleiben in Diagrammen und Tabellen verfügbar.
              </div>
            </section>

            <div className="space-y-4">{currentDataset.summary.direktmandat ? <DirektmandatKartenHinweis /> : null}</div>
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

function normalizeSearchValue(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[–—]/g, "-")
    .replace(/[^a-z0-9-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreSearchOption(option: SearchOption, query: string) {
  if (!query) {
    return 0;
  }
  if (option.normalizedLabel === query) {
    return 500;
  }
  if (option.normalizedTerms.includes(query)) {
    return 350;
  }
  if (option.normalizedLabel.startsWith(query)) {
    return 250;
  }
  if (option.normalizedTerms.some((term) => term.startsWith(query))) {
    return 180;
  }
  if (option.normalizedSearch.includes(query)) {
    return 100;
  }
  return 0;
}

function formatSearchMeta(option: SearchOption) {
  const parts = [];
  if (option.nummer) {
    parts.push(`WK ${option.nummer}`);
  }
  if (option.officialName && option.officialName !== option.label) {
    parts.push(`offiziell ${option.officialName}`);
  }
  parts.push(option.bezirk);
  return parts.join(" · ");
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

function DirektmandatKartenHinweis() {
  return (
    <section className="rounded-xl border border-[#d0ddd9] bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Hinweis zur Bundestagskarte</p>
      <p className="mt-2 text-sm leading-6 text-slate-700">
        Das Direktmandat Ostdeutschland wird als gesondertes Ergebnis im Hauptbereich ausgewiesen und nicht als Kartenfläche modelliert.
      </p>
    </section>
  );
}

function AreaSearchCombobox({
  label,
  placeholder,
  options,
  onSelect,
  resetKey,
}: {
  label: string;
  placeholder: string;
  options: SearchOption[];
  onSelect: (option: SearchOption) => void;
  resetKey: string;
}) {
  const inputId = useId();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
  }, [resetKey]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) {
      return [];
    }

    return options
      .map((option) => ({
        option,
        score: scoreSearchOption(option, normalizedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => right.score - left.score || left.option.label.localeCompare(right.option.label, "de"))
      .slice(0, 8)
      .map((entry) => entry.option);
  }, [options, query]);

  const hasResults = results.length > 0;
  const showList = isOpen && query.trim().length > 0;
  const activeDescendant = showList && hasResults && activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined;

  useEffect(() => {
    if (!showList || !hasResults) {
      setActiveIndex(-1);
      return;
    }
    if (activeIndex >= results.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, hasResults, results.length, showList]);

  const commitSelection = (option: SearchOption) => {
    setQuery(option.label);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect(option);
  };

  return (
    <div className="relative">
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          className="w-full rounded-lg border border-[#c5d7d3] bg-white px-3 py-2.5 pr-11 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[#0f766e]"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            blurTimeoutRef.current = window.setTimeout(() => {
              setIsOpen(false);
              setActiveIndex(-1);
            }, 120);
          }}
          onKeyDown={(event) => {
            if (!showList || !hasResults) {
              if (event.key === "ArrowDown" && query.trim()) {
                setIsOpen(true);
                setActiveIndex(0);
              }
              if (event.key === "Escape") {
                setIsOpen(false);
                setActiveIndex(-1);
              }
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % results.length);
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
              return;
            }

            if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              commitSelection(results[activeIndex]);
              return;
            }

            if (event.key === "Escape") {
              event.preventDefault();
              setIsOpen(false);
              setActiveIndex(-1);
            }
          }}
        />

        {query ? (
          <button
            type="button"
            className="absolute inset-y-1 right-1 rounded-md px-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setActiveIndex(-1);
            }}
            aria-label="Suche leeren"
          >
            Löschen
          </button>
        ) : null}
      </div>

      {showList ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-[#d0ddd9] bg-white shadow-[0_18px_40px_rgba(0,43,49,0.12)]">
          {hasResults ? (
            <ul id={listboxId} role="listbox" className="max-h-80 overflow-y-auto py-1">
              {results.map((option, index) => (
                <li
                  key={option.id}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`cursor-pointer px-3 py-2.5 text-sm transition ${
                    index === activeIndex ? "bg-[#edf5f2] text-[#14333d]" : "text-slate-700 hover:bg-slate-50"
                  }`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commitSelection(option);
                  }}
                >
                  <span className="block break-words font-medium">{option.label}</span>
                  <span className="mt-0.5 block break-words text-xs text-slate-500">{formatSearchMeta(option)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 text-sm text-slate-600">Keine passenden Gebiete im aktuellen Datensatz gefunden.</p>
          )}
        </div>
      ) : null}
    </div>
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
                className="mt-0.5 h-3.5 w-5 flex-shrink-0 rounded-sm border border-slate-300"
                style={{
                  background: item.colors
                    ? `repeating-linear-gradient(45deg, ${item.colors[0]} 0 6px, ${item.colors[1]} 6px 12px)`
                    : item.color,
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
