## Codex-Prompt: Offizielles Wahlportal des Freistaates Ostdeutschland

### Projektziel
Erstelle eine vollständige, produktionsreife Webapplikation für das offizielle Wahlportal des fiktiven **Freistaates Ostdeutschland** unter der Domain `wahlen.freistaat-ostdeutschland.de`. Die Seite ist die offizielle Webpräsenz des **Landeswahlleiters des Freistaates Ostdeutschland** und dient als Ergebnisportal, Demokratie-Informationsplattform und Transparenzinstrument.

---

### Tech-Stack & Architektur

| Komponente | Technologie |
|---|---|
| **Framework** | Next.js 15 (App Router, Static Export via `output: "export"`) |
| **Sprache** | TypeScript |
| **Styling** | Tailwind CSS 4 |
| **Visualisierung** | D3.js (für Karten, Sitzverteilung, Balkendiagramme) |
| **Karte** | GeoJSON-basierte interaktive SVG-Karte (kein externer Kartendienst – die Karte wird als Inline-SVG mit D3 gerendert) |
| **Hosting/Deploy** | Cloudflare Pages (Static HTML Export) |
| **CI/CD** | GitHub-Repository → Cloudflare Pages auto-deploy bei Push auf `main` |
| **Domain** | Custom Domain `wahlen.freistaat-ostdeutschland.de` via Cloudflare DNS |

**Begründung für Static Export:** Die Seite enthält ausschließlich vorab definierte, simulierte Wahldaten (JSON-Dateien). Es gibt keine Datenbank, keine API-Calls zur Laufzeit, kein SSR. Alle Daten werden bei Build-Time eingebunden. Das macht Static Export ideal – maximale Performance, kein Worker-Bedarf, unbegrenzte Bandbreite auf Cloudflare Pages Free Tier.

---

### Projektstruktur

