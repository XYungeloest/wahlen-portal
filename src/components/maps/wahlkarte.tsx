"use client";

import { geoIdentity, geoPath } from "d3-geo";
import { useMemo, useState } from "react";
import type { GeoFeatureCollection } from "@/lib/types";

type Ergebnis = {
  name: string;
  bezirk: string;
  winner: string;
  winnerPercent: number;
};

type Props = {
  title: string;
  geo: GeoFeatureCollection;
  resultsById: Record<string, Ergebnis>;
  partyColors: Record<string, string>;
};

type Point = [number, number];

type MultiLineGeometry = {
  type: "MultiLineString";
  coordinates: Point[][];
};

function pointKey(point: Point, precision = 3) {
  return `${point[0].toFixed(precision)},${point[1].toFixed(precision)}`;
}

function segmentKey(start: Point, end: Point) {
  const a = pointKey(start);
  const b = pointKey(end);
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function extractRings(feature: GeoFeatureCollection["features"][number]): Point[][] {
  const coordinates = feature.geometry.coordinates;
  if (feature.geometry.type === "Polygon") {
    return (coordinates as Point[][]).filter((ring) => ring.length > 1);
  }

  const multi = coordinates as Point[][][];
  const rings: Point[][] = [];
  for (const polygon of multi) {
    for (const ring of polygon) {
      if (ring.length > 1) {
        rings.push(ring);
      }
    }
  }
  return rings;
}

function buildOuterBoundaryGeometry(features: GeoFeatureCollection["features"]): MultiLineGeometry | null {
  const segments = new Map<string, { count: number; start: Point; end: Point }>();

  for (const feature of features) {
    const rings = extractRings(feature);
    for (const ring of rings) {
      for (let index = 0; index < ring.length - 1; index += 1) {
        const start = ring[index];
        const end = ring[index + 1];
        const key = segmentKey(start, end);
        const entry = segments.get(key);
        if (entry) {
          entry.count += 1;
        } else {
          segments.set(key, {
            count: 1,
            start: [Number(start[0].toFixed(3)), Number(start[1].toFixed(3))],
            end: [Number(end[0].toFixed(3)), Number(end[1].toFixed(3))],
          });
        }
      }
    }
  }

  const lines = [...segments.values()].filter((entry) => entry.count === 1).map((entry) => [entry.start, entry.end]);
  if (!lines.length) {
    return null;
  }

  return {
    type: "MultiLineString",
    coordinates: lines,
  };
}

export function Wahlkarte({ title, geo, resultsById, partyColors }: Props) {
  const width = 920;
  const height = 640;
  const [activeId, setActiveId] = useState<string | null>(null);

  const projection = useMemo(() => geoIdentity().fitSize([width, height], geo as never), [geo]);
  const pathBuilder = useMemo(() => geoPath(projection), [projection]);

  const mapSilhouettePath = useMemo(() => pathBuilder(geo as never), [geo, pathBuilder]);

  const featureItems = useMemo(() => {
    const counters = new Map<string, number>();

    return geo.features
      .map((feature) => {
        const id = String(feature.properties.id ?? "");
        const rawGroup = feature.properties.mapGroupId;
        const groupId = typeof rawGroup === "string" && rawGroup.trim().length > 0 ? rawGroup : null;
        const displayId = groupId ?? id;
        const index = counters.get(displayId) ?? 0;
        counters.set(displayId, index + 1);
        const d = pathBuilder(feature as never);

        return {
          feature,
          id,
          groupId,
          displayId,
          d,
          isPrimaryInteractionPath: index === 0,
        };
      })
      .filter((item) => item.d);
  }, [geo, pathBuilder]);

  const groupedBoundaryPaths = useMemo(() => {
    const groups = new Map<string, GeoFeatureCollection["features"]>();

    for (const item of featureItems) {
      if (!item.groupId) {
        continue;
      }
      const list = groups.get(item.groupId) ?? [];
      list.push(item.feature);
      groups.set(item.groupId, list);
    }

    const out: Record<string, string> = {};
    for (const [groupId, features] of groups.entries()) {
      const geometry = buildOuterBoundaryGeometry(features);
      if (!geometry) {
        continue;
      }
      const path = pathBuilder(geometry as never);
      if (path) {
        out[groupId] = path;
      }
    }

    return out;
  }, [featureItems, pathBuilder]);

  const groupedActivePaths = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const item of featureItems) {
      if (!item.groupId) {
        continue;
      }
      const list = groups.get(item.groupId) ?? [];
      list.push(item.d as string);
      groups.set(item.groupId, list);
    }

    return Object.fromEntries([...groups.entries()].map(([groupId, paths]) => [groupId, paths.join(" ")]));
  }, [featureItems]);

  const boundaryPaths = useMemo(
    () => featureItems.filter((item) => !item.groupId).map((item) => ({ key: item.id, d: item.d as string })),
    [featureItems],
  );

  const activePath = useMemo(() => {
    if (!activeId) {
      return null;
    }
    if (groupedBoundaryPaths[activeId] || groupedActivePaths[activeId]) {
      return groupedBoundaryPaths[activeId] ?? groupedActivePaths[activeId];
    }
    const item = featureItems.find((entry) => entry.displayId === activeId);
    return item?.d ?? null;
  }, [activeId, featureItems, groupedActivePaths, groupedBoundaryPaths]);

  const activeResult = activeId ? resultsById[activeId] : null;

  return (
    <section className="card p-4" aria-label={title}>
      <h3 className="mb-3 text-lg font-semibold text-[var(--color-primary)]">{title}</h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full rounded border border-slate-300 bg-slate-50"
        role="img"
        aria-label={title}
        shapeRendering="geometricPrecision"
      >
        {mapSilhouettePath ? <path d={mapSilhouettePath} fill="#dce6f1" /> : null}

        {featureItems.map((item) => {
          const result = resultsById[item.displayId];
          const fill = result ? partyColors[result.winner] ?? "#94a3b8" : "#cbd5e1";
          const fallbackName = String(item.feature.properties.mapGroupName ?? item.feature.properties.name ?? item.displayId);
          const ariaLabel = result
            ? `${result.name}, Bezirk ${result.bezirk}, stärkste Partei ${result.winner} mit ${result.winnerPercent.toFixed(1).replace(".", ",")} Prozent`
            : fallbackName;

          return (
            <path
              key={`${item.id}-${item.displayId}`}
              d={item.d as string}
              fill={fill}
              stroke="none"
              tabIndex={item.isPrimaryInteractionPath ? 0 : -1}
              role={item.isPrimaryInteractionPath ? "button" : "presentation"}
              aria-hidden={item.isPrimaryInteractionPath ? undefined : true}
              aria-label={item.isPrimaryInteractionPath ? ariaLabel : undefined}
              onMouseEnter={() => setActiveId(item.displayId)}
              onMouseLeave={() => setActiveId(null)}
              onFocus={() => {
                if (item.isPrimaryInteractionPath) {
                  setActiveId(item.displayId);
                }
              }}
              onBlur={() => {
                if (item.isPrimaryInteractionPath) {
                  setActiveId(null);
                }
              }}
              onKeyDown={(event) => {
                if (!item.isPrimaryInteractionPath) {
                  return;
                }
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveId(item.displayId);
                }
              }}
            />
          );
        })}

        <g pointerEvents="none" aria-hidden="true">
          {boundaryPaths.map((item) => (
            <path
              key={`b-${item.key}`}
              d={item.d}
              fill="none"
              stroke="#c7d2df"
              strokeWidth={0.72}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {Object.entries(groupedBoundaryPaths).map(([groupId, d]) => (
            <path
              key={`g-${groupId}`}
              d={d}
              fill="none"
              stroke="#c7d2df"
              strokeWidth={0.72}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </g>

        {activePath ?
          (
            <path
              d={activePath}
              fill="none"
              stroke="#0f172a"
              strokeWidth={2.25}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
              aria-hidden="true"
            />
          )
          : null}
      </svg>

      <div className="mt-4 rounded border border-slate-200 bg-white p-3 text-sm">
        {activeResult ? (
          <div>
            <p className="font-semibold">{activeResult.name}</p>
            <p>Bezirk: {activeResult.bezirk}</p>
            <p>
              Stärkste Partei: <strong>{activeResult.winner}</strong> ({activeResult.winnerPercent.toFixed(1).replace(".", ",")} %)
            </p>
          </div>
        ) : (
          <p>Für Details ein Gebiet fokussieren oder mit der Maus überfahren.</p>
        )}
      </div>
    </section>
  );
}
