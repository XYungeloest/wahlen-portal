#!/usr/bin/env python3

from __future__ import annotations

import csv
import json
import math
import re
import urllib.request
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DATA = ROOT / "public" / "data"
PUBLIC_GEO = ROOT / "public" / "geo"

WAHLKREISE_SVG = ROOT / "Wahlkreise.svg"
LANDKREISE_SVG = ROOT / "Landkreise.svg"

WAHLKREISNAMEN_URL = "https://www.bundeswahlleiterin.de/dam/jcr/17e066f6-a0af-42df-a5d2-365dc87769ab/btw25_wahlkreisnamen_utf8.csv"
WAHLKREIS_GEMEINDEN_URL = "https://www.bundeswahlleiterin.de/dam/jcr/aa868597-0e60-476c-bd2b-279c1e9a142a/btw25_wkr_gemeinden_20241130_utf8.csv"

CACHE_DIR = ROOT / "scripts" / "_cache"
WAHLKREISNAMEN_CSV = CACHE_DIR / "btw25_wahlkreisnamen_utf8.csv"
WAHLKREIS_GEMEINDEN_CSV = CACHE_DIR / "btw25_wkr_gemeinden_20241130_utf8.csv"

EAST_STATE_NUMBERS = {11, 12, 13, 14, 15, 16}

BEZIRK_NAMES = {
    "berlin": "Berlin",
    "brandenburg": "Brandenburg",
    "mecklenburg-vorpommern": "Mecklenburg-Vorpommern",
    "niederlausitz": "Niederlausitz",
    "oberlausitz": "Oberlausitz",
    "sachsen": "Sachsen",
    "sachsen-anhalt": "Sachsen-Anhalt",
    "thueringen": "Thüringen",
}

# Counties assigned to special simulation districts.
NIEDERLAUSITZ_CODES = {"12052", "12061", "12066", "12071"}
OBERLAUSITZ_CODES = {"14625", "14626"}

# Needed because the simulation uses 73 regional units, while the source SVG has 76 in East Germany.
LANDTAG_MERGE_CODES = {
    "lk-035-zwickau": ["14521"],
    "lk-036-chemnitz": ["14522"],
    "lk-037-dresden": ["14627"],
    "lk-068-weimarer-land": ["16068"],
}

# Disambiguation for names that exist as both district and district-free city.
LANDKREIS_CODE_OVERRIDES = {
    "lk-019-rostock": ["13072"],
    "lk-022-rostock-stadt": ["13003"],
    "lk-031-leipzig-landkreis": ["14729"],
    "lk-038-leipzig": ["14713"],
    "lk-052-magdeburg": ["15003"],
}

Number = float
Point = Tuple[Number, Number]
Ring = List[Point]
Polygon = List[Ring]
MultiPolygon = List[Polygon]
Matrix = Tuple[Number, Number, Number, Number, Number, Number]

SVG_NS = {"svg": "http://www.w3.org/2000/svg"}


def ensure_cache() -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)



def download_if_missing(path: Path, url: str) -> None:
    if path.exists():
        return
    with urllib.request.urlopen(url) as response:
        path.write_bytes(response.read())



def matrix_mul(m1: Matrix, m2: Matrix) -> Matrix:
    a1, b1, c1, d1, e1, f1 = m1
    a2, b2, c2, d2, e2, f2 = m2
    return (
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1,
    )



