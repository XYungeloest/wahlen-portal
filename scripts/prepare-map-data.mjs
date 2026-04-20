import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import shapefile from "shapefile";

const root = process.cwd();
const publicDir = join(root, "public");
const dataDir = join(publicDir, "data");
const geoDir = join(publicDir, "geo");
const electionsDir = join(dataDir, "elections");
const mappingsDir = join(dataDir, "mappings");

const eastStateCodes = new Set(["11", "12", "13", "14", "15", "16"]);
const parties = ["Volksfront", "DEMOS Ost", "CPD Ost", "FRP", "Patrioten", "Sonstige"];
const partyOrder = ["Volksfront", "DEMOS Ost", "CPD Ost", "Patrioten", "FRP", "Sonstige"];

const districtOffsetsLandtag2020 = {
  berlin: { "DEMOS Ost": 4.8, Volksfront: -2.1, Patrioten: -2.4, FRP: 1.2 },
  brandenburg: { Volksfront: 1.2, "CPD Ost": 1.4, Patrioten: 0.6, "DEMOS Ost": -1.3 },
  "mecklenburg-vorpommern": { Patrioten: 2.2, Volksfront: 0.4, "DEMOS Ost": -1.1 },
  niederlausitz: { Patrioten: 4.1, Volksfront: -0.4, "DEMOS Ost": -1.8, "CPD Ost": 0.8 },
  oberlausitz: { Patrioten: 3.6, "CPD Ost": 1.4, Volksfront: -1.3, "DEMOS Ost": -1.5 },
  sachsen: { "CPD Ost": 1.8, Patrioten: 1.6, Volksfront: -1.2, "DEMOS Ost": -1.3 },
  "sachsen-anhalt": { Patrioten: 2.6, "CPD Ost": 1.1, Volksfront: -0.8, "DEMOS Ost": -1.5 },
  thueringen: { Patrioten: 2.1, "CPD Ost": 0.8, Volksfront: -0.8, "DEMOS Ost": -1.2 },
};

const districtOffsetsLandtag2024Supplement = {
  berlin: { "DEMOS Ost": 2.6, Volksfront: -1.1, Patrioten: -1.7, FRP: 0.8 },
  brandenburg: { Volksfront: 1.0, "DEMOS Ost": -0.6, "CPD Ost": 0.5 },
  "mecklenburg-vorpommern": { Volksfront: 0.5, Patrioten: 0.8 },
  niederlausitz: { Patrioten: 2.5, Volksfront: 0.3, "DEMOS Ost": -1.1, "CPD Ost": 0.6 },
  oberlausitz: { Patrioten: 2.1, "CPD Ost": 0.9, Volksfront: -0.2, "DEMOS Ost": -0.8 },
  sachsen: { "CPD Ost": 1.0, Patrioten: 0.9, Volksfront: -0.5, "DEMOS Ost": -0.4 },
  "sachsen-anhalt": { Patrioten: 1.1, "CPD Ost": 0.5, Volksfront: 0.2 },
  thueringen: { Patrioten: 0.7, "CPD Ost": 0.3, Volksfront: 0.2 },
};

const districtOffsetsBundestag2025 = {
  berlin: { "DEMOS Ost": 4.2, Volksfront: -0.8, Patrioten: -3.1, FRP: 1.1 },
  brandenburg: { Volksfront: 1.5, Patrioten: 1.8, "DEMOS Ost": -1.4, "CPD Ost": 0.6 },
  "mecklenburg-vorpommern": { Volksfront: 0.8, Patrioten: 1.4, "DEMOS Ost": -0.5 },
  niederlausitz: { Patrioten: 3.6, Volksfront: 0.4, "DEMOS Ost": -1.7, "CPD Ost": 0.8 },
  oberlausitz: { Patrioten: 2.7, "CPD Ost": 1.9, Volksfront: 0.1, "DEMOS Ost": -1.6 },
  sachsen: { "CPD Ost": 1.3, Patrioten: 1.7, Volksfront: -0.6, "DEMOS Ost": -0.9 },
  "sachsen-anhalt": { Patrioten: 1.9, Volksfront: 0.4, "DEMOS Ost": -0.7, "CPD Ost": 0.5 },
  thueringen: { Patrioten: 1.6, "CPD Ost": 0.7, Volksfront: 0.1, "DEMOS Ost": -0.5 },
};

const districtOffsetsBundestag2021 = {
  berlin: { "CPD Ost": 2.3, "DEMOS Ost": 1.8, Volksfront: -2.4, Patrioten: -2.2 },
  brandenburg: { "CPD Ost": 1.1, Patrioten: 1.0, Volksfront: -1.4, "DEMOS Ost": -0.4 },
  "mecklenburg-vorpommern": { "CPD Ost": 0.7, Patrioten: 0.9, Volksfront: -1.1 },
  niederlausitz: { Patrioten: 2.8, "CPD Ost": 0.9, Volksfront: -1.6, "DEMOS Ost": -0.9 },
  oberlausitz: { Patrioten: 2.5, "CPD Ost": 1.5, Volksfront: -1.7, "DEMOS Ost": -1.1 },
  sachsen: { "CPD Ost": 1.8, Patrioten: 1.4, Volksfront: -1.5, "DEMOS Ost": -0.9 },
  "sachsen-anhalt": { Patrioten: 1.6, "CPD Ost": 0.8, Volksfront: -1.1, "DEMOS Ost": -0.6 },
  thueringen: { Patrioten: 1.2, "CPD Ost": 0.9, Volksfront: -0.8, "DEMOS Ost": -0.4 },
};

