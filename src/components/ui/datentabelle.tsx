import { formatProzent } from "@/lib/formatierung";

type Row = {
  name: string;
  value: number;
};

type Props = {
  title: string;
  rows: Row[];
  unit?: "percent" | "number";
};

export function DatenTabelle({ title, rows, unit = "percent" }: Props) {
  return (
    <section aria-label={title} className="card overflow-x-auto">
      <table className="table-basic">
        <caption className="sr-only">{title}</caption>
        <thead>
          <tr>
            <th scope="col">Eintrag</th>
            <th scope="col">Wert</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">{row.name}</th>
              <td className="font-mono-data">{unit === "percent" ? formatProzent(row.value) : row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