def parse_transform(transform: str | None) -> Matrix:
    if not transform:
        return (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)

    token_re = re.compile(r"(matrix|translate|scale|rotate)\s*\(([^)]*)\)")
    matrix: Matrix = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)

    for kind, args in token_re.findall(transform):
        nums = [float(value) for value in re.split(r"[ ,]+", args.strip()) if value]

        if kind == "matrix" and len(nums) == 6:
            current = tuple(nums)  # type: ignore[assignment]
        elif kind == "translate":
            tx = nums[0] if nums else 0.0
            ty = nums[1] if len(nums) > 1 else 0.0
            current = (1.0, 0.0, 0.0, 1.0, tx, ty)
        elif kind == "scale":
            sx = nums[0] if nums else 1.0
            sy = nums[1] if len(nums) > 1 else sx
            current = (sx, 0.0, 0.0, sy, 0.0, 0.0)
        elif kind == "rotate":
            angle = math.radians(nums[0] if nums else 0.0)
            cosv = math.cos(angle)
            sinv = math.sin(angle)
            if len(nums) >= 3:
                cx, cy = nums[1], nums[2]
                current = (
                    cosv,
                    sinv,
                    -sinv,
                    cosv,
                    cx - cosv * cx + sinv * cy,
                    cy - sinv * cx - cosv * cy,
                )
            else:
                current = (cosv, sinv, -sinv, cosv, 0.0, 0.0)
        else:
            continue

        matrix = matrix_mul(matrix, current)  # type: ignore[arg-type]

    return matrix



def apply_matrix(matrix: Matrix, point: Point) -> Point:
    a, b, c, d, e, f = matrix
    x, y = point
    return (a * x + c * y + e, b * x + d * y + f)



def parse_path_data(d: str) -> List[Ring]:
    tokens = re.findall(r"[A-Za-z]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?", d)
    index = 0
    command = None

    x = 0.0
    y = 0.0
    rings: List[Ring] = []
    ring: Ring = []

    def read_number() -> float:
        nonlocal index
        value = float(tokens[index])
        index += 1
        return value

    while index < len(tokens):
        token = tokens[index]
        if re.match(r"[A-Za-z]", token):
            command = token
            index += 1

        if command is None:
            break

        relative = command.islower()
        lower = command.lower()

        if lower == "m":
            dx = read_number()
            dy = read_number()
            if relative:
                x += dx
                y += dy
            else:
                x, y = dx, dy

            if ring:
                if ring[0] != ring[-1]:
                    ring.append(ring[0])
                rings.append(ring)
                ring = []

            ring = [(x, y)]

            while index < len(tokens) and not re.match(r"[A-Za-z]", tokens[index]):
                dx = read_number()
                dy = read_number()
                if relative:
                    x += dx
                    y += dy
                else:
                    x, y = dx, dy
                ring.append((x, y))

            command = "l" if relative else "L"

        elif lower == "l":
            while index < len(tokens) and not re.match(r"[A-Za-z]", tokens[index]):
                dx = read_number()
                dy = read_number()
                if relative:
                    x += dx
                    y += dy
                else:
                    x, y = dx, dy
                ring.append((x, y))

        elif lower == "h":
            while index < len(tokens) and not re.match(r"[A-Za-z]", tokens[index]):
                dx = read_number()
                x = x + dx if relative else dx
                ring.append((x, y))

        elif lower == "v":
            while index < len(tokens) and not re.match(r"[A-Za-z]", tokens[index]):
                dy = read_number()
                y = y + dy if relative else dy
                ring.append((x, y))

        elif lower == "c":
            while index < len(tokens) and not re.match(r"[A-Za-z]", tokens[index]):
                x1 = read_number()
                y1 = read_number()
                x2 = read_number()
                y2 = read_number()
                x3 = read_number()
                y3 = read_number()

                p0 = (x, y)
                p1 = (x + x1, y + y1) if relative else (x1, y1)
                p2 = (x + x2, y + y2) if relative else (x2, y2)
                p3 = (x + x3, y + y3) if relative else (x3, y3)

                # Flatten cubic curves into line segments for GeoJSON export.
                for step in range(1, 9):
                    t = step / 8.0
                    mt = 1.0 - t
                    px = (
                        (mt ** 3) * p0[0]
                        + 3 * (mt ** 2) * t * p1[0]
                        + 3 * mt * (t ** 2) * p2[0]
                        + (t ** 3) * p3[0]
                    )
                    py = (
                        (mt ** 3) * p0[1]
                        + 3 * (mt ** 2) * t * p1[1]
                        + 3 * mt * (t ** 2) * p2[1]
                        + (t ** 3) * p3[1]
                    )
                    ring.append((px, py))

                x, y = p3

        elif lower == "z":
            if ring and ring[0] != ring[-1]:
                ring.append(ring[0])
            if ring:
                rings.append(ring)
            ring = []

        else:
            raise ValueError(f"Unsupported path command: {command}")

    if ring:
        if ring[0] != ring[-1]:
            ring.append(ring[0])
        rings.append(ring)

    return [r for r in rings if len(r) >= 4]