```
wahlen-portal/
├── public/
│   ├── geo/
│   │   └── bezirke.geojson          # GeoJSON der 8 Bezirke
│   ├── data/
│   │   ├── landtagswahl-2024.json   # Ergebnisdaten Landtagswahl
│   │   ├── bezirkstagswahlen-2025.json
│   │   ├── bundestagswahl-2025.json
│   │   ├── wahlkreise.json          # Wahlkreisverzeichnis mit Zuordnung zu Bezirken
│   │   └── parteien.json            # Parteifarben, Kürzel, volle Namen
│   ├── og-image.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root-Layout mit Header/Footer/Nav
│   │   ├── page.tsx                 # Startseite / Dashboard
│   │   ├── ergebnisse/
│   │   │   ├── page.tsx             # Übersicht aller Wahlen
│   │   │   ├── landtag/
│   │   │   │   └── page.tsx         # Landtagswahl-Ergebnisseite
│   │   │   ├── bezirkstag/
│   │   │   │   └── page.tsx         # Bezirkstagswahlen-Ergebnisseite
│   │   │   └── bundestag/
│   │   │       └── page.tsx         # Bundestagswahl-Ergebnisseite
│   │   ├── karte/
│   │   │   └── page.tsx             # Interaktive Wahlkreiskarte
│   │   ├── wahlrecht/
│   │   │   └── page.tsx             # Erklärungs- und Informationsseite
│   │   ├── direkte-demokratie/
│   │   │   └── page.tsx             # Volksantrag, Volksbegehren, Volksentscheid
│   │   ├── werkzeuge/
│   │   │   ├── page.tsx             # Übersicht Tools
│   │   │   ├── koalitionsrechner/
│   │   │   │   └── page.tsx         # Koalitionsrechner
│   │   │   └── sitzverteilung/
│   │   │       └── page.tsx         # Sitzverteilungs-Visualisierung
│   │   ├── impressum/
│   │   │   └── page.tsx
│   │   └── barrierefreiheit/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── Breadcrumb.tsx
│   │   ├── charts/
│   │   │   ├── SitzverteilungHalbkreis.tsx   # D3 Halbkreis-Parlament
│   │   │   ├── BalkendiagrammErgebnis.tsx     # Horizontale Balken je Partei
│   │   │   ├── WahlkreisKarte.tsx             # D3 + GeoJSON interaktive Karte
│   │   │   ├── KoalitionsRechner.tsx          # Interaktiver Koalitionsrechner
│   │   │   └── AuszaehlungsStand.tsx          # Simulierter Fortschrittsbalken
│   │   ├── ui/
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── SkipLink.tsx         # Barrierefreiheit
│   │   └── content/
│   │       ├── VolksantragErklaerung.tsx
│   │       ├── WahlsystemErklaerung.tsx
│   │       └── BezirkSelector.tsx
│   ├── lib/
│   │   ├── wahldaten.ts             # Typen und Loader für JSON-Daten
│   │   ├── sitzberechnung.ts        # Sainte-Laguë / d'Hondt Berechnung
│   │   ├── farben.ts                # Parteifarben-Mapping
│   │   └── bezirke.ts              # Bezirks-Konstanten und Metadaten
│   └── styles/
│       └── globals.css
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

### Inhaltliche Vorgaben (fiktiver Simulationskontext)

#### 1. Staatsstruktur
Der **Freistaat Ostdeutschland** ist ein vereinigter ostdeutscher Flächenstaat aus den Gebieten von Berlin, Brandenburg, Mecklenburg-Vorpommern, Sachsen, Sachsen-Anhalt und Thüringen. Hauptstadt ist **Dresden**. Landesfarben: **Blau, Weiß, Grün**.

#### 2. Acht Bezirke
Seit dem Bezirkseinführungsgesetz (6. März 2025) bestehen acht Bezirke als allgemeine Staatsbehörden und regionale Koordinationsräume mit direkt gewählten **Bezirkstagen**:
1. **Berlin** (Sonderstatus als Bundeshauptstadt)
2. **Brandenburg**
3. **Mecklenburg-Vorpommern**
4. **Niederlausitz**
5. **Oberlausitz**
6. **Sachsen**
7. **Sachsen-Anhalt**
8. **Thüringen**

#### 3. Wahlrecht (Art. 41 Verfassung)
- Art. 41: „Das Wahlsystem wird durch die Bestimmungen des Bundeswahlgesetzes geregelt."
- Art. 39: Freies Mandat, Landtag als gewählte Vertretung des Volkes
- Art. 4: Wahlen und Abstimmungen sind allgemein, unmittelbar, frei, gleich und geheim

#### 4. Direkte Demokratie (Art. 71–73 Verfassung)
- **Volksantrag (Art. 71):** Mindestens 1/10 der Stimmberechtigten; muss begründeten Gesetzentwurf enthalten; Einreichung beim Landtagspräsidenten; Verfassungsgerichtshof prüft Zulässigkeit; Landtag muss anhören.
- **Volksbegehren (Art. 72):** Wenn Landtag Volksantrag nicht binnen 6 Monaten zustimmt; erneut 1/10 der Stimmberechtigten; führt zum Volksentscheid; max. 6 Wochen Frist zwischen Begehren und Entscheid.
- **Volksentscheid (Art. 72 Abs. 5):** Ja/Nein-Abstimmung; Mehrheit der abgegebenen gültigen Stimmen entscheidet; bei regionalen Fragen nur im betroffenen Gebiet.
- **Ausschlüsse (Art. 73):** Keine Volksabstimmungen über Abgaben-, Besoldungs- und Haushaltsgesetze.

#### 5. Wahlebenen
Die Webseite präsentiert Ergebnisse für drei Wahlebenen:
- **Landtagswahlen** (Ostdeutscher Landtag)
- **Bundestagswahlen** (Bundestag – ostdeutsche Wahlkreise)
- **Bezirkstagswahlen** (seit Bezirkseinführungsgesetz; jeweils pro Bezirk)

#### 6. Parteien (Simulationsdaten)
Erstelle plausible fiktive Wahlergebnisse für mindestens folgende Parteien:
- **Volksfront** (Regierungspartei des MP Honecker, links-progressiv)
- **DEMOS Ost** (Koalitionspartner, Mitte-links/sozialdemokratisch)
- **CDU** (konservativ)
- **AfD** (rechtspopulistisch)
- **BSW** (Bündnis Sahra Wagenknecht)
- **FDP** (liberal)
- **Grüne** (ökologisch)
- **Die Linke** (sozialistisch)
- **Freie Wähler**
- Sonstige

Verwende plausible Parteifarben. **Volksfront** = Rot (#C41E3A), **DEMOS Ost** = Orange (#E8851A).

#### 7. Beispiel-Wahldaten
Generiere realistische JSON-Daten für:
- **Landtagswahl Oktober 2024**: Gesamtergebnis + Ergebnisse pro Bezirk (=8 regionale Ergebnisse); Sitzverteilung im Landtag (ca. 200 Sitze); Wahlbeteiligung.
- **Bundestagswahl September 2025**: Erst- und Zweitstimmen; Direktmandate pro Wahlkreis.
- **Bezirkstagswahlen März 2025**: Ergebnisse pro Bezirkstag.

Die Daten sollen so gestaltet sein, dass Volksfront + DEMOS Ost zusammen eine regierungsfähige Mehrheit im Landtag haben (das Kabinett Honecker).

---

### Seitenbeschreibungen

#### Startseite (`/`)
- Offizieller Header: „Landeswahlleiter des Freistaates Ostdeutschland"
- Hero-Bereich mit Überschrift: „Wahlen im Freistaat Ostdeutschland"
- 3 Kacheln mit den aktuellsten Wahlergebnissen (Landtag, Bundestag, Bezirkstag) inkl. Mini-Sitzverteilung als Halbkreis-Icon
- Quick-Facts-Bereich: Wahlberechtigte, Wahlbeteiligung, nächster Wahltermin
- Link-Bereich zu Wahlrecht-Erklärseite und Direkte-Demokratie-Seite
- Hinweis-Banner: „Diese Seite ist eine Simulation im Rahmen des Projekts Freistaat Ostdeutschland."

#### Ergebnisseiten (`/ergebnisse/landtag`, `/ergebnisse/bezirkstag`, `/ergebnisse/bundestag`)
Jeweils:
- **Kopfzeile:** Wahlbezeichnung, Wahltag, Wahlbeteiligung
- **Sitzverteilung als D3-Halbkreis** (Parlamentsdarstellung): Sitze nach Parteien, Hover zeigt Parteiname + Sitze + Prozent
- **Balkendiagramm:** Zweitstimmen-Ergebnis aller Parteien in horizontalen Balken mit Prozentangabe
- **Auszählungsstand:** Simulierter Fortschrittsbalken „100 % der Stimmbezirke ausgezählt"
- **Bezirkstag-Spezifisch:** Tabs oder Dropdown zur Auswahl des Bezirks; jeder Bezirk hat eigene Sitzverteilung
- **Tabellen-Ansicht:** Umschaltbar zwischen Diagramm und Tabelle (für Barrierefreiheit und Screenreader)

#### Interaktive Karte (`/karte`)
- D3.js + GeoJSON-Karte aller 8 Bezirke
- Klick auf einen Bezirk zeigt Wahlergebnis-Overlay (Sitzverteilung des Bezirkstags + stärkste Partei + Wahlbeteiligung)
- Farbliche Schattierung nach stärkster Partei oder Wahlbeteiligung (umschaltbar)
- Tooltip bei Hover mit Bezirksname und Kurzinfo
- Responsiv: auf Mobile als vertikale Liste mit Bezirks-Karten-Thumbnails

#### Wahlrecht-Erklärseite (`/wahlrecht`)
- Abschnitt 1: **Wahlsystem** – Erklärung, dass das Wahlsystem nach Art. 41 der Verfassung durch das Bundeswahlgesetz geregelt wird; personalisierte Verhältniswahl; Erst- und Zweitstimme
- Abschnitt 2: **Wer darf wählen?** – Wahlberechtigung (Art. 4: allgemein, unmittelbar, frei, gleich, geheim)
- Abschnitt 3: **Wer darf sich wählen lassen?** – Wählbarkeit, freies Mandat (Art. 39, 42)
- Abschnitt 4: **Bezirkstage** – Seit dem Bezirkseinführungsgesetz vom 6. März 2025 werden in allen acht Bezirken Bezirkstage mit direkt gewählten Vertreterinnen und Vertretern gebildet
- Abschnitt 5: **Parlamentarische Opposition** – Art. 40 Verfassung
- Formatierung: Akkordeon-Elemente, mit Icons, barrierefrei bedienbar per Tastatur

#### Direkte Demokratie (`/direkte-demokratie`)
- Dreistufiger visueller Prozess-Flow (Volksantrag → Volksbegehren → Volksentscheid) als interaktive Infografik
- Für jeden Schritt: Voraussetzungen, Quorum, Fristen, Zuständigkeit, Ausschlüsse
- Exakte Wiedergabe der Art. 71–73 der Verfassung, aufbereitet in bürgernaher Sprache
- Am Ende: FAQ-Abschnitt (z.B. „Kann über den Haushalt abgestimmt werden?" → Nein, Art. 73 Abs. 1)

#### Koalitionsrechner (`/werkzeuge/koalitionsrechner`)
- Nutzer können Parteien an- und abwählen (Checkbox-Kacheln)
- Echtzeit-Anzeige der kombinierten Sitzzahl
- Visuelle Anzeige ob Mehrheit erreicht (grüne Linie bei 50%+1)
- Basiert auf den aktuellen Landtagswahl-Daten

#### Sitzverteilung (`/werkzeuge/sitzverteilung`)
- Große Halbkreis-Visualisierung mit Beschriftung
- Sortierung nach Fraktionsgröße
- Anzeige: Regierungskoalition (Volksfront + DEMOS Ost) vs. Opposition

---

### Design-System

**Farbpalette:**
- Primär: `#003366` (Dunkelblau – offizielles Behördenblau)
- Sekundär: `#1A6B3C` (Grün – aus Landesfarben)
- Akzent: `#FFFFFF` (Weiß – aus Landesfarben)
- Hintergrund: `#F8FAFB` (Helles Grau)
- Text: `#1A1A2E` (Fast-Schwarz)
- Fehler/Warnung: `#B91C1C`

