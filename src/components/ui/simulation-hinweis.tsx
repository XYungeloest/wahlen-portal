type Props = {
  text: string;
};

export function SimulationHinweis({ text }: Props) {
  return (
    <aside className="rounded-xl border border-[#cbdcd7] bg-white p-4 text-sm text-slate-700" aria-label="Simulationshinweis">
      <p className="font-semibold text-[var(--color-primary)]">Hinweis zur Politiksimulation</p>
      <p className="mt-1 leading-6">{text}</p>
    </aside>
  );
}
