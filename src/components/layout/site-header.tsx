import Link from "next/link";

const navItems = [
  { href: "/", label: "Start" },
  { href: "/ergebnisse/", label: "Ergebnisse" },
  { href: "/karte/", label: "Karte" },
  { href: "/wahlrecht/", label: "Wahlrecht" },
  { href: "/direkte-demokratie/", label: "Direkte Demokratie" },
  { href: "/werkzeuge/", label: "Werkzeuge" },
  { href: "/methodik/", label: "Methodik" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-slate-300 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:px-6">
        <p className="text-sm font-semibold tracking-wide text-slate-700">Landeswahlleiter des Freistaates Ostdeutschland</p>
        <nav aria-label="Hauptnavigation">
          <ul className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 no-underline hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