**Typografie:**
- Überschriften: `Inter`, sans-serif, font-weight 700
- Fließtext: `Inter`, sans-serif, font-weight 400
- Monospace (Zahlen in Tabellen): `JetBrains Mono`

**Design-Prinzipien:**
- Sachlich-modern, institutionell, datengetrieben
- Orientiert an realen Landeswahlleiter-Portalen (z.B. wahlen.sachsen.de)
- Viel Whitespace, klare Hierarchie
- Responsives Grid-Layout
- Dark Mode: nein (offizielle Behördenseite)

**Barrierefreiheit (WCAG 2.1 AA):**
- Skip-Links
- Alle Diagramme haben alternative Tabellenansichten
- ARIA-Labels auf allen interaktiven Elementen
- Fokus-Indikatoren
- Kontrastverhältnisse ≥ 4.5:1
- Tastatur-Navigation für alle interaktiven Komponenten
- `lang="de"` im HTML-Element

---

### Header & Footer

**Header:**
- Logo/Wappen-Platzhalter links (SVG-Platzhalter mit Blau-Weiß-Grün-Streifen)
- Text: „Landeswahlleiter | Freistaat Ostdeutschland"
- Navigation: Startseite · Ergebnisse · Karte · Wahlrecht · Direkte Demokratie · Werkzeuge
- Mobile: Burger-Menü

