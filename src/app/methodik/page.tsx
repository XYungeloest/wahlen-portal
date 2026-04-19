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
      </section>

      <section className="card p-5 text-slate-700">
        <h2 className="text-xl font-semibold text-[var(--color-primary)]">Kartenquellen und Zuordnungslogik</h2>
        <p className="mt-3">
          Die Kartengeometrien stammen aus den bereitgestellten SVG-Quellen (`Landkreise.svg`, `Wahlkreise.svg`). Dargestellt werden
          ausschließlich ostdeutsche Gebiete.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Bundestag: Wahlkreisnummern und -namen folgen der amtlichen Wahlkreiseinteilung 2025 der Bundeswahlleiterin; die
            Shape-Zuordnung erfolgt über die nummerierten SVG-Labels.
          </li>
          <li>
            Für die Kartenansicht wird Berlin im Bundestagskartenmodul als ein zusammengefasstes Darstellungsobjekt geführt; interne
            Berliner Wahlkreisgrenzen werden dort nicht gezeichnet.
          </li>
          <li>
            Bezirkszuordnungen von Bundestagswahlkreisen werden aus der amtlichen Gemeindezuordnung plausibilisiert; bei
            grenzüberschreitenden Fällen wird ein primärer Bezirk ausgewiesen.
          </li>
          <li>
            Landtag: Kreisfreie Städte bleiben als eigene Einheiten erhalten. Für Hoyerswerda wird keine künstliche Sondergeometrie
            erzeugt; in der Kartenansicht wird die Region über den umgebenden Landkreis-Zuschnitt abgedeckt.
          </li>
          <li>
            Einzelne fehlende Flächenzuschnitte in Sachsen/Thüringen werden transparent und ausschließlich auf Landkreisebene
            modelliert; die betroffenen Codes sind in den GeoJSON-Metadaten dokumentiert.
          </li>
        </ul>
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
