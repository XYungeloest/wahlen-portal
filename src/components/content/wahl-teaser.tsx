import Link from "next/link";
import { ParteienBalken } from "@/components/charts/parteien-balken";
import { formatDatum, formatProzent } from "@/lib/formatierung";

type Props = {
  eyebrow: string;
  title: string;
  date: string;
  turnout: number;
  description: string;
  href: string;
  cta: string;
  chartTitle: string;
  chartData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
};

export function WahlTeaser({ eyebrow, title, date, turnout, description, href, cta, chartTitle, chartData }: Props) {
  return (
    <article className="rounded-[1.6rem] border border-[#cdded8] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(242,248,245,0.95))] p-5 shadow-[0_22px_44px_rgba(0,43,49,0.07)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#25515c]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-[#16343d]">{title}</h2>
      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <p>Wahltag: {formatDatum(date)}</p>
        <p>Wahlbeteiligung: {formatProzent(turnout)}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{description}</p>

      <div className="mt-5 rounded-[1.1rem] border border-[#d8e5e2] bg-white p-4">
        <ParteienBalken title={chartTitle} data={chartData} compact maxItems={4} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Datenstand im Portal verfügbar</p>
        <Link
          href={href}
          className="inline-flex items-center rounded-full border border-[#0f5e68] bg-[#0f5e68] px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-[#124952]"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
