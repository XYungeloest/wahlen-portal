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
  nummer: number;
  name: string;
  kurzname: string;
  bezirkId: string;
  bezirk: string;
};

export type ErgebnisDatensatz = {
  [partei: string]: number;
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
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: {
      type: "Polygon" | "MultiPolygon";
      coordinates: number[][][] | number[][][][];
    };
  }>;
};
