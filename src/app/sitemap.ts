import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const routes = [
  "",
  "/ergebnisse",
  "/ergebnisse/landtag",
  "/ergebnisse/bundestag",
  "/karte",
  "/wahlrecht",
  "/direkte-demokratie",
  "/methodik",
  "/impressum",
  "/datenschutz",
  "/barrierefreiheit",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `https://wahlen.freistaat-ostdeutschland.de${path}/`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
