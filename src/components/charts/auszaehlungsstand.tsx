"use client";

import { useEffect, useMemo, useState } from "react";

const target = 100;

type Props = {
  startValue?: number;
};

export function Auszaehlungsstand({ startValue = 87.4 }: Props) {
  const [progress, setProgress] = useState(startValue);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((current) => {
        if (current >= target) {
          return 100;
        }
        const delta = Number((Math.random() * 0.4).toFixed(2));
        return Math.min(100, Number((current + delta).toFixed(2)));
      });
    }, 1500);

    return () => clearInterval(id);
  }, []);

  const status = useMemo(() => {
    if (progress >= 99.5) {
      return "Vorläufiges Endergebnis";
    }
    if (progress >= 95) {
      return "Späte Hochrechnung";
    }
    return "Laufende Hochrechnung";
  }, [progress]);

  return (
    <section className="card p-4" aria-live="polite" aria-label="Simulierter Auszählungsstand">
      <h3 className="text-lg font-semibold text-[var(--color-primary)]">Auszählungsstand (Simulation)</h3>
      <p className="mt-2 text-sm text-slate-700">
        Diese Anzeige ist ein Frontend-Simulationsmodul zur Veranschaulichung von Hochrechnungsständen.
      </p>
      <div className="mt-4 h-5 rounded bg-slate-100">
        <div className="h-5 rounded bg-[var(--color-secondary)] transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Status: {status}</span>
        <span className="font-mono-data">{progress.toFixed(2).replace(".", ",")} % ausgezählt</span>
      </div>
    </section>
  );
}