const legacyNameAliases = new Map([
  ["Rostock|kreisfreie_stadt", "Rostock (Stadt)"],
  ["Leipzig|landkreis", "Leipzig (Landkreis)"],
]);

const supplementalLandkreisAssignments = {
  "14521": { name: "Erzgebirgskreis", type: "landkreis", bezirkId: "sachsen" },
  "14522": { name: "Mittelsachsen", type: "landkreis", bezirkId: "sachsen" },
  "14627": { name: "Meißen", type: "landkreis", bezirkId: "sachsen" },
  "16068": { name: "Sömmerda", type: "landkreis", bezirkId: "thueringen" },
};

const districtAssignmentsManual = {
  "wk-064": "niederlausitz",
  "wk-065": "brandenburg",
  "wk-155": "oberlausitz",
  "wk-156": "oberlausitz",
  "wk-159": "sachsen",
};

const textFixes = new Map([
  ["Spree-Nei�xe", "Spree-Neiße"],
  ["Teltow-Fl�ming", "Teltow-Fläming"],
  ["Vorpommern-R�gen", "Vorpommern-Rügen"],
  ["G�rlitz", "Görlitz"],
  ["Mei�en", "Meißen"],
  ["S�chsische Schweiz-Osterzgebirge", "Sächsische Schweiz-Osterzgebirge"],
  ["Dessau-Ro�lau", "Dessau-Roßlau"],
  ["B�rde", "Börde"],
  ["Mansfeld-S�dharz", "Mansfeld-Südharz"],
  ["Kyffh�userkreis", "Kyffhäuserkreis"],
  ["S�mmerda", "Sömmerda"],
  ["Cottbus – Spree-Nei�xe", "Cottbus – Spree-Neiße"],
  ["Berlin-Tempelhof-Sch�neberg", "Berlin-Tempelhof-Schöneberg"],
  ["Berlin-Neuk�lln", "Berlin-Neukölln"],
  ["Berlin-Treptow-K�penick", "Berlin-Treptow-Köpenick"],
  ["M�rkisch-Oderland – Barnim II", "Märkisch-Oderland – Barnim II"],
  ["Brandenburg an der Havel – Potsdam-Mittelmark I – Havelland III – Teltow-Fl�ming I", "Brandenburg an der Havel – Potsdam-Mittelmark I – Havelland III – Teltow-Fläming I"],
  ["Potsdam – Potsdam-Mittelmark II – Teltow-Fl�ming II", "Potsdam – Potsdam-Mittelmark II – Teltow-Fläming II"],
  ["Dahme-Spreewald – Teltow-Fl�ming III", "Dahme-Spreewald – Teltow-Fläming III"],
  ["Vorpommern-R�gen – Vorpommern-Greifswald I", "Vorpommern-Rügen – Vorpommern-Greifswald I"],
  ["Rostock – Landkreis Rostock II", "Rostock – Landkreis Rostock II"],
  ["Schwerin – Ludwigslust-Parchim I – Nordwestmecklenburg I", "Schwerin – Ludwigslust-Parchim I – Nordwestmecklenburg I"],
  ["Mecklenburgische Seenplatte I – Vorpommern-Greifswald II", "Mecklenburgische Seenplatte I – Vorpommern-Greifswald II"],
  ["B�rde – Salzlandkreis", "Börde – Salzlandkreis"],
  ["Jena – S�mmerda – Weimarer Land I", "Jena – Sömmerda – Weimarer Land I"],
  ["Eichsfeld – Nordhausen – Kyffh�userkreis", "Eichsfeld – Nordhausen – Kyffhäuserkreis"],
  ["Th�ringen", "Thüringen"],
]);

