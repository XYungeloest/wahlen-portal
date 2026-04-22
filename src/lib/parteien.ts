import type { Partei } from "@/lib/types";

const partyAliases: Record<string, string> = {
  "Volksfront Ostdeutschland": "Volksfront",
  VF: "Volksfront",
  "DEMOS Ostdeutschland": "DEMOS Ost",
  DEMOS: "DEMOS Ost",
  "Sozialdemokratisch-Grüne Bewegung": "DEMOS Ost",
  SGB: "DEMOS Ost",
  "DEMOS an der Elbe": "DEMOS Ost",
  "Bündnis Demokratie Europa": "DEMOS Ost",
  "Bündnis Demokratie Europa an der Elbe": "DEMOS Ost",
  "Bündnis Demokratie Europa Ost": "DEMOS Ost",
  "Christlich Demokratische Partei": "CPD Ost",
  "Christlich Demokratische Partei Landesverband Ost": "CPD Ost",
  "Christlich Demokratische Partei im Ostdeutschen Freistaat": "CPD Ost",
  "CDP Ost": "CPD Ost",
  CDP: "CPD Ost",
  "Freiheitliche Reformpartei": "FRP",
  "Freiheitliche Reformpartei Ostdeutschland": "FRP",
  "Freiheitliche Reformpartei Ostdeutschlands": "FRP",
  "FRP Ost": "FRP",
  "Die ostdeutschen Patrioten": "Patrioten",
  "DIE PATRIOTEN": "Patrioten",
  PATRIOTEN: "Patrioten",
  "Nationale Freiheitspartei Ost": "Patrioten",
  "Nationale Freiheitspartei": "Patrioten",
  NFP: "Patrioten",
  "NFP Ost": "Patrioten",
  DHP: "Patrioten",
  "Deutsche Heimatpartei": "Patrioten",
  "Liberal-Demokratische Partei Ostdeutschland": "LDP",
  "Liberal-Demokratische Partei": "LDP",
  "LDP-Ost": "LDP",
  "Progressiv-Liberale Allianz": "LDP",
  PLA: "LDP",
  "Ostdeutschland in Bewegung": "DRiB",
  OiB: "DRiB",
  "Die Republik in Bewegung": "DRiB",
  DRiB: "DRiB",
  "Einheitlich Sozialistische Partei": "ESP",
  "Einheitlich Sozialistische Partei im Ostdeutschen Freistaat": "ESP",
  "ESP Ost": "ESP",
  "Bewegung der 5 Sterne": "M5S",
  "Bewegung der 5 Sterne: Die Bürgerbewegung": "M5S",
  M5S: "M5S",
  "Republikanische Partei": "RP",
  RP: "RP",
  R: "RP",
  "Freikonservative Partei": "FKP",
  "Liberal-Konservative Partei": "FKP",
  LKP: "FKP",
  FKP: "FKP",
};

export function parteiFarbenMap(parteien: Partei[]) {
  const farben = Object.fromEntries(parteien.map((partei) => [partei.name, partei.color]));
  for (const [alias, canonical] of Object.entries(partyAliases)) {
    if (farben[canonical]) {
      farben[alias] = farben[canonical];
    }
  }
  return farben;
}

export function parteiKurznameMap(parteien: Partei[]) {
  const kurz = Object.fromEntries(parteien.map((partei) => [partei.name, partei.short]));
  for (const [alias, canonical] of Object.entries(partyAliases)) {
    if (kurz[canonical]) {
      kurz[alias] = kurz[canonical];
    }
  }
  return kurz;
}
