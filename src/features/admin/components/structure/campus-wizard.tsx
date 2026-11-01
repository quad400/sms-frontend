'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader } from '@/components/patterns/loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import { useCampuses, useSaveCampus } from '../../hooks/use-structure';
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
  details: { label: 'Details', description: 'Code and display name' },
  done: { label: 'Done', description: 'Review and finish' },
};

export function CampusWizard({
  mode = 'create',
  initialCampusId,
}: {
  mode?: 'create' | 'edit';
  initialCampusId?: number;
} = {}) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const campusIdParam = searchParams.get('campusId');
  const campusIdFromQuery =
    campusIdParam && Number.isFinite(Number(campusIdParam))
      ? Number(campusIdParam)
      : null;
  const campusId = initialCampusId ?? campusIdFromQuery;
  const step = parseWizardStep(searchParams.get('step'), STEPS, 'details');

  const campuses = useCampuses();
  const saveCampus = useSaveCampus();

  const campus = useMemo(
    () => (campuses.data ?? []).find((c) => c.id === campusId) ?? null,
    [campuses.data, campusId],
  );

  const [code, setCode] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isEdit || initialCampusId == null) return;
    const needsId = campusIdFromQuery !== initialCampusId;
    const needsStep = !searchParams.get('step');
    if (!needsId && !needsStep) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('campusId', String(initialCampusId));
    if (needsStep) params.set('step', 'details');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [isEdit, initialCampusId, campusIdFromQuery, searchParams, pathname, router]);

  useEffect(() => {
    if (!campus) return;
    setName(campus.name);
    setCode(campus.code ?? '');
  }, [campus]);

  const setStepState = (next: { step: Step; id?: number | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    const id = next.id === undefined ? campusId : next.id;
    if (id != null) params.set('campusId', String(id));
    else params.delete('campusId');
    params.set('step', next.step);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const effectiveStep: Step =
    step === 'done' && campusId == null ? 'details' : step;

  const goBack = () => {
    const p = prevWizardStep(STEPS, effectiveStep);
    if (p) setStepState({ step: p });
  };

  const submit = () => {
    saveCampus.mutate(
      {
        editId: isEdit || campusId != null ? campusId ?? undefined : undefined,
        code: code.trim(),
        name: name.trim(),
      },
      {
        onSuccess: (row) => {
          toastSuccess(isEdit || campusId != null ? 'Campus updated' : 'Campus created');
          setStepState({ step: 'done', id: row.id });
        },
        onError: (e) => toastError('Could not save campus', e.message),
      },
    );
  };

  const steps = STEPS.map((s) => ({
    id: s,
    ...STEP_META[s],
    reachable: s === 'details' || campusId != null,
  }));

  return (
    <AdminWizardShell
      backHref="/admin/campuses"
      backLabel="Back to campuses"
      title={isEdit ? 'Edit campus' : 'Add campus'}
      description={
        isEdit
          ? 'Update the display name for this site.'
          : 'Create a campus code and name used across sessions and people.'
      }
      titleAddon={
        campus?.code ? (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-teal-800">
            {campus.code}
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
        isPending={isEdit && campuses.isPending && !campus}
        error={isEdit ? campuses.error : null}
        onRetry={() => void campuses.refetch()}
      >
        {effectiveStep === 'details' ? (
          <AdminWizardStepCard
            title="Campus details"
            description="Code is fixed after create; name can change anytime."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div className="grid gap-1.5">
                <Label required htmlFor="campus-code">
                  Code
                </Label>
                <Input
                  id="campus-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MAIN"
                  autoComplete="off"
                  disabled={isEdit || campusId != null}
                />
              </div>
              <div className="grid gap-1.5">
                <Label required htmlFor="campus-name">
                  Name
                </Label>
                <Input
                  id="campus-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Main Campus"
                  autoComplete="organization"
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={
                    !name.trim() ||
                    (!(isEdit || campusId != null) && !code.trim()) ||
                    saveCampus.isPending
                  }
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  {saveCampus.isPending
                    ? 'Saving…'
                    : isEdit || campusId != null
                      ? 'Save & continue'
                      : 'Create & continue'}
                </Button>
              </div>
            </form>
          </AdminWizardStepCard>
        ) : null}

        {effectiveStep === 'done' && campus ? (
          <WizardDone
            title={isEdit ? 'Campus updated' : 'Campus created'}
            description="The site is ready for sessions, classes, and people."
            summary={
              <div className="rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)]">
                <p className="font-semibold">{campus.name}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {campus.code || `CAMP-${campus.id}`}
                </p>
              </div>
            }
            primaryHref="/admin/campuses"
            primaryLabel="View campuses"
            secondaryHref="/admin/sessions"
            secondaryLabel="Manage sessions"
            onAnother={
              !isEdit
                ? () => {
                    router.replace(pathname);
                  }
                : undefined
            }
            anotherLabel="Add another campus"
          />
        ) : null}

        {effectiveStep === 'done' && campusId != null && !campus ? (
          <Loader variant="inline" label="Loading campus" />
        ) : null}
      </QueryState>
    </AdminWizardShell>
  );
}
