import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/badge';
import { formatTime, timeRange, WEEKDAY_LABEL, type Weekday } from '../../lib/format';
import { EmptyPanel } from '../shared/panel';
import type { TimetableEntry } from './timetable-types';

export function DayAgenda({ day, entries }: { day: Weekday; entries: TimetableEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyPanel
        title={`No lessons on ${WEEKDAY_LABEL[day]}`}
        description="You have no teaching periods scheduled for this day."
      />
    );
  }

  return (
    <ol className="space-y-2">
      {entries.map((entry) => (
        <li
          key={entry.id}
          aria-current={entry.current ? 'time' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-xl border p-3.5',
            entry.current ? 'border-academic/50 bg-accent-soft/60' : 'border-border bg-card',
          )}
        >
          <div className="w-16 shrink-0">
            <p className="font-mono text-sm font-semibold tabular-nums">
              {formatTime(entry.startTime)}
            </p>
            <p className="text-xs text-muted-foreground">{entry.periodName}</p>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{entry.subject}</p>
            <p className="truncate text-xs text-muted-foreground">
              {entry.className}
              {entry.room ? ` · ${entry.room}` : ''} · {timeRange(entry.startTime, entry.endTime)}
            </p>
          </div>
          {entry.current ? <Badge>Now</Badge> : null}
        </li>
      ))}
    </ol>
  );
}
