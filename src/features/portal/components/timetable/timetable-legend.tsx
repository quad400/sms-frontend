'use client';

import { Clock3 } from 'lucide-react';

const ITEMS = [
  { label: 'Core academic subject', swatch: 'bg-sky-200 ring-1 ring-sky-300/60' },
  { label: 'Active ongoing period', swatch: 'bg-primary' },
  { label: 'Upcoming period', swatch: 'bg-muted ring-1 ring-border' },
  { label: 'Break / free gap', swatch: 'bg-violet-100 ring-1 ring-violet-200/70' },
] as const;

export function TimetableLegend() {
  return (
    <footer className="flex flex-col gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
        <Clock3 className="size-3.5" aria-hidden />
        Published timetable · live when online
      </p>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {ITEMS.map((item) => (
          <li key={item.label} className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className={`size-2.5 shrink-0 rounded-full ${item.swatch}`} aria-hidden />
            {item.label}
          </li>
        ))}
      </ul>
    </footer>
  );
}
