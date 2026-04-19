"use client";

import { geoIdentity, geoPath } from "d3-geo";
import { useMemo, useState } from "react";
import type { GeoFeatureCollection } from "@/lib/types";

type Ergebnis = {
  name: string;
  bezirk: string;
  winner: string;
  winnerPercent: number;
};

type Props = {
  title: string;
  geo: GeoFeatureCollection;
  resultsById: Record<string, Ergebnis>;
  partyColors: Record<string, string>;
};

export function Wahlkarte({ title, geo, resultsById, partyColors }: Props) {
  const width = 920;
  const height = 640;
  const [activeId, setActiveId] = useState<string | null>(null);

  const projection = useMemo(() => geoIdentity().fitSize([width, height], geo as never), [geo]);
  const pathBuilder = useMemo(() => geoPath(projection), [projection]);

  const activeResult = activeId ? resultsById[activeId] : null;

  return (
    <section className="card p-4" aria-label={title}>
      <h3 className="mb-3 text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded border border-slate-300 bg-slate-50" role="img" aria-label={title}>
        {geo.features.map((feature) => {
          const id = String(feature.properties.id ?? "");
          const result = resultsById[id];
          const fill = result ? partyColors[result.winner] ?? "#94a3b8" : "#cbd5e1";
          const d = pathBuilder(feature as never);
          if (!d) {
            return null;
          }
          return (
            <path
              key={id}
              d={d}
              fill={fill}
              stroke={activeId === id ? "#0f172a" : "#ffffff"}
              strokeWidth={activeId === id ? 1.8 : 0.9}
              tabIndex={0}
              role="button"
              aria-label={
                result
                  ? `${result.name}, Bezirk ${result.bezirk}, stärkste Partei ${result.winner} mit ${result.winnerPercent.toFixed(1).replace(".", ",")} Prozent`
                  : String(feature.properties.name ?? id)
              }
              onMouseEnter={() => setActiveId(id)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(id)}
              onBlur={() => setActiveId(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveId(id);
                }
              }}
            />
          );
        })}
      </svg>

      <div className="mt-4 rounded border border-slate-200 bg-white p-3 text-sm">
        {activeResult ? (
          <div>
            <p className="font-semibold">{activeResult.name}</p>
            <p>Bezirk: {activeResult.bezirk}</p>
            <p>
              Stärkste Partei: <strong>{activeResult.winner}</strong> ({activeResult.winnerPercent.toFixed(1).replace(".", ",")} %)
            </p>
          </div>
        ) : (
          <p>Für Details ein Gebiet fokussieren oder mit der Maus überfahren.</p>
        )}
      </div>
    </section>
  );
}
