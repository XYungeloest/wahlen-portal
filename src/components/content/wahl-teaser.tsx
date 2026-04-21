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
    <article className="card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#25515c]">{eyebrow}</p>
      <h2 className="mt-2 break-words text-2xl font-semibold text-[#16343d]">{title}</h2>
      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <p>Wahltag: {formatDatum(date)}</p>
        <p className="sm:text-right">Wahlbeteiligung: {formatProzent(turnout)}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{description}</p>

      <div className="mt-5 border-t border-[#d9e2e7] pt-4">
        <ParteienBalken title={chartTitle} data={chartData} compact maxItems={4} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Datenstand im Portal verfügbar</p>
        <Link
          href={href}
          className="inline-flex items-center rounded-lg border border-[#9dbdc0] bg-white px-4 py-2 text-sm font-medium text-[#184650] no-underline transition hover:border-[#0f5e68] hover:bg-[#eef6f5]"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}
