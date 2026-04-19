import type { GeoFeatureCollection } from "@/lib/types";

export function filterGeoByBezirk(geo: GeoFeatureCollection, bezirkId: string) {
  if (bezirkId === "alle") {
    return geo;
  }
  return {
    ...geo,
    features: geo.features.filter((feature) => feature.properties.bezirkId === bezirkId),
  };
}
