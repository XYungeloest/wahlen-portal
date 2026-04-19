#  Codex-Prompt

## Codex-Prompt: Offizielles Wahlportal des Freistaates Ostdeutschland

### Projektziel
Erstelle eine vollständige, produktionsreife Webapplikation für das offizielle Wahlportal des fiktiven **Freistaates Ostdeutschland** unter der Domain `wahlen.freistaat-ostdeutschland.de`.

Die Seite ist die offizielle Webpräsenz des **Landeswahlleiters des Freistaates Ostdeutschland** und dient als:

- Ergebnisportal
- Demokratie-Informationsplattform
- Transparenz- und Erklärseite für Wahlen und direkte Demokratie

Die Website ist Teil eines größeren Simulationsuniversums, wird aber als **eigenständiges Projekt in eigenem Repository** umgesetzt.

---

## Wichtige Grundentscheidung
Der folgende Stack ist bewusst so festgelegt und soll beibehalten werden:

- **Framework:** Next.js 15
- **Routing:** App Router
- **Build-Modell:** Static Export via `output: "export"`
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS 4
- **Visualisierung:** D3.js
- **Hosting:** Cloudflare Pages
- **Datenhaltung:** ausschließlich statische JSON- und GeoJSON-Dateien im Repository
- **Keine Datenbank**
- **Keine SSR**
- **Keine Runtime-API-Calls**
- **Kein externer Kartendienst**

Begründung:
Alle Wahldaten sind simuliert und werden vorab als JSON gepflegt. Das Projekt soll extrem schnell, günstig, portabel und robust deploybar sein.

---

## Inhaltlicher Kern des Portals

Die Website soll diese drei Hauptfunktionen vereinen:

1. **Wahlergebnisse**
   - Landtagswahlen
   - Bundestagswahlen

2. **Demokratie-Information**
   - Wahlrecht
   - Direktdemokratische Instrumente nach Art. 71–73 der Verfassung

3. **Wahlwerkzeuge und Visualisierungen**
   - interaktive Karten
   - Koalitionsrechner
   - Sitzverteilung
   - Auszählungsstand / Hochrechnungsdarstellung als simuliertes Frontend-Element

---

## Wichtiger fachlicher Kontext zur Wahllogik

### 1. Tatsächliche Wahlebenen im Simulationskontext
Im Freistaat Ostdeutschland werden im Simulationskontext im Wesentlichen **zwei** Ebenen dargestellt:

- **Landtagswahl**
- **Bundestagswahl**

Die Bezirke existieren als territoriale und politische Struktur, aber **nicht** als eigene dritte Ergebnis-Hauptebene im Wahlportal.

### 2. Landtagswahl – vereinfachtes Simulationsmodell
Für die Landtagswahl gilt im Portalmodell:

- Es gibt **nur eine Listenstimme**
- Die zentrale Auswertung basiert auf dem landesweiten Parteienergebnis
- Die Karte zeigt Ergebnisse auf **Landkreisebene**
- Diese Landkreise fungieren im Portal als „Wahlkreise“
- Pro Landkreis wird **nur die stärkste Partei** ausgewiesen
- Zusätzlich wird eine landesweite Sitzverteilung im Landtag visualisiert

Wichtig:
Das Portal soll **kein reales deutsches Mischwahlsystem** nachbauen, sondern genau dieses vereinfachte Simulationsmodell klar und verständlich darstellen.

### 3. Bundestagswahl – vereinfachtes Simulationsmodell
Für die Bundestagswahl gilt im Portalmodell:

- Ebenfalls **nur eine Listenstimme** in der Portal-Darstellung
- Die Karte zeigt Ergebnisse auf Ebene der **Bundestagswahlkreise**
- Pro Bundestagswahlkreis wird die **stärkste Partei** ausgewiesen
- Zusätzlich gibt es im Portal ein **einziges Direktmandat für ganz Ostdeutschland**, das separat ausgewiesen wird
- Die Bundestagsdarstellung bleibt also bewusst vereinfacht und simulationsspezifisch

Wichtig:
Codex soll **kein reales Bundeswahlrecht vollständig rekonstruieren**, sondern dieses vereinfachte, intern konsistente Simulationsmodell umsetzen.

### 4. Wenn juristische Details fehlen
Falls einzelne juristische oder mathematische Details nicht ausdrücklich festgelegt sind, soll eine **klare, transparente technische Modellannahme** getroffen und im Portal als solche kenntlich gemacht werden.
Es soll **nicht** eigenmächtig kompliziertes reales Wahlrecht ergänzt werden.

---

