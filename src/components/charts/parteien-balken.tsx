"use client";

import { scaleLinear } from "d3-scale";

type Item = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  title: string;
  data: Item[];
};

export function ParteienBalken({ title, data }: Props) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const xScale = scaleLinear().domain([0, max]).range([0, 100]);

  return (
    <section aria-label={title} className="card p-4">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="font-mono-data">{item.value.toFixed(1).replace(".", ",")} %</span>
            </div>
            <div className="h-5 rounded bg-slate-100">
              <div
                className="h-5 rounded"
                style={{ width: `${xScale(item.value)}%`, background: item.color }}
                role="img"
                aria-label={`${item.name} erreicht ${item.value.toFixed(1).replace(".", ",")} Prozent`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
