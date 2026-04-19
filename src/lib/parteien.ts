import type { Partei } from "@/lib/types";

export function parteiFarbenMap(parteien: Partei[]) {
  return Object.fromEntries(parteien.map((partei) => [partei.name, partei.color]));
}

export function parteiKurznameMap(parteien: Partei[]) {
  return Object.fromEntries(parteien.map((partei) => [partei.name, partei.short]));
}