## Simulationskontext / Staatsstruktur

### Freistaat Ostdeutschland
Der Freistaat Ostdeutschland ist ein vereinigter ostdeutscher Flächenstaat. Hauptstadt ist **Dresden**. Landesfarben: **Blau, Weiß, Grün**.

### Acht Bezirke
Die Bezirke sind für Orientierung, regionale Einordnung und Kartenlogik wichtig:

1. Berlin
2. Brandenburg
3. Mecklenburg-Vorpommern
4. Niederlausitz
5. Oberlausitz
6. Sachsen
7. Sachsen-Anhalt
8. Thüringen

Die Bezirke sollen im Portal vorkommen:
- als geographische Bezugsebene
- als Filter-/Orientierungsebene
- als Kontext für Ergebnisse und Karten

Sie sind aber **nicht** die zentrale Wahlebene des Portals.

### Territoriale Grundlage des Wahlportals

Für das Wahlportal gilt eine feste kanonische Bezirks- und Gebietsgliederung. Verwende dafür die Datei `docs/WAHLGEBIETE_UND_BEZIRKE.md` als Source of Truth.

Wichtige Regeln:
- Der Freistaat Ostdeutschland besteht aus 8 Bezirken:
  Berlin, Brandenburg, Mecklenburg-Vorpommern, Niederlausitz, Oberlausitz, Sachsen, Sachsen-Anhalt, Thüringen.
- Für die Landtagswahl werden Ergebnisse auf Landkreisebene dargestellt; die Landkreise fungieren im Portal als regionale Wahlkreisebene.
- Für die Bundestagswahl werden Ergebnisse auf Ebene der Bundestagswahlkreise dargestellt.
- Bezirke dienen als Aggregations-, Filter- und Orientierungsebene.
- Bezirkshauptstädte und Landkreis-Zuordnungen müssen konsistent mit `docs/WAHLGEBIETE_UND_BEZIRKE.md` sein.
- Oberlausitz und Niederlausitz haben wegen der sorbischen Siedlungsgebiete besonderes regionalpolitisches Gewicht und sollen im Wording sowie in Karten-/Kontextdarstellungen entsprechend behandelt werden.
---

## Parteien
Erstelle plausible simulierte Wahldaten für mindestens diese Parteien:

- Volksfront
- DEMOS Ost
- CPD Ost
- FRP
- Patrioten
- Sonstige

Verwende plausible Parteifarben.

Fest vorgegeben:
- **Volksfront:** `#C41E3A`
- **DEMOS Ost:** `#E8851A`
- CDP schwarz
- FRP lila
- Patrioten dunkelblau

Ziel für die Landtagswahl:
- **Volksfront + DEMOS Ost** sollen zusammen eine regierungsfähige Mehrheit erreichen

---

## Datenmodell

### Öffentliche Datenstruktur
Lege die Simulationsdaten sauber und klar strukturiert ab.

Empfohlene Struktur:

