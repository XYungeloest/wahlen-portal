"use client";

import { geoIdentity, geoPath } from "d3-geo";
import { useMemo, useState } from "react";
import type { GeoFeatureCollection } from "@/lib/types";

type KartenFlaeche = {
  id: string;
  name: string;
  fill: string;
  patternId?: string;
  patternColors?: [string, string];
  stroke?: string;
  headline: string;
  detail: string;
  ariaLabel: string;
  history?: Array<{
    id: string;
    label: string;
    datum: string;
    value: string;
    color: string;
    colors?: [string, string];
  }>;
};

type Props = {
  title: string;
  geo: GeoFeatureCollection;
  areasById: Record<string, KartenFlaeche>;
  preserveFullExtent?: boolean;
};

export function Wahlkarte({ title, geo, areasById, preserveFullExtent = false }: Props) {
  const width = 980;
  const height = 720;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const projection = useMemo(
    () => geoIdentity().reflectY(true).fitExtent([[20, 20], [width - 20, height - 20]], geo as never),
    [geo],
  );
  const pathBuilder = useMemo(() => geoPath(projection), [projection]);

  const featureById = useMemo(
    () => Object.fromEntries(geo.features.map((feature) => [String(feature.properties.id ?? ""), feature])),
    [geo.features],
  );

  const transform = useMemo(() => {
    if (!focusedId) {
      return "translate(0 0) scale(1)";
    }
    const feature = featureById[focusedId];
    if (!feature) {
      return "translate(0 0) scale(1)";
    }

    const [[x0, y0], [x1, y1]] = pathBuilder.bounds(feature as never);
    const featureWidth = Math.max(1, x1 - x0);
    const featureHeight = Math.max(1, y1 - y0);
    const scale = Math.min(5, Math.max(1.2, 0.84 / Math.max(featureWidth / width, featureHeight / height)));
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const tx = width / 2 - scale * cx;
    const ty = height / 2 - scale * cy;
    return `translate(${tx} ${ty}) scale(${scale})`;
  }, [featureById, focusedId, height, pathBuilder, width]);

  const displayedId = activeId ?? focusedId;
  const activeArea = displayedId ? areasById[displayedId] ?? null : null;
  const patterns = useMemo(() => {
    const uniquePatterns = new Map<string, [string, string]>();
    for (const area of Object.values(areasById)) {
      if (area.patternId && area.patternColors) {
        uniquePatterns.set(area.patternId, area.patternColors);
      }
    }
    return Array.from(uniquePatterns.entries()).map(([id, colors]) => ({ id, colors }));
  }, [areasById]);

  return (
    <section
      className="overflow-hidden rounded-xl border border-[#c8d8d5] bg-white p-4 shadow-[0_10px_24px_rgba(0,43,49,0.045)]"
      aria-label={title}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Interaktive Karte</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-[#c6d7d3] bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-[#0f766e] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => setFocusedId(null)}
            disabled={!focusedId}
          >
            Fokus zurücksetzen
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="relative h-full min-h-[30rem] overflow-hidden rounded-lg border border-[#d8e4df] bg-[#edf5f2]">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio={preserveFullExtent ? "xMidYMid meet" : "xMidYMid slice"}
            className="absolute inset-0 block h-full w-full"
            role="img"
            aria-label={title}
          >
            <defs>
              {patterns.map((pattern) => (
                <pattern
                  key={pattern.id}
                  id={pattern.id}
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect x="0" y="0" width="8" height="16" fill={pattern.colors[0]} />
                  <rect x="8" y="0" width="8" height="16" fill={pattern.colors[1]} />
                </pattern>
              ))}
            </defs>
            <g transform={transform} style={{ transition: "transform 240ms ease" }}>
              {geo.features.map((feature) => {
                const id = String(feature.properties.id ?? "");
                const area = areasById[id];
                const d = pathBuilder(feature as never);
                if (!d || !area) {
                  return null;
                }

                const isActive = activeId === id;
                const isFocused = focusedId === id;
                return (
                  <path
                    key={id}
                    d={d}
                    fill={area.patternId ? `url(#${area.patternId})` : area.fill}
                    stroke={area.stroke ?? (isFocused ? "#0f766e" : isActive ? "#0f172a" : "#f8fafc")}
                    strokeWidth={isFocused ? 3.4 : isActive ? 2.5 : 1.2}
                    vectorEffect="non-scaling-stroke"
                    className="cursor-pointer transition-[opacity,stroke-width] duration-150 ease-out"
                    opacity={activeId && !isActive ? 0.82 : 1}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isFocused}
                    aria-label={area.ariaLabel}
                    onClick={() => setFocusedId((current) => (current === id ? null : id))}
                    onMouseEnter={() => setActiveId(id)}
                    onMouseLeave={() => setActiveId(null)}
                    onFocus={() => setActiveId(id)}
                    onBlur={() => setActiveId(null)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveId(id);
                        setFocusedId((current) => (current === id ? null : id));
                      }
                    }}
                  />
                );
              })}
            </g>
          </svg>
        </div>

        <aside className="relative min-h-[36rem] rounded-lg border border-[#d2dfdb] bg-white p-4">
          <div className="absolute inset-4 flex flex-col justify-between">
            {activeArea ? (
              <AreaDetails area={activeArea} />
            ) : (
              <p className="text-sm leading-6 text-slate-600">Gebiet per Maus, Touch-Fokus oder Tastatur auswählen, um Details anzuzeigen.</p>
            )}
            <FocusFootnote />
          </div>
        </aside>
      </div>
    </section>
  );
}

function AreaDetails({ area }: { area: KartenFlaeche }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Fokusgebiet</p>
        <h3 className="mt-1 text-lg font-semibold text-[#16343d]">{area.name}</h3>
      </div>
      <div className="rounded-lg border border-[#dce9e6] bg-[#f6fbfa] p-3">
        <p className="text-sm font-semibold text-[#14333d]">{area.headline}</p>
        <p className="mt-2 text-sm leading-6 text-slate-700">{area.detail}</p>
      </div>
      {area.history && area.history.length > 0 ? (
        <div className="rounded-lg border border-[#dce9e6] bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#25515c]">Historie</p>
          <ul className="mt-2 space-y-2 text-sm text-slate-700">
            {area.history.map((entry) => (
              <li key={entry.id} className="flex items-start gap-2">
                <span
                  className="mt-1 h-3.5 w-5 flex-shrink-0 rounded-sm border border-slate-300"
                  style={{
                    background: entry.colors
                      ? `repeating-linear-gradient(45deg, ${entry.colors[0]} 0 6px, ${entry.colors[1]} 6px 12px)`
                      : entry.color,
                  }}
                  aria-hidden
                />
                <span>
                  <span className="block font-medium leading-5 text-[#14333d]">{entry.label}</span>
                  <span className="block text-xs leading-5 text-slate-500">{entry.datum}</span>
                  <span className="block leading-5">{entry.value}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function FocusFootnote() {
  return <p className="mt-4 text-xs leading-5 text-slate-500">Klick auf ein Gebiet setzt einen kontrollierten Fokus.</p>;
}
