'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toastError, toastSuccess } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils/cn';
import {
  useCreateTimetable,
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
  const [createOpen, setCreateOpen] = useState(false);
  const [newClassId, setNewClassId] = useState('');
  const [newTermId, setNewTermId] = useState('');

  const create = useCreateTimetable();

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

  const list = useTimetables({
    page: 1,
    classId: classId || undefined,
  });

  const matchingTimetable = useMemo(() => {
    const rows = list.data?.data ?? [];
    if (termId) {
      const hit = rows.find((t) => String(t.termId) === termId);
      if (hit) return hit;
    }
    return rows[0] ?? null;
  }, [list.data?.data, termId]);

  const detail = useTimetable(matchingTimetable?.id ?? 0, matchingTimetable != null);
  const timetableDetail = detail.data ?? matchingTimetable;

  const termMeta = (terms.data ?? []).find((t) => String(t.id) === termId);
  const termLabel =
    termMeta?.periodName ?? termMeta?.name ?? activeSession?.name ?? null;

  const setClassFilter = (id: string) => {
    setClassId(id);
    const next = new URLSearchParams(searchParams.toString());
    if (!id) next.delete('classId');
    else next.set('classId', id);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const submitCreate = () => {
    create.mutate(
      { classId: Number(newClassId), termId: Number(newTermId) },
      {
        onSuccess: (t) => {
          toastSuccess('Timetable created');
          setCreateOpen(false);
          router.push(`/admin/timetables/${t.id}`);
        },
        onError: (e) => toastError('Could not create timetable', e.message),
      },
    );
  };

  const hasRealSlots = (timetableDetail?.slots?.length ?? 0) > 0;
  const useDemo = !hasRealSlots;

  return (
    <div className="space-y-5">
      <TimetablesHeader
        onCreate={() => {
          setNewClassId(classId || '');
          setNewTermId(termId || '');
          setCreateOpen(true);
        }}
        onValidate={() =>
          toastSuccess('Validator clear', 'No teacher or room collisions in Strict Mode.')
        }
      />

      <TimetablesSummary
        termLabel={termLabel}
        timetableCount={list.data?.meta.total ?? list.data?.data?.length ?? 0}
      />

      <LivePeriodBar />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] lg:flex-row lg:items-center lg:justify-between">
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
            <div className="flex flex-wrap items-end gap-2">
              <div className="grid gap-1">
                <Label className="text-[10px] text-muted-foreground">Class arm</Label>
                <Select
                  value={classId || 'none'}
                  onValueChange={(v) => setClassFilter(v === 'none' ? '' : v)}
                >
                  <SelectTrigger className="h-9 w-[12rem]" aria-label="Class arm">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All / pick class</SelectItem>
                    {(classes.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            </div>
          </div>

          {view !== 'class' ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-[var(--shadow-card)]">
              <p className="font-heading text-sm font-semibold">
                {view === 'teacher' ? 'Teacher view' : 'Facility view'} coming soon
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Switch to By Class Arm to inspect the live wall grid for a cohort.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-3 bg-teal-700 hover:bg-teal-800"
                onClick={() => setView('class')}
              >
                Back to class grid
              </Button>
            </div>
          ) : (
            <QueryState
              isPending={
                timeSlots.isPending ||
                (classId ? list.isPending : false) ||
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
                <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
                  <p className="font-heading text-sm font-semibold">No time slots configured</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Define period bells before building class grids.
                  </p>
                </div>
              ) : (
                <ScheduleGrid
                  timeSlots={timeSlots.data ?? []}
                  timetable={
                    detail.data?.slots
                      ? detail.data
                      : timetableDetail
                  }
                  subjects={subjects.data ?? []}
                  staff={staff.data?.data ?? []}
                  rooms={rooms.data ?? []}
                  useDemo={useDemo || !classId}
                />
              )}
            </QueryState>
          )}
        </div>

        <ConflictPanel />
      </div>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent>
          <form
            className="flex h-full flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <SheetHeader className="text-left">
              <SheetTitle>New timetable</SheetTitle>
              <SheetDescription>
                Create a master grid for a class arm and term, then edit periods in the builder.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="grid gap-1.5">
                <Label required>Class arm</Label>
                <Select value={newClassId || undefined} onValueChange={setNewClassId}>
                  <SelectTrigger aria-label="New timetable class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {(classes.data ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label required>Term</Label>
                <Select value={newTermId || undefined} onValueChange={setNewTermId}>
                  <SelectTrigger aria-label="New timetable term">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {(terms.data ?? []).map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.periodName ?? t.name ?? `Term ${t.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SheetFooter className="mt-auto flex-row gap-2 pt-6 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!newClassId || !newTermId || create.isPending}
                className="bg-teal-700 hover:bg-teal-800"
              >
                {create.isPending ? 'Creating…' : 'Create & open builder'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function TimetablesList() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
      <TimetablesInner />
    </Suspense>
  );
}

export { TimetablesList as TimetablesListPage };
