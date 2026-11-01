'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Layers, School } from 'lucide-react';
import { EmptyState } from '@/components/patterns/empty-state';
import { Fact } from '@/components/patterns/fact';
import { Loader } from '@/components/patterns/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Level, LevelStage } from '../../api/structure';
import {
  useClass,
  useCreateClass,
  useCreateLevel,
  useCreateLevelStage,
  useLevels,
  useLevelStages,
  useSessions,
  useUpdateClass,
} from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { Field } from '../students/admission/form-bits';
import {
  AdminWizardShell,
  AdminWizardStepCard,
  WizardDone,
  parseWizardStep,
  prevWizardStep,
} from '../wizards';

const STEPS = ['year-group', 'arm', 'done'] as const;
type Step = (typeof STEPS)[number];

const STEP_META: Record<Step, { label: string; description: string }> = {
  'year-group': {
    label: 'Year group',
    description: 'Stage & level',
  },
  arm: {
    label: 'Class arm',
    description: 'Stream letter',
  },
  done: {
    label: 'Done',
    description: 'Review and finish',
  },
};

function slugifyStageCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stageCodeOf(level: Level): string {
  return level.stage ?? level.stageCode ?? '';
}

function groupLevelsByStage(levels: Level[], stages: LevelStage[]) {
  const buckets = new Map<string, Level[]>();
  for (const level of levels) {
    const code = stageCodeOf(level);
    if (!code) continue;
    const arr = buckets.get(code) ?? [];
    arr.push(level);
    buckets.set(code, arr);
  }
  for (const arr of buckets.values()) {
    arr.sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0) || a.name.localeCompare(b.name));
  }
  const stageCodes = stages.map((s) => s.code);
  const labelByCode = new Map(stages.map((s) => [s.code, s.name]));
  const orderedCodes = [
    ...stageCodes.filter((c) => buckets.has(c)),
    ...[...buckets.keys()].filter((c) => !stageCodes.includes(c)),
  ];
  return orderedCodes.map((code) => ({
    code,
    label: labelByCode.get(code) ?? buckets.get(code)?.[0]?.stageName ?? code,
    levels: buckets.get(code) ?? [],
  }));
}

