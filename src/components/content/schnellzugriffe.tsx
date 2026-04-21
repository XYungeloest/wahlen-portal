import Link from "next/link";

type Shortcut = {
  href: string;
  title: string;
  desc: string;
};

const shortcuts: Shortcut[] = [
  { href: "/ergebnisse/", title: "Ergebnisse", desc: "Landtags- und Bundestagsergebnisse auf einen Blick." },
  { href: "/karte/", title: "Karte", desc: "Interaktive Karten zu Landkreisen und Wahlkreisen." },
  { href: "/wahlrecht/", title: "Wahlrecht", desc: "Erläuterung des vereinfachten Simulationsmodells." },
  {
    href: "/direkte-demokratie/",
    title: "Direkte Demokratie",
    desc: "Volksantrag, Volksbegehren und Volksentscheid nach Art. 71 bis 73.",
  },
  { href: "/methodik/", title: "Methodik", desc: "Datenherkunft, Modellannahmen und Berechnungslogik." },
];

export function Schnellzugriffe() {
  return (
    <section aria-label="Schnellzugriffe">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-primary)]">Weitere Bereiche</h2>
          <p className="mt-1 text-sm text-slate-600">Ergänzende Inhalte, Transparenz und rechtliche Einordnung des Portals.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((item) => (
          <Link key={item.href} href={item.href} className="card block p-4 no-underline transition hover:border-[#9eb7bd] hover:shadow-[0_14px_28px_rgba(0,43,49,0.07)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Bereich</p>
            <p className="mt-2 text-base font-semibold text-[var(--color-primary)]">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.desc}</p>
            <p className="mt-4 text-sm font-medium text-[#184650]">Öffnen</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
