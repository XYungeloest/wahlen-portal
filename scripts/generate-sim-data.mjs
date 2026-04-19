import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dataDir = join(root, "public", "data");
const geoDir = join(root, "public", "geo");
mkdirSync(dataDir, { recursive: true });
mkdirSync(geoDir, { recursive: true });

const parties = [
  { id: "volksfront", name: "Volksfront", short: "VF", color: "#C41E3A", position: "sozial-patriotisch" },
  { id: "demos-ost", name: "DEMOS Ost", short: "DEM", color: "#E8851A", position: "liberal-sozial" },
  { id: "cpd-ost", name: "CPD Ost", short: "CPD", color: "#111111", position: "christdemokratisch" },
  { id: "frp", name: "FRP", short: "FRP", color: "#6B21A8", position: "freiheitlich" },
  { id: "patrioten", name: "Patrioten", short: "PAT", color: "#0B3A82", position: "konservativ" },
  { id: "sonstige", name: "Sonstige", short: "SON", color: "#6B7280", position: "verschieden" },
];

const districts = [
  {
    id: "berlin",
    name: "Berlin",
    hauptstadt: "Berlin",
    highlights: "Städtischer Kernraum mit hoher Mobilität.",
    specialRole: false,
    box: { lon: 13.05, lat: 52.8, w: 0.45, h: 0.35 },
    counties: [{ name: "Berlin", type: "kreisfreie_stadt" }],
  },
  {
    id: "brandenburg",
    name: "Brandenburg",
    hauptstadt: "Potsdam",
    highlights: "Flächenbezirk mit urbanen Zentren entlang der Havel und Oder.",
    specialRole: false,
    box: { lon: 11.35, lat: 53.45, w: 3.5, h: 1.85 },
    counties: [
      { name: "Barnim", type: "landkreis" },
      { name: "Elbe-Elster", type: "landkreis" },
      { name: "Havelland", type: "landkreis" },
      { name: "Märkisch-Oderland", type: "landkreis" },
      { name: "Oberhavel", type: "landkreis" },
      { name: "Oder-Spree", type: "landkreis" },
      { name: "Ostprignitz-Ruppin", type: "landkreis" },
      { name: "Potsdam-Mittelmark", type: "landkreis" },
      { name: "Prignitz", type: "landkreis" },
      { name: "Teltow-Fläming", type: "landkreis" },
      { name: "Uckermark", type: "landkreis" },
      { name: "Brandenburg an der Havel", type: "kreisfreie_stadt" },
      { name: "Frankfurt (Oder)", type: "kreisfreie_stadt" },
      { name: "Potsdam", type: "kreisfreie_stadt" },
    ],
  },
  {
    id: "mecklenburg-vorpommern",
    name: "Mecklenburg-Vorpommern",
    hauptstadt: "Rostock",
    highlights: "Küstenbezirk mit maritimer Wirtschaftsstruktur.",
    specialRole: false,
    box: { lon: 11.0, lat: 54.95, w: 3.85, h: 1.35 },
    counties: [
      { name: "Ludwigslust-Parchim", type: "landkreis" },
      { name: "Mecklenburgische Seenplatte", type: "landkreis" },
      { name: "Nordwestmecklenburg", type: "landkreis" },
      { name: "Rostock", type: "landkreis" },
      { name: "Vorpommern-Greifswald", type: "landkreis" },
      { name: "Vorpommern-Rügen", type: "landkreis" },
      { name: "Rostock (Stadt)", type: "kreisfreie_stadt" },
      { name: "Schwerin", type: "kreisfreie_stadt" },
    ],
  },
  {
    id: "niederlausitz",
    name: "Niederlausitz",
    hauptstadt: "Cottbus/Chóśebuz",
    highlights: "Sorbisch geprägter Strukturwandelraum mit besonderem regionalpolitischem Gewicht.",
    specialRole: true,
    box: { lon: 13.0, lat: 52.05, w: 1.55, h: 1.05 },
    counties: [
      { name: "Spree-Neiße", type: "landkreis" },
      { name: "Dahme-Spreewald", type: "landkreis" },
      { name: "Oberspreewald-Lausitz", type: "landkreis" },
      { name: "Cottbus", type: "kreisfreie_stadt" },
    ],
  },
  {
    id: "oberlausitz",
    name: "Oberlausitz",
    hauptstadt: "Bautzen/Budyšin",
    highlights: "Sorbisch geprägter Kulturraum mit grenzregionaler Verflechtung.",
    specialRole: true,
    box: { lon: 14.2, lat: 51.95, w: 1.45, h: 1.1 },
    counties: [
      { name: "Bautzen", type: "landkreis" },
      { name: "Görlitz", type: "landkreis" },
      { name: "Hoyerswerda", type: "kreisfreie_stadt" },
    ],
  },
  {
    id: "sachsen",
    name: "Sachsen",
    hauptstadt: "Dresden",
    highlights: "Industrieller Verdichtungsraum mit mehreren Oberzentren.",
    specialRole: false,
    box: { lon: 12.15, lat: 51.2, w: 2.75, h: 1.0 },
    counties: [
      { name: "Leipzig (Landkreis)", type: "landkreis" },
      { name: "Nordsachsen", type: "landkreis" },
      { name: "Sächsische Schweiz-Osterzgebirge", type: "landkreis" },
      { name: "Vogtlandkreis", type: "landkreis" },
      { name: "Zwickau", type: "landkreis" },
      { name: "Chemnitz", type: "kreisfreie_stadt" },
      { name: "Dresden", type: "kreisfreie_stadt" },
      { name: "Leipzig", type: "kreisfreie_stadt" },
    ],
  },
  {
    id: "sachsen-anhalt",
    name: "Sachsen-Anhalt",
    hauptstadt: "Magdeburg",
    highlights: "Mittelraum zwischen Altmark, Börde und Industrieregion Halle.",
    specialRole: false,
    box: { lon: 10.05, lat: 52.4, w: 2.95, h: 1.65 },
    counties: [
      { name: "Altmarkkreis Salzwedel", type: "landkreis" },
      { name: "Anhalt-Bitterfeld", type: "landkreis" },
      { name: "Börde", type: "landkreis" },
      { name: "Burgenlandkreis", type: "landkreis" },
      { name: "Harz", type: "landkreis" },
      { name: "Jerichower Land", type: "landkreis" },
      { name: "Mansfeld-Südharz", type: "landkreis" },
      { name: "Saalekreis", type: "landkreis" },
      { name: "Salzlandkreis", type: "landkreis" },
      { name: "Stendal", type: "landkreis" },
      { name: "Wittenberg", type: "landkreis" },
      { name: "Dessau-Roßlau", type: "kreisfreie_stadt" },
      { name: "Halle (Saale)", type: "kreisfreie_stadt" },
      { name: "Magdeburg", type: "kreisfreie_stadt" },
    ],
  },
  {
    id: "thueringen",
    name: "Thüringen",
    hauptstadt: "Erfurt",
    highlights: "Mittelgebirgsgeprägter Bezirk mit zentraler Lage im Süden des Freistaates.",
    specialRole: false,
    box: { lon: 10.35, lat: 50.85, w: 2.5, h: 1.2 },
    counties: [
      { name: "Altenburger Land", type: "landkreis" },
      { name: "Eichsfeld", type: "landkreis" },
      { name: "Gotha", type: "landkreis" },
      { name: "Greiz", type: "landkreis" },
      { name: "Hildburghausen", type: "landkreis" },
      { name: "Ilm-Kreis", type: "landkreis" },
      { name: "Kyffhäuserkreis", type: "landkreis" },
      { name: "Nordhausen", type: "landkreis" },
      { name: "Saale-Holzland-Kreis", type: "landkreis" },
      { name: "Saale-Orla-Kreis", type: "landkreis" },
      { name: "Saalfeld-Rudolstadt", type: "landkreis" },
      { name: "Schmalkalden-Meiningen", type: "landkreis" },
      { name: "Sonneberg", type: "landkreis" },
      { name: "Unstrut-Hainich-Kreis", type: "landkreis" },
      { name: "Wartburgkreis", type: "landkreis" },
      { name: "Weimarer Land", type: "landkreis" },
      { name: "Erfurt", type: "kreisfreie_stadt" },
      { name: "Gera", type: "kreisfreie_stadt" },
      { name: "Jena", type: "kreisfreie_stadt" },
      { name: "Suhl", type: "kreisfreie_stadt" },
      { name: "Weimar", type: "kreisfreie_stadt" },
    ],
  },
];