async function main() {
  const legacyDistricts = await readJson(join(dataDir, "bezirke.json"));
  const legacyLandkreise = await readJson(join(dataDir, "landkreise.json"));
  const legacyLandtag2024 = await readJson(join(dataDir, "landtagswahl-2024.json"));
  const legacyBundestag2025 = await readJson(join(dataDir, "bundestagswahl-2025.json"));
  const legacyMetadaten = await readJson(join(dataDir, "metadaten.json"));

  const bkgKreise = await readShapefile(
    join(root, "scripts", "_cache", "extracted", "bkg", "vg250_12-31.utm32s.shape.ebenen", "vg250_ebenen_1231", "VG250_KRS.shp"),
  );
  const bkgGemeinden = await readShapefile(
    join(root, "scripts", "_cache", "extracted", "bkg", "vg250_12-31.utm32s.shape.ebenen", "vg250_ebenen_1231", "VG250_GEM.shp"),
  );
  const bundestagWahlkreiseRaw = await readShapefile(
    join(root, "scripts", "_cache", "extracted", "btw", "btw25_geometrie_wahlkreise_vg250.shp"),
  );
  const municipalityAssignments = await readMunicipalityAssignments(
    join(root, "scripts", "_cache", "downloads", "btw25_wkr_gemeinden_20241130_utf8.csv"),
  );

  const districtsById = Object.fromEntries(legacyDistricts.map((district) => [district.id, district]));
  const landkreisLookup = buildLegacyLandkreisLookup(legacyLandkreise);
  const legacyLandtagByName = buildLegacyLandtagLookup(legacyLandtag2024.ergebnisseLandkreise);

  const officialLandkreise = buildLandkreiseFeatures(bkgKreise, landkreisLookup, districtsById);
  const hoyerswerdaFeature = buildHoyerswerdaFeature(bkgGemeinden, districtsById);
  officialLandkreise.features.push(hoyerswerdaFeature.feature);
  officialLandkreise.index.push(hoyerswerdaFeature.meta);
  officialLandkreise.index.sort((a, b) => a.name.localeCompare(b.name, "de"));

  const countyDistrictMap = Object.fromEntries(
    officialLandkreise.index
      .filter((entry) => entry.ags.length === 5)
      .map((entry) => [entry.ags, { bezirkId: entry.bezirkId, bezirk: entry.bezirk }]),
  );

  const bundestagBezirkMapping = buildBundestagBezirkMapping(
    municipalityAssignments,
    bundestagWahlkreiseRaw,
    countyDistrictMap,
    districtsById,
  );
  const bundestagGeo = buildBundestagGeo(bundestagWahlkreiseRaw, bundestagBezirkMapping, districtsById);

  const landkreiseIndex = officialLandkreise.index.map((entry) => ({
    id: entry.id,
    ags: entry.ags,
    name: entry.name,
    officialName: entry.officialName,
    type: entry.type,
    bezirkId: entry.bezirkId,
    bezirk: entry.bezirk,
    sourceGeometry: entry.sourceGeometry,
  }));

  const bundestagswahlkreisIndex = bundestagGeo.index.map((entry) => ({
    id: entry.id,
    nummer: entry.nummer,
    name: entry.name,
    land: entry.land,
    bezirkId: entry.bezirkId,
    bezirk: entry.bezirk,
    zuordnung: entry.assignmentMethod,
  }));

  const landtag2024 = buildLandtag2024Dataset(legacyLandtag2024, landkreiseIndex, legacyLandtagByName);
  const landtag2020 = buildDerivedLandtagDataset(landtag2024, legacyMetadaten);
  const bundestag2025 = buildBundestag2025Dataset(legacyBundestag2025, bundestagswahlkreisIndex, legacyMetadaten);
  const bundestag2021 = buildBundestag2021Dataset(bundestag2025, legacyMetadaten);

  addLandtagComparisons(landtag2024, landtag2020);
  addLandtagComparisons(landtag2020, landtag2024);
  addBundestagComparisons(bundestag2025, bundestag2021);
  addBundestagComparisons(bundestag2021, bundestag2025);

  await mkdir(join(electionsDir, "landtag"), { recursive: true });
  await mkdir(join(electionsDir, "bundestag"), { recursive: true });
  await mkdir(mappingsDir, { recursive: true });

  await writeJson(join(geoDir, "landkreise-ost.geojson"), {
    type: "FeatureCollection",
    metadata: {
      source: "BKG VG250 31.12.",
      sourceUrl: "https://daten.gdz.bkg.bund.de/produkte/vg/vg250_ebenen_1231/aktuell/vg250_12-31.utm32s.shape.ebenen.zip",
      projection: "ETRS89 / UTM zone 32N (UTM32s)",
      note: "Hoyerswerda wird als dokumentierte Portal-Ausnahme auf Basis der BKG-Gemeindegrenze zusätzlich überlagert.",
    },
    features: officialLandkreise.features,
  });
  await writeJson(join(geoDir, "btw-wahlkreise-ost.geojson"), {
    type: "FeatureCollection",
    metadata: {
      source: "Die Bundeswahlleiterin - Wahlkreiseinteilung Bundestagswahl 2025",
      sourceUrl:
        "https://bundeswahlleiterin.de/dam/jcr/b3656fdd-eb0c-4721-ba02-9e7fdf558475/btw25_geometrie_wahlkreise_vg250_shp.zip",
      projection: "ETRS89 / UTM zone 32N",
    },
    features: bundestagGeo.features,
  });

  await writeJson(join(dataDir, "landkreise.json"), landkreiseIndex);
  await writeJson(join(dataDir, "bundestagswahlkreise.json"), bundestagswahlkreisIndex);
  await writeJson(join(electionsDir, "landtag", "2020.json"), landtag2020);
  await writeJson(join(electionsDir, "landtag", "2024.json"), landtag2024);
  await writeJson(join(electionsDir, "bundestag", "2021.json"), bundestag2021);
  await writeJson(join(electionsDir, "bundestag", "2025.json"), bundestag2025);
  await writeJson(join(mappingsDir, "bundestagswahlkreise-bezirke.json"), bundestagBezirkMapping);
  await writeJson(join(mappingsDir, "landkreise-bezirke.json"), landkreiseIndex.map((item) => ({
    id: item.id,
    ags: item.ags,
    name: item.name,
    bezirkId: item.bezirkId,
    bezirk: item.bezirk,
  })));
}

