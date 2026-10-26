'use client';

import { CalendarDays, Plus, School } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { SectionCard } from '@/components/patterns/section-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Level, SchoolClass } from '../../api/structure';
import {
  useClasses,
  useCreateClass,
  useCreateLevel,
  useLevels,
  useSessions,
} from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { ClassTile } from './class-tile';

const selectClass =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground ' +
  'outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

const STAGE_ORDER = ['primary', 'jss', 'ss'] as const;
const STAGE_LABEL: Record<(typeof STAGE_ORDER)[number], string> = {
  primary: 'Primary',
  jss: 'Junior secondary',
  ss: 'Senior secondary',
};

type LevelGroup = { levelId: number; name: string; rows: SchoolClass[] };

function stageCodeOf(level: Level): string {
  return level.stage ?? level.stageCode ?? 'primary';
}

function groupLevelsByStage(levels: Level[]) {
  const buckets = new Map<string, Level[]>();
  for (const level of levels) {
    const code = stageCodeOf(level);
    const arr = buckets.get(code) ?? [];
    arr.push(level);
    buckets.set(code, arr);
  }
  for (const arr of buckets.values()) {
    arr.sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0) || a.name.localeCompare(b.name));
  }
  const orderedCodes = [
    ...STAGE_ORDER.filter((c) => buckets.has(c)),
    ...[...buckets.keys()].filter((c) => !(STAGE_ORDER as readonly string[]).includes(c)),
  ];
  return orderedCodes.map((code) => ({
    code,
    label: STAGE_LABEL[code as (typeof STAGE_ORDER)[number]] ?? buckets.get(code)?.[0]?.stageName ?? code,
    levels: buckets.get(code) ?? [],
  }));
}

