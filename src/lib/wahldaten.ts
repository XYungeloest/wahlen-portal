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

type ManualWinnerMapping = {
  schema: string;
  gebietsebene: "landkreis" | "bundestagswahlkreis";
  quelle: string;
  hinweis: string;
  gebiete: ManualWinnerArea[];
};

type ManualWinnerArea = {
  gebietId: string;
  gebietName: string;
  gewinner: Record<string, string[]>;
  hinweise?: Record<string, string>;
};

type RegionalArea = Landkreis | Bundestagswahlkreis;

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
  const enrichedDatasets = await applyManualWinnerMappings(group, datasets);
  return enrichedDatasets.sort((left, right) => right.datum.localeCompare(left.datum));
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

async function applyManualWinnerMappings(group: "landtag" | "bundestag", datasets: WahlDataset[]) {
  const mappingFile = group === "landtag" ? "mappings/landtag-gebietssieger.json" : "mappings/bundestag-gebietssieger.json";
  const areasFile = group === "landtag" ? "landkreise.json" : "bundestagswahlkreise.json";
  const [mapping, areas] = await Promise.all([
    readDataJson<ManualWinnerMapping>(mappingFile).catch(() => null),
    readDataJson<RegionalArea[]>(areasFile),
  ]);

  if (!mapping) {
    return datasets;
  }

  const areasById = new Map(areas.map((area) => [area.id, area]));

  return datasets.map((dataset) => {
    const mappedAreas = mapping.gebiete
      .map((entry) => {
        const winners = entry.gewinner[dataset.id];
        const area = areasById.get(entry.gebietId);
        if (!winners?.length || !area) {
          return null;
        }
        const officialName = "officialName" in area && typeof area.officialName === "string" ? area.officialName : area.name;
        const typ = "type" in area ? area.type : undefined;

        return {
          gebietId: area.id,
          gebietName: area.name,
          officialName,
          bezirkId: area.bezirkId,
          bezirk: area.bezirk,
          wahlbeteiligung: dataset.wahlbeteiligung,
          ergebnisse: {},
          staerkstePartei: winners.join(" / "),
          staerksteParteien: winners,
          staerksteParteiProzent: 0,
          siegerHinweis: entry.hinweise?.[dataset.id],
          typ,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

    if (mappedAreas.length === 0) {
      return dataset;
    }

    return {
      ...dataset,
      gebiete: mappedAreas,
      regionaldatenTyp: "manuelles-sieger-mapping" as const,
      regionaldatenQuelle: `${mapping.quelle} ${mapping.hinweis}`,
      metadaten: {
        ...dataset.metadaten,
        quelle: `${dataset.metadaten.quelle}; regionale Siegerkarte: manuelles Referenzbild-Mapping`,
        geobasis:
          group === "landtag"
            ? "Lokales GeoJSON der Landkreise und kreisfreien Städte mit manuellem Gebietssieger-Mapping aus Referenzbildern"
            : "Lokales GeoJSON der ostdeutschen Bundestagswahlkreise mit manuellem Gebietssieger-Mapping aus Referenzbildern",
      },
    };
  });
}

export async function getLandtagswahl2024(): Promise<Landtagswahl> {
  const dataset = findDataset(await getLandtagDatasets(), "landtag-2024");
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
  const dataset = findDataset(await getBundestagDatasets(), "bundestag-2025");
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