def parse_polygon_points(points: str) -> Ring:
    values = [float(value) for value in re.split(r"[ ,\n\t\r]+", points.strip()) if value]
    if len(values) % 2 != 0:
        raise ValueError("Polygon points contain an uneven number of coordinates")

    ring = [(values[i], values[i + 1]) for i in range(0, len(values), 2)]
    if ring and ring[0] != ring[-1]:
        ring.append(ring[0])
    return ring



def cumulative_matrix(element: ET.Element, parent_map: Dict[ET.Element, ET.Element]) -> Matrix:
    chain: List[Matrix] = []
    current: ET.Element | None = element
    while current is not None:
        chain.append(parse_transform(current.get("transform")))
        current = parent_map.get(current)

    matrix: Matrix = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
    for part in reversed(chain):
        matrix = matrix_mul(matrix, part)
    return matrix



def round_point(point: Point, digits: int = 2) -> List[float]:
    return [round(point[0], digits), round(point[1], digits)]



def ring_bbox(ring: Ring) -> Tuple[float, float, float, float]:
    xs = [p[0] for p in ring]
    ys = [p[1] for p in ring]
    return min(xs), min(ys), max(xs), max(ys)



def polygon_centroid(multi_polygon: MultiPolygon) -> Point:
    points = [point for polygon in multi_polygon for ring in polygon for point in ring]
    if not points:
        return (0.0, 0.0)
    return (
        sum(point[0] for point in points) / len(points),
        sum(point[1] for point in points) / len(points),
    )



def point_in_ring(point: Point, ring: Ring) -> bool:
    x, y = point
    inside = False
    for index in range(len(ring) - 1):
        x1, y1 = ring[index]
        x2, y2 = ring[index + 1]
        intersects = ((y1 > y) != (y2 > y)) and (x < (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-12) + x1)
        if intersects:
            inside = not inside
    return inside



def point_in_rings(point: Point, rings: List[Ring]) -> bool:
    inside = False
    for ring in rings:
        if point_in_ring(point, ring):
            inside = not inside
    return inside



def normalize_name(value: str) -> str:
    mapped = (
        value.lower()
        .replace("ä", "ae")
        .replace("ö", "oe")
        .replace("ü", "ue")
        .replace("ß", "ss")
    )
    replacements = [
        "(saale)",
        "(landkreis)",
        "(stadt)",
        ", stadt",
        ", landeshauptstadt",
        "landkreis ",
    ]
    for replacement in replacements:
        mapped = mapped.replace(replacement, " ")
    mapped = re.sub(r"[^a-z0-9]+", " ", mapped).strip()
    return mapped



def read_semicolon_csv(path: Path) -> Tuple[List[str], List[List[str]]]:
    lines: List[str] = []
    with path.open("r", encoding="utf-8-sig") as handle:
        for line in handle:
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            lines.append(stripped)

    reader = csv.reader(lines, delimiter=";")
    rows = list(reader)
    return rows[0], rows[1:]



def ags_code(land: str, regbez: str, kreis: str) -> str:
    if int(regbez) == 0:
        return f"{int(land):02d}{int(kreis):03d}"
    return f"{int(land):02d}{int(regbez)}{int(kreis):02d}"



