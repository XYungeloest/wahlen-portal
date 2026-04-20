type Props = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: Props) {
  return (
    <header className="mb-6 rounded-[1.5rem] border border-[#d3e0dc] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,250,248,0.96))] p-6 shadow-[0_18px_40px_rgba(0,38,46,0.05)]">
      <h1 className="break-words text-3xl font-bold text-[var(--color-primary)]">{title}</h1>
      <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-700">{description}</p>
    </header>
  );
}