function buildLandkreiseFeatures(features, landkreisLookup, districtsById) {
  const grouped = new Map();
  for (const feature of features) {
    const props = mapProps(feature.properties);
    if (!eastStateCodes.has(props.SN_L)) {
      continue;
    }

    const type = props.BEZ.includes("Kreisfreie") ? "kreisfreie_stadt" : "landkreis";
    const key = findLegacyLandkreisKey(props.GEN, type);
    const legacy = landkreisLookup[key] ?? supplementalLandkreisAssignments[props.AGS];
    if (!legacy) {
      throw new Error(`Kein Landkreis-Mapping für ${props.GEN} (${type}) gefunden.`);
    }

    const district = districtsById[legacy.bezirkId];
    const id = `lk-${props.AGS}`;
    const existing = grouped.get(props.AGS);
    const geometry = roundGeometry(feature.geometry);
    if (existing) {
      existing.geometry = mergeGeometry(existing.geometry, geometry);
      continue;
    }

    grouped.set(props.AGS, {
      type: "Feature",
      properties: {
        id,
        ags: props.AGS,
        name: legacy.name,
        officialName: props.GEN,
        type,
        bezirkId: legacy.bezirkId,
        bezirk: district.name,
        sourceGeometry: "bkg-vg250-krs",
      },
      geometry,
    });
  }

  const prepared = Array.from(grouped.values()).sort((a, b) => a.properties.name.localeCompare(b.properties.name, "de"));
  const index = prepared.map((item) => ({
    id: item.properties.id,
    ags: item.properties.ags,
    name: item.properties.name,
    officialName: item.properties.officialName,
    type: item.properties.type,
    bezirkId: item.properties.bezirkId,
    bezirk: item.properties.bezirk,
    sourceGeometry: item.properties.sourceGeometry,
  }));
  return { features: prepared, index };
}

function buildHoyerswerdaFeature(features, districtsById) {
  const match = features.find((feature) => {
    const props = mapProps(feature.properties);
    return props.AGS === "14625240" || fixText(props.GEN) === "Hoyerswerda";
  });

  if (!match) {
    throw new Error("Gemeindegrenze für Hoyerswerda nicht gefunden.");
  }

  const district = districtsById.oberlausitz;
  return {
    feature: {
      type: "Feature",
      properties: {
        id: "lk-14625240",
        ags: "14625240",
        name: "Hoyerswerda",
        officialName: "Hoyerswerda",
        type: "kreisfreie_stadt",
        bezirkId: "oberlausitz",
        bezirk: district.name,
        sourceGeometry: "bkg-vg250-gem",
        portalException: true,
      },
      geometry: roundGeometry(match.geometry),
    },
    meta: {
      id: "lk-14625240",
      ags: "14625240",
      name: "Hoyerswerda",
      officialName: "Hoyerswerda",
      type: "kreisfreie_stadt",
      bezirkId: "oberlausitz",
      bezirk: district.name,
      sourceGeometry: "bkg-vg250-gem",
    },
  };
}

function buildBundestagBezirkMapping(municipalityAssignments, bundestagFeatures, countyDistrictMap, districtsById) {
  const countsByWk = {};
  for (const row of municipalityAssignments) {
    if (!eastStateCodes.has(row.land)) {
      continue;
    }
    const county = `${row.land}${row.regBez}${row.kreis}`;
    const district = countyDistrictMap[county];
    if (!district) {
      throw new Error(`Kein Bezirks-Mapping für Kreis ${county} gefunden.`);
    }
    countsByWk[row.wahlkreisId] ??= {};
    countsByWk[row.wahlkreisId][district.bezirkId] = (countsByWk[row.wahlkreisId][district.bezirkId] ?? 0) + 1;
  }

  const mapping = [];
  for (const feature of bundestagFeatures) {
    const props = mapProps(feature.properties);
    if (!eastStateCodes.has(props.LAND_NR)) {
      continue;
    }

    const id = `wk-${String(props.WKR_NR).padStart(3, "0")}`;
    const counts = countsByWk[id] ?? {};
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const chosenId = districtAssignmentsManual[id] ?? sorted[0]?.[0] ?? landToDefaultDistrict(props.LAND_NR);
    const district = districtsById[chosenId];
    mapping.push({
      id,
      nummer: String(props.WKR_NR).padStart(3, "0"),
      name: fixText(props.WKR_NAME),
      land: fixText(props.LAND_NAME),
      bezirkId: chosenId,
      bezirk: district.name,
      assignmentMethod: districtAssignmentsManual[id] ? "manual-override" : "dominant-municipality-count",
      municipalityCounts: counts,
    });
  }

  mapping.sort((a, b) => Number(a.nummer) - Number(b.nummer));
  return mapping;
}