def bezirk_for_ags(code: str) -> str:
    prefix = code[:2]
    if prefix == "11":
        return "berlin"
    if prefix == "12":
        return "niederlausitz" if code in NIEDERLAUSITZ_CODES else "brandenburg"
    if prefix == "13":
        return "mecklenburg-vorpommern"
    if prefix == "14":
        return "oberlausitz" if code in OBERLAUSITZ_CODES else "sachsen"
    if prefix == "15":
        return "sachsen-anhalt"
    if prefix == "16":
        return "thueringen"
    raise ValueError(f"Unexpected AGS code prefix: {code}")



def parse_landkreise_svg() -> Dict[str, MultiPolygon]:
    tree = ET.parse(LANDKREISE_SVG)
    root = tree.getroot()
    parent_map = {child: parent for parent in root.iter() for child in parent}

    by_code: Dict[str, MultiPolygon] = defaultdict(list)

    for element in root.findall(".//svg:path", SVG_NS) + root.findall(".//svg:polygon", SVG_NS):
        code = element.get("id", "")
        if not re.fullmatch(r"\d{5}", code):
            continue

        matrix = cumulative_matrix(element, parent_map)

        if element.tag.endswith("path"):
            rings = parse_path_data(element.get("d", ""))
        else:
            rings = [parse_polygon_points(element.get("points", ""))]

        transformed = [[apply_matrix(matrix, point) for point in ring] for ring in rings if len(ring) >= 4]
        for ring in transformed:
            by_code[code].append([ring])

    return by_code



def parse_wahlkreise_svg() -> Tuple[List[Dict[str, object]], Dict[int, str], Dict[int, List[Point]]]:
    tree = ET.parse(WAHLKREISE_SVG)
    root = tree.getroot()
    parent_map = {child: parent for parent in root.iter() for child in parent}

    layer1 = root.find(".//*[@id='layer1']")
    layer5 = root.find(".//*[@id='layer5']")
    if layer1 is None or layer5 is None:
        raise ValueError("Required layers not found in Wahlkreise.svg")

    path_entries: List[Dict[str, object]] = []
    for element in layer1.findall(".//svg:path", SVG_NS):
        matrix = cumulative_matrix(element, parent_map)
        rings = parse_path_data(element.get("d", ""))
        transformed = [[apply_matrix(matrix, point) for point in ring] for ring in rings if len(ring) >= 4]
        path_entries.append(
            {
                "shapeKey": element.get("id"),
                "rings": transformed,
                "centroid": polygon_centroid([[ring] for ring in transformed]),
            }
        )

    number_points: Dict[int, List[Point]] = defaultdict(list)
    for text in layer5.findall(".//svg:text", SVG_NS):
        value = "".join(text.itertext()).strip()
        if not value.isdigit():
            continue
        number = int(value)
        if not (1 <= number <= 299):
            continue

        x_text = text.get("x")
        y_text = text.get("y")
        if not x_text or not y_text:
            continue

        x = float(x_text.split()[0])
        y = float(y_text.split()[0])
        matrix = cumulative_matrix(text, parent_map)
        point = apply_matrix(matrix, (x, y))
        number_points[number].append(point)

    if len(path_entries) != 299:
        raise ValueError(f"Expected 299 constituency paths, found {len(path_entries)}")

    if len(number_points) != 299:
        raise ValueError(f"Expected number labels 1..299, found {len(number_points)} unique labels")

    number_to_path_index: Dict[int, int] = {}
    used_paths: set[int] = set()

    candidates: Dict[int, set[int]] = defaultdict(set)
    for number, points in number_points.items():
        for point in points:
            for index, entry in enumerate(path_entries):
                if point_in_rings(point, entry["rings"]):
                    candidates[number].add(index)

    changed = True
    while changed:
        changed = False
        for number in range(1, 300):
            if number in number_to_path_index:
                continue
            free_candidates = [index for index in candidates[number] if index not in used_paths]
            if len(free_candidates) == 1:
                selected = free_candidates[0]
                number_to_path_index[number] = selected
                used_paths.add(selected)
                changed = True

    for number in range(1, 300):
        if number in number_to_path_index:
            continue

        best_distance = None
        best_index = None
        for point in number_points[number]:
            for index, entry in enumerate(path_entries):
                if index in used_paths:
                    continue
                cx, cy = entry["centroid"]
                distance = (cx - point[0]) ** 2 + (cy - point[1]) ** 2
                if best_distance is None or distance < best_distance:
                    best_distance = distance
                    best_index = index

        if best_index is None:
            raise ValueError(f"Could not assign shape for constituency {number}")

        number_to_path_index[number] = best_index
        used_paths.add(best_index)

    if len(number_to_path_index) != 299:
        raise ValueError("Constituency mapping incomplete")

    if len(set(number_to_path_index.values())) != 299:
        raise ValueError("Constituency mapping not one-to-one")

    number_to_shape_key = {
        number: str(path_entries[index]["shapeKey"])
        for number, index in number_to_path_index.items()
    }

    return path_entries, number_to_shape_key, number_points



