import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type {
  Bezirk,
  Bundestagswahl,
  Bundestagswahlkreis,
  GeoFeatureCollection,
  Landkreis,
  Landtagswahl,
  Metadaten,
  Partei,
  WahlDataset,
} from "@/lib/types";

const dataBase = join(process.cwd(), "public", "data");
const geoBase = join(process.cwd(), "public", "geo");
const electionsBase = join(dataBase, "elections");

async function readJson<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

async function readDataJson<T>(fileName: string): Promise<T> {
  return readJson<T>(join(dataBase, fileName));
}

async function readGeoJson(fileName: string) {
  return readJson<GeoFeatureCollection>(join(geoBase, fileName));
}

async function readElectionGroup(group: "landtag" | "bundestag") {
  const groupDir = join(electionsBase, group);
  const files = (await readdir(groupDir)).filter((fileName) => fileName.endsWith(".json")).sort();
  const datasets = await Promise.all(files.map((fileName) => readJson<WahlDataset>(join(groupDir, fileName))));
  return datasets.sort((left, right) => right.datum.localeCompare(left.datum));
}

function findDataset(datasets: WahlDataset[], id: string) {
  const match = datasets.find((dataset) => dataset.id === id);
  if (!match) {
    throw new Error(`Datensatz ${id} nicht gefunden.`);
  }
  return match;
}

export async function getParteien() {
  return readDataJson<Partei[]>("parteien.json");
}

export async function getBezirke() {
  return readDataJson<Bezirk[]>("bezirke.json");
}

export async function getLandkreise() {
  return readDataJson<Landkreis[]>("landkreise.json");
}

export async function getBundestagswahlkreise() {
  return readDataJson<Bundestagswahlkreis[]>("bundestagswahlkreise.json");
}

export async function getMetadaten() {
  return readDataJson<Metadaten>("metadaten.json");
}

export async function getLandtagDatasets() {
  return readElectionGroup("landtag");
}

export async function getBundestagDatasets() {
  return readElectionGroup("bundestag");
}

export async function getLandkreiseGeo() {
  return readGeoJson("landkreise-ost.geojson");
}

export async function getBundestagswahlkreiseGeo() {
  return readGeoJson("btw-wahlkreise-ost.geojson");
}

export async function getLandtagswahl2024(): Promise<Landtagswahl> {
  const datasets = await getLandtagDatasets();
  const dataset = datasets.find((entry) => entry.summary.sitzverteilung) ?? datasets[0];
  return {
    id: dataset.id,
    name: dataset.label,
    datum: dataset.datum,
    wahlbeteiligung: dataset.wahlbeteiligung,
    wahlberechtigte: dataset.wahlberechtigte,
    gueltigeStimmen: dataset.gueltigeStimmen,
    sitzeGesamt: dataset.summary.sitzeGesamt ?? 0,
    mehrheitsgrenze: dataset.summary.mehrheitsgrenze ?? 0,
    modellhinweis: dataset.modellhinweis,
    landesergebnis: dataset.summary.gesamtergebnis,
    sitzverteilung: dataset.summary.sitzverteilung ?? {},
    regierungsoption: dataset.summary.regierungsoption ?? {
      koalition: [],
      sitze: 0,
      mehrheitsfaehig: false,
    },
    ergebnisseLandkreise: dataset.gebiete.map((gebiet) => ({
      landkreisId: gebiet.gebietId,
      landkreis: gebiet.gebietName,
      bezirkId: gebiet.bezirkId,
      bezirk: gebiet.bezirk,
      parteien: gebiet.ergebnisse,
      staerkstePartei: gebiet.staerkstePartei,
      staerksteParteiProzent: gebiet.staerksteParteiProzent,
    })),
  };
}

export async function getBundestagswahl2025(): Promise<Bundestagswahl> {
  const dataset = findDataset(await getBundestagDatasets(), "bundestag-8-ost");
  return {
    id: dataset.id,
    name: dataset.label,
    datum: dataset.datum,
    wahlbeteiligung: dataset.wahlbeteiligung,
    wahlberechtigte: dataset.wahlberechtigte,
    gueltigeStimmen: dataset.gueltigeStimmen,
    modellhinweis: dataset.modellhinweis,
    gesamtergebnisOst: dataset.summary.gesamtergebnis,
    direktmandatOstdeutschland: dataset.summary.direktmandat ?? {
      mandatName: "Direktmandat Ostdeutschland",
      kandidat: "k. A.",
      partei: "k. A.",
      stimmenanteil: 0,
      hinweis: "",
    },
    ergebnisseWahlkreise: dataset.gebiete.map((gebiet) => ({
      wahlkreisId: gebiet.gebietId,
      wahlkreis: gebiet.gebietName,
      bezirkId: gebiet.bezirkId,
      bezirk: gebiet.bezirk,
      parteien: gebiet.ergebnisse,
      staerkstePartei: gebiet.staerkstePartei,
      staerksteParteiProzent: gebiet.staerksteParteiProzent,
    })),
  };
}
