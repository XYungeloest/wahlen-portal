type Props = {
  text: string;
};

export function SimulationHinweis({ text }: Props) {
  return (
    <aside className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900" aria-label="Simulationshinweis">
      <p className="font-semibold">Hinweis zur Politiksimulation</p>
      <p className="mt-1">{text}</p>
    </aside>
  );
}
