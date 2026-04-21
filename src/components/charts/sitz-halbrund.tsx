"use client";

import { arc } from "d3-shape";

type SeatInput = {
  name: string;
  seats: number;
  color: string;
};

type Props = {
  title: string;
  totalSeats: number;
  data: SeatInput[];
  majority: number;
};

export function SitzHalbrund({ title, totalSeats, data, majority }: Props) {
  const width = 560;
  const height = 390;
  const centerX = width / 2;
  const centerY = height - 42;
  const outerRadius = 192;
  const innerRadius = 102;

  let running = 0;
  const slices = data.map((item) => {
    const startAngle = -Math.PI / 2 + (running / totalSeats) * Math.PI;
    running += item.seats;
    const endAngle = -Math.PI / 2 + (running / totalSeats) * Math.PI;
    return { ...item, startAngle, endAngle };
  });

  const majorityPosition = Math.max(0, majority - 0.5);
  const majorityAngle = -Math.PI / 2 + (majorityPosition / Math.max(totalSeats, 1)) * Math.PI;
  const majorityInnerX = centerX + (innerRadius - 8) * Math.sin(majorityAngle);
  const majorityInnerY = centerY - (innerRadius - 8) * Math.cos(majorityAngle);
  const majorityOuterX = centerX + (outerRadius + 14) * Math.sin(majorityAngle);
  const majorityOuterY = centerY - (outerRadius + 14) * Math.cos(majorityAngle);
  const majorityLabelX = centerX + (outerRadius + 34) * Math.sin(majorityAngle);
  const majorityLabelY = centerY - (outerRadius + 34) * Math.cos(majorityAngle);

  return (
    <section aria-label={title} className="card p-4">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Sitzverteilung mit ${totalSeats} Sitzen`} className="w-full">
        <line
          x1={centerX - outerRadius}
          y1={centerY}
          x2={centerX + outerRadius}
          y2={centerY}
          stroke="#8aa2a5"
          strokeDasharray="4 6"
          strokeWidth={1}
        />
        <line
          x1={majorityInnerX}
          y1={majorityInnerY}
          x2={majorityOuterX}
          y2={majorityOuterY}
          stroke="#25515c"
          strokeDasharray="5 5"
          strokeWidth={2}
        />
        {slices.map((slice) => {
          const pathBuilder = arc<void>()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(slice.startAngle)
            .endAngle(slice.endAngle);
          const d = pathBuilder(undefined);
          if (!d) {
            return null;
          }
          return <path key={slice.name} d={d} transform={`translate(${centerX}, ${centerY})`} fill={slice.color} stroke="#fff" strokeWidth={1} />;
        })}
        <circle cx={centerX} cy={centerY} r={innerRadius - 18} fill="#ffffff" stroke="#d7e2e0" />
        <text x={centerX} y={centerY - 32} textAnchor="middle" className="fill-slate-800 text-2xl font-bold font-mono-data">
          {totalSeats}
        </text>
        <text x={centerX} y={centerY - 8} textAnchor="middle" className="fill-slate-600 text-sm">
          Sitze gesamt
        </text>
        <text x={centerX} y={centerY + 22} textAnchor="middle" className="fill-slate-700 text-sm">
          Mehrheitsgrenze: {majority}
        </text>
        <text x={majorityLabelX} y={majorityLabelY} textAnchor={majorityLabelX >= centerX ? "start" : "end"} className="fill-[#25515c] text-xs font-semibold">
          Mehrheit
        </text>
      </svg>
      <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {data.map((item) => (
          <li key={item.name} className="flex items-start justify-between gap-3 rounded border border-slate-200 px-3 py-2">
            <span className="flex min-w-0 items-start gap-2">
              <span className="inline-block h-3 w-3 rounded" style={{ background: item.color }} aria-hidden />
              <span className="break-words">{item.name}</span>
            </span>
            <strong className="shrink-0 font-mono-data">{item.seats}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
