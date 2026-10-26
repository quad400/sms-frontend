import { cn } from '@/lib/utils/cn';
import { timeRange, WEEKDAY_LABEL, type Weekday } from '../../lib/format';
import type { PeriodRow, TimetableEntry } from './timetable-types';

export function WeekGrid({
  days,
  periods,
  entries,
  today,
}: {
  days: Weekday[];
  periods: PeriodRow[];
  entries: TimetableEntry[];
  today: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">Your weekly teaching timetable</caption>
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th scope="col" className="w-32 px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Period
            </th>
            {days.map((day) => (
              <th
                key={day}
                scope="col"
                className={cn(
                  'px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                  day === today && 'text-foreground',
                )}
              >
                {WEEKDAY_LABEL[day]}
                {day === today ? <span className="ml-1.5 font-normal normal-case">· today</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.ordinal} className="border-b border-border/70 last:border-b-0">
              <th scope="row" className="px-3 py-3 text-left align-top">
                <span className="block text-sm font-semibold">{period.name}</span>
                <span className="block font-mono text-xs font-normal tabular-nums text-muted-foreground">
                  {timeRange(period.startTime, period.endTime)}
                </span>
              </th>
              {days.map((day) => {
                const cell = entries.filter(
                  (entry) => entry.weekday === day && entry.ordinal === period.ordinal,
                );
                return (
                  <td
                    key={day}
                    className={cn('px-2 py-2 align-top', day === today && 'bg-accent-soft/30')}
                  >
                    {cell.map((entry) => (
                      <div
                        key={entry.id}
                        aria-current={entry.current ? 'time' : undefined}
                        className={cn(
                          'mb-1 rounded-lg border px-2.5 py-2 last:mb-0',
                          entry.current
                            ? 'border-academic bg-accent-soft'
                            : 'border-border bg-background',
                        )}
                      >
                        <p className="text-sm font-semibold leading-tight">{entry.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.className}
                          {entry.room ? ` · ${entry.room}` : ''}
                        </p>
                      </div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