export function ClassesPage() {
  const { campusQuery } = useAdminCampus();
  const sessions = useSessions(campusQuery);
  const [sessionId, setSessionId] = useState('');

  const defaultSessionId = sessions.data?.find((s) => s.isActive)?.id;
  const activeSession = sessionId || (defaultSessionId != null ? String(defaultSessionId) : '');
  const activeSessionMeta = sessions.data?.find((s) => String(s.id) === activeSession);
  const effectiveCampusId =
    campusQuery ??
    (activeSessionMeta?.campusId != null ? String(activeSessionMeta.campusId) : undefined);

  const levels = useLevels();
  const classesKey = `${effectiveCampusId ?? ''}-${activeSession}`;
  const classes = useClasses({
    campusId: effectiveCampusId,
    sessionId: activeSession || undefined,
    key: classesKey,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [yearGroupOpen, setYearGroupOpen] = useState(false);
  const [levelId, setLevelId] = useState('');
  const [armName, setArmName] = useState('A');
  const [ygName, setYgName] = useState('');
  const [ygStage, setYgStage] = useState<(typeof STAGE_ORDER)[number]>('primary');

  const byLevel = useMemo<LevelGroup[]>(() => {
    const map = new Map<number, LevelGroup>();
    for (const c of classes.data ?? []) {
      const group = map.get(c.levelId) ?? {
        levelId: c.levelId,
        name: c.levelName ?? `Year group ${c.levelId}`,
        rows: [],
      };
      group.rows.push(c);
      map.set(c.levelId, group);
    }
    // Prefer school year-group order when levels are loaded.
    const order = new Map((levels.data ?? []).map((l, i) => [l.id, l.ordinal ?? i]));
    return [...map.values()].sort(
      (a, b) => (order.get(a.levelId) ?? 999) - (order.get(b.levelId) ?? 999),
    );
  }, [classes.data, levels.data]);

  const levelsByStage = useMemo(
    () => groupLevelsByStage(levels.data ?? []),
    [levels.data],
  );

  const createClassMutation = useCreateClass(classesKey);
  const createLevelMutation = useCreateLevel();

  const resetClassForm = () => {
    setArmName('A');
    setLevelId('');
  };

  const resetYearGroupForm = () => {
    setYgName('');
    setYgStage('primary');
  };

  const openCreate = (preselectLevelId?: number) => {
    setLevelId(preselectLevelId != null ? String(preselectLevelId) : '');
    setCreateOpen(true);
  };

  const canSubmitClass =
    !!levelId && !!armName.trim() && !!effectiveCampusId && !!activeSession && !createClassMutation.isPending;

  const submitCreate = () => {
    if (!canSubmitClass) return;
    createClassMutation.mutate(
      {
        campusId: Number(effectiveCampusId),
        sessionId: Number(activeSession),
        levelId: Number(levelId),
        armName: armName.trim(),
      },
      {
        onSuccess: () => {
          toastSuccess('Class created');
          setCreateOpen(false);
          resetClassForm();
        },
        onError: (e) => toastError('Could not create class', e.message),
      },
    );
  };

  const canSubmitYearGroup = !!ygName.trim() && !createLevelMutation.isPending;

  const submitYearGroup = () => {
    if (!canSubmitYearGroup) return;
    const nextOrdinal =
      Math.max(0, ...(levels.data ?? []).map((l) => l.ordinal ?? 0)) + 1;
    createLevelMutation.mutate(
      { name: ygName.trim(), stageCode: ygStage, ordinal: nextOrdinal },
      {
        onSuccess: (created) => {
          toastSuccess('Year group created');
          setYearGroupOpen(false);
          resetYearGroupForm();
          setLevelId(String(created.id));
          setCreateOpen(true);
        },
        onError: (e) => toastError('Could not create year group', e.message),
      },
    );
  };

  const needsScope = !activeSession || !effectiveCampusId;
  const hasYearGroups = (levels.data?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Classes"
        description="Primary and secondary year groups with arms for each academic session (e.g. Primary 3 A, JSS 1 B)."
        actions={
          <div className="flex flex-wrap gap-2">
            <PermissionGate permission="school-structure.level.create">
              <Button type="button" variant="outline" onClick={() => setYearGroupOpen(true)}>
                Add year group
              </Button>
            </PermissionGate>
            <PermissionGate permission="school-structure.class.create">
              <Button type="button" onClick={() => openCreate()} disabled={needsScope}>
                <Plus className="size-4" aria-hidden />
                Add class
              </Button>
            </PermissionGate>
          </div>
        }
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid w-full max-w-xs gap-1.5">
          <Label htmlFor="session-select" className="text-xs text-muted-foreground">
            Academic session
          </Label>
          <select
            id="session-select"
            className={`${selectClass} font-medium`}
            value={activeSession}
            onChange={(e) => setSessionId(e.target.value)}
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

        {!needsScope && !classes.isPending ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-heading text-lg font-semibold tabular-nums text-foreground">
              {classes.data?.length ?? 0}
            </span>{' '}
            classes in this session
          </p>
        ) : null}
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
        <QueryState
          isPending={classes.isPending || levels.isPending}
          error={classes.error ?? levels.error}
          onRetry={() => {
            void classes.refetch();
            void levels.refetch();
          }}
        >
          {!hasYearGroups ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <School className="size-6" aria-hidden />
              </span>
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  No year groups yet
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Seed Primary 1–6, JSS 1–3 and SS 1–3, or add a custom year group, then create
                  class arms.
                </p>
              </div>
              <PermissionGate permission="school-structure.level.create">
                <Button type="button" onClick={() => setYearGroupOpen(true)}>
                  Add year group
                </Button>
              </PermissionGate>
            </div>
          ) : byLevel.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <School className="size-6" aria-hidden />
              </span>
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  No classes yet
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Pick a year group (Primary 1, JSS 2, SS 1…) and an arm (A, B, C) for{' '}
                  {activeSessionMeta?.name ?? 'this session'}.
                </p>
              </div>
              <PermissionGate permission="school-structure.class.create">
                <Button type="button" onClick={() => openCreate()}>
                  <Plus className="size-4" aria-hidden />
                  Add first class
                </Button>
              </PermissionGate>
            </div>
          ) : (
            <div className="space-y-8">
              {byLevel.map(({ levelId: lid, name, rows }) => (
                <section key={lid} aria-labelledby={`level-${lid}`} className="space-y-3">
                  <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                    <div className="flex items-center gap-2.5">
                      <h2
                        id={`level-${lid}`}
                        className="font-heading text-lg font-semibold tracking-tight"
                      >
                        {name}
                      </h2>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
                        {rows.length} {rows.length === 1 ? 'arm' : 'arms'}
                      </span>
                    </div>
                    <PermissionGate permission="school-structure.class.create">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openCreate(lid)}
                      >
                        <Plus className="size-4" aria-hidden />
                        Add arm
                      </Button>
                    </PermissionGate>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {rows.map((c) => (
                      <li key={c.id}>
                        <ClassTile schoolClass={c} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </QueryState>
      )}

      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetClassForm();
        }}
      >
        <SheetContent>
          <form
            className="flex h-full flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <SheetHeader className="text-left">
              <SheetTitle>Add class</SheetTitle>
              <SheetDescription>
                Create a class arm for {activeSessionMeta?.name ?? 'this session'} — e.g. Primary
                4 A or JSS 2 B.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="class-year-group">Year group</Label>
                <select
                  id="class-year-group"
                  className={selectClass}
                  value={levelId}
                  onChange={(e) => setLevelId(e.target.value)}
                >
                  <option value="">Select year group…</option>
                  {levelsByStage.map((group) => (
                    <optgroup key={group.code} label={group.label}>
                      {group.levels.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {!hasYearGroups ? (
                  <p className="text-xs text-muted-foreground">
                    No year groups loaded. Add one or re-run the database seed.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Primary and secondary only — not tertiary courses or departments.
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="class-arm">Arm</Label>
                <Input
                  id="class-arm"
                  value={armName}
                  onChange={(e) => setArmName(e.target.value.toUpperCase())}
                  placeholder="A"
                  maxLength={10}
                  autoComplete="off"
                />
                <p className="text-xs text-muted-foreground">
                  Parallel stream in the same year group (A, B, C…).
                </p>
              </div>
            </div>

            <SheetFooter className="mt-auto flex-row gap-2 pt-6 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmitClass}>
                {createClassMutation.isPending ? 'Creating…' : 'Create class'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={yearGroupOpen}
        onOpenChange={(open) => {
          setYearGroupOpen(open);
          if (!open) resetYearGroupForm();
        }}
      >
        <SheetContent>
          <form
            className="flex h-full flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              submitYearGroup();
            }}
          >
            <SheetHeader className="text-left">
              <SheetTitle>Add year group</SheetTitle>
              <SheetDescription>
                Custom year groups for this primary / secondary school (e.g. Nursery 1). Defaults
                Primary 1–6, JSS 1–3, SS 1–3 come from seed.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="yg-stage">Stage</Label>
                <select
                  id="yg-stage"
                  className={selectClass}
                  value={ygStage}
                  onChange={(e) => setYgStage(e.target.value as (typeof STAGE_ORDER)[number])}
                >
                  {STAGE_ORDER.map((code) => (
                    <option key={code} value={code}>
                      {STAGE_LABEL[code]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="yg-name">Name</Label>
                <Input
                  id="yg-name"
                  value={ygName}
                  onChange={(e) => setYgName(e.target.value)}
                  placeholder="e.g. Nursery 1"
                  autoComplete="off"
                />
              </div>
            </div>

            <SheetFooter className="mt-auto flex-row gap-2 pt-6 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setYearGroupOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmitYearGroup}>
                {createLevelMutation.isPending ? 'Saving…' : 'Save year group'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