```text
public/
  data/
    parteien.json
    bezirke.json
    landkreise.json
    bundestagswahlkreise.json
    landtagswahl-2024.json
    bundestagswahl-2025.json
    metadaten.json
  geo/
    bezirke.geojson
    landkreise.geojson
    bundestagswahlkreise.geojson
````

### Anforderungen an die Daten

Die Daten müssen intern konsistent sein.

#### Landtagswahl 2024

Mindestens enthalten:

* Wahldatum
* Wahlbeteiligung
* landesweites Ergebnis je Partei
* Sitzverteilung im Landtag
* Ergebnis je Landkreis
* stärkste Partei je Landkreis
* Zuordnung Landkreis → Bezirk

#### Bundestagswahl 2025

Mindestens enthalten:

* Wahldatum
* Wahlbeteiligung
* ostweites Gesamtergebnis je Partei
* Ergebnis je Bundestagswahlkreis
* stärkste Partei je Bundestagswahlkreis
* ein separat ausgewiesenes „Direktmandat Ostdeutschland“

### GeoJSON

Erstelle:

* eine vereinfachte Bezirkskarte
* eine vereinfachte Landkreiskarte
* eine vereinfachte Bundestagswahlkreis-Karte

Die Geometrien müssen nicht exakt amtlich sein, aber:

* visuell sauber
* geografisch grob plausibel
* zusammenhängend
* für D3-SVG-Karten gut nutzbar

---

## Projektstruktur

Empfohlene Struktur:

```text
wahlen-portal/
├── public/
│   ├── geo/
│   │   ├── bezirke.geojson
│   │   ├── landkreise.geojson
│   │   └── bundestagswahlkreise.geojson
│   ├── data/
│   │   ├── parteien.json
│   │   ├── bezirke.json
│   │   ├── landkreise.json
│   │   ├── bundestagswahlkreise.json
│   │   ├── landtagswahl-2024.json
│   │   ├── bundestagswahl-2025.json
│   │   └── metadaten.json
│   ├── og-image.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── ergebnisse/
│   │   │   ├── page.tsx
│   │   │   ├── landtag/
│   │   │   │   └── page.tsx
│   │   │   └── bundestag/
│   │   │       └── page.tsx
│   │   ├── karte/
│   │   │   ├── page.tsx
│   │   │   ├── landtag/
│   │   │   │   └── page.tsx
│   │   │   └── bundestag/
│   │   │       └── page.tsx
│   │   ├── wahlrecht/
│   │   │   └── page.tsx
│   │   ├── direkte-demokratie/
│   │   │   └── page.tsx
│   │   ├── werkzeuge/
│   │   │   ├── page.tsx
│   │   │   ├── koalitionsrechner/
│   │   │   │   └── page.tsx
│   │   │   └── sitzverteilung/
│   │   │       └── page.tsx
│   │   ├── methodik/
│   │   │   └── page.tsx
│   │   ├── impressum/
│   │   │   └── page.tsx
│   │   ├── datenschutz/
│   │   │   └── page.tsx
│   │   └── barrierefreiheit/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   ├── charts/
│   │   ├── maps/
│   │   ├── ui/
│   │   └── content/
│   ├── lib/
│   │   ├── wahldaten.ts
│   │   ├── sitzberechnung.ts
│   │   ├── parteien.ts
│   │   ├── geografie.ts
│   │   └── formatierung.ts
│   └── styles/
│       └── globals.css
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Seitenumfang

### Startseite `/`

Die Startseite soll sein:

* sachlich
* offiziell
* datengetrieben
* gut verständlich

Inhalte:

* offizieller Header „Landeswahlleiter des Freistaates Ostdeutschland“
* Hero mit Titel „Wahlen im Freistaat Ostdeutschland“
* Teaser zu den zwei Hauptergebnissen:

  * Landtagswahl 2024
  * Bundestagswahl 2025
* Quick Facts:

  * Wahlberechtigte
  * Wahlbeteiligung
  * letzter Wahltermin
  * nächster fiktiver Wahltermin
* Schnellzugriffe:

  * Ergebnisse
  * Karte
  * Wahlrecht
  * Direkte Demokratie
  * Werkzeuge
* sichtbarer Simulationshinweis

### Ergebnisse `/ergebnisse/landtag`

Inhalte:

* Wahlname
* Wahldatum
* Wahlbeteiligung
* landesweites Parteienergebnis
* Sitzverteilung des Landtags als Halbkreis
* Balkendiagramm der Parteien
* Tabelle als barrierefreie Alternative
* Bereich „Stärkste Partei nach Landkreis“
* Filter oder Auswahl nach Bezirk
* Liste/Übersicht aller Landkreise

### Ergebnisse `/ergebnisse/bundestag`

Inhalte:

* Wahlname
* Wahldatum
* Wahlbeteiligung
* ostweites Gesamtergebnis
* Balkendiagramm
* Ergebnis nach Bundestagswahlkreisen
* separate Hervorhebung:

  * „Direktmandat Ostdeutschland“
* Tabellenansicht als barrierefreie Alternative

### Karten

#### `/karte/landtag`

* D3-Karte auf Basis `landkreise.geojson`
* farbliche Darstellung der stärksten Partei je Landkreis
* Hover-Tooltip mit:

  * Landkreis
  * Bezirk
  * stärkste Partei
  * Prozentwert
* Filter nach Bezirk

#### `/karte/bundestag`

* D3-Karte auf Basis `bundestagswahlkreise.geojson`
* stärkste Partei je Bundestagswahlkreis
* Tooltip mit Kurzinfos

#### `/karte`

* Übersichtsseite für beide Karten

### `/wahlrecht`

Inhalte:

* Erklärung des vereinfachten Simulationswahlrechts
* Landtagswahl:

  * eine Listenstimme
  * Sitzverteilung nach landesweitem Ergebnis
  * Landkreiskarte als regionale Darstellung stärkster Kräfte
* Bundestagswahl:

  * eine Listenstimme in der Darstellung
  * Wahlkreiskarte
  * zusätzlich ein ostweites Direktmandat
* allgemeine Wahlgrundsätze:

  * allgemein
  * unmittelbar
  * frei
  * gleich
  * geheim
