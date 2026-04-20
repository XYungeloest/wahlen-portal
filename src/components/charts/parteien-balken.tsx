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
  compact?: boolean;
  maxItems?: number;
};

export function ParteienBalken({ title, data, compact = false, maxItems }: Props) {
  const visibleData = typeof maxItems === "number" ? data.slice(0, maxItems) : data;
  const max = Math.max(...visibleData.map((item) => item.value), 1);
  const xScale = scaleLinear().domain([0, max]).range([0, 100]);

  return (
    <section aria-label={title} className={`card ${compact ? "p-0 shadow-none" : "p-4"}`}>
      <h3 className={`${compact ? "mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#25515c]" : "mb-4 text-lg font-semibold text-[var(--color-primary)]"}`}>{title}</h3>
      <div className={compact ? "space-y-2.5" : "space-y-3"}>
        {visibleData.map((item) => (
          <div key={item.name}>
            <div className={`mb-1 flex items-center justify-between ${compact ? "text-xs" : "text-sm"}`}>
              <span className="font-medium">{item.name}</span>
              <span className="font-mono-data">{item.value.toFixed(1).replace(".", ",")} %</span>
            </div>
            <div className={`${compact ? "h-3.5" : "h-5"} rounded-full bg-slate-100`}>
              <div
                className={`${compact ? "h-3.5" : "h-5"} rounded-full`}
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
