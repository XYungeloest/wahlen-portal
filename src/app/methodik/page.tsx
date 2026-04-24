import { PageHeader } from "@/components/layout/page-header";
import { SimulationHinweis } from "@/components/ui/simulation-hinweis";
import { sainteLague } from "@/lib/sitzberechnung";
import { getBundestagswahl2025, getLandtagswahl2024, getMetadaten } from "@/lib/wahldaten";

export default async function MethodikPage() {
  const [landtag, bundestag, metadaten] = await Promise.all([
    getLandtagswahl2024(),
    getBundestagswahl2025(),
    getMetadaten(),
  ]);

  const recalculatedSeats = sainteLague(landtag.landesergebnis, landtag.sitzeGesamt, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Methodik"
        description="Transparenzseite zu Datenherkunft, Modellannahmen und Berechnungslogik der Wahldarstellungen im Portal."
      />

      <section className="card p-5 text-slate-700">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Welche Daten sind simuliert?</h2>
        <p className="mt-3">
          Sämtliche Wahl- und Geodaten sind fiktive Simulationsdaten. Die Datenhaltung erfolgt ausschließlich statisch in JSON- und
          GeoJSON-Dateien im Repository.
        </p>
        <p className="mt-3">
          Das Portal lädt zur Laufzeit keine externen APIs, keine Datenbank und keinen externen Kartendienst. Neue Wahldaten werden als
          versionierte JSON-Datensätze ergänzt und beim statischen Build eingebunden.
        </p>
      </section>

      <section className="card p-5 text-slate-700">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Vereinfachtes Wahlmodell</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Landtag: eine Listenstimme, zentrale Auswertung landesweit, Landkreiskarte der stärksten Partei.</li>
          <li>Bundestag: eine Listenstimme in der Portaldarstellung und Wahlkreiskarte der stärksten Partei.</li>
          <li>Zusätzlich: ein gesondertes Direktmandat Ostdeutschland als eigener Simulationsbaustein.</li>
        </ul>
      </section>

      <section className="card p-5 text-slate-700">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Wie Sitze berechnet werden</h2>
        <p className="mt-3">Die Sitzverteilung im Landtag wird mit Sainte-Laguë/Schepers bei einer 5%-Schwelle modelliert.</p>
        <p className="mt-2">Kontrollrechnung für {landtag.name}:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-mono-data text-sm">
          {Object.entries(recalculatedSeats).map(([party, seats]) => (
            <li key={party}>
              {party}: {seats} Sitze
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 text-slate-700">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Warum Landkreise und Wahlkreise kartiert werden</h2>
        <p className="mt-3">
          Karten dienen als regionale Orientierungsebene. Bezirke sind Filter- und Aggregationsraum; zentrale Ergebnisebenen bleiben
          Landtag und Bundestag.
        </p>
        <p className="mt-3">
          Historische Referenzkarten werden als Gebietssieger direkt in den lokalen Wahldatensätzen gepflegt. Daraus werden keine
          regionalen Prozentwerte konstruiert; die interaktiven Karten bleiben D3-SVG-Karten auf Basis der lokalen GeoJSON-Dateien.
        </p>
        <p className="mt-3">
          Die GeoJSON-Geometrien werden vorsichtig behandelt: Eine künftige Performance-Optimierung darf die fachliche Formtreue nicht
          substanziell reduzieren. Bevor Geometrien vereinfacht werden, sind Dateigröße, Renderzeit und sichtbare Grenzqualität gegeneinander
          zu prüfen.
        </p>
      </section>

      <section className="card p-5 text-slate-700">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Datenqualität und fehlende Regionalwerte</h2>
        <p className="mt-3">
          Datensätze können unterschiedliche Detailgrade haben. Wenn keine belastbare regionale Kartenauflösung vorliegt, zeigt das Portal
          keine künstliche Karte an. Wenn nur Gebietssieger, aber keine regionalen Prozentwerte vorliegen, wird dies in Karte, Tabelle und
          Datenhinweisen kenntlich gemacht.
        </p>
        <p className="mt-3">
          Tabellen und Diagramme verwenden denselben Datensatz wie die Karte. Filter nach Bezirk oder Partei sind deshalb als
          Darstellungsfilter zu verstehen, nicht als Veränderung der zugrunde liegenden Wahlberechnung.
        </p>
      </section>

      <section className="card p-5 text-slate-700">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Archiv und Nachvollziehbarkeit</h2>
        <p className="mt-3">
          Mehrere Wahlstände können parallel im Portal auswählbar bleiben. Für Nutzerinnen und Nutzer ist dabei entscheidend, dass Datum,
          Datenstand, Quelle, Kartierungsgrad und Modellannahmen direkt beim Datensatz erkennbar sind.
        </p>
      </section>

      <section className="card p-5 text-slate-700">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Bedeutung des Direktmandats Ostdeutschland</h2>
        <p className="mt-3">
          Das Direktmandat ergänzt die Listenstimmen-Auswertung von {bundestag.name} um ein einziges ostweites Einzelmandat. Es ist eine
          transparente Modellannahme und kein Nachbau des realen Bundeswahlrechts.
        </p>
      </section>

      <SimulationHinweis text={metadaten.portal.simulationshinweis} />
    </div>
  );
}