function buildBundestagGeo(features, mapping, districtsById) {
  const mappingById = Object.fromEntries(mapping.map((item) => [item.id, item]));
  const out = [];
  const index = [];
  for (const feature of features) {
    const props = mapProps(feature.properties);
    if (!eastStateCodes.has(props.LAND_NR)) {
      continue;
    }
    const id = `wk-${String(props.WKR_NR).padStart(3, "0")}`;
    const mapped = mappingById[id];
    const district = districtsById[mapped.bezirkId];
    const name = fixText(props.WKR_NAME);
    out.push({
      type: "Feature",
      properties: {
        id,
        nummer: String(props.WKR_NR).padStart(3, "0"),
        name,
        officialName: name,
        land: fixText(props.LAND_NAME),
        bezirkId: mapped.bezirkId,
        bezirk: district.name,
        assignmentMethod: mapped.assignmentMethod,
      },
      geometry: roundGeometry(feature.geometry),
    });
    index.push({
      id,
      nummer: String(props.WKR_NR).padStart(3, "0"),
      name,
      land: fixText(props.LAND_NAME),
      bezirkId: mapped.bezirkId,
      bezirk: district.name,
      assignmentMethod: mapped.assignmentMethod,
    });
  }

  out.sort((a, b) => Number(a.properties.nummer) - Number(b.properties.nummer));
  index.sort((a, b) => Number(a.nummer) - Number(b.nummer));
  return { features: out, index };
}

function buildLandtag2024Dataset(legacyLandtag2024, landkreiseIndex, legacyLandtagByName) {
  const gebiete = landkreiseIndex.map((item) => {
    const legacy = legacyLandtagByName[findLegacyLandkreisKey(item.name, item.type)];
    const generatedSupplement = !legacy
      ? deriveAreaResult(
          {
            gebietId: item.id,
            gebietName: item.name,
            officialName: item.officialName,
            bezirkId: item.bezirkId,
            bezirk: item.bezirk,
            typ: item.type,
          },
          {
            id: item.id,
            base: normalizeResult(legacyLandtag2024.landesergebnis),
            districtOffsets: districtOffsetsLandtag2024Supplement[item.bezirkId] ?? {},
            turnoutBase: legacyLandtag2024.wahlbeteiligung,
            turnoutOffset: districtTurnoutOffset(item.bezirkId, "landtag"),
            noisePrefix: "landtag-2024-supplement",
          },
        )
      : null;
    return {
      gebietId: item.id,
      gebietName: item.name,
      officialName: item.officialName,
      bezirkId: item.bezirkId,
      bezirk: item.bezirk,
      wahlbeteiligung: generatedSupplement?.wahlbeteiligung ?? round1(
        clamp(
          legacyLandtag2024.wahlbeteiligung + districtTurnoutOffset(item.bezirkId, "landtag") + noise(`${item.id}:turnout`, 2.8),
          61,
          83,
        ),
      ),
      ergebnisse: generatedSupplement?.ergebnisse ?? normalizeResult(legacy.parteien),
      staerkstePartei: generatedSupplement?.staerkstePartei ?? legacy.staerkstePartei,
      staerksteParteiProzent: generatedSupplement?.staerksteParteiProzent ?? round1(legacy.staerksteParteiProzent),
      typ: item.type,
    };
  });

  return {
    id: "landtag-2024",
    electionId: "landtag-2024",
    label: "Landtagswahl 2024",
    datum: "2024-09-22",
    typ: "landtag",
    gebietsebene: "landkreis",
    wahlbeteiligung: legacyLandtag2024.wahlbeteiligung,
    wahlberechtigte: legacyLandtag2024.wahlberechtigte,
    gueltigeStimmen: legacyLandtag2024.gueltigeStimmen,
    modellhinweis:
      "Vereinfachtes Portalmodell mit einer Listenstimme. Landkreise und kreisfreie Städte bilden die regionale Ergebnisdarstellung; Hoyerswerda wird als dokumentierte Portal-Ausnahme separat geführt.",
    datenstand: "2026-04-20",
    metadaten: {
      quelle: "Simulierte Wahldaten auf Basis der kanonischen Portalgebiete",
      geobasis: "BKG VG250 31.12. für Kreise und kreisfreie Städte, ergänzt um Hoyerswerda aus der BKG-Gemeindeebene",
      legendenTitel: "Stärkste Partei",
      vergleichMit: "landtag-2020",
      simulationshinweis:
        "Die Landtagskarte bildet das vereinfachte Portalmodell mit nur einer Listenstimme ab und rekonstruiert kein reales Landeswahlrecht.",
    },
    summary: {
      gesamtergebnis: normalizeResult(legacyLandtag2024.landesergebnis),
      sitzverteilung: legacyLandtag2024.sitzverteilung,
      sitzeGesamt: legacyLandtag2024.sitzeGesamt,
      mehrheitsgrenze: legacyLandtag2024.mehrheitsgrenze,
      regierungsoption: legacyLandtag2024.regierungsoption,
    },
    gebiete,
  };
}