def create_hoyerswerda_shape(code_shapes: Dict[str, MultiPolygon]) -> MultiPolygon:
    bautzen = polygon_centroid(code_shapes["14625"])
    spree_neisse = polygon_centroid(code_shapes["12071"])

    center = (
        bautzen[0] * 0.72 + spree_neisse[0] * 0.28,
        bautzen[1] * 0.72 + spree_neisse[1] * 0.28,
    )

    all_points = [
        point
        for code in code_shapes
        if code[:2] in {"11", "12", "13", "14", "15", "16"}
        for polygon in code_shapes[code]
        for ring in polygon
        for point in ring
    ]
    width = max(point[0] for point in all_points) - min(point[0] for point in all_points)
    radius = width * 0.006

    ring: Ring = []
    segments = 20
    for index in range(segments):
        angle = (index / segments) * math.pi * 2
        ring.append((center[0] + math.cos(angle) * radius, center[1] + math.sin(angle) * radius))
    ring.append(ring[0])
    return [[ring]]



def build_landkreis_geojson(code_shapes: Dict[str, MultiPolygon], kreis_name_map: Dict[str, str]) -> Dict[str, object]:
    landkreise = json.loads((PUBLIC_DATA / "landkreise.json").read_text(encoding="utf-8"))

    normalized_code_lookup: Dict[str, List[str]] = defaultdict(list)
    for code, name in kreis_name_map.items():
        normalized_code_lookup[normalize_name(name)].append(code)

    simulation_to_codes: Dict[str, List[str]] = {}
    unresolved: List[str] = []

    for entry in landkreise:
        entry_id = entry["id"]
        if entry_id in LANDKREIS_CODE_OVERRIDES:
            simulation_to_codes[entry_id] = LANDKREIS_CODE_OVERRIDES[entry_id][:]
            continue

        if entry_id == "lk-030-hoyerswerda":
            simulation_to_codes[entry_id] = []
            continue

        candidates = normalized_code_lookup.get(normalize_name(entry["name"]), [])
        if len(candidates) == 1:
            simulation_to_codes[entry_id] = candidates
        else:
            unresolved.append(f"{entry_id}: {entry['name']} -> {candidates}")

    if unresolved:
        raise ValueError("Unresolved county mappings:\n" + "\n".join(unresolved))

    for simulation_id, merged_codes in LANDTAG_MERGE_CODES.items():
        simulation_to_codes[simulation_id].extend(merged_codes)

    features = []

    synthetic_hoyerswerda = create_hoyerswerda_shape(code_shapes)

    for entry in landkreise:
        entry_id = entry["id"]
        if entry_id == "lk-030-hoyerswerda":
            geometry = synthetic_hoyerswerda
            source_codes: List[str] = []
            source = "synthetisch"
        else:
            source_codes = simulation_to_codes[entry_id]
            geometry = []
            for code in source_codes:
                geometry.extend(code_shapes[code])
            source = "landkreise.svg"

        feature = {
            "type": "Feature",
            "properties": {
                "id": entry_id,
                "name": entry["name"],
                "type": entry["type"],
                "bezirkId": entry["bezirkId"],
                "bezirk": entry["bezirk"],
                "source": source,
                "sourceCodes": source_codes,
            },
            "geometry": {
                "type": "MultiPolygon",
                "coordinates": [
                    [[round_point(point) for point in ring] for ring in polygon]
                    for polygon in geometry
                ],
            },
        }
        features.append(feature)

    return {"type": "FeatureCollection", "features": features}



