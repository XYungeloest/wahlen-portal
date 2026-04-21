"use client";

import { arc } from "d3-shape";
import { useMemo, useState } from "react";

type SeatInput = {
  name: string;
  seats: number;
  color: string;
};

type Slice = SeatInput & {
  startAngle: number;
  endAngle: number;
  percent: number;
};

type Props = {
  title: string;
  totalSeats: number;
  data: SeatInput[];
  majority: number;
};

export function SitzHalbrund({ title, totalSeats, data, majority }: Props) {
  const width = 760;
  const height = 455;
  const centerX = width / 2;
  const centerY = height - 44;
  const outerRadius = 292;
  const innerRadius = 166;
  const actualTotal = totalSeats || data.reduce((sum, item) => sum + item.seats, 0);
  const [activeName, setActiveName] = useState<string | null>(null);

  const slices = useMemo(() => {
    let running = 0;
    return data
      .filter((item) => item.seats > 0)
      .map((item) => {
        const startAngle = -Math.PI / 2 + (running / Math.max(actualTotal, 1)) * Math.PI;
        running += item.seats;
        const endAngle = -Math.PI / 2 + (running / Math.max(actualTotal, 1)) * Math.PI;
        return {
          ...item,
          startAngle,
          endAngle,
          percent: actualTotal > 0 ? (item.seats / actualTotal) * 100 : 0,
        };
      });
  }, [actualTotal, data]);

  const activeSlice = slices.find((slice) => slice.name === activeName) ?? null;
  const activeForTooltip = activeSlice ?? slices[0] ?? null;
  const majorityAngle = -Math.PI / 2 + ((Math.max(majority, 1) - 0.5) / Math.max(actualTotal, 1)) * Math.PI;
  const markerInner = polarPoint(centerX, centerY, innerRadius - 12, majorityAngle);
  const markerOuter = polarPoint(centerX, centerY, outerRadius + 18, majorityAngle);
  const markerLabel = polarPoint(centerX, centerY, outerRadius + 38, majorityAngle);
  const activeSeats = activeSlice?.seats ?? 0;
  const activeHasMajority = activeSeats >= majority;

  return (
    <section aria-label={title} className="card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Sitzverteilung</p>
          <h3 className="mt-1 text-xl font-semibold text-[var(--color-primary)]">{title}</h3>
        </div>
        <p className="text-sm text-slate-600">
          <span className="font-mono-data font-semibold text-slate-900">{actualTotal}</span> Sitze, Mehrheit ab{" "}
          <span className="font-mono-data font-semibold text-slate-900">{majority}</span>
        </p>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 overflow-hidden rounded-xl border border-[#d8e4df] bg-[#f7fbfa] p-3">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`Halbkreis der Sitzverteilung mit ${actualTotal} Sitzen und Mehrheitsgrenze bei ${majority} Sitzen`}
            className="w-full"
          >
            <line x1={centerX - outerRadius} y1={centerY} x2={centerX + outerRadius} y2={centerY} stroke="#b4c7c4" strokeWidth={1.2} />
            <line
              x1={markerInner.x}
              y1={markerInner.y}
              x2={markerOuter.x}
              y2={markerOuter.y}
              stroke="#003366"
              strokeWidth={3}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={markerLabel.x}
              y={markerLabel.y}
              textAnchor={markerLabel.x >= centerX ? "start" : "end"}
              dominantBaseline="middle"
              className="fill-[#003366] text-xs font-semibold"
            >
              Mehrheit
            </text>

            {slices.map((slice) => {
              const path = arc<void>()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius)
                .startAngle(slice.startAngle)
                .endAngle(slice.endAngle)
                .padAngle(0.006)
                .cornerRadius(3)(undefined);
              const isActive = activeName === slice.name;
              const isDimmed = Boolean(activeName) && !isActive;

              if (!path) {
                return null;
              }

              return (
                <path
                  key={slice.name}
                  d={path}
                  transform={`translate(${centerX}, ${centerY})`}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth={isActive ? 3 : 1.4}
                  opacity={isDimmed ? 0.45 : 1}
                  tabIndex={0}
                  role="button"
                  aria-label={`${slice.name}: ${slice.seats} Sitze`}
                  className="cursor-pointer transition-[opacity,stroke-width] duration-150"
                  onMouseEnter={() => setActiveName(slice.name)}
                  onMouseLeave={() => setActiveName(null)}
                  onFocus={() => setActiveName(slice.name)}
                  onBlur={() => setActiveName(null)}
                />
              );
            })}

            <circle cx={centerX} cy={centerY} r={innerRadius - 28} fill="#ffffff" stroke="#d7e2e0" strokeWidth={1.4} />
            <text x={centerX} y={centerY - 54} textAnchor="middle" className="fill-slate-900 text-3xl font-bold font-mono-data">
              {actualTotal}
            </text>
            <text x={centerX} y={centerY - 25} textAnchor="middle" className="fill-slate-600 text-sm">
              Sitze gesamt
            </text>
            <text x={centerX} y={centerY + 5} textAnchor="middle" className="fill-[#003366] text-sm font-semibold">
              Mehrheit ab {majority}
            </text>

            {activeForTooltip ? (
              <g transform={`translate(${centerX - 136}, ${centerY - 154})`} pointerEvents="none">
                <rect width="272" height="80" rx="10" fill="#ffffff" stroke="#cbdcd7" filter="drop-shadow(0 10px 18px rgba(0, 43, 49, 0.14))" />
                <circle cx="23" cy="28" r="6" fill={activeForTooltip.color} />
                <text x="40" y="31" className="fill-slate-900 text-sm font-semibold">
                  {shortLabel(activeForTooltip.name)}
                </text>
                <text x="20" y="60" className="fill-slate-700 text-sm">
                  {activeForTooltip.seats} Sitze
                </text>
              </g>
            ) : null}
          </svg>
        </div>

        <aside className="rounded-xl border border-[#d8e4df] bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Fraktion im Fokus</p>
          {activeForTooltip ? (
            <div className="mt-3">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-3 w-3 rounded-sm flex-shrink-0" style={{ background: activeForTooltip.color }} aria-hidden />
                <div className="min-w-0">
                  <h4 className="break-words text-lg font-semibold text-[#15343d]">{activeForTooltip.name}</h4>
                  <p className="mt-1 text-sm text-slate-700">
                    <span className="font-mono-data font-semibold">{activeForTooltip.seats}</span> Sitze,{" "}
                    <span className="font-mono-data font-semibold">{activeForTooltip.percent.toFixed(1).replace(".", ",")}%</span>  des Parlaments.
                  </p>
                </div>
              </div>
              {activeName ? (
                <p className="mt-4 rounded-lg border border-[#d8e4df] bg-[#f7fbfa] p-3 text-sm leading-6 text-slate-700">
                  Diese Fraktion erreicht allein {activeHasMajority ? "die" : "nicht die"} Mehrheitsgrenze.
                </p>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-600">Fraktion per Maus oder Tastatur fokussieren, um Sitze einzublenden.</p>
              )}
            </div>
          ) : null}
        </aside>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="table-basic">
          <caption className="sr-only">Tabellarische Alternative zur Sitzverteilung</caption>
          <thead>
            <tr>
              <th scope="col">Fraktion</th>
              <th scope="col">Sitze</th>
              <th scope="col">Anteil</th>
            </tr>
          </thead>
          <tbody>
            {slices.map((slice) => (
              <tr key={slice.name}>
                <th scope="row">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ background: slice.color }} aria-hidden />
                    {slice.name}
                  </span>
                </th>
                <td className="font-mono-data">{slice.seats}</td>
                <td className="font-mono-data">{slice.percent.toFixed(1).replace(".", ",")} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  return {
    x: cx + radius * Math.sin(angle),
    y: cy - radius * Math.cos(angle),
  };
}

function shortLabel(label: string) {
  return label.length > 30 ? `${label.slice(0, 27)}...` : label;
}
