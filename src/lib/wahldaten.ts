import { readFile } from "node:fs/promises";
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
} from "@/lib/types";

const dataBase = join(process.cwd(), "public", "data");
const geoBase = join(process.cwd(), "public", "geo");

async function readJson<T>(base: string, fileName: string): Promise<T> {
  const content = await readFile(join(base, fileName), "utf8");
  return JSON.parse(content) as T;
}

export async function getParteien() {
  return readJson<Partei[]>(dataBase, "parteien.json");
}

export async function getBezirke() {
  return readJson<Bezirk[]>(dataBase, "bezirke.json");
}

export async function getLandkreise() {
  return readJson<Landkreis[]>(dataBase, "landkreise.json");
}

export async function getBundestagswahlkreise() {
  return readJson<Bundestagswahlkreis[]>(dataBase, "bundestagswahlkreise.json");
}

export async function getLandtagswahl2024() {
  return readJson<Landtagswahl>(dataBase, "landtagswahl-2024.json");
}

export async function getBundestagswahl2025() {
  return readJson<Bundestagswahl>(dataBase, "bundestagswahl-2025.json");
}

export async function getMetadaten() {
  return readJson<Metadaten>(dataBase, "metadaten.json");
}

export async function getBezirkeGeo() {
  return readJson<GeoFeatureCollection>(geoBase, "bezirke.geojson");
}

export async function getLandkreiseGeo() {
  return readJson<GeoFeatureCollection>(geoBase, "landkreise.geojson");
}

export async function getBundestagswahlkreiseGeo() {
  return readJson<GeoFeatureCollection>(geoBase, "bundestagswahlkreise.geojson");
}
