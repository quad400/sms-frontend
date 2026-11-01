'use client';

import { EmptyState } from '@/components/patterns/empty-state';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, School } from 'lucide-react';
import { SectionCard } from '@/components/patterns/section-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/lib/auth/permissions';
import { fullName } from '../../types';
import { useStaffList } from '../../hooks/use-staff';
import { useClasses, useLevels, useSessions, useSubjects } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { ClassDetailPanel } from './class-detail-panel';
import { ClassesHeader } from './classes-header';
import { ClassesSummary } from './classes-summary';
import { ClassesTable } from './classes-table';
import { cn } from '@/lib/utils/cn';

const PAGE_SIZE = 8;

const selectClass =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground ' +
  'outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

function newClassHref(opts: {
  sessionId?: string;
  levelId?: string;
  step?: 'year-group' | 'arm';
}) {
  const params = new URLSearchParams();
  if (opts.sessionId) params.set('sessionId', opts.sessionId);
  if (opts.levelId) params.set('levelId', opts.levelId);
  if (opts.step) params.set('step', opts.step);
  const qs = params.toString();
  return qs ? `/admin/classes/new?${qs}` : '/admin/classes/new';
}

export function ClassesList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campusQuery, density } = useAdminCampus();

  const sessions = useSessions(campusQuery);
  const [sessionId, setSessionId] = useState('');
  const defaultSessionId = sessions.data?.find((s) => s.isActive)?.id;
  const activeSession =
    sessionId || (defaultSessionId != null ? String(defaultSessionId) : '');
  const activeSessionMeta = sessions.data?.find((s) => String(s.id) === activeSession);
  const effectiveCampusId =
    campusQuery ??
    (activeSessionMeta?.campusId != null
      ? String(activeSessionMeta.campusId)
      : undefined);

  const levels = useLevels();
  const classesKey = `${effectiveCampusId ?? ''}-${activeSession}`;
  const classes = useClasses({
    campusId: effectiveCampusId,
    sessionId: activeSession || undefined,
    key: classesKey,
  });

  const staff = useStaffList(
    { campusId: effectiveCampusId, status: 'active', page: 1 },
    !!effectiveCampusId,
  );
  const subjects = useSubjects();

  const classIdParam = searchParams.get('classId');
  const selectedId =
    classIdParam && Number.isFinite(Number(classIdParam))
      ? Number(classIdParam)
      : null;

  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [levelId, setLevelId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setQ(qInput.trim().toLowerCase());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const staffNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of staff.data?.data ?? []) {
      map.set(s.id, fullName(s.firstName, s.lastName, s.middleName));
    }
    return map;
  }, [staff.data?.data]);

  const filtered = useMemo(() => {
    let rows = classes.data ?? [];
    if (levelId) {
      const lid = Number(levelId);
      rows = rows.filter((c) => c.levelId === lid);
    }
    if (q) {
      rows = rows.filter((c) => {
        const tutor =
          c.formTeacherStaffId != null
            ? staffNames.get(c.formTeacherStaffId) ?? ''
            : '';
        const hay = `${c.name} ${c.armName ?? ''} ${c.levelName ?? ''} ${tutor}`.toLowerCase();
        return hay.includes(q);
      });
    }
    return rows;
  }, [classes.data, levelId, q, staffNames]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSafe = Math.min(page, pages);
  const pageRows = useMemo(() => {
    const start = (pageSafe - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, pageSafe]);

  const selectedClass = useMemo(
    () => (classes.data ?? []).find((c) => c.id === selectedId) ?? null,
    [classes.data, selectedId],
  );

  const setSelectedClassId = (id: number | null) => {
    const next = new URLSearchParams(searchParams.toString());
    if (id == null) next.delete('classId');
    else next.set('classId', String(id));
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const needsScope = !activeSession || !effectiveCampusId;
  const hasYearGroups = (levels.data?.length ?? 0) > 0;

  const createHref = newClassHref({
    sessionId: activeSession || undefined,
    step: 'arm',
  });
  const yearGroupHref = newClassHref({
    sessionId: activeSession || undefined,
    step: 'year-group',
  });

  return (
    <div className="space-y-5">
      <ClassesHeader
        sessionName={activeSessionMeta?.name}
        createHref={needsScope ? undefined : createHref}
        yearGroupHref={needsScope ? undefined : yearGroupHref}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-end sm:justify-between">
        <div className="grid w-full max-w-xs gap-1.5">
          <Label htmlFor="classes-session" className="text-xs text-muted-foreground">
            Academic session
          </Label>
          <select
            id="classes-session"
            className={`${selectClass} font-medium`}
            value={activeSession}
            onChange={(e) => {
              setSessionId(e.target.value);
              setPage(1);
              setSelectedClassId(null);
            }}
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
      </div>

      {needsScope ? (
        <SectionCard title="Choose a session">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {!activeSession
                ? 'Select an academic session above. Each class belongs to that session’s campus.'
                : 'The selected session has no campus. Create or pick a session under Sessions & terms.'}
            </p>
          </div>
        </SectionCard>
      ) : (
        <>
          <ClassesSummary
            classes={classes.data ?? []}
            isPending={classes.isPending}
          />

          {!hasYearGroups && !levels.isPending ? (
            <EmptyState
              icon={School}
              title="No year groups yet"
              description="Add a year group, then create class arms for this session."
              action={
                <PermissionGate permission="school-structure.level.create">
                  <Button asChild>
                    <Link href={yearGroupHref}>Add year group</Link>
                  </Button>
                </PermissionGate>
              }
            />
          ) : !classes.isPending && (classes.data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={School}
              title="No classes yet"
              description={`Pick a year group and an arm (A, B, C) for ${activeSessionMeta?.name ?? 'this session'}.`}
              action={
                <PermissionGate permission="school-structure.class.create">
                  <Button asChild>
                    <Link href={createHref}>Create Class Arm</Link>
                  </Button>
                </PermissionGate>
              }
            />
          ) : (
            <div
              className={cn(
                'grid gap-4',
                selectedClass
                  ? 'lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]'
                  : 'grid-cols-1',
              )}
            >
              <ClassesTable
                rows={pageRows}
                allRows={classes.data ?? []}
                levels={levels.data ?? []}
                staffNames={staffNames}
                isPending={classes.isPending || levels.isPending}
                error={classes.error ?? levels.error}
                onRetry={() => {
                  void classes.refetch();
                  void levels.refetch();
                }}
                density={density}
                q={qInput}
                onQChange={setQInput}
                levelId={levelId}
                onLevelIdChange={(v) => {
                  setLevelId(v);
                  setPage(1);
                }}
                selectedId={selectedId}
                onSelect={(id) =>
                  setSelectedClassId(selectedId === id ? null : id)
                }
                page={pageSafe}
                pages={pages}
                total={total}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />

              {selectedClass ? (
                <ClassDetailPanel
                  schoolClass={selectedClass}
                  staff={staff.data?.data ?? []}
                  subjects={subjects.data ?? []}
                  invalidateKey={classesKey}
                  onClose={() => setSelectedClassId(null)}
                />
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { ClassesList as ClassesPage };
export { ClassDetailPage } from './class-detail-page';