function buildDerivedLandtagDataset(reference, legacyMetadaten) {
  const base = normalizeResult({
    Volksfront: 30.4,
    "DEMOS Ost": 13.8,
    "CPD Ost": 20.1,
    FRP: 11.4,
    Patrioten: 18.0,
    Sonstige: 6.3,
  });

  const gebiete = reference.gebiete.map((gebiet) =>
    deriveAreaResult(gebiet, {
      id: gebiet.gebietId,
      base,
      districtOffsets: districtOffsetsLandtag2020[gebiet.bezirkId] ?? {},
      turnoutBase: 71.8,
      turnoutOffset: districtTurnoutOffset(gebiet.bezirkId, "landtag") - 1.6,
      noisePrefix: "landtag-2020",
    }),
  );

  const statewide = averageResults(gebiete);
  const seatDistribution = allocateSeats(statewide, 120);

  return {
    id: "landtag-2020",
    electionId: "landtag-2020",
    label: "Landtagswahl 2020",
    datum: "2020-09-27",
    typ: "landtag",
    gebietsebene: "landkreis",
    wahlbeteiligung: 71.8,
    wahlberechtigte: 10090000,
    gueltigeStimmen: 7246100,
    modellhinweis:
      "Vergleichsdatensatz im vereinfachten Portalmodell mit identischer Gebietslogik wie 2024. Die Sitze werden für die Simulation proportional aus dem Gesamtstimmenergebnis abgeleitet.",
    datenstand: legacyMetadaten.portal.stand,
    metadaten: {
      quelle: "Simulierter Vergleichsdatensatz",
      geobasis: "BKG VG250 31.12. für Kreise und kreisfreie Städte, ergänzt um Hoyerswerda aus der BKG-Gemeindeebene",
      legendenTitel: "Stärkste Partei",
      vergleichMit: "landtag-2024",
      simulationshinweis:
        "Der Vergleichsstand 2020 ist ein konsistenter Portal-Datensatz zur Bedienung der Kartenwahl und kein historischer Originaldatensatz.",
    },
    summary: {
      gesamtergebnis: statewide,
      sitzverteilung: seatDistribution,
      sitzeGesamt: 120,
      mehrheitsgrenze: 61,
      regierungsoption: {
        koalition: ["Volksfront", "DEMOS Ost"],
        sitze: (seatDistribution["Volksfront"] ?? 0) + (seatDistribution["DEMOS Ost"] ?? 0),
        mehrheitsfaehig: (seatDistribution["Volksfront"] ?? 0) + (seatDistribution["DEMOS Ost"] ?? 0) >= 61,
      },
    },
    gebiete,
  };
}

function buildBundestag2025Dataset(legacyBundestag2025, bundestagswahlkreisIndex, legacyMetadaten) {
  const base = normalizeResult(legacyBundestag2025.gesamtergebnisOst);
  const gebiete = bundestagswahlkreisIndex.map((gebiet) =>
    deriveAreaResult(gebiet, {
      id: gebiet.id,
      base,
      districtOffsets: districtOffsetsBundestag2025[gebiet.bezirkId] ?? {},
      turnoutBase: legacyBundestag2025.wahlbeteiligung,
      turnoutOffset: districtTurnoutOffset(gebiet.bezirkId, "bundestag"),
      noisePrefix: "bundestag-2025",
    }),
  );

  return {
    id: "bundestag-2025",
    electionId: "bundestag-2025",
    label: "Bundestagswahl 2025",
    datum: "2025-09-21",
    typ: "bundestag",
    gebietsebene: "bundestagswahlkreis",
    wahlbeteiligung: legacyBundestag2025.wahlbeteiligung,
    wahlberechtigte: legacyBundestag2025.wahlberechtigte,
    gueltigeStimmen: legacyBundestag2025.gueltigeStimmen,
    modellhinweis:
      "Vereinfachte Portal-Darstellung mit einer Listenstimme je Wahlkreis und einem einzigen separat ausgewiesenen Direktmandat für ganz Ostdeutschland.",
    datenstand: legacyMetadaten.portal.stand,
    metadaten: {
      quelle: "Simulierte Bundestagswahldaten auf offizieller Wahlkreisgeometrie 2025",
      geobasis: "Die Bundeswahlleiterin - Wahlkreiseinteilung Bundestagswahl 2025",
      legendenTitel: "Stärkste Partei",
      vergleichMit: "bundestag-2021",
      simulationshinweis:
        "Die Karte nutzt reale Bundestagswahlkreise, bildet aber bewusst nur das vereinfachte Portalmodell mit einem ostweiten Direktmandat ab.",
    },
    summary: {
      gesamtergebnis: averageResults(gebiete),
      direktmandat: legacyBundestag2025.direktmandatOstdeutschland,
    },
    gebiete,
  };
}

