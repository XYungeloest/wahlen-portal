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
  { href: "/werkzeuge/", title: "Werkzeuge", desc: "Koalitionsrechner, Sitzverteilung und Auszählungsstand." },
];

export function Schnellzugriffe() {
  return (
    <section aria-label="Schnellzugriffe">
      <h2 className="mb-4 text-2xl font-semibold text-[var(--color-primary)]">Schnellzugriffe</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((item) => (
          <Link key={item.href} href={item.href} className="card block p-4 no-underline hover:border-slate-400">
            <p className="text-lg font-semibold text-[var(--color-primary)]">{item.title}</p>
            <p className="mt-2 text-sm text-slate-700">{item.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
