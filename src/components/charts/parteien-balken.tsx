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
  subtitle?: string;
};

export function ParteienBalken({ title, data, compact = false, maxItems, subtitle }: Props) {
  const visibleData = typeof maxItems === "number" ? data.slice(0, maxItems) : data;
  const max = Math.max(...visibleData.map((item) => item.value), 1);
  const xScale = scaleLinear().domain([0, max]).range([0, 100]);

  return (
    <section aria-label={title} className={`card ${compact ? "p-0 shadow-none" : "p-4"}`}>
      <h3 className={`${compact ? "mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#25515c]" : "mb-1 text-lg font-semibold text-[var(--color-primary)]"}`}>{title}</h3>
      {subtitle ? <p className={`${compact ? "mb-3 text-xs text-slate-600" : "mb-4 text-sm leading-6 text-slate-600"}`}>{subtitle}</p> : compact ? null : <div className="mb-4" />}
      <div className={compact ? "space-y-2.5" : "space-y-3"}>
        {visibleData.map((item) => (
          <div key={item.name} className="min-w-0">
            <div className={`mb-1 flex items-start justify-between gap-3 ${compact ? "text-xs" : "text-sm"}`}>
              <span className="min-w-0 break-words font-medium text-slate-800">{item.name}</span>
              <span className="shrink-0 whitespace-nowrap font-mono-data text-slate-700">{item.value.toFixed(1).replace(".", ",")} %</span>
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
