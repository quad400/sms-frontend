'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { useAttendanceSummary, useRegisters } from '../../hooks/use-attendance';
import { addDays, formatDate, localToday, statusLabel } from '../../lib/format';
import { QueryState } from '../../lib/shared';
import { EmptyPanel, Panel } from '../shared/panel';
import { StatusBadge } from '../shared/status-badge';

const WINDOW_DAYS = 30;

export function ClassAttendanceTab({ classId }: { classId: number }) {
  const { can } = useSession();
  const { from, to } = useMemo(() => {
    const end = localToday();
    return { from: addDays(end, -(WINDOW_DAYS - 1)), to: end };
  }, []);
  const canSummary = can('attendance.summary.read');
  const summary = useAttendanceSummary(classId, from, to, canSummary);
  const registers = useRegisters({ classId, pageSize: 10 });

  const rate = summary.data?.attendanceRate;

  return (
    <div className="space-y-4">
      {canSummary ? (
        <Panel
          title={`Attendance — last ${WINDOW_DAYS} days`}
          description={`${formatDate(from)} to ${formatDate(to)}`}
        >
          {summary.isPending ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : !summary.data ? (
            <p className="text-sm text-muted-foreground">
              No attendance has been recorded for this class in this period.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div>
                <p className="font-heading text-3xl font-semibold tabular-nums">
                  {rate === null || rate === undefined ? '—' : `${Math.round(rate * 100)}%`}
                </p>
                <p className="text-xs text-muted-foreground">
                  attendance rate · {summary.data.registers} registers
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.entries(summary.data.counts).map(([code, count]) => (
                  <div key={code} className="rounded-xl bg-muted/60 px-3 py-2">
                    <dt className="text-xs text-muted-foreground">{statusLabel(code)}</dt>
                    <dd className="font-mono text-lg font-semibold tabular-nums">{count}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </Panel>
      ) : null}

      <Panel
        title="Recent registers"
        actions={
          can('attendance.register.open') ? (
            <Link
              href={`/staff/attendance?classId=${classId}`}
              className={buttonVariants({ size: 'sm' })}
            >
              Take attendance
            </Link>
          ) : null
        }
      >
        <QueryState
          isPending={registers.isPending}
          error={registers.error}
          onRetry={() => void registers.refetch()}
          isEmpty={(registers.data?.data ?? []).length === 0}
          empty={
            <EmptyPanel
              icon={ClipboardList}
              title="No registers yet"
              description="Registers for this class will be listed here."
            />
          }
        >
          <ul className="divide-y divide-border/70">
            {registers.data?.data.map((register) => (
              <li key={register.id}>
                <Link
                  href={`/staff/attendance/${register.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-brand"
                >
                  <span className="font-medium">{formatDate(register.date)}</span>
                  <StatusBadge status={register.status} />
                </Link>
              </li>
            ))}
          </ul>
        </QueryState>
      </Panel>
    </div>
  );
}
