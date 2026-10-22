'use client';

import { useMemo } from 'react';
import { usePortalAttendance } from '../hooks/use-portal';
import { QueryState } from './query-state';
import { asArray, asRecord, str } from '@/lib/utils/record';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

function statusTone(code: string): string {
  const c = code.toLowerCase();
  if (c === 'present') return 'bg-success/15 text-success';
  if (c === 'absent') return 'bg-danger/15 text-danger';
  if (c === 'late') return 'bg-accent-soft text-accent-soft-foreground';
  return 'bg-muted text-muted-foreground';
}

export function StudentAttendance() {
  const query = usePortalAttendance();
  const rows = useMemo(
    () =>
      asArray(query.data)
        .map((row) => asRecord(row))
        .filter((row): row is Record<string, unknown> => !!row),
    [query.data],
  );

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    for (const row of rows) {
      const code = str(row.statusCode ?? row.status ?? row.mark).toLowerCase();
      if (code === 'present') present += 1;
      else if (code === 'absent') absent += 1;
      else if (code === 'late') late += 1;
    }
    const total = rows.length || 1;
    return {
      present,
      absent,
      late,
      rate: Math.round((present / total) * 100),
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">Your recent attendance marks.</p>
      </div>

      <QueryState isPending={query.isPending} error={query.error}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Rate', `${summary.rate}%`],
            ['Present', String(summary.present)],
            ['Absent', String(summary.absent)],
            ['Late', String(summary.late)],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <ul className="space-y-2">
          {rows.map((row, index) => {
            const code = str(row.statusCode ?? row.status ?? row.mark, 'mark');
            const date = str(row.date ?? row.markedAt ?? row.createdAt, '—');
            return (
              <li
                key={`${date}-${index}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span className="text-sm">{date.slice(0, 10)}</span>
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                    statusTone(code),
                  )}
                >
                  {code}
                </span>
              </li>
            );
          })}
        </ul>
      </QueryState>
    </div>
  );
}
