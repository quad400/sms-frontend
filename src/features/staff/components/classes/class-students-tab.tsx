'use client';

import { useId, useMemo, useState } from 'react';
import { Search, UsersRound } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useClassRoster } from '../../hooks/use-structure';
import { fullName, plural, statusLabel } from '../../lib/format';
import { QueryState } from '../../lib/shared';
import { EmptyPanel } from '../shared/panel';

export function ClassStudentsTab({ classId }: { classId: number }) {
  const roster = useClassRoster(classId);
  const searchId = useId();
  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const all = roster.data ?? [];
    if (!needle) return all;
    return all.filter((student) =>
      `${fullName(student.firstName, student.lastName, student.middleName)} ${student.studentNumber}`
        .toLowerCase()
        .includes(needle),
    );
  }, [roster.data, search]);

  return (
    <QueryState
      isPending={roster.isPending}
      error={roster.error}
      onRetry={() => void roster.refetch()}
      isEmpty={(roster.data ?? []).length === 0}
      empty={
        <EmptyPanel
          icon={UsersRound}
          title="No students on this roster"
          description="There are no active students enrolled in this class."
        />
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-muted-foreground">{plural(roster.data?.length ?? 0, 'student')}</p>
          <div className="relative w-full sm:w-64">
            <Label htmlFor={searchId} className="sr-only">
              Search students
            </Label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id={searchId}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or number"
              className="pl-9"
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyPanel title="No matches" description="No students match your search." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <table className="w-full min-w-[28rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="px-4 py-2.5">Student</th>
                  <th scope="col" className="px-4 py-2.5">Number</th>
                  <th scope="col" className="px-4 py-2.5">Gender</th>
                  <th scope="col" className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((student) => (
                  <tr key={student.id} className="border-b border-border/70 last:border-b-0">
                    <td className="px-4 py-2.5 font-medium">
                      {fullName(student.firstName, student.lastName, student.middleName)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                      {student.studentNumber}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{statusLabel(student.gender)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{statusLabel(student.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </QueryState>
  );
}