const bundestagDistrictBlocks = {
  berlin: ["Berlin Zentrum", "Berlin Nord", "Berlin Süd"],
  brandenburg: ["Brandenburg Nord", "Brandenburg West", "Brandenburg Süd", "Brandenburg Ost"],
  "mecklenburg-vorpommern": ["Mecklenburgische Küste", "Seenplatte", "Vorpommern"],
  niederlausitz: ["Niederlausitz Nord", "Niederlausitz Süd"],
  oberlausitz: ["Oberlausitz West", "Oberlausitz Ost"],
  sachsen: ["Sachsen Nord", "Sachsen Mitte", "Sachsen Ost", "Sachsen Süd"],
  "sachsen-anhalt": ["Altmark-Börde", "Magdeburg-Jerichow", "Halle-Saalekreis", "Harz-Burgenland"],
  thueringen: ["Thüringen Nord", "Thüringen Mitte", "Thüringen Ost", "Thüringen Süd"],
};

const landtagStatewide = {
  Volksfront: 34.8,
  "DEMOS Ost": 18.2,
  "CPD Ost": 15.4,
  FRP: 10.8,
  Patrioten: 14.9,
  Sonstige: 5.9,
};

const bundestagStatewide = {
  Volksfront: 31.2,
  "DEMOS Ost": 19.5,
  "CPD Ost": 17.6,
  FRP: 11.2,
  Patrioten: 14.8,
  Sonstige: 5.7,
};

