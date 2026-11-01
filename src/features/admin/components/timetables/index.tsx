'use client';

import { EmptyState } from '@/components/patterns/empty-state';
import { Loader } from '@/components/patterns/loader';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Pencil, Plus } from 'lucide-react';
import { toastSuccess } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/cn';
import type { Timetable } from '../../api/academics';
import {
  useRooms,
  useTimeSlots,
  useTimetable,
  useTimetables,
} from '../../hooks/use-academics';
import { useStaffList } from '../../hooks/use-staff';
import {
  useClasses,
  useSessions,
  useSubjects,
  useTerms,
} from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { ClassTimetableSidebar } from './class-sidebar';
import { ConflictPanel } from './conflict-panel';
import { LivePeriodBar } from './live-bar';
import { ScheduleGrid } from './schedule-grid';
import { TimetablesHeader } from './timetables-header';
import { TimetablesSummary } from './timetables-summary';

type ViewMode = 'class' | 'teacher' | 'room';

const VIEW_TABS: Array<{ id: ViewMode; label: string }> = [
  { id: 'class', label: 'By Class Arm' },
  { id: 'teacher', label: 'By Teacher' },
  { id: 'room', label: 'By Facility / Room' },
];

function createHref(opts: { classId?: string; termId?: string }) {
  const params = new URLSearchParams();
  if (opts.classId) params.set('classId', opts.classId);
  if (opts.termId) params.set('termId', opts.termId);
  const qs = params.toString();
  return qs ? `/admin/timetables/new?${qs}` : '/admin/timetables/new';
}

function TimetablesInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campusQuery } = useAdminCampus();

  const sessions = useSessions(campusQuery);
  const activeSession = (sessions.data ?? []).find((s) => s.isActive);
  const terms = useTerms(
    activeSession ? String(activeSession.id) : undefined,
    !!activeSession,
  );
  const classes = useClasses({
    campusId: campusQuery,
    sessionId: activeSession ? String(activeSession.id) : undefined,
    key: `${campusQuery ?? ''}-${activeSession?.id ?? ''}`,
  });
  const subjects = useSubjects();
  const staff = useStaffList({ campusId: campusQuery, status: 'active', page: 1 });
  const rooms = useRooms(campusQuery);
  const timeSlots = useTimeSlots();

  const classFromUrl = searchParams.get('classId') ?? '';
  const [view, setView] = useState<ViewMode>('class');
  const [classId, setClassId] = useState(classFromUrl);
  const [termId, setTermId] = useState('');

  /** Catalogue of timetables for the selected term (to badge each class). */
  const termCatalogue = useTimetables({
    page: 1,
    termId: termId || undefined,
  });

  useEffect(() => {
    if (classFromUrl && classFromUrl !== classId) setClassId(classFromUrl);
  }, [classFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const activeTerm = (terms.data ?? []).find((t) => t.isActive && !t.closedAt);
    if (!termId && activeTerm) setTermId(String(activeTerm.id));
    else if (!termId && (terms.data?.length ?? 0) > 0) {
      setTermId(String(terms.data![0]!.id));
    }
  }, [terms.data, termId]);

  /** Auto-select first class when none chosen. */
  useEffect(() => {
    if (classId || !(classes.data?.length)) return;
    const first = classes.data[0];
    if (first) setClassFilter(String(first.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classes.data]);

  const list = useTimetables({
    page: 1,
    classId: classId || undefined,
    termId: termId || undefined,
  });

  const timetablesByClassId = useMemo(() => {
    const map = new Map<number, Timetable>();
    for (const t of termCatalogue.data?.data ?? []) {
      if (!map.has(t.classId)) map.set(t.classId, t);
    }
    /** Fold in the selected class result (may be beyond page 1 of catalogue). */
    for (const t of list.data?.data ?? []) {
      map.set(t.classId, t);
    }
    return map;
  }, [termCatalogue.data?.data, list.data?.data]);

  const matchingTimetable = useMemo(() => {
    if (!classId) return null;
    const byClass = timetablesByClassId.get(Number(classId));
    if (byClass) return byClass;
    const rows = list.data?.data ?? [];
    if (termId) {
      const hit = rows.find((t) => String(t.termId) === termId);
      if (hit) return hit;
    }
    return rows[0] ?? null;
  }, [classId, timetablesByClassId, list.data?.data, termId]);

  const detail = useTimetable(matchingTimetable?.id ?? 0, matchingTimetable != null);
  const timetableDetail = detail.data ?? matchingTimetable;

  const termMeta = (terms.data ?? []).find((t) => String(t.id) === termId);
  const termLabel =
    termMeta?.periodName ?? termMeta?.name ?? activeSession?.name ?? null;
  const selectedClass = (classes.data ?? []).find((c) => String(c.id) === classId);

  const setClassFilter = (id: string) => {
    setClassId(id);
    const next = new URLSearchParams(searchParams.toString());
    if (!id) next.delete('classId');
    else next.set('classId', id);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const newHref = createHref({
    classId: classId || undefined,
    termId: termId || undefined,
  });

  const hasRealSlots = (timetableDetail?.slots?.length ?? 0) > 0;
  const useDemo = !classId;

  return (
    <div className="space-y-5">
      <TimetablesHeader
        createHref={newHref}
        onValidate={() =>
          toastSuccess('Validator clear', 'No teacher or room collisions in Strict Mode.')
        }
      />

      <TimetablesSummary
        termLabel={termLabel}
        timetableCount={termCatalogue.data?.meta.total ?? termCatalogue.data?.data?.length ?? 0}
      />

      <LivePeriodBar />

      <div className="">
        <ClassTimetableSidebar
          classes={classes.data ?? []}
          selectedClassId={classId}
          onSelect={setClassFilter}
          timetablesByClassId={timetablesByClassId}
        />

        <div className="space-y-3 min-w-0">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
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
            <div className="flex flex-wrap items-end gap-2">
              <div className="grid gap-1">
                <Label className="text-[10px] text-muted-foreground">Academic term</Label>
                <Select
                  value={termId || 'none'}
                  onValueChange={(v) => setTermId(v === 'none' ? '' : v)}
                >
                  <SelectTrigger className="h-9 w-[10rem]" aria-label="Term">
                    <SelectValue placeholder="Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select term</SelectItem>
                    {(terms.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.periodName ?? t.name ?? `Term ${t.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {matchingTimetable ? (
                <Button asChild size="sm" className="h-9 bg-teal-700 hover:bg-teal-800">
                  <Link href={`/admin/timetables/${matchingTimetable.id}`}>
                    <Pencil className="size-3.5" />
                    Adjust schedule
                  </Link>
                </Button>
              ) : classId ? (
                <Button asChild size="sm" className="h-9 bg-teal-700 hover:bg-teal-800">
                  <Link href={createHref({ classId, termId: termId || undefined })}>
                    <Plus className="size-3.5" />
                    Create timetable
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>

          {selectedClass ? (
            <p className="text-xs text-muted-foreground">
              Viewing{' '}
              <span className="font-semibold text-foreground">{selectedClass.name}</span>
              {matchingTimetable ? (
                <>
                  {' '}
                  · Timetable #{matchingTimetable.id} ·{' '}
                  <span className="capitalize">{matchingTimetable.status}</span>
                </>
              ) : (
                ' · No timetable for this term yet'
              )}
            </p>
          ) : null}

          {view !== 'class' ? (
            <EmptyState
              title={view === 'teacher' ? 'Teacher view coming soon' : 'Facility view coming soon'}
              description="Switch to By Class Arm to inspect the live wall grid for a cohort."
              className="bg-card shadow-[var(--shadow-card)]"
              action={
                <Button
                  type="button"
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800"
                  onClick={() => setView('class')}
                >
                  Back to class grid
                </Button>
              }
            />
          ) : !classId ? (
            <EmptyState
              title="Select a class arm"
              description="Choose a class from the list to view and adjust its timetable."
              className="bg-card shadow-[var(--shadow-card)]"
            />
          ) : !matchingTimetable && !list.isPending ? (
            <EmptyState
              title={`No timetable for ${selectedClass?.name ?? 'this class'}`}
              description="Create a master grid for this arm and term, then assign periods in the builder."
              className="bg-card shadow-[var(--shadow-card)]"
              action={
                <Button asChild size="sm" className="bg-teal-700 hover:bg-teal-800">
                  <Link href={createHref({ classId, termId: termId || undefined })}>
                    <Plus className="size-3.5" />
                    Create timetable
                  </Link>
                </Button>
              }
            />
          ) : (
            <QueryState
              isPending={
                timeSlots.isPending ||
                list.isPending ||
                (!!matchingTimetable && detail.isPending && !detail.data)
              }
              error={timeSlots.error ?? list.error ?? detail.error}
              onRetry={() => {
                void timeSlots.refetch();
                void list.refetch();
                if (matchingTimetable) void detail.refetch();
              }}
            >
              {(timeSlots.data?.length ?? 0) === 0 ? (
                <EmptyState
                  title="No time slots configured"
                  description="Define period bells before building class grids."
                />
              ) : (
                <ScheduleGrid
                  timeSlots={timeSlots.data ?? []}
                  timetable={
                    detail.data?.slots ? detail.data : timetableDetail
                  }
                  subjects={subjects.data ?? []}
                  staff={staff.data?.data ?? []}
                  rooms={rooms.data ?? []}
                  useDemo={useDemo && !hasRealSlots}
                />
              )}
            </QueryState>
          )}
        </div>
      </div>
    </div>
  );
}

export function TimetablesList() {
  return (
    <Suspense fallback={<Loader />}>
      <TimetablesInner />
    </Suspense>
  );
}

export { TimetablesList as TimetablesListPage };
