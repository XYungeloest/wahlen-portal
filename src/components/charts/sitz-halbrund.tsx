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
  const size = 540;
  const centerX = size / 2;
  const centerY = size / 2 + 70;
  const outerRadius = 230;
  const innerRadius = 120;

  let running = 0;
  const slices = data.map((item) => {
    const startAngle = Math.PI + (running / totalSeats) * Math.PI;
    running += item.seats;
    const endAngle = Math.PI + (running / totalSeats) * Math.PI;
    return { ...item, startAngle, endAngle };
  });

  return (
    <section aria-label={title} className="card p-4">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Sitzverteilung mit ${totalSeats} Sitzen`} className="w-full">
        <line
          x1={centerX - outerRadius}
          y1={centerY}
          x2={centerX + outerRadius}
          y2={centerY}
          stroke="#475569"
          strokeDasharray="5 5"
          strokeWidth={1}
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
        <text x={centerX} y={centerY - 46} textAnchor="middle" className="fill-slate-800 text-2xl font-bold font-mono-data">
          {totalSeats}
        </text>
        <text x={centerX} y={centerY - 20} textAnchor="middle" className="fill-slate-600 text-sm">
          Sitze gesamt
        </text>
        <text x={centerX} y={centerY + 20} textAnchor="middle" className="fill-slate-700 text-sm">
          Mehrheitsgrenze: {majority}
        </text>
      </svg>
      <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        {data.map((item) => (
          <li key={item.name} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
            <span className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded" style={{ background: item.color }} aria-hidden />
              {item.name}
            </span>
            <strong className="font-mono-data">{item.seats}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
