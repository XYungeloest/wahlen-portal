import { PageHeader } from "@/components/layout/page-header";

export default function ImpressumPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Impressum" description="Angaben gemäß den Vorgaben des Simulationsprojekts." />
      <section className="card p-5 text-slate-700">
        <p className="font-semibold">Landeswahlleiter des Freistaates Ostdeutschland</p>
        <p>Staatskanzlei, Wahlportal-Referat</p>
        <p>Theaterplatz 1, 01067 Dresden</p>
        <p>E-Mail: kontakt@wahlen.freistaat-ostdeutschland.de</p>
        <p className="mt-3 text-sm">Diese Angaben sind Teil einer fiktiven Verwaltungssimulation.</p>
      </section>
    </div>
  );
}
