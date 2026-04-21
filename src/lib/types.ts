export type Partei = {
  id: string;
  name: string;
  short: string;
  color: string;
  position: string;
};

export type Bezirk = {
  id: string;
  name: string;
  hauptstadt: string;
  besonderesRegionalgewicht: boolean;
  hinweis: string;
  anzahlLandkreise: number;
};

export type Landkreis = {
  id: string;
  name: string;
  type: "landkreis" | "kreisfreie_stadt";
  bezirkId: string;
  bezirk: string;
};

export type Bundestagswahlkreis = {
  id: string;
  name: string;
  nummer?: string;
  land?: string;
  bezirkId: string;
  bezirk: string;
  zuordnung?: string;
};

export type GebietsEbene = "landkreis" | "bundestagswahlkreis";
export type WahlTyp = "landtag" | "bundestag";

export type ErgebnisDatensatz = {
  [partei: string]: number;
};

export type ParteiErgebnisDetail = {
  name: string;
  kurz?: string;
  stimmen: number;
  prozent: number;
  sitze?: number;
  kandidat?: string;
  normiertAuf?: string;
};

export type ErgebnisBlock = {
  id: string;
  label: string;
  stimmart: "gesamt" | "listenstimme" | "zweitstimme" | "erststimme" | "wahlkreisstimme";
  parteien: ParteiErgebnisDetail[];
  hinweis?: string;
};

export type Vergleichswerte = {
  datasetId: string;
  wahlbeteiligung: number;
  staerkstePartei: string;
  staerksteParteiProzent: number;
};

export type KartenGebietErgebnis = {
  gebietId: string;
  gebietName: string;
  officialName?: string;
  bezirkId: string;
  bezirk: string;
  wahlbeteiligung: number;
  ergebnisse: ErgebnisDatensatz;
  staerkstePartei: string;
  staerksteParteien?: string[];
  staerksteParteiProzent: number;
  siegerHinweis?: string;
  vergleichswerte?: Vergleichswerte;
  typ?: Landkreis["type"];
};

export type WahlDataset = {
  id: string;
  electionId: string;
  label: string;
  datum: string;
  typ: WahlTyp;
  gebietsebene: GebietsEbene;
  wahlbeteiligung: number;
  wahlberechtigte: number;
  gueltigeStimmen: number;
  modellhinweis: string;
  datenstand: string;
  metadaten: {
    quelle: string;
    geobasis: string;
    legendenTitel: string;
    vergleichMit?: string;
    simulationshinweis: string;
    ordnungscode?: string;
    pdfDatei?: string;
  };
  regionaldatenTyp?: "vollergebnis" | "manuelles-sieger-mapping";
  regionaldatenQuelle?: string;
  summary: {
    gesamtergebnis: ErgebnisDatensatz;
    detailergebnisse?: ErgebnisBlock[];
    sitzverteilung?: Record<string, number>;
    sitzeGesamt?: number;
    mehrheitsgrenze?: number;
    regierungsoption?: {
      koalition: string[];
      sitze: number;
      mehrheitsfaehig: boolean;
    };
    direktmandat?: {
      mandatName: string;
      kandidat: string;
      partei: string;
      stimmenanteil: number;
      hinweis: string;
    };
  };
  gebiete: KartenGebietErgebnis[];
};

export type LandkreisErgebnis = {
  landkreisId: string;
  landkreis: string;
  bezirkId: string;
  bezirk: string;
  parteien: ErgebnisDatensatz;
  staerkstePartei: string;
  staerksteParteiProzent: number;
};

export type WahlkreisErgebnis = {
  wahlkreisId: string;
  wahlkreis: string;
  bezirkId: string;
  bezirk: string;
  parteien: ErgebnisDatensatz;
  staerkstePartei: string;
  staerksteParteiProzent: number;
};

export type Landtagswahl = {
  id: string;
  name: string;
  datum: string;
  wahlbeteiligung: number;
  wahlberechtigte: number;
  gueltigeStimmen: number;
  sitzeGesamt: number;
  mehrheitsgrenze: number;
  modellhinweis: string;
  landesergebnis: ErgebnisDatensatz;
  sitzverteilung: Record<string, number>;
  regierungsoption: {
    koalition: string[];
    sitze: number;
    mehrheitsfaehig: boolean;
  };
  ergebnisseLandkreise: LandkreisErgebnis[];
};

export type Bundestagswahl = {
  id: string;
  name: string;
  datum: string;
  wahlbeteiligung: number;
  wahlberechtigte: number;
  gueltigeStimmen: number;
  modellhinweis: string;
  gesamtergebnisOst: ErgebnisDatensatz;
  direktmandatOstdeutschland: {
    mandatName: string;
    kandidat: string;
    partei: string;
    stimmenanteil: number;
    hinweis: string;
  };
  ergebnisseWahlkreise: WahlkreisErgebnis[];
};

export type Metadaten = {
  portal: {
    name: string;
    institution: string;
    domain: string;
    stand: string;
    simulationshinweis: string;
  };
  quickfacts: {
    wahlberechtigte: number;
    letzteWahl: string;
    naechsteWahl: string;
    aktuelleWahlbeteiligungReferenz: number;
  };
  design: {
    landesfarben: string[];
  };
};

export type GeoFeatureCollection = {
  type: "FeatureCollection";
  metadata?: Record<string, string>;
  features: GeoFeature[];
};

export type GeoFeature = {
  type: "Feature";
  properties: Record<string, string | number | boolean>;
  geometry: GeoGeometry;
};

export type GeoGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};