const landtagOffsets = {
  berlin: { "DEMOS Ost": 4.0, Volksfront: -2.0, Patrioten: -2.2, Sonstige: -0.8 },
  brandenburg: { Volksfront: 1.8, Patrioten: 0.8, "DEMOS Ost": -0.6 },
  "mecklenburg-vorpommern": { Patrioten: 2.0, Volksfront: 0.8, "DEMOS Ost": -1.2 },
  niederlausitz: { Volksfront: 2.4, Patrioten: 1.0, "CPD Ost": -0.8 },
  oberlausitz: { Volksfront: 2.0, Patrioten: 1.3, "DEMOS Ost": -1.1 },
  sachsen: { "CPD Ost": 1.8, Volksfront: 0.7, FRP: 0.8 },
  "sachsen-anhalt": { Volksfront: 1.4, Patrioten: 0.9, "DEMOS Ost": -0.8 },
  thueringen: { Patrioten: 2.5, "CPD Ost": 1.0, "DEMOS Ost": -1.0 },
};

const bundestagOffsets = {
  berlin: { "DEMOS Ost": 3.4, Volksfront: -1.2, Patrioten: -2.1 },
  brandenburg: { Volksfront: 1.2, Patrioten: 1.0 },
  "mecklenburg-vorpommern": { Patrioten: 1.6, Volksfront: 0.6, "DEMOS Ost": -0.8 },
  niederlausitz: { Volksfront: 1.8, Patrioten: 1.1, "DEMOS Ost": -1.1 },
  oberlausitz: { Volksfront: 1.6, Patrioten: 1.3, "DEMOS Ost": -1.0 },
  sachsen: { "CPD Ost": 1.5, FRP: 0.6, Volksfront: 0.5 },
  "sachsen-anhalt": { Volksfront: 1.1, Patrioten: 0.8 },
  thueringen: { Patrioten: 2.0, "CPD Ost": 1.0, "DEMOS Ost": -0.9 },
};