export function ClassWizard({
  mode = 'create',
  initialClassId,
}: {
  mode?: 'create' | 'edit';
  initialClassId?: number;
} = {}) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campusQuery } = useAdminCampus();

  const classIdParam = searchParams.get('classId');
  const classIdFromQuery =
    classIdParam && Number.isFinite(Number(classIdParam))
      ? Number(classIdParam)
      : null;
  const classId = initialClassId ?? classIdFromQuery;
  const step = parseWizardStep(searchParams.get('step'), STEPS, isEdit ? 'arm' : 'arm');

  const levelFromUrl = searchParams.get('levelId') ?? '';
  const sessionFromUrl = searchParams.get('sessionId') ?? '';

  const sessions = useSessions(campusQuery);
  const activeSession =
    sessionFromUrl ||
    (sessions.data?.find((s) => s.isActive)?.id != null
      ? String(sessions.data.find((s) => s.isActive)!.id)
      : '');
  const sessionMeta = sessions.data?.find((s) => String(s.id) === activeSession);
  const campusId =
    campusQuery ??
    (sessionMeta?.campusId != null ? String(sessionMeta.campusId) : undefined);

  const levels = useLevels();
  const stages = useLevelStages();
  const invalidateKey = `${campusId ?? ''}-${activeSession}`;
  const createClassMutation = useCreateClass(invalidateKey);
  const createLevelMutation = useCreateLevel();
  const createStageMutation = useCreateLevelStage();
  const updateClassMutation = useUpdateClass(invalidateKey);
  const classQuery = useClass(classId ?? 0, classId != null);
  const schoolClass = classQuery.data ?? null;

  const [levelId, setLevelId] = useState(levelFromUrl);
  const [armName, setArmName] = useState('A');
  const [ygName, setYgName] = useState('');
  const [ygStage, setYgStage] = useState('');
  const [creatingStage, setCreatingStage] = useState(false);
  const [stageName, setStageName] = useState('');
  const [stageCode, setStageCode] = useState('');
  const [stageCodeTouched, setStageCodeTouched] = useState(false);

  const hasStages = (stages.data?.length ?? 0) > 0;

  useEffect(() => {
    if (ygStage) return;
    const first = stages.data?.[0]?.code;
    if (first) setYgStage(first);
  }, [stages.data, ygStage]);

  useEffect(() => {
    if (!stages.isPending && !hasStages) setCreatingStage(true);
  }, [stages.isPending, hasStages]);

  useEffect(() => {
    if (!isEdit || initialClassId == null) return;
    const needsId = classIdFromQuery !== initialClassId;
    const needsStep = !searchParams.get('step');
    if (!needsId && !needsStep) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('classId', String(initialClassId));
    if (needsStep) params.set('step', 'arm');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [isEdit, initialClassId, classIdFromQuery, searchParams, pathname, router]);

  useEffect(() => {
    if (levelFromUrl && !levelId) setLevelId(levelFromUrl);
  }, [levelFromUrl, levelId]);

  useEffect(() => {
    if (!schoolClass) return;
    setLevelId(String(schoolClass.levelId));
    setArmName(schoolClass.armName ?? 'A');
  }, [schoolClass]);

  const setStepState = (next: {
    step: Step;
    id?: number | null;
    levelId?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const id = next.id === undefined ? classId : next.id;
    if (id != null) params.set('classId', String(id));
    else params.delete('classId');
    params.set('step', next.step);
    if (next.levelId != null) {
      if (next.levelId) params.set('levelId', next.levelId);
      else params.delete('levelId');
    }
    if (activeSession) params.set('sessionId', activeSession);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const levelsByStage = useMemo(
    () => groupLevelsByStage(levels.data ?? [], stages.data ?? []),
    [levels.data, stages.data],
  );

  const selectedLevel = useMemo(
    () => (levels.data ?? []).find((l) => String(l.id) === levelId) ?? null,
    [levels.data, levelId],
  );

  const hasLevels = (levels.data?.length ?? 0) > 0;

  const effectiveStep: Step = useMemo(() => {
    if (isEdit) {
      if (step === 'year-group') return 'arm';
      if (step === 'done' && classId == null) return 'arm';
      return step;
    }
    if (step === 'done' && classId == null) return 'arm';
    if (step === 'arm' && !hasLevels && !levels.isPending) return 'year-group';
    return step;
  }, [isEdit, step, classId, hasLevels, levels.isPending]);

  const goBack = () => {
    if (isEdit) {
      setStepState({ step: 'arm' });
      return;
    }
    const p = prevWizardStep(STEPS, effectiveStep);
    if (p) setStepState({ step: p });
  };

  const resetStageForm = () => {
    setStageName('');
    setStageCode('');
    setStageCodeTouched(false);
  };

  const submitStage = () => {
    createStageMutation.mutate(
      { code: stageCode.trim(), name: stageName.trim() },
      {
        onSuccess: (created) => {
          toastSuccess('Stage created');
          setYgStage(created.code);
          resetStageForm();
          setCreatingStage(false);
        },
        onError: (e) => toastError('Could not create stage', e.message),
      },
    );
  };

  const submitYearGroup = () => {
    const nextOrdinal =
      Math.max(0, ...(levels.data ?? []).map((l) => l.ordinal ?? 0)) + 1;
    createLevelMutation.mutate(
      { name: ygName.trim(), stageCode: ygStage, ordinal: nextOrdinal },
      {
        onSuccess: (created) => {
          toastSuccess('Year group created');
          setLevelId(String(created.id));
          setYgName('');
          setStepState({ step: 'arm', levelId: String(created.id) });
        },
        onError: (e) => toastError('Could not create year group', e.message),
      },
    );
  };

  const submitArm = () => {
    if (isEdit || classId != null) {
      updateClassMutation.mutate(
        {
          id: classId!,
          body: { armName: armName.trim() },
        },
        {
          onSuccess: (row) => {
            toastSuccess('Class updated');
            setStepState({ step: 'done', id: row.id });
          },
          onError: (e) => toastError('Could not update class', e.message),
        },
      );
      return;
    }
    if (!campusId || !activeSession || !levelId) return;
    createClassMutation.mutate(
      {
        campusId: Number(campusId),
        sessionId: Number(activeSession),
        levelId: Number(levelId),
        armName: armName.trim(),
      },
      {
        onSuccess: (row) => {
          toastSuccess('Class created');
          setStepState({ step: 'done', id: row.id });
        },
        onError: (e) => toastError('Could not create class', e.message),
      },
    );
  };

  const pending =
    createClassMutation.isPending ||
    updateClassMutation.isPending ||
    createLevelMutation.isPending ||
    createStageMutation.isPending;

  const steps = STEPS.filter((s) => !(isEdit && s === 'year-group')).map((s) => ({
    id: s,
    ...STEP_META[s],
    reachable: s === 'done' ? classId != null : true,
  }));

  if (!isEdit && (!activeSession || !campusId)) {
    return (
      <EmptyState
        title="Choose a session"
        description="Select an academic session on Class Management before creating an arm."
        className="bg-card shadow-[var(--shadow-card)]"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/classes">Back to classes</Link>
          </Button>
        }
      />
    );
  }

  const backHref =
    isEdit && classId != null ? `/admin/classes/${classId}` : '/admin/classes';

  return (
    <AdminWizardShell
      backHref={backHref}
      backLabel={isEdit ? 'Back to profile' : 'Back to Class Management'}
      title={isEdit ? 'Edit class arm' : 'Add class arm'}
      description={
        isEdit
          ? 'Update the arm letter for this cohort.'
          : `Create a class arm for ${sessionMeta?.name ?? 'this session'} — e.g. Primary 4 A.`
      }
      titleAddon={
        schoolClass?.name ? (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
            {schoolClass.name}
          </span>
        ) : sessionMeta?.name ? (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
            {sessionMeta.name}
          </span>
        ) : null
      }
      steps={steps}
      activeStep={effectiveStep}
      onStepChange={(id) => setStepState({ step: id as Step })}
      showStepBack={effectiveStep !== 'year-group' && !(isEdit && effectiveStep === 'arm')}
      onStepBack={goBack}
    >
      <QueryState
        isPending={isEdit && classQuery.isPending && !schoolClass}
        error={isEdit ? classQuery.error : null}
        onRetry={() => void classQuery.refetch()}
      >
        {effectiveStep === 'year-group' ? (
          <AdminWizardStepCard
            title={creatingStage ? 'Add stage' : 'Add year group'}
            description={
              creatingStage
                ? 'Stages group year levels — e.g. Primary, Junior secondary.'
                : 'Custom year groups for this school (e.g. Nursery 1). Skip if you already have levels.'
            }
          >
            {!creatingStage && hasLevels ? (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                <p className="text-muted-foreground">
                  Year groups already exist — you can create the arm now.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="bg-teal-700 hover:bg-teal-800"
                  onClick={() => setStepState({ step: 'arm' })}
                >
                  Continue to arm
                </Button>
              </div>
            ) : null}

            {creatingStage ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitStage();
                }}
              >
                <Field label="Name" required>
                  <Input
                    id="stage-name"
                    value={stageName}
                    onChange={(e) => {
                      const next = e.target.value;
                      setStageName(next);
                      if (!stageCodeTouched) setStageCode(slugifyStageCode(next));
                    }}
                    placeholder="e.g. Junior secondary"
                    autoComplete="off"
                  />
                </Field>
                <Field
                  label="Code"
                  required
                  hint="Stable identifier for year groups. Lowercase, no spaces."
                >
                  <Input
                    id="stage-code"
                    value={stageCode}
                    onChange={(e) => {
                      setStageCodeTouched(true);
                      setStageCode(slugifyStageCode(e.target.value));
                    }}
                    placeholder="e.g. jss"
                    autoComplete="off"
                  />
                </Field>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  {hasStages ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        resetStageForm();
                        setCreatingStage(false);
                      }}
                    >
                      Use existing stage
                    </Button>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={
                      !stageName.trim() ||
                      !stageCode.trim() ||
                      createStageMutation.isPending
                    }
                    className="bg-teal-700 hover:bg-teal-800"
                  >
                    {createStageMutation.isPending ? 'Saving…' : 'Save stage'}
                  </Button>
                </div>
              </form>
            ) : (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitYearGroup();
                }}
              >
                <Field
                  label="Stage"
                  required
                  action={
                    <button
                      type="button"
                      className="text-xs font-semibold text-teal-700 hover:underline"
                      onClick={() => setCreatingStage(true)}
                    >
                      New stage
                    </button>
                  }
                >
                  <Select
                    value={ygStage || undefined}
                    onValueChange={setYgStage}
                    disabled={stages.isPending || !hasStages}
                  >
                    <SelectTrigger aria-label="Stage">
                      <SelectValue
                        placeholder={
                          stages.isPending
                            ? 'Loading stages…'
                            : hasStages
                              ? 'Select stage'
                              : 'No stages yet'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(stages.data ?? []).map((stage) => (
                        <SelectItem key={stage.id} value={stage.code}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Name" required>
                  <Input
                    id="yg-name"
                    value={ygName}
                    onChange={(e) => setYgName(e.target.value)}
                    placeholder="e.g. Nursery 1"
                    autoComplete="off"
                  />
                </Field>
                <div className="flex flex-wrap justify-end gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={
                      !ygName.trim() ||
                      !ygStage ||
                      createLevelMutation.isPending ||
                      stages.isPending
                    }
                    className="bg-teal-700 hover:bg-teal-800"
                  >
                    {createLevelMutation.isPending ? 'Saving…' : 'Save & continue'}
                  </Button>
                </div>
              </form>
            )}
          </AdminWizardStepCard>
        ) : null}

        {effectiveStep === 'arm' ? (
          <AdminWizardStepCard
            title={isEdit ? 'Edit arm' : 'Class arm'}
            description="Pick a year group and arm letter (A, B, C…)."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submitArm();
              }}
            >
              {!isEdit ? (
                <Field
                  label="Year group"
                  required
                  action={
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="h-auto px-0 text-teal-700"
                      onClick={() => setStepState({ step: 'year-group' })}
                    >
                      Add year group
                    </Button>
                  }
                >
                  <Select
                    value={levelId || undefined}
                    onValueChange={setLevelId}
                  >
                    <SelectTrigger aria-label="Year group">
                      <SelectValue placeholder="Select year group…" />
                    </SelectTrigger>
                    <SelectContent>
                      {levelsByStage.map((group) => (
                        <SelectGroup key={group.code}>
                          <SelectLabel>{group.label}</SelectLabel>
                          {group.levels.map((l) => (
                            <SelectItem key={l.id} value={String(l.id)}>
                              {l.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              ) : (
                <Field label="Year group">
                  <Input
                    value={schoolClass?.levelName ?? selectedLevel?.name ?? `Level ${levelId}`}
                    disabled
                  />
                </Field>
              )}

              <Field
                label="Arm"
                required
                hint="Parallel stream in the same year group (A, B, C…)."
              >
                <Input
                  id="class-arm"
                  value={armName}
                  onChange={(e) => setArmName(e.target.value.toUpperCase())}
                  placeholder="A"
                  maxLength={10}
                  autoComplete="off"
                  className="max-w-[8rem] font-semibold tracking-wide"
                />
              </Field>

              {!isEdit && levelId && armName.trim() ? (
                <p className="rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2 text-sm text-teal-900">
                  Will create{' '}
                  <span className="font-semibold">
                    {(selectedLevel?.name ?? 'Year group') + armName.trim()}
                  </span>
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={
                    !armName.trim() ||
                    (!isEdit && (!levelId || !campusId || !activeSession)) ||
                    pending
                  }
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  {pending
                    ? 'Saving…'
                    : isEdit
                      ? 'Save & continue'
                      : 'Create & continue'}
                </Button>
              </div>
            </form>
          </AdminWizardStepCard>
        ) : null}

        {effectiveStep === 'done' && schoolClass ? (
          <WizardDone
            title={isEdit ? 'Class updated' : 'Class created'}
            description="Open the profile to assign a form tutor and view the roster."
            summary={
              <div className="overflow-hidden rounded-2xl border border-border bg-card text-left shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-4 border-b border-border bg-[linear-gradient(160deg,color-mix(in_oklab,var(--academic)_10%,transparent),transparent_72%)] p-5">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                    <School className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-heading text-lg font-semibold tracking-tight">
                      {schoolClass.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[
                        sessionMeta?.name,
                        schoolClass.levelStageName ?? schoolClass.levelStage,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Class arm'}
                    </p>
                  </div>
                </div>
                <div className="grid gap-0 sm:grid-cols-2">
                  <section className="space-y-3 border-b border-border p-5 sm:border-b-0 sm:border-r">
                    <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <Layers className="size-3.5" />
                      </span>
                      Details
                    </h3>
                    <Fact layout="inline" label="Year group" value={schoolClass.levelName} />
                    <Fact
                      layout="inline"
                      label="Arm"
                      value={schoolClass.armName ? String(schoolClass.armName) : null}
                    />
                    <Fact
                      layout="inline"
                      label="Stage"
                      value={schoolClass.levelStageName ?? schoolClass.levelStage}
                    />
                  </section>
                  <section className="space-y-3 p-5">
                    <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                        <School className="size-3.5" />
                      </span>
                      Placement
                    </h3>
                    <Fact layout="inline" label="Session" value={sessionMeta?.name} />
                    <Fact
                      layout="inline"
                      label="Students"
                      value={
                        schoolClass.studentCount != null
                          ? String(schoolClass.studentCount)
                          : '0'
                      }
                    />
                  </section>
                </div>
              </div>
            }
            primaryHref={`/admin/classes/${schoolClass.id}`}
            primaryLabel="View profile"
            secondaryHref="/admin/classes"
            secondaryLabel="Class directory"
            onAnother={
              !isEdit
                ? () => {
                    router.replace(
                      activeSession
                        ? `${pathname}?sessionId=${activeSession}`
                        : pathname,
                    );
                  }
                : undefined
            }
            anotherLabel="Add another arm"
          />
        ) : null}

        {effectiveStep === 'done' && classId != null && !schoolClass ? (
          <Loader variant="inline" label="Loading class" />
        ) : null}
      </QueryState>
    </AdminWizardShell>
  );
}
