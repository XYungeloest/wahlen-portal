import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-slate-300 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-700 md:flex-row md:items-center md:justify-between md:px-6">
        <p>© Landeswahlleiter des Freistaates Ostdeutschland · Simulationsportal</p>
        <ul className="flex flex-wrap gap-4">
          <li>
            <Link href="/impressum/">Impressum</Link>
          </li>
          <li>
            <Link href="/datenschutz/">Datenschutz</Link>
          </li>
          <li>
            <Link href="/barrierefreiheit/">Barrierefreiheit</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
