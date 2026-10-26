'use client';

import Link from 'next/link';
import { useStudents } from '../../hooks/use-students';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';

export function ClassRoster({ classId }: { classId: number }) {
  const roster = useStudents({ classId: String(classId), page: 1 }, true);

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold tracking-tight">Roster</h2>
        <Link
          href={`/admin/students?classId=${classId}`}
          className="text-xs font-medium text-primary hover:underline"
        >
          View all students
        </Link>
      </div>
      <QueryState
        isPending={roster.isPending}
        error={roster.error}
        onRetry={() => void roster.refetch()}
      >
        {(roster.data?.data ?? []).length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            No students enrolled yet.
          </p>
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border bg-card">
            {(roster.data?.data ?? []).map((s) => {
              const name = fullName(s.firstName, s.lastName, s.middleName);
              const initials =
                `${s.firstName?.[0] ?? ''}${s.lastName?.[0] ?? ''}`.toUpperCase() || '?';
              return (
                <li key={s.id}>
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-muted/50"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      {s.studentNumber}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </QueryState>
    </section>
  );
}
