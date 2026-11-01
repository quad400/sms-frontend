'use client';

import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { Timetable } from '../../api/academics';
import type { SchoolClass } from '../../api/structure';

export function ClassTimetableSidebar({
  classes,
  selectedClassId,
  onSelect,
  timetablesByClassId,
}: {
  classes: SchoolClass[];
  selectedClassId: string;
  onSelect: (classId: string) => void;
  timetablesByClassId: Map<number, Timetable>;
}) {
  return (
    <aside className="space-y-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <section className="rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
        <div className="mb-2 flex items-center gap-2 px-1">
          <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <CalendarDays className="size-3.5" />
          </span>
          <div>
            <h2 className="font-heading text-sm font-semibold tracking-tight">Class arms</h2>
            <p className="text-[11px] text-muted-foreground">Pick a cohort to view its grid</p>
          </div>
        </div>
        {classes.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            No classes for this campus / session.
          </p>
        ) : (
          <ul className="space-y-0.5 flex flex-row flex-wrap gap-2">
            {classes.map((c) => {
              const active = String(c.id) === selectedClassId;
              const tt = timetablesByClassId.get(c.id);
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(String(c.id))}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition',
                      active
                        ? 'bg-teal-700 text-white'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{c.name}</span>
                      <span
                        className={cn(
                          'block truncate text-[11px]',
                          active ? 'text-white/75' : 'text-muted-foreground',
                        )}
                      >
                        {tt
                          ? tt.status === 'published'
                            ? 'Published'
                            : `Draft · #${tt.id}`
                          : 'No timetable'}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'size-2 shrink-0 rounded-full',
                        tt
                          ? tt.status === 'published'
                            ? active
                              ? 'bg-emerald-300'
                              : 'bg-emerald-500'
                            : active
                              ? 'bg-amber-200'
                              : 'bg-amber-500'
                          : active
                            ? 'bg-white/40'
                            : 'bg-muted-foreground/30',
                      )}
                      aria-hidden
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}