function slugify(input) {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/\(stadt\)/g, "stadt")
    .replace(/\(landkreis\)/g, "landkreis")
    .replace(/\([^)]*\)/g, "")
    .replace(/chóśebuz/g, "chosebuz")
    .replace(/budyšin/g, "budysin")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function randomDelta(key, scale = 1) {
  const value = hashString(key) / 0xffffffff;
  return (value * 2 - 1) * scale;
}

function roundTo100(rawValues) {
  const entries = Object.entries(rawValues).map(([name, value]) => ({
    name,
    value: Math.max(0.1, value),
  }));
  const sum = entries.reduce((acc, entry) => acc + entry.value, 0);
  const scaled = entries.map((entry) => {
    const scaledValue = (entry.value / sum) * 1000;
    const floor = Math.floor(scaledValue);
    return {
      name: entry.name,
      floor,
      frac: scaledValue - floor,
    };
  });

  let used = scaled.reduce((acc, entry) => acc + entry.floor, 0);
  let remaining = 1000 - used;

  scaled
    .sort((a, b) => b.frac - a.frac)
    .forEach((entry, index) => {
      if (index < remaining) {
        entry.floor += 1;
      }
    });

  const out = {};
  for (const entry of scaled) {
    out[entry.name] = Number((entry.floor / 10).toFixed(1));
  }
  return out;
}

function strongestParty(result) {
  return Object.entries(result).sort((a, b) => b[1] - a[1])[0];
}

function rectPolygon(lon, lat, w, h) {
  return [
    [lon, lat],
    [lon + w, lat],
    [lon + w, lat - h],
    [lon, lat - h],
    [lon, lat],
  ];
}

function generateGridFeatures(items, box, propsFactory) {
  const n = items.length;
  const cols = Math.max(1, Math.ceil(Math.sqrt((n * box.w) / box.h)));
  const rows = Math.ceil(n / cols);
  const cellW = box.w / cols;
  const cellH = box.h / rows;
  const margin = Math.min(cellW, cellH) * 0.12;

  return items.map((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const lon = box.lon + col * cellW + margin / 2;
    const lat = box.lat - row * cellH - margin / 2;
    const w = Math.max(cellW - margin, 0.03);
    const h = Math.max(cellH - margin, 0.03);

    return {
      type: "Feature",
      properties: propsFactory(item, i),
      geometry: {
        type: "Polygon",
        coordinates: [rectPolygon(lon, lat, w, h)],
      },
    };
  });
}

function sainteLague(votes, totalSeats, threshold = 5) {
  const qualified = Object.entries(votes).filter(([, value]) => value >= threshold);
  const quotients = [];
  for (const [name, value] of qualified) {
    for (let i = 0; i < totalSeats * 3; i += 1) {
      quotients.push({ name, q: value / (2 * i + 1) });
    }
  }
  quotients.sort((a, b) => b.q - a.q);
  const seats = Object.fromEntries(Object.keys(votes).map((name) => [name, 0]));
  for (let i = 0; i < totalSeats; i += 1) {
    seats[quotients[i].name] += 1;
  }
  return seats;
}

const countyList = [];
let countyIndex = 1;

for (const district of districts) {
  for (const county of district.counties) {
    countyList.push({
      id: `lk-${String(countyIndex).padStart(3, "0")}-${slugify(county.name)}`,
      name: county.name,
      type: county.type,
      bezirkId: district.id,
      bezirk: district.name,
    });
    countyIndex += 1;
  }
}

