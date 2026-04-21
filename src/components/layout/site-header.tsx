import Link from "next/link";

const navItems = [
  { href: "/", label: "Start" },
  { href: "/ergebnisse/", label: "Ergebnisse" },
  { href: "/wahlrecht/", label: "Wahlrecht" },
  { href: "/direkte-demokratie/", label: "Direkte Demokratie" },
  { href: "/methodik/", label: "Methodik" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[#cbdcd7] bg-white/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="min-w-0 no-underline">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#25515c]">Landeswahlleiter</p>
          <p className="mt-1 break-words text-base font-semibold text-[#003366]">Freistaat Ostdeutschland</p>
        </Link>
        <nav aria-label="Hauptnavigation">
          <ul className="flex flex-wrap gap-1.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-slate-700 no-underline transition hover:border-[#cbdcd7] hover:bg-[#f4faf8] hover:text-[#003366] focus-visible:border-[#003366] focus-visible:bg-white"
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
