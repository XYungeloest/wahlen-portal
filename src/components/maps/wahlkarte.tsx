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

  const fallbackId = geo.features[0] ? String(geo.features[0].properties.id ?? "") : null;
  const displayedId = activeId ?? focusedId ?? fallbackId;
  const activeArea = displayedId ? areasById[displayedId] ?? null : null;

  return (
    <section
      className="overflow-hidden rounded-[1.5rem] border border-[#c8d8d5] bg-[linear-gradient(180deg,rgba(241,248,246,0.95),rgba(251,253,252,1))] p-4 shadow-[0_20px_45px_rgba(0,51,61,0.08)]"
      aria-label={title}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Interaktive SVG-Karte</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-[#c6d7d3] bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-[#0f766e]"
            onClick={() => setFocusedId(null)}
            disabled={!focusedId}
          >
            Fokus zurücksetzen
          </button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="overflow-hidden rounded-[1.25rem] border border-white/70 bg-[#edf5f2]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={title}>
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
                    fill={area.fill}
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
            <p className="text-sm leading-6 text-slate-600">Gebiet per Maus, Touch-Fokus oder Tastatur auswählen, um Details anzuzeigen.</p>
          )}

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Klick auf ein Gebiet setzt einen kontrollierten Fokus. Die Darstellung bleibt statisch exportierbar und benötigt keine externen Karten- oder Tile-Dienste.
          </p>
        </aside>
      </div>
    </section>
  );
}
