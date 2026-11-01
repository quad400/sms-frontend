'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/patterns/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useCreateSubject,
  useSubjects,
  useUpdateSubject,
} from '../../hooks/use-structure';
import { QueryState } from '../../lib/shared';
import {
  AdminWizardShell,
  AdminWizardStepCard,
  WizardDone,
  parseWizardStep,
  prevWizardStep,
} from '../wizards';

const STEPS = ['details', 'done'] as const;
type Step = (typeof STEPS)[number];

const STEP_META: Record<Step, { label: string; description: string }> = {
  details: { label: 'Details', description: 'Code and name' },
  done: { label: 'Done', description: 'Review and finish' },
};

export function SubjectWizard({
  mode = 'create',
  initialSubjectId,
}: {
  mode?: 'create' | 'edit';
  initialSubjectId?: number;
} = {}) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const subjectIdParam = searchParams.get('subjectId');
  const subjectIdFromQuery =
    subjectIdParam && Number.isFinite(Number(subjectIdParam))
      ? Number(subjectIdParam)
      : null;
  const subjectId = initialSubjectId ?? subjectIdFromQuery;
  const step = parseWizardStep(searchParams.get('step'), STEPS, 'details');

  const subjects = useSubjects();
  const create = useCreateSubject();
  const update = useUpdateSubject();

  const subject = useMemo(
    () => (subjects.data ?? []).find((s) => s.id === subjectId) ?? null,
    [subjects.data, subjectId],
  );

  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isEdit || initialSubjectId == null) return;
    const needsId = subjectIdFromQuery !== initialSubjectId;
    const needsStep = !searchParams.get('step');
    if (!needsId && !needsStep) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('subjectId', String(initialSubjectId));
    if (needsStep) params.set('step', 'details');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [isEdit, initialSubjectId, subjectIdFromQuery, searchParams, pathname, router]);

  useEffect(() => {
    if (!subject) return;
    setCode(subject.code ?? '');
    setName(subject.name ?? '');
  }, [subject]);

  const setStepState = (next: { step: Step; id?: number | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    const id = next.id === undefined ? subjectId : next.id;
    if (id != null) params.set('subjectId', String(id));
    else params.delete('subjectId');
    params.set('step', next.step);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const effectiveStep: Step =
    step === 'done' && subjectId == null ? 'details' : step;

  const goBack = () => {
    const p = prevWizardStep(STEPS, effectiveStep);
    if (p) setStepState({ step: p });
  };

  const submit = () => {
    if (isEdit || subjectId != null) {
      update.mutate(
        {
          id: subjectId!,
          body: { name: name.trim(), ...(isEdit ? {} : { code: code.trim() }) },
        },
        {
          onSuccess: (row) => {
            toastSuccess('Subject updated');
            setStepState({ step: 'done', id: row.id });
          },
          onError: (e) => toastError('Could not update subject', e.message),
        },
      );
      return;
    }
    create.mutate(
      { code: code.trim(), name: name.trim() },
      {
        onSuccess: (row) => {
          toastSuccess('Subject created');
          setStepState({ step: 'done', id: row.id });
        },
        onError: (e) => toastError('Could not create subject', e.message),
      },
    );
  };

  const pending = create.isPending || update.isPending;
  const steps = STEPS.map((s) => ({
    id: s,
    ...STEP_META[s],
    reachable: s === 'details' || subjectId != null,
  }));

  return (
    <AdminWizardShell
      backHref="/admin/subjects"
      backLabel="Back to subjects"
      title={isEdit ? 'Edit subject' : 'Add subject'}
      description={
        isEdit
          ? 'Update the subject name in the curriculum registry.'
          : 'Create a subject code and name for the curriculum registry.'
      }
      titleAddon={
        subject?.code ? (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-teal-800">
            {subject.code}
          </span>
        ) : null
      }
      steps={steps}
      activeStep={effectiveStep}
      onStepChange={(id) => setStepState({ step: id as Step })}
      showStepBack={effectiveStep === 'done'}
      onStepBack={goBack}
    >
      <QueryState
        isPending={isEdit && subjects.isPending && !subject}
        error={isEdit ? subjects.error : null}
        onRetry={() => void subjects.refetch()}
      >
        {effectiveStep === 'details' ? (
          <AdminWizardStepCard
            title="Subject identity"
            description="Level mapping can follow from curriculum tools after create."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div className="grid gap-1.5">
                <Label required htmlFor="subject-code">
                  Code
                </Label>
                <Input
                  id="subject-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MTH-201"
                  autoComplete="off"
                  disabled={isEdit || subjectId != null}
                />
              </div>
              <div className="grid gap-1.5">
                <Label required htmlFor="subject-name">
                  Name
                </Label>
                <Input
                  id="subject-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. General Mathematics"
                  autoComplete="off"
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={!code.trim() || !name.trim() || pending}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  {pending
                    ? 'Saving…'
                    : isEdit || subjectId != null
                      ? 'Save & continue'
                      : 'Create & continue'}
                </Button>
              </div>
            </form>
          </AdminWizardStepCard>
        ) : null}

        {effectiveStep === 'done' && subject ? (
          <WizardDone
            title={isEdit ? 'Subject updated' : 'Subject created'}
            description="The subject is in the curriculum registry."
            summary={
              <div className="rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)]">
                <p className="font-semibold">{subject.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{subject.code}</p>
              </div>
            }
            primaryHref={`/admin/subjects?subjectId=${subject.id}`}
            primaryLabel="View in registry"
            secondaryHref="/admin/subjects"
            secondaryLabel="All subjects"
            onAnother={
              !isEdit
                ? () => {
                    router.replace(pathname);
                  }
                : undefined
            }
            anotherLabel="Add another subject"
          />
        ) : null}

        {effectiveStep === 'done' && subjectId != null && !subject ? (
          <Loader variant="inline" label="Loading subject" />
        ) : null}
      </QueryState>
    </AdminWizardShell>
  );
}
