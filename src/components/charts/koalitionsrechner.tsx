"use client";

import { useMemo, useState } from "react";

type PartySeat = {
  name: string;
  seats: number;
  color: string;
};

type Props = {
  parties: PartySeat[];
  majority: number;
};

export function Koalitionsrechner({ parties, majority }: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedParties = useMemo(
    () => parties.filter((party) => selected[party.name]),
    [parties, selected],
  );

  const selectedSeats = selectedParties.reduce((acc, party) => acc + party.seats, 0);
  const hasMajority = selectedSeats >= majority;

  return (
    <section className="card p-4" aria-label="Koalitionsrechner">
      <h3 className="text-xl font-semibold text-[var(--color-primary)]">Koalitionsrechner</h3>
      <p className="mt-2 text-sm text-slate-700">Parteien auswählen, um eine mögliche Regierungsmehrheit im Landtag zu prüfen.</p>

      <fieldset className="mt-4 grid gap-2 sm:grid-cols-2" aria-describedby="majority-note">
        <legend className="sr-only">Parteiauswahl</legend>
        {parties.map((party) => (
          <label key={party.name} className="flex cursor-pointer items-center justify-between rounded border border-slate-300 px-3 py-2">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Boolean(selected[party.name])}
                onChange={(event) => {
                  setSelected((current) => ({
                    ...current,
                    [party.name]: event.target.checked,
                  }));
                }}
              />
              <span className="inline-block h-3 w-3 rounded" style={{ background: party.color }} aria-hidden />
              <span>{party.name}</span>
            </span>
            <strong className="font-mono-data">{party.seats}</strong>
          </label>
        ))}
      </fieldset>

      <div className={`mt-4 rounded p-3 ${hasMajority ? "bg-emerald-50 text-emerald-900" : "bg-slate-100 text-slate-800"}`}>
        <p id="majority-note" className="font-semibold">
          {hasMajority ? "Regierungsfähige Mehrheit erreicht" : "Keine Mehrheit"}
        </p>
        <p className="mt-1 text-sm">
          Ausgewählte Sitze: <strong className="font-mono-data">{selectedSeats}</strong> von mindestens{" "}
          <strong className="font-mono-data">{majority}</strong>.
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="table-basic">
          <caption className="sr-only">Ausgewählte Koalition</caption>
          <thead>
            <tr>
              <th scope="col">Partei</th>
              <th scope="col">Sitze</th>
            </tr>
          </thead>
          <tbody>
            {selectedParties.length === 0 ? (
              <tr>
                <td colSpan={2}>Keine Parteien ausgewählt.</td>
              </tr>
            ) : (
              selectedParties.map((party) => (
                <tr key={party.name}>
                  <th scope="row">{party.name}</th>
                  <td className="font-mono-data">{party.seats}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
