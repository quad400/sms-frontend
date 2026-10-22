'use client';

import { useMemo, useState } from 'react';
import { usePortalTimetable } from '../hooks/use-portal';
import { QueryState } from './query-state';
import { asArray, asRecord, num, str } from '@/lib/utils/record';
import { cn } from '@/lib/utils/cn';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;
const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
};

function todayCode(): (typeof DAYS)[number] {
  const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const code = map[new Date().getDay()];
  if (code === 'sun' || code === 'sat' || !code) return 'mon';
  return code;
}

export function StudentTimetable() {
  const query = usePortalTimetable();
  const [day, setDay] = useState<(typeof DAYS)[number]>(todayCode);

  const slots = useMemo(() => {
    const root = query.data;
    const list = asArray(asRecord(root)?.slots ?? root);
    return list
      .map((row) => asRecord(row))
      .filter((row): row is Record<string, unknown> => !!row)
      .filter((row) => str(row.weekday).toLowerCase().startsWith(day));
  }, [query.data, day]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Timetable</h1>
        <p className="text-sm text-muted-foreground">Your periods for the week.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1">
        {DAYS.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setDay(code)}
            className={cn(
              'min-w-[3.25rem] flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors',
              day === code ? 'bg-brand text-brand-foreground' : 'text-muted-foreground hover:bg-card',
            )}
          >
            {DAY_LABELS[code]}
          </button>
        ))}
      </div>

      <QueryState isPending={query.isPending} error={query.error} isEmpty={slots.length === 0}>
        <ul className="space-y-2">
          {slots.map((slot, index) => {
            const subject = str(slot.subjectName ?? slot.subjectId, 'Subject');
            const room = str(slot.roomName ?? slot.roomId, '');
            const start = str(slot.startTime ?? slot.timeSlotOrdinal, '');
            const end = str(slot.endTime, '');
            return (
              <li
                key={num(slot.id, index)}
                className="rounded-2xl border border-border bg-card px-4 py-3 shadow-[var(--shadow-card)]"
              >
                <p className="font-medium">{subject}</p>
                <p className="text-sm text-muted-foreground">
                  {[start && end ? `${start}–${end}` : start, room && `Room ${room}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </li>
            );
          })}
        </ul>
      </QueryState>
    </div>
  );
}