* freies Mandat
* Wählbarkeit / Wahlberechtigung
* klarer Hinweis:

  * Es handelt sich um das Wahlportal einer Politiksimulation

### `/direkte-demokratie`

Inhalte:

* Volksantrag
* Volksbegehren
* Volksentscheid
* verständliche, bürgernahe Darstellung der Art. 71–73
* grafischer Prozessfluss
* FAQ
* klarer Ausschluss von Abgaben-, Besoldungs- und Haushaltsgesetzen

### `/werkzeuge/koalitionsrechner`

* Parteien auswählbar
* aktuelle Sitzzahl in Echtzeit
* Mehrheitsgrenze sichtbar
* Regierung/ Opposition optisch unterscheidbar

### `/werkzeuge/sitzverteilung`

* große Halbkreis-Visualisierung
* Sortierung nach Fraktionsgröße
* Legende
* Tabellenalternative

### `/methodik`

Wichtig:
Erstelle eine Methodik-Seite.

Inhalte:

* welche Daten simuliert sind
* welches vereinfachte Wahlmodell verwendet wird
* wie Sitze berechnet werden
* warum Landkreise bzw. Bundestagswahlkreise kartiert werden
* was das „Direktmandat Ostdeutschland“ bedeutet
* klare Transparenz über Modellannahmen

---

## Visualisierungen

Baue mindestens diese D3-Elemente:

1. **Sitzverteilung als Halbkreis**
2. **Horizontales Balkendiagramm für Parteienergebnisse**
3. **Interaktive SVG-Karten**
4. **Koalitionsrechner**
5. **Simulierter Auszählungsstand / Hochrechnungsanzeige**

Wichtig:

* alle Visualisierungen brauchen barrierefreie Alternativen
* Tabellenansicht
* Textzusammenfassungen
* Tastaturbedienbarkeit, soweit interaktiv
* sinnvolle ARIA-Beschriftungen

---

## Design-System

### Anmutung

* modern
* institutionell
* datengetrieben
* barrierearm
* seriös
* nicht verspielt

### Farbpalette

* Primär: `#003366`
* Sekundär: `#1A6B3C`
* Weiß: `#FFFFFF`
* Hintergrund: `#F8FAFB`
* Text: `#1A1A2E`
* Warnung/Fehler: `#B91C1C`

### Typografie

* Hauptschrift: `Inter`
* Monospace für Zahlen/Tabellen: `JetBrains Mono`

### Design-Prinzipien

* klares Behördenportal
* viel Weißraum
* klare visuelle Hierarchie
* gute Mobilnutzung
* kein Dark Mode
* Simulationshinweis sichtbar, aber dezent

---

## Accessibility / SEO / Qualität

### Accessibility

* WCAG 2.1 AA als Ziel
* Skip-Link
* Fokus-Indikatoren
* Kontrast ≥ 4.5:1
* Tabellenalternativen für Diagramme
* Tastaturbedienbarkeit
* `lang="de"`

### SEO

* saubere `<title>` und `<meta description>`
* Open Graph Tags
* Sitemap / robots / favicon
* klare Seitentitel und URLs

### Qualität

* responsive
* keine externen API-Calls
* kein Leaflet, kein Mapbox
* keine unnötigen Pakete
* keine Überkomplizierung
* statisch exportierbar
* sauber deploybar auf Cloudflare Pages

---

## Deployment

### `next.config.ts`

```typescript
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};
export default nextConfig;
```

### Cloudflare Pages

* Build command: `npm run build`
* Output directory: `out`
* Framework preset: `Next.js (Static HTML Export)`
* Node.js: 20

### Domain

* `wahlen.freistaat-ostdeutschland.de`

---

## Arbeitsweise für Codex

Wichtig:
Arbeite nicht chaotisch „alles auf einmal“, sondern sinnvoll strukturiert.

Bitte:

1. analysiere zuerst kurz die Zielarchitektur
2. nenne dann vorab:

   * welche Seiten
   * welche Komponenten
   * welche Datendateien
   * welche Visualisierungskomponenten
     du anlegen wirst
3. setze dann das Projekt vollständig um
4. führe am Ende Build-Check aus
5. dokumentiere in der README:

   * lokale Entwicklung
   * Build
   * Cloudflare Pages Deployment
   * Datenstruktur
   * wie neue Wahldaten ergänzt werden

Wichtig:

* nicht eigenmächtig reales deutsches Wahlrecht voll nachbilden
* das vereinfachte Simulationsmodell konsequent und transparent umsetzen
* die Website soll offiziell wirken, aber klar als Simulationsprojekt gekennzeichnet sein

