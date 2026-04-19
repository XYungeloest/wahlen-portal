"use client";

import { useMemo, useState } from "react";
import type { Bezirk, GeoFeatureCollection } from "@/lib/types";
import { filterGeoByBezirk } from "@/lib/geografie";
import { Wahlkarte } from "@/components/maps/wahlkarte";

type Ergebnis = {
  id: string;
  name: string;
  bezirkId: string;
  bezirk: string;
  winner: string;
  winnerPercent: number;
};

type Props = {
  title: string;
  bezirke: Bezirk[];
  geo: GeoFeatureCollection;
  data: Ergebnis[];
  partyColors: Record<string, string>;
  firstColumnLabel: string;
};

export function KartenModul({ title, bezirke, geo, data, partyColors, firstColumnLabel }: Props) {
  const [bezirkId, setBezirkId] = useState<string>("alle");

  const filteredData = useMemo(
    () => (bezirkId === "alle" ? data : data.filter((item) => item.bezirkId === bezirkId)),
    [bezirkId, data],
  );

  const filteredGeo = useMemo(() => filterGeoByBezirk(geo, bezirkId), [geo, bezirkId]);
  const byId = useMemo(
    () =>
      Object.fromEntries(
        filteredData.map((item) => [
          item.id,
          {
            name: item.name,
            bezirk: item.bezirk,
            winner: item.winner,
            winnerPercent: item.winnerPercent,
          },
        ]),
      ),
    [filteredData],
  );

  return (
    <div className="space-y-4">
      <label className="block max-w-sm text-sm font-medium text-slate-700">
        Bezirk auswählen
        <select
          className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2"
          value={bezirkId}
          onChange={(event) => setBezirkId(event.target.value)}
        >
          <option value="alle">Alle Bezirke</option>
          {bezirke.map((bezirk) => (
            <option key={bezirk.id} value={bezirk.id}>
              {bezirk.name}
            </option>
          ))}
        </select>
      </label>

      <Wahlkarte title={title} geo={filteredGeo} resultsById={byId} partyColors={partyColors} />

      <section className="card overflow-x-auto" aria-label="Tabellarische Kartenalternative">
        <table className="table-basic">
          <caption className="sr-only">Tabellarische Kartenalternative</caption>
          <thead>
            <tr>
              <th scope="col">{firstColumnLabel}</th>
              <th scope="col">Bezirk</th>
              <th scope="col">Stärkste Partei</th>
              <th scope="col">Prozent</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.name}</th>
                <td>{row.bezirk}</td>
                <td>{row.winner}</td>
                <td className="font-mono-data">{row.winnerPercent.toFixed(1).replace(".", ",")} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