def build_kreis_name_map_from_municipalities() -> Dict[str, str]:
    header, rows = read_semicolon_csv(WAHLKREIS_GEMEINDEN_CSV)
    index = {name: idx for idx, name in enumerate(header)}

    by_code: Dict[str, str] = {}
    for row in rows:
        land = row[index["RGS_Land"]]
        regbez = row[index["RGS_RegBez"]]
        kreis = row[index["RGS_Kreis"]]
        if not (land.isdigit() and regbez.isdigit() and kreis.isdigit()):
            continue

        if int(land) not in EAST_STATE_NUMBERS:
            continue

        code = ags_code(land, regbez, kreis)
        by_code[code] = row[index["Kreisname"]]

    return by_code



def build_wahlkreis_records() -> Tuple[List[Dict[str, object]], Dict[int, Dict[str, object]]]:
    header, rows = read_semicolon_csv(WAHLKREISNAMEN_CSV)
    index = {name: idx for idx, name in enumerate(header)}

    records: List[Dict[str, object]] = []
    by_number: Dict[int, Dict[str, object]] = {}

    for row in rows:
        land_number = int(row[index["LAND_NR"]])
        if land_number not in EAST_STATE_NUMBERS:
            continue

        number = int(row[index["WKR_NR"]])
        record = {
            "nummer": number,
            "name": row[index["WKR_NAME"]].strip(),
            "landNr": land_number,
            "landName": row[index["LAND_NAME"]].strip(),
        }
        records.append(record)
        by_number[number] = record

    records.sort(key=lambda item: int(item["nummer"]))
    return records, by_number



