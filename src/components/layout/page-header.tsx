type Props = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: Props) {
  return (
    <header className="mb-6 rounded-xl border border-[#d9e2e7] bg-white p-6 shadow-[0_10px_24px_rgba(0,43,49,0.045)]">
      <h1 className="break-words text-3xl font-semibold text-[var(--color-primary)]">{title}</h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">{description}</p>
    </header>
  );
}