function buildBundestag2021Dataset(reference, legacyMetadaten) {
  const base = normalizeResult({
    Volksfront: 28.7,
    "DEMOS Ost": 16.8,
    "CPD Ost": 20.4,
    FRP: 10.4,
    Patrioten: 18.1,
    Sonstige: 5.6,
  });
  const gebiete = reference.gebiete.map((gebiet) =>
    deriveAreaResult(gebiet, {
      id: gebiet.gebietId,
      base,
      districtOffsets: districtOffsetsBundestag2021[gebiet.bezirkId] ?? {},
      turnoutBase: 75.4,
      turnoutOffset: districtTurnoutOffset(gebiet.bezirkId, "bundestag") - 1.4,
      noisePrefix: "bundestag-2021",
    }),
  );

  return {
    id: "bundestag-2021",
    electionId: "bundestag-2021",
    label: "Bundestagswahl 2021",
    datum: "2021-09-26",
    typ: "bundestag",
    gebietsebene: "bundestagswahlkreis",
    wahlbeteiligung: 75.4,
    wahlberechtigte: 10160000,
    gueltigeStimmen: 7655400,
    modellhinweis:
      "Simulierter Vergleichsstand mit derselben offiziellen Wahlkreisgeometrie wie 2025. Das ostweite Direktmandat bleibt auch hier eine eigenständige Portal-Komponente.",
    datenstand: legacyMetadaten.portal.stand,
    metadaten: {
      quelle: "Simulierter Vergleichsdatensatz",
      geobasis: "Die Bundeswahlleiterin - Wahlkreiseinteilung Bundestagswahl 2025",
      legendenTitel: "Stärkste Partei",
      vergleichMit: "bundestag-2025",
      simulationshinweis:
        "Der Vergleichsstand 2021 dient als zweiter wählbarer Karten-Datensatz und ist kein Vollnachbau realer Bundeswahlergebnisse.",
    },
    summary: {
      gesamtergebnis: averageResults(gebiete),
      direktmandat: {
        mandatName: "Direktmandat Ostdeutschland",
        kandidat: "Matthias Berger",
        partei: "CPD Ost",
        stimmenanteil: 50.6,
        hinweis:
          "Auch der Vergleichsdatensatz weist aus Konsistenzgründen nur ein einziges ostweites Direktmandat aus und bildet damit kein reales Bundeswahlrecht nach.",
      },
    },
    gebiete,
  };
}

function addLandtagComparisons(dataset, compareTo) {
  const compareById = Object.fromEntries(compareTo.gebiete.map((gebiet) => [gebiet.gebietId, gebiet]));
  for (const gebiet of dataset.gebiete) {
    const compare = compareById[gebiet.gebietId];
    gebiet.vergleichswerte = {
      datasetId: compareTo.id,
      wahlbeteiligung: compare.wahlbeteiligung,
      staerkstePartei: compare.staerkstePartei,
      staerksteParteiProzent: compare.staerksteParteiProzent,
    };
  }
}

function addBundestagComparisons(dataset, compareTo) {
  const compareById = Object.fromEntries(compareTo.gebiete.map((gebiet) => [gebiet.gebietId, gebiet]));
  for (const gebiet of dataset.gebiete) {
    const compare = compareById[gebiet.gebietId];
    gebiet.vergleichswerte = {
      datasetId: compareTo.id,
      wahlbeteiligung: compare.wahlbeteiligung,
      staerkstePartei: compare.staerkstePartei,
      staerksteParteiProzent: compare.staerksteParteiProzent,
    };
  }
}

function deriveAreaResult(gebiet, config) {
  const result = {};
  for (const party of parties) {
    const baseValue = config.base[party] ?? 0;
    const offset = config.districtOffsets[party] ?? 0;
    const drift = noise(`${config.noisePrefix}:${config.id}:${party}`, 2.2);
    result[party] = Math.max(1, baseValue + offset + drift);
  }
  const normalized = normalizeResult(result);
  const [winner, winnerPercent] = topParty(normalized);

  return {
    gebietId: gebiet.gebietId ?? gebiet.id,
    gebietName: gebiet.gebietName ?? gebiet.name,
    officialName: gebiet.officialName ?? gebiet.name,
    bezirkId: gebiet.bezirkId,
    bezirk: gebiet.bezirk,
    wahlbeteiligung: round1(clamp(config.turnoutBase + config.turnoutOffset + noise(`${config.noisePrefix}:${config.id}:turnout`, 3.3), 61, 86)),
    ergebnisse: normalized,
    staerkstePartei: winner,
    staerksteParteiProzent: winnerPercent,
    typ: gebiet.typ,
  };
}

function averageResults(gebiete) {
  const totals = Object.fromEntries(parties.map((party) => [party, 0]));
  for (const gebiet of gebiete) {
    for (const party of parties) {
      totals[party] += gebiet.ergebnisse[party] ?? 0;
    }
  }
  const avg = {};
  for (const party of parties) {
    avg[party] = totals[party] / gebiete.length;
  }
  return normalizeResult(avg);
}

