'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, School } from 'lucide-react';
import { SectionCard } from '@/components/patterns/section-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PermissionGate } from '@/lib/auth/permissions';
import { fullName } from '../../types';
import { useStaffList } from '../../hooks/use-staff';
import { useClasses, useLevels, useSessions } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { ClassDetailPanel } from './class-detail-panel';
import { ClassesHeader } from './classes-header';
import { ClassesSummary } from './classes-summary';
import { ClassesTable } from './classes-table';
import { ClassCreateSheets } from './create-sheets';

const PAGE_SIZE = 8;

const selectClass =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground ' +
  'outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

/**
 * Class Management — UI shell first.
 * KPI / capacity / homeroom use presentational mock enrichment until APIs land.
 * Table + roster + form-tutor assign load real class / student / staff data.
 */
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

  const classIdParam = searchParams.get('classId');
  const selectedId =
    classIdParam && Number.isFinite(Number(classIdParam))
      ? Number(classIdParam)
      : null;

  const [qInput, setQInput] = useState('');
  const [q, setQ] = useState('');
  const [levelId, setLevelId] = useState('');
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [yearGroupOpen, setYearGroupOpen] = useState(false);
  const [preselectLevelId, setPreselectLevelId] = useState<string | undefined>();

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

  const assignedFormMasters = useMemo(
    () => (classes.data ?? []).filter((c) => c.formTeacherStaffId != null).length,
    [classes.data],
  );

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

  const openCreate = (lid?: number) => {
    setPreselectLevelId(lid != null ? String(lid) : undefined);
    setCreateOpen(true);
  };

  const needsScope = !activeSession || !effectiveCampusId;
  const hasYearGroups = (levels.data?.length ?? 0) > 0;

  return (
    <div className="space-y-5">
      <ClassesHeader
        sessionName={activeSessionMeta?.name}
        onCreateArm={() => openCreate()}
        onAddYearGroup={() => setYearGroupOpen(true)}
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
            armCount={(classes.data ?? []).length}
            assignedFormMasters={assignedFormMasters}
          />

          {!hasYearGroups && !levels.isPending ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <School className="size-6" aria-hidden />
              </span>
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  No year groups yet
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Add a year group, then create class arms for this session.
                </p>
              </div>
              <PermissionGate permission="school-structure.level.create">
                <Button type="button" onClick={() => setYearGroupOpen(true)}>
                  Add year group
                </Button>
              </PermissionGate>
            </div>
          ) : !classes.isPending && (classes.data?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <School className="size-6" aria-hidden />
              </span>
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  No classes yet
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Pick a year group and an arm (A, B, C) for{' '}
                  {activeSessionMeta?.name ?? 'this session'}.
                </p>
              </div>
              <PermissionGate permission="school-structure.class.create">
                <Button type="button" onClick={() => openCreate()}>
                  Create Class Arm
                </Button>
              </PermissionGate>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
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
                onSelect={setSelectedClassId}
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
                  invalidateKey={classesKey}
                />
              ) : (
                <aside className="hidden rounded-xl border border-dashed border-border bg-card/50 p-6 text-center lg:block lg:sticky lg:top-4">
                  <EyeHint />
                  <p className="mt-3 font-heading text-sm font-semibold">Inspect a class arm</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Select a row to review roster, form tutor, and quick actions.
                  </p>
                </aside>
              )}
            </div>
          )}
        </>
      )}

      <ClassCreateSheets
        createOpen={createOpen}
        onCreateOpenChange={setCreateOpen}
        yearGroupOpen={yearGroupOpen}
        onYearGroupOpenChange={setYearGroupOpen}
        levels={levels.data ?? []}
        campusId={effectiveCampusId}
        sessionId={activeSession}
        sessionName={activeSessionMeta?.name}
        invalidateKey={classesKey}
        preselectLevelId={preselectLevelId}
      />
    </div>
  );
}

function EyeHint() {
  return (
    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
      <School className="size-5" />
    </span>
  );
}

export { ClassesList as ClassesPage };
export { ClassDetailPage } from './class-detail-page';
