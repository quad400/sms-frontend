'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, GraduationCap, UserRound } from 'lucide-react';
import { EmptyState } from '@/components/patterns/empty-state';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ApiClientError } from '@/lib/api/errors';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import { useAllocations, useSaveAllocations } from '../../hooks/use-academics';
import { useStaffList } from '../../hooks/use-staff';
import { useClasses, useSessions, useSubjects } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { fullName } from '../../types';
import { AllocationsHeader } from './allocations-header';
import { AllocationsSummary } from './allocations-summary';

type ViewMode = 'class' | 'teacher';

const VIEW_TABS: Array<{ id: ViewMode; label: string }> = [
  { id: 'class', label: 'By Class Arm' },
  { id: 'teacher', label: 'By Teacher' },
];

const selectClass =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground ' +
  'outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

export function AllocationsPage() {
  const { campusQuery } = useAdminCampus();
  const sessions = useSessions(campusQuery);
  const [sessionId, setSessionId] = useState('');
  const activeSession =
    sessionId ||
    (sessions.data?.find((s) => s.isActive)?.id != null
      ? String(sessions.data.find((s) => s.isActive)!.id)
      : '');
  const activeSessionMeta = sessions.data?.find((s) => String(s.id) === activeSession);

  const classes = useClasses({
    campusId: campusQuery,
    sessionId: activeSession || undefined,
    key: `${campusQuery ?? ''}-${activeSession}`,
  });
  const subjects = useSubjects();
  const staff = useStaffList({ page: 1, campusId: campusQuery, status: 'active' });

  const [classId, setClassId] = useState('');
  const [view, setView] = useState<ViewMode>('class');
  const allocations = useAllocations(
    {
      classId: classId || undefined,
      sessionId: activeSession || undefined,
      page: 1,
    },
    !!activeSession && (!!classId || view === 'teacher'),
  );

  const [map, setMap] = useState<Record<number, number>>({});
  useEffect(() => {
    const next: Record<number, number> = {};
    for (const row of allocations.data?.data ?? []) {
      if (!classId || row.classId === Number(classId)) next[row.subjectId] = row.staffId;
    }
    setMap(next);
  }, [allocations.data, classId]);

  const save = useSaveAllocations();

  const assignedCount = useMemo(
    () => Object.values(map).filter((id) => id > 0).length,
    [map],
  );
  const staffCovered = useMemo(
    () => new Set(Object.values(map).filter((id) => id > 0)).size,
    [map],
  );
  const selectedClass = (classes.data ?? []).find((c) => String(c.id) === classId);

  const teacherGroups = useMemo(() => {
    type Row = NonNullable<typeof allocations.data>['data'][number];
    const groups = new Map<
      number,
      { staffId: number; staffName: string; rows: Row[] }
    >();
    for (const a of allocations.data?.data ?? []) {
      const g = groups.get(a.staffId) ?? {
        staffId: a.staffId,
        staffName: a.staffName ?? `Staff #${a.staffId}`,
        rows: [] as Row[],
      };
      g.rows.push(a);
      groups.set(a.staffId, g);
    }
    return [...groups.values()].sort((a, b) => a.staffName.localeCompare(b.staffName));
  }, [allocations.data?.data]);

  function saveAllocations() {
    save.mutate(
      {
        map,
        classId,
        sessionId: activeSession,
        existing: allocations.data?.data ?? [],
      },
      {
        onSuccess: () => toastSuccess('Allocations saved'),
        onError: (e) => {
          if (
            e instanceof ApiClientError &&
            /clash|book|422/i.test(e.message + e.mapped.code)
          ) {
            toastError('Double booking', e.message);
            return;
          }
          toastError('Could not save', e.message);
        },
      },
    );
  }

  const canSave = view === 'class' && !!classId && !!activeSession;

  return (
    <div className="space-y-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
        Academic operations · Teaching load
      </p>

      <AllocationsHeader
        sessionLabel={activeSessionMeta?.name}
        onSave={canSave ? saveAllocations : undefined}
        saveDisabled={!canSave}
        savePending={save.isPending}
      />

      <AllocationsSummary
        subjectCount={(subjects.data ?? []).length}
        assignedCount={view === 'class' && classId ? assignedCount : 0}
        staffCovered={view === 'class' && classId ? staffCovered : teacherGroups.length}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {VIEW_TABS.map((t) => {
            const active = view === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setView(t.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'bg-teal-700 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="grid min-w-[10rem] gap-1">
            <Label className="text-[10px] text-muted-foreground">Academic session</Label>
            <select
              className={selectClass}
              value={activeSession}
              onChange={(e) => {
                setSessionId(e.target.value);
                setClassId('');
              }}
              aria-label="Session"
            >
              <option value="">Select session…</option>
              {(sessions.data ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.isActive ? ' (active)' : ''}
                </option>
              ))}
            </select>
          </div>
          {view === 'class' ? (
            <div className="grid min-w-[10rem] gap-1">
              <Label className="text-[10px] text-muted-foreground">Class arm</Label>
              <select
                className={selectClass}
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                aria-label="Class"
                disabled={!activeSession}
              >
                <option value="">Select class…</option>
                {(classes.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>

      {!activeSession ? (
        <EmptyState
          icon={GraduationCap}
          title="Choose a session"
          description="Allocations are scoped to an academic session."
          className="bg-card shadow-[var(--shadow-card)]"
        />
      ) : view === 'class' && !classId ? (
        <EmptyState
          icon={BookOpen}
          title="Select a class arm"
          description="Pick a cohort to map subjects to teachers."
          className="bg-card shadow-[var(--shadow-card)]"
        />
      ) : view === 'class' ? (
        <QueryState
          isPending={allocations.isPending || subjects.isPending || staff.isPending}
          error={allocations.error ?? subjects.error ?? staff.error}
          onRetry={() => {
            void allocations.refetch();
            void subjects.refetch();
            void staff.refetch();
          }}
        >
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
              <div>
                <h2 className="font-heading text-sm font-semibold tracking-tight">
                  {selectedClass?.name ?? 'Class'} · subject teachers
                </h2>
                <p className="text-xs text-muted-foreground">
                  {assignedCount} of {(subjects.data ?? []).length} subjects assigned
                </p>
              </div>
            </div>
            {(subjects.data ?? []).length === 0 ? (
              <EmptyState
                title="No subjects yet"
                description="Add subjects to the curriculum registry first."
                className="border-0 py-10"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2.5">Subject</th>
                      <th className="px-4 py-2.5">Code</th>
                      <th className="px-4 py-2.5">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(subjects.data ?? []).map((s) => {
                      const staffId = map[s.id] ?? 0;
                      return (
                        <tr
                          key={s.id}
                          className="border-b border-border/70 last:border-0 hover:bg-muted/20"
                        >
                          <td className="px-4 py-2.5 font-medium">{s.name}</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                              {s.code}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <select
                              className={cn(selectClass, 'h-9 max-w-xs')}
                              value={staffId || ''}
                              onChange={(e) =>
                                setMap((prev) => ({
                                  ...prev,
                                  [s.id]: e.target.value ? Number(e.target.value) : 0,
                                }))
                              }
                              aria-label={`Teacher for ${s.name}`}
                            >
                              <option value="">Unassigned</option>
                              {(staff.data?.data ?? []).map((st) => (
                                <option key={st.id} value={st.id}>
                                  {fullName(st.firstName, st.lastName, st.middleName)}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </QueryState>
      ) : (
        <QueryState
          isPending={allocations.isPending}
          error={allocations.error}
          onRetry={() => void allocations.refetch()}
        >
          {teacherGroups.length === 0 ? (
            <EmptyState
              icon={UserRound}
              title="No allocations yet"
              description="Assign teachers by class arm, then review load here."
              className="bg-card shadow-[var(--shadow-card)]"
              action={
                <Button
                  type="button"
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800"
                  onClick={() => setView('class')}
                >
                  Switch to class view
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {teacherGroups.map((g) => (
                <li key={g.staffId}>
                  <article className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                    <div className="flex items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <UserRound className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-heading text-sm font-semibold">
                          {g.staffName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {g.rows.length} allocation{g.rows.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                      {g.rows.map((a, i) => (
                        <li
                          key={a.id ?? `${a.classId}-${a.subjectId}-${i}`}
                          className="rounded-lg bg-muted/40 px-2.5 py-1.5 text-xs"
                        >
                          <span className="font-semibold text-foreground">
                            {a.className ?? `Class ${a.classId}`}
                          </span>
                          <span className="text-muted-foreground">
                            {' '}
                            · {a.subjectName ?? `Subject ${a.subjectId}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      )}
    </div>
  );
}
