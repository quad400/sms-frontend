'use client';

import { CalendarOff } from 'lucide-react';

export function TimetableCalmState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="mb-3 flex size-11 items-center justify-center rounded-xl bg-academic/10 text-academic">
        <CalendarOff className="size-5" aria-hidden />
      </span>
      <p className="font-heading text-lg font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
