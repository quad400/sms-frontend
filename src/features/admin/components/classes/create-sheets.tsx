'use client';

import { useMemo, useState } from 'react';
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
import { toastError, toastSuccess } from '@/lib/toast';
import type { Level } from '../../api/structure';
import { useCreateClass, useCreateLevel } from '../../hooks/use-structure';

const selectClass =
  'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground ' +
  'outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50';

const STAGE_ORDER = ['primary', 'jss', 'ss'] as const;
const STAGE_LABEL: Record<(typeof STAGE_ORDER)[number], string> = {
  primary: 'Primary',
  jss: 'Junior secondary',
  ss: 'Senior secondary',
};

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
    label:
      STAGE_LABEL[code as (typeof STAGE_ORDER)[number]] ??
      buckets.get(code)?.[0]?.stageName ??
      code,
    levels: buckets.get(code) ?? [],
  }));
}

export function ClassCreateSheets({
  createOpen,
  onCreateOpenChange,
  yearGroupOpen,
  onYearGroupOpenChange,
  levels,
  campusId,
  sessionId,
  sessionName,
  invalidateKey,
  preselectLevelId,
}: {
  createOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
  yearGroupOpen: boolean;
  onYearGroupOpenChange: (open: boolean) => void;
  levels: Level[];
  campusId?: string;
  sessionId: string;
  sessionName?: string | null;
  invalidateKey: string;
  preselectLevelId?: string;
}) {
  const [levelId, setLevelId] = useState(preselectLevelId ?? '');
  const [armName, setArmName] = useState('A');
  const [ygName, setYgName] = useState('');
  const [ygStage, setYgStage] = useState<(typeof STAGE_ORDER)[number]>('primary');

  const createClassMutation = useCreateClass(invalidateKey);
  const createLevelMutation = useCreateLevel();

  const levelsByStage = useMemo(() => groupLevelsByStage(levels), [levels]);

  const resetClassForm = () => {
    setArmName('A');
    setLevelId(preselectLevelId ?? '');
  };

  const resetYearGroupForm = () => {
    setYgName('');
    setYgStage('primary');
  };

  const canSubmitClass =
    !!levelId &&
    !!armName.trim() &&
    !!campusId &&
    !!sessionId &&
    !createClassMutation.isPending;

  const submitCreate = () => {
    if (!canSubmitClass) return;
    createClassMutation.mutate(
      {
        campusId: Number(campusId),
        sessionId: Number(sessionId),
        levelId: Number(levelId),
        armName: armName.trim(),
      },
      {
        onSuccess: () => {
          toastSuccess('Class created');
          onCreateOpenChange(false);
          resetClassForm();
        },
        onError: (e) => toastError('Could not create class', e.message),
      },
    );
  };

  const canSubmitYearGroup = !!ygName.trim() && !createLevelMutation.isPending;

  const submitYearGroup = () => {
    if (!canSubmitYearGroup) return;
    const nextOrdinal = Math.max(0, ...levels.map((l) => l.ordinal ?? 0)) + 1;
    createLevelMutation.mutate(
      { name: ygName.trim(), stageCode: ygStage, ordinal: nextOrdinal },
      {
        onSuccess: (created) => {
          toastSuccess('Year group created');
          onYearGroupOpenChange(false);
          resetYearGroupForm();
          setLevelId(String(created.id));
          onCreateOpenChange(true);
        },
        onError: (e) => toastError('Could not create year group', e.message),
      },
    );
  };

  return (
    <>
      <Sheet
        open={createOpen}
        onOpenChange={(open) => {
          onCreateOpenChange(open);
          if (open && preselectLevelId) setLevelId(preselectLevelId);
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
                Create a class arm for {sessionName ?? 'this session'} — e.g. Primary 4 A or
                JSS 2 B.
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
              <Button type="button" variant="outline" onClick={() => onCreateOpenChange(false)}>
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
          onYearGroupOpenChange(open);
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
                Custom year groups for this primary / secondary school (e.g. Nursery 1).
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="yg-stage">Stage</Label>
                <select
                  id="yg-stage"
                  className={selectClass}
                  value={ygStage}
                  onChange={(e) =>
                    setYgStage(e.target.value as (typeof STAGE_ORDER)[number])
                  }
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onYearGroupOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!canSubmitYearGroup}>
                {createLevelMutation.isPending ? 'Saving…' : 'Save year group'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
