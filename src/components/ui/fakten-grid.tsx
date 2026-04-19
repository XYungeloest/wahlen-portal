type Fact = {
  label: string;
  value: string;
};

type Props = {
  facts: Fact[];
};

export function FaktenGrid({ facts }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {facts.map((fact) => (
        <article key={fact.label} className="card p-4">
          <p className="text-sm text-slate-600">{fact.label}</p>
          <p className="mt-2 text-xl font-bold text-[var(--color-primary)]">{fact.value}</p>
        </article>
      ))}
    </div>
  );
}