const countiesByDistrict = Object.fromEntries(districts.map((district) => [district.id, countyList.filter((county) => county.bezirkId === district.id)]));

const landtagCountyResults = countyList.map((county) => {
  const offsets = landtagOffsets[county.bezirkId] || {};
  const raw = {};
  for (const party of parties) {
    const partyName = party.name;
    raw[partyName] =
      landtagStatewide[partyName] +
      (offsets[partyName] || 0) +
      randomDelta(`landtag:${county.id}:${partyName}`, 2.1);
  }
  const percentages = roundTo100(raw);
  const [winnerName, winnerValue] = strongestParty(percentages);
  return {
    landkreisId: county.id,
    landkreis: county.name,
    bezirkId: county.bezirkId,
    bezirk: county.bezirk,
    parteien: percentages,
    staerkstePartei: winnerName,
    staerksteParteiProzent: winnerValue,
  };
});

const bundestagswahlkreise = [];
let wahlkreisIndex = 1;
for (const district of districts) {
  const labels = bundestagDistrictBlocks[district.id];
  for (const label of labels) {
    bundestagswahlkreise.push({
      id: `bwk-${String(wahlkreisIndex).padStart(2, "0")}`,
      name: `Bundestagswahlkreis ${String(wahlkreisIndex).padStart(2, "0")}: ${label}`,
      kurzname: label,
      bezirkId: district.id,
      bezirk: district.name,
    });
    wahlkreisIndex += 1;
  }
}

const bundestagWahlkreisResults = bundestagswahlkreise.map((wahlkreis) => {
  const offsets = bundestagOffsets[wahlkreis.bezirkId] || {};
  const raw = {};
  for (const party of parties) {
    const partyName = party.name;
    raw[partyName] =
      bundestagStatewide[partyName] +
      (offsets[partyName] || 0) +
      randomDelta(`bundestag:${wahlkreis.id}:${partyName}`, 1.9);
  }
  const percentages = roundTo100(raw);
  const [winnerName, winnerValue] = strongestParty(percentages);
  return {
    wahlkreisId: wahlkreis.id,
    wahlkreis: wahlkreis.name,
    bezirkId: wahlkreis.bezirkId,
    bezirk: wahlkreis.bezirk,
    parteien: percentages,
    staerkstePartei: winnerName,
    staerksteParteiProzent: winnerValue,
  };
});

const seatDistribution = sainteLague(landtagStatewide, 120, 5);

const landtagswahl = {
  id: "landtagswahl-2024",
  name: "Landtagswahl 2024",
  datum: "2024-09-22",
  wahlbeteiligung: 74.6,
  wahlberechtigte: 10180000,
  gueltigeStimmen: 7512400,
  sitzeGesamt: 120,
  mehrheitsgrenze: 61,
  modellhinweis:
    "Vereinfachtes Simulationsmodell mit einer Listenstimme. Landkreise dienen als regionale Ergebnisdarstellung der stärksten Partei.",
  landesergebnis: landtagStatewide,
  sitzverteilung: seatDistribution,
  regierungsoption: {
    koalition: ["Volksfront", "DEMOS Ost"],
    sitze: seatDistribution["Volksfront"] + seatDistribution["DEMOS Ost"],
    mehrheitsfaehig: seatDistribution["Volksfront"] + seatDistribution["DEMOS Ost"] >= 61,
  },
  ergebnisseLandkreise: landtagCountyResults,
};

const bundestagswahl = {
  id: "bundestagswahl-2025",
  name: "Bundestagswahl 2025 (Simulationsebene Ostdeutschland)",
  datum: "2025-09-21",
  wahlbeteiligung: 78.1,
  wahlberechtigte: 10240000,
  gueltigeStimmen: 7878400,
  modellhinweis:
    "Vereinfachte Darstellung mit einer Listenstimme sowie einem separat ausgewiesenen Direktmandat Ostdeutschland.",
  gesamtergebnisOst: bundestagStatewide,
  direktmandatOstdeutschland: {
    mandatName: "Direktmandat Ostdeutschland",
    kandidat: "Elisabeth Kramer",
    partei: "Volksfront",
    stimmenanteil: 52.4,
    hinweis:
      "Im Simulationsmodell wird ein einziges ostweites Direktmandat ergänzend zur Listenstimme ausgewiesen.",
  },
  ergebnisseWahlkreise: bundestagWahlkreisResults,
};