def assign_wahlkreis_bezirke() -> Dict[int, Dict[str, object]]:
    header, rows = read_semicolon_csv(WAHLKREIS_GEMEINDEN_CSV)
    index = {name: idx for idx, name in enumerate(header)}

    counts: Dict[int, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

    for row in rows:
        number = row[index["Wahlkreis-Nr"]]
        if not number.isdigit():
            continue

        land = row[index["RGS_Land"]]
        regbez = row[index["RGS_RegBez"]]
        kreis = row[index["RGS_Kreis"]]

        if not (land.isdigit() and regbez.isdigit() and kreis.isdigit()):
            continue

        if int(land) not in EAST_STATE_NUMBERS:
            continue

        code = ags_code(land, regbez, kreis)
        bezirk_id = bezirk_for_ags(code)
        counts[int(number)][bezirk_id] += 1

    result: Dict[int, Dict[str, object]] = {}

    for number, bezirk_counts in counts.items():
        sorted_bezirke = sorted(bezirk_counts.items(), key=lambda item: (-item[1], item[0]))
        primary = sorted_bezirke[0][0]
        result[number] = {
            "bezirkId": primary,
            "bezirk": BEZIRK_NAMES[primary],
            "bezirkeBeteiligt": [bezirk for bezirk, _count in sorted_bezirke],
            "gemeindeCounts": {bezirk: count for bezirk, count in sorted_bezirke},
            "zuordnung": "gemischt" if len(sorted_bezirke) > 1 else "eindeutig",
        }

    return result



def build_bundestag_outputs(
    path_entries: List[Dict[str, object]],
    number_to_shape_key: Dict[int, str],
) -> Tuple[Dict[str, object], List[Dict[str, object]], Dict[str, object]]:
    records, records_by_number = build_wahlkreis_records()
    bezirk_assignment = assign_wahlkreis_bezirke()

    number_to_entry_index: Dict[int, int] = {}
    # Determine shape index from shape key lookup.
    shape_key_to_index = {str(entry["shapeKey"]): idx for idx, entry in enumerate(path_entries)}
    for number, shape_key in number_to_shape_key.items():
        number_to_entry_index[number] = shape_key_to_index[shape_key]

    features = []
    bundestagswahlkreise_json: List[Dict[str, object]] = []
    mapping_rows: List[Dict[str, object]] = []

    for record in records:
        number = int(record["nummer"])
        assignment = bezirk_assignment[number]
        shape_index = number_to_entry_index[number]
        shape_key = number_to_shape_key[number]
        rings: List[Ring] = path_entries[shape_index]["rings"]  # type: ignore[assignment]

        geometry: MultiPolygon = [[ring] for ring in rings]

        wahlkreis_id = f"bwk-{number:03d}"
        wahlkreis_name = str(record["name"])

        features.append(
            {
                "type": "Feature",
                "properties": {
                    "id": wahlkreis_id,
                    "nummer": number,
                    "name": wahlkreis_name,
                    "bezirkId": assignment["bezirkId"],
                    "bezirk": assignment["bezirk"],
                    "shapeKey": shape_key,
                    "zuordnung": assignment["zuordnung"],
                    "bezirkeBeteiligt": assignment["bezirkeBeteiligt"],
                },
                "geometry": {
                    "type": "MultiPolygon",
                    "coordinates": [
                        [[round_point(point) for point in ring] for ring in polygon]
                        for polygon in geometry
                    ],
                },
            }
        )

        bundestagswahlkreise_json.append(
            {
                "id": wahlkreis_id,
                "nummer": number,
                "name": f"Bundestagswahlkreis {number}: {wahlkreis_name}",
                "kurzname": wahlkreis_name,
                "bezirkId": assignment["bezirkId"],
                "bezirk": assignment["bezirk"],
            }
        )

        mapping_rows.append(
            {
                "id": wahlkreis_id,
                "nummer": number,
                "name": wahlkreis_name,
                "land": record["landName"],
                "bezirkId": assignment["bezirkId"],
                "bezirk": assignment["bezirk"],
                "shapeKey": shape_key,
                "zuordnung": assignment["zuordnung"],
                "bezirkeBeteiligt": assignment["bezirkeBeteiligt"],
                "gemeindeCounts": assignment["gemeindeCounts"],
                "quelle": "Bundeswahlleiterin 2025 Wahlkreisnummern/-namen und Wahlkreis-Gemeinde-Zuordnung",
            }
        )

    mapping_rows.sort(key=lambda row: int(row["nummer"]))
    bundestagswahlkreise_json.sort(key=lambda row: int(row["nummer"]))

    mapping_file = {
        "quelle": {
            "wahlkreisnamenCsv": WAHLKREISNAMEN_URL,
            "wahlkreisGemeindenCsv": WAHLKREIS_GEMEINDEN_URL,
            "hinweis": "Wahlkreisnummerierung und Namen aus amtlicher Liste; Bezirkszuordnung anhand Gemeindezuordnung plausibilisiert.",
        },
        "eintraege": mapping_rows,
    }

    geojson = {"type": "FeatureCollection", "features": features}
    return geojson, bundestagswahlkreise_json, mapping_file



def hash_string(value: str) -> int:
    result = 2166136261
    for char in value:
        result ^= ord(char)
        result = (result * 16777619) & 0xFFFFFFFF
    return result



def random_delta(key: str, scale: float = 1.0) -> float:
    value = hash_string(key) / 0xFFFFFFFF
    return (value * 2.0 - 1.0) * scale



def rounded_percentages(values: Dict[str, float]) -> Dict[str, float]:
    clamped = {party: max(0.1, value) for party, value in values.items()}
    total = sum(clamped.values())
    scaled = {party: (value / total) * 1000.0 for party, value in clamped.items()}

    floors = {party: math.floor(value) for party, value in scaled.items()}
    remainder = 1000 - sum(floors.values())

    sorted_parties = sorted(scaled.keys(), key=lambda party: (scaled[party] - floors[party]), reverse=True)
    for party in sorted_parties[:remainder]:
        floors[party] += 1

    return {party: round(floors[party] / 10.0, 1) for party in floors}



def generate_bundestag_results(bundestagswahlkreise: List[Dict[str, object]]) -> None:
    path = PUBLIC_DATA / "bundestagswahl-2025.json"
    data = json.loads(path.read_text(encoding="utf-8"))

    statewide = data["gesamtergebnisOst"]

    bezirk_offsets = {
        "berlin": {"DEMOS Ost": 3.4, "Volksfront": -1.2, "Patrioten": -2.1},
        "brandenburg": {"Volksfront": 1.2, "Patrioten": 1.0},
        "mecklenburg-vorpommern": {"Patrioten": 1.6, "Volksfront": 0.6, "DEMOS Ost": -0.8},
        "niederlausitz": {"Volksfront": 1.8, "Patrioten": 1.1, "DEMOS Ost": -1.1},
        "oberlausitz": {"Volksfront": 1.6, "Patrioten": 1.3, "DEMOS Ost": -1.0},
        "sachsen": {"CPD Ost": 1.5, "FRP": 0.6, "Volksfront": 0.5},
        "sachsen-anhalt": {"Volksfront": 1.1, "Patrioten": 0.8},
        "thueringen": {"Patrioten": 2.0, "CPD Ost": 1.0, "DEMOS Ost": -0.9},
    }

    generated = []
    for wahlkreis in bundestagswahlkreise:
        wid = str(wahlkreis["id"])
        bezirk_id = str(wahlkreis["bezirkId"])
        offsets = bezirk_offsets.get(bezirk_id, {})

        raw: Dict[str, float] = {}
        for party, base in statewide.items():
            delta = offsets.get(party, 0.0)
            noise = random_delta(f"{wid}:{party}", 2.0)
            raw[party] = float(base) + delta + noise

        rounded = rounded_percentages(raw)
        winner_party, winner_value = max(rounded.items(), key=lambda item: item[1])

        generated.append(
            {
                "wahlkreisId": wid,
                "wahlkreis": wahlkreis["kurzname"],
                "bezirkId": bezirk_id,
                "bezirk": wahlkreis["bezirk"],
                "parteien": rounded,
                "staerkstePartei": winner_party,
                "staerksteParteiProzent": winner_value,
            }
        )

    data["ergebnisseWahlkreise"] = generated
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")



def write_json(path: Path, content: object) -> None:
    path.write_text(json.dumps(content, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")



def main() -> None:
    ensure_cache()
    download_if_missing(WAHLKREISNAMEN_CSV, WAHLKREISNAMEN_URL)
    download_if_missing(WAHLKREIS_GEMEINDEN_CSV, WAHLKREIS_GEMEINDEN_URL)

    kreis_name_map = build_kreis_name_map_from_municipalities()

    landkreis_code_shapes = parse_landkreise_svg()
    landkreis_geojson = build_landkreis_geojson(landkreis_code_shapes, kreis_name_map)
    write_json(PUBLIC_GEO / "landkreise.geojson", landkreis_geojson)

    path_entries, number_to_shape_key, _number_points = parse_wahlkreise_svg()
    bundestag_geojson, bundestagswahlkreise_json, mapping_file = build_bundestag_outputs(path_entries, number_to_shape_key)

    write_json(PUBLIC_GEO / "bundestagswahlkreise.geojson", bundestag_geojson)
    write_json(PUBLIC_DATA / "bundestagswahlkreise.json", bundestagswahlkreise_json)
    write_json(PUBLIC_DATA / "bundestagswahlkreis-mapping-2025.json", mapping_file)

    generate_bundestag_results(bundestagswahlkreise_json)



if __name__ == "__main__":
    main()