**Footer:**
- Links: Impressum · Barrierefreiheit · Datenschutz
- Mitte: „© 2026 Landeswahlleiter des Freistaates Ostdeutschland"
- Rechts: „Powered by ost-recht.de" (Link-Platzhalter)
- Hinweis: „Simulationsprojekt – keine echte Behörde"

---

### GeoJSON-Daten

Erstelle eine vereinfachte `bezirke.geojson`-Datei mit 8 Features (eines pro Bezirk). Die Geometrien müssen nicht exakt sein – verwende vereinfachte Polygone, die grob die geographische Lage der Bezirke abbilden. Wichtig ist, dass sie als D3-SVG-Karte visuell erkennbar zusammen den Umriss des Freistaates Ostdeutschland (≈ Gebiet der ehemaligen DDR + Berlin) ergeben. Jedes Feature hat folgende Properties:
```json
{
  "id": "berlin",
  "name": "Berlin",
  "hauptort": "Berlin",
  "typ": "bezirk"
}
```

---

### Deployment-Konfiguration

**`next.config.ts`:**
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

**Cloudflare Pages Setup:**
- Build command: `npm run build`
- Build output directory: `out`
- Framework preset: `Next.js (Static HTML Export)`
- Root directory: `/`
- Node.js version: 20

**Custom Domain:**
- CNAME `wahlen` → `wahlen-portal.pages.dev`
- SSL: Full (strict)

---

### Qualitätsanforderungen

1. **Lighthouse Score ≥ 95** auf allen Kategorien (Performance, Accessibility, Best Practices, SEO)
2. **Vollständig responsive** (Mobile, Tablet, Desktop)
3. **Alle Seiten haben korrekte `<title>`, `<meta description>`, Open Graph Tags**
4. **Keine externen API-Calls** – alles statisch, alle Daten im `/public/data/`
5. **Kein JavaScript-Framework für die Karte** außer D3.js – kein Leaflet, kein Mapbox
6. **Deutsche Sprache** durchgehend; `lang="de"` im HTML
7. **Simulationshinweis** auf jeder Seite sichtbar (kleiner Banner oder Footer-Zeile)
8. **Saubere Git-History**: Initialer Commit mit funktionsfähiger App

---

### Zusammenfassung der zu generierenden Dateien

1. Gesamte Next.js-App mit allen oben beschriebenen Seiten und Komponenten
2. Simulierte Wahldaten als JSON (3 Wahlen, 8 Bezirke, ~10 Parteien)
3. Vereinfachte GeoJSON-Datei für die 8 Bezirke
4. D3.js-Visualisierungen: Halbkreis-Parlament, Balkendiagramm, Karte, Koalitionsrechner
5. Vollständiges Tailwind-Styling
6. README.md mit Deployment-Anleitung für Cloudflare Pages