function allocateSeats(result, totalSeats) {
  const entries = Object.entries(result).map(([name, value]) => ({
    name,
    raw: (value / 100) * totalSeats,
  }));
  const seats = Object.fromEntries(entries.map((entry) => [entry.name, Math.floor(entry.raw)]));
  let allocated = Object.values(seats).reduce((sum, value) => sum + value, 0);
  const remainders = entries
    .map((entry) => ({ name: entry.name, remainder: entry.raw - Math.floor(entry.raw) }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let index = 0; allocated < totalSeats; index += 1) {
    seats[remainders[index].name] += 1;
    allocated += 1;
  }
  return seats;
}

function buildLegacyLandkreisLookup(legacyLandkreise) {
  const out = {};
  for (const item of legacyLandkreise) {
    out[findLegacyLandkreisKey(item.name, item.type)] = item;
  }
  return out;
}

function buildLegacyLandtagLookup(landkreise) {
  const out = {};
  for (const item of landkreise) {
    const type = item.landkreis.includes("(Stadt)") || item.landkreis === "Berlin" ? "kreisfreie_stadt" : "landkreis";
    out[findLegacyLandkreisKey(item.landkreis, type)] = item;
  }
  return out;
}

function findLegacyLandkreisKey(name, type) {
  const alias = legacyNameAliases.get(`${fixText(name)}|${type}`);
  const effectiveName = alias ?? fixText(name);
  return `${type}:${normalizeName(effectiveName)}`;
}

function normalizeName(value) {
  return value
    .replace(/\s+\((Landkreis|Stadt)\)/g, "")
    .replace(/[()/,.-]/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeResult(result) {
  const values = Object.fromEntries(parties.map((party) => [party, Number(result[party] ?? 0)]));
  const total = Object.values(values).reduce((sum, value) => sum + value, 0);
  const normalized = {};
  let running = 0;
  for (let index = 0; index < parties.length; index += 1) {
    const party = parties[index];
    const value = total === 0 ? 0 : (values[party] / total) * 100;
    normalized[party] = index === parties.length - 1 ? round1(100 - running) : round1(value);
    running += normalized[party];
  }
  return normalized;
}

function topParty(result) {
  const top = Object.entries(result).sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }
    return partyOrder.indexOf(a[0]) - partyOrder.indexOf(b[0]);
  })[0];
  return [top[0], round1(top[1])];
}

function districtTurnoutOffset(bezirkId, type) {
  const baseOffsets = {
    berlin: type === "bundestag" ? 1.4 : 0.8,
    brandenburg: -0.3,
    "mecklenburg-vorpommern": 0.4,
    niederlausitz: -1.2,
    oberlausitz: -0.7,
    sachsen: 0.6,
    "sachsen-anhalt": -0.5,
    thueringen: 0.2,
  };
  return baseOffsets[bezirkId] ?? 0;
}

function landToDefaultDistrict(landCode) {
  switch (landCode) {
    case "11":
      return "berlin";
    case "12":
      return "brandenburg";
    case "13":
      return "mecklenburg-vorpommern";
    case "14":
      return "sachsen";
    case "15":
      return "sachsen-anhalt";
    case "16":
      return "thueringen";
    default:
      throw new Error(`Unbekannter Landescode ${landCode}`);
  }
}

async function readMunicipalityAssignments(filePath) {
  const raw = await readFile(filePath, "utf8");
  const cleaned = raw.replace(/^\uFEFF/, "");
  const lines = cleaned.split(/\r?\n/).filter(Boolean);
  const dataLines = lines.filter((line) => !line.startsWith("#"));
  const [headerLine, ...rows] = dataLines;
  const headers = headerLine.split(";");
  return rows.map((row) => {
    const cols = row.split(";");
    const entry = Object.fromEntries(headers.map((header, index) => [header, cols[index] ?? ""]));
    return {
      wahlkreisId: `wk-${String(entry["Wahlkreis-Nr"]).padStart(3, "0")}`,
      land: entry.RGS_Land,
      regBez: entry.RGS_RegBez,
      kreis: entry.RGS_Kreis,
      gemeinde: entry.Gemeindename,
      kreisname: entry.Kreisname,
    };
  });
}

async function readShapefile(filePath) {
  const source = await shapefile.open(filePath);
  const features = [];
  while (true) {
    const { done, value } = await source.read();
    if (done) {
      break;
    }
    features.push(value);
  }
  return features;
}

function mapProps(properties) {
  return Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, typeof value === "string" ? fixText(value) : value]));
}

function fixText(value) {
  if (typeof value !== "string") {
    return value;
  }
  const applyFallbacks = (input) =>
    textFixes.get(input) ??
    input
      .replace(/�x/g, "ß")
      .replace(/�–/g, " – ")
      .replace(/�/g, "")
      .replace(/\u001c/g, "–")
      .replace(/â€“/g, "–")
      .replace(/â€”/g, "—");

  if (!/[Ãâ]/.test(value)) {
    return applyFallbacks(value);
  }
  return applyFallbacks(Buffer.from(value, "latin1").toString("utf8"));
}

function roundGeometry(geometry) {
  return {
    ...geometry,
    coordinates: roundCoordinates(geometry.coordinates),
  };
}

function mergeGeometry(left, right) {
  const leftParts = geometryToMultiPolygonParts(left);
  const rightParts = geometryToMultiPolygonParts(right);
  return {
    type: "MultiPolygon",
    coordinates: [...leftParts, ...rightParts],
  };
}

function geometryToMultiPolygonParts(geometry) {
  if (geometry.type === "Polygon") {
    return [geometry.coordinates];
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates;
  }
  throw new Error(`Nicht unterstuetzter Geometrietyp ${geometry.type}`);
}

function roundCoordinates(value) {
  if (typeof value === "number") {
    return Math.round(value);
  }
  return value.map((item) => roundCoordinates(item));
}

function noise(seed, amplitude) {
  return (seeded(seed) * 2 - 1) * amplitude;
}

function seeded(seed) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 10000) / 10000;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

async function readJson(filePath) {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content);
}

async function writeJson(filePath, value) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