const bezirkeData = districts.map((district) => ({
  id: district.id,
  name: district.name,
  hauptstadt: district.hauptstadt,
  besonderesRegionalgewicht: district.specialRole,
  hinweis: district.highlights,
  anzahlLandkreise: countiesByDistrict[district.id].length,
}));

const bezirkeGeo = {
  type: "FeatureCollection",
  features: districts.map((district) => ({
    type: "Feature",
    properties: {
      id: district.id,
      name: district.name,
      hauptstadt: district.hauptstadt,
      besonderesRegionalgewicht: district.specialRole,
    },
    geometry: {
      type: "Polygon",
      coordinates: [rectPolygon(district.box.lon, district.box.lat, district.box.w, district.box.h)],
    },
  })),
};

const landkreiseGeo = {
  type: "FeatureCollection",
  features: districts.flatMap((district) => {
    const counties = countiesByDistrict[district.id];
    return generateGridFeatures(counties, district.box, (county) => ({
      id: county.id,
      name: county.name,
      type: county.type,
      bezirkId: county.bezirkId,
      bezirk: county.bezirk,
    }));
  }),
};

const wahlkreiseByDistrict = Object.fromEntries(
  districts.map((district) => [district.id, bundestagswahlkreise.filter((item) => item.bezirkId === district.id)]),
);

const bundestagGeo = {
  type: "FeatureCollection",
  features: districts.flatMap((district) =>
    generateGridFeatures(wahlkreiseByDistrict[district.id], district.box, (wahlkreis) => ({
      id: wahlkreis.id,
      name: wahlkreis.name,
      kurzname: wahlkreis.kurzname,
      bezirkId: wahlkreis.bezirkId,
      bezirk: wahlkreis.bezirk,
    })),
  ),
};

const metadata = {
  portal: {
    name: "Wahlen im Freistaat Ostdeutschland",
    institution: "Landeswahlleiter des Freistaates Ostdeutschland",
    domain: "wahlen.freistaat-ostdeutschland.de",
    stand: "2026-04-19",
    simulationshinweis:
      "Alle Inhalte und Wahldaten sind Bestandteil einer Politiksimulation und bilden kein amtliches deutsches Wahlrecht ab.",
  },
  quickfacts: {
    wahlberechtigte: 10240000,
    letzteWahl: "2025-09-21",
    naechsteWahl: "2029-09-23",
    aktuelleWahlbeteiligungReferenz: 78.1,
  },
  design: {
    landesfarben: ["#003366", "#FFFFFF", "#1A6B3C"],
  },
};

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

writeJson(join(dataDir, "parteien.json"), parties);
writeJson(join(dataDir, "bezirke.json"), bezirkeData);
writeJson(join(dataDir, "landkreise.json"), countyList);
writeJson(join(dataDir, "bundestagswahlkreise.json"), bundestagswahlkreise);
writeJson(join(dataDir, "landtagswahl-2024.json"), landtagswahl);
writeJson(join(dataDir, "bundestagswahl-2025.json"), bundestagswahl);
writeJson(join(dataDir, "metadaten.json"), metadata);
writeJson(join(geoDir, "bezirke.geojson"), bezirkeGeo);
writeJson(join(geoDir, "landkreise.geojson"), landkreiseGeo);
writeJson(join(geoDir, "bundestagswahlkreise.geojson"), bundestagGeo);

console.log("Simulationsdaten und GeoJSON wurden erzeugt.");
