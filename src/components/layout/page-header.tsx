type Props = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: Props) {
  return (
    <header className="mb-6 rounded-xl border border-slate-300 bg-white p-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary)]">{title}</h1>
      <p className="mt-3 max-w-4xl text-slate-700">{description}</p>
    </header>
  );
}
