"use client";

import { useMemo, useState } from "react";
import type { Bezirk, WahlkreisErgebnis } from "@/lib/types";

type Props = {
  bezirke: Bezirk[];
  ergebnisse: WahlkreisErgebnis[];
};

export function WahlkreisUebersicht({ bezirke, ergebnisse }: Props) {
  const [bezirkId, setBezirkId] = useState<string>("alle");

  const filtered = useMemo(
    () => (bezirkId === "alle" ? ergebnisse : ergebnisse.filter((item) => item.bezirkId === bezirkId)),
    [bezirkId, ergebnisse],
  );

  return (
    <section className="space-y-3" aria-label="Ergebnisse nach Bundestagswahlkreis">
      <label className="block max-w-sm text-sm font-medium text-slate-700">
        Bezirk filtern
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

      <div className="card overflow-x-auto">
        <table className="table-basic">
          <caption className="sr-only">Bundestagswahlkreisergebnisse</caption>
          <thead>
            <tr>
              <th scope="col">Bundestagswahlkreis</th>
              <th scope="col">Bezirk</th>
              <th scope="col">Stärkste Partei</th>
              <th scope="col">Prozent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.wahlkreisId}>
                <th scope="row">{entry.wahlkreis}</th>
                <td>{entry.bezirk}</td>
                <td>{entry.staerkstePartei}</td>
                <td className="font-mono-data">{entry.staerksteParteiProzent.toFixed(1).replace(".", ",")} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
