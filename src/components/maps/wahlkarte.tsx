"use client";

import { geoIdentity, geoPath } from "d3-geo";
import { useMemo, useState } from "react";
import type { GeoFeatureCollection } from "@/lib/types";

type KartenFlaeche = {
  id: string;
  name: string;
  fill: string;
  stroke?: string;
  headline: string;
  detail: string;
  ariaLabel: string;
};

type Props = {
  title: string;
  geo: GeoFeatureCollection;
  areasById: Record<string, KartenFlaeche>;
};

export function Wahlkarte({ title, geo, areasById }: Props) {
  const width = 980;
  const height = 720;
  const [activeId, setActiveId] = useState<string | null>(null);

  const projection = useMemo(
    () => geoIdentity().reflectY(true).fitExtent([[20, 20], [width - 20, height - 20]], geo as never),
    [geo],
  );
  const pathBuilder = useMemo(() => geoPath(projection), [projection]);

  const fallbackId = geo.features[0] ? String(geo.features[0].properties.id ?? "") : null;
  const activeArea = (activeId ? areasById[activeId] : null) ?? (fallbackId ? areasById[fallbackId] : null) ?? null;

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#c8d8d5] bg-[linear-gradient(180deg,rgba(241,248,246,0.95),rgba(251,253,252,1))] p-4 shadow-[0_20px_45px_rgba(0,51,61,0.08)]" aria-label={title}>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="overflow-hidden rounded-[1.25rem] border border-white/70 bg-[#edf5f2]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={title}>
            {geo.features.map((feature) => {
              const id = String(feature.properties.id ?? "");
              const area = areasById[id];
              const d = pathBuilder(feature as never);
              if (!d || !area) {
                return null;
              }

              const isActive = activeId === id;
              return (
                <path
                  key={id}
                  d={d}
                  fill={area.fill}
                  stroke={area.stroke ?? (isActive ? "#0f172a" : "#f8fafc")}
                  strokeWidth={isActive ? 2.5 : 1.2}
                  vectorEffect="non-scaling-stroke"
                  className="cursor-pointer transition-[opacity,stroke-width] duration-150 ease-out"
                  opacity={activeId && !isActive ? 0.8 : 1}
                  tabIndex={0}
                  role="button"
                  aria-label={area.ariaLabel}
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
        </div>

        <aside className="flex min-h-[10rem] flex-col justify-between rounded-[1.25rem] border border-[#d2dfdb] bg-white/95 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          {activeArea ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Fokusgebiet</p>
                <h3 className="mt-1 text-lg font-semibold text-[#16343d]">{activeArea.name}</h3>
              </div>
              <div className="rounded-2xl border border-[#dce9e6] bg-[#f6fbfa] p-3">
                <p className="text-sm font-semibold text-[#14333d]">{activeArea.headline}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{activeArea.detail}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-6 text-slate-600">Gebiet per Maus, Touch-Fokus oder Tastatur auswaehlen, um Details anzuzeigen.</p>
          )}

          <p className="mt-4 text-xs leading-5 text-slate-500">Die SVG-Karte rendert lokal aus GeoJSON und benoetigt keine externen Karten- oder Tile-Dienste.</p>
        </aside>
      </div>
    </section>
  );
}
