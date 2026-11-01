'use client';

import { EmptyState } from '@/components/patterns/empty-state';
import Link from 'next/link';
import { BookMarked, GraduationCap, Layers, Pencil, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/patterns/status-badge';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import type { Level, Subject } from '../../api/structure';
import { useAllocations } from '../../hooks/use-academics';
import { useUpdateSubject } from '../../hooks/use-structure';
import { QueryState } from '../../lib/shared';
import { SUBJECTS_UI_MOCK, subjectExtraForId } from './ui-mock';

export function SubjectDetailPanel({
  subject,
  levels,
  curriculumLevelIds,
  onClose,
}: {
  subject: Subject;
  levels: Level[];
  curriculumLevelIds: number[];
  onClose?: () => void;
}) {
  const extra = subjectExtraForId(subject.id, subject.code);
  const update = useUpdateSubject();
  const allocations = useAllocations({
    subjectId: String(subject.id),
    page: 1,
  });

  const levelNames = levels
    .filter((l) => curriculumLevelIds.includes(l.id))
    .map((l) => l.name);

  const toggleActive = () => {
    update.mutate(
      { id: subject.id, body: { isActive: subject.isActive === false } },
      {
        onSuccess: () => toastSuccess('Subject updated'),
        onError: (e) => toastError('Could not update', e.message),
      },
    );
  };

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]">
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="info" size="sm" className="font-mono">
                {subject.code}
              </Badge>
              {extra.compulsory ? (
                <Badge variant="soft" size="sm">
                  Compulsory Core
                </Badge>
              ) : (
                <Badge variant="secondary" size="sm">
                  {extra.tier}
                </Badge>
              )}
              <StatusBadge status={subject.isActive === false ? 'inactive' : 'active'} />
            </div>
            <h2 className="mt-2 font-heading text-lg font-semibold tracking-tight">
              {subject.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {extra.department} · {extra.levelSpan}
            </p>
          </div>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              aria-label="Close inspection"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Layers className="size-3.5" />
            Syllabus Coverage
          </h3>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold tabular-nums">{extra.syllabusPct}% · Term 2</span>
              <span className="text-muted-foreground">Target 75%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-teal-600"
                style={{ width: `${Math.min(100, extra.syllabusPct)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Current module on track · {extra.periods} periods / week
            </p>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <BookMarked className="size-3.5" />
            Prescribed Textbooks
          </h3>
          <ul className="space-y-1.5">
            {SUBJECTS_UI_MOCK.textbooks.map((book) => (
              <li
                key={book}
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium"
              >
                {book}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Users className="size-3.5" />
            Classes teaching this subject
          </h3>
          <QueryState
            isPending={allocations.isPending}
            error={allocations.error}
            onRetry={() => void allocations.refetch()}
          >
            {(allocations.data?.data ?? []).length === 0 ? (
              <EmptyState
                title="Not allocated yet"
                description="Not allocated to any class yet."
                className="py-6"
              />
            ) : (
              <ul className="divide-y divide-border/70 overflow-hidden rounded-lg border border-border">
                {(allocations.data?.data ?? []).map((a) => (
                  <li key={a.id ?? `${a.classId}-${a.staffId}`} className="px-3 py-2.5 text-sm">
                    <p className="font-semibold">
                      {a.className ?? `Class ${a.classId}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.staffName ?? (a.staffId ? `Staff #${a.staffId}` : 'Unassigned')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </section>

        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <GraduationCap className="size-3.5" />
            Assessment Grading Scheme
          </h3>
          <div className="flex h-3 overflow-hidden rounded-full">
            {SUBJECTS_UI_MOCK.grading.map((g) => (
              <span
                key={g.id}
                className={cn(g.barClass)}
                style={{ width: `${g.pct}%` }}
                title={`${g.label} ${g.pct}%`}
              />
            ))}
          </div>
          <ul className="grid grid-cols-2 gap-1.5 text-[11px]">
            {SUBJECTS_UI_MOCK.grading.map((g) => (
              <li key={g.id} className="flex items-center gap-1.5 text-muted-foreground">
                <span className={cn('size-2 rounded-full', g.barClass)} />
                {g.label} · {g.pct}%
              </li>
            ))}
          </ul>
        </section>

        {levelNames.length > 0 ? (
          <section className="space-y-1.5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              On curriculum
            </h3>
            <div className="flex flex-wrap gap-1">
              {levelNames.map((n) => (
                <Badge key={n} variant="secondary" size="sm">
                  {n}
                </Badge>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="space-y-2 border-t border-border p-3">
        <PermissionGate permission="school-structure.subject.update">
          <Button asChild className="w-full bg-teal-700 hover:bg-teal-800">
            <Link href={`/admin/subjects/${subject.id}/edit`}>
              <Pencil className="size-3.5" />
              Edit subject
            </Link>
          </Button>
        </PermissionGate>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/admin/allocations?subjectId=${subject.id}`}>Allocations</Link>
          </Button>
          <PermissionGate permission="school-structure.subject.update">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={update.isPending}
              onClick={toggleActive}
            >
              {subject.isActive === false ? 'Activate' : 'Deactivate'}
            </Button>
          </PermissionGate>
        </div>
      </div>
    </aside>
  );
}
