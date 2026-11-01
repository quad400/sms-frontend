'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { EmptyState } from '@/components/patterns/empty-state';
import { Loader } from '@/components/patterns/loader';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useCreateSession,
  useSession,
  useUpdateSession,
} from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
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
  details: { label: 'Details', description: 'Name and calendar dates' },
  done: { label: 'Done', description: 'Review and finish' },
};

const STRUCTURE_SESSIONS = '/admin/campuses?tab=sessions';

export function SessionWizard({
  mode = 'create',
  initialSessionId,
}: {
  mode?: 'create' | 'edit';
  initialSessionId?: number;
} = {}) {
  const isEdit = mode === 'edit';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { campusQuery } = useAdminCampus();

  const sessionIdParam = searchParams.get('sessionId');
  const sessionIdFromQuery =
    sessionIdParam && Number.isFinite(Number(sessionIdParam))
      ? Number(sessionIdParam)
      : null;
  const sessionId = initialSessionId ?? sessionIdFromQuery;
  const step = parseWizardStep(searchParams.get('step'), STEPS, 'details');

  const detail = useSession(sessionId);
  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession();
  const session = detail.data ?? null;

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isEdit || initialSessionId == null) return;
    const needsId = sessionIdFromQuery !== initialSessionId;
    const needsStep = !searchParams.get('step');
    if (!needsId && !needsStep) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sessionId', String(initialSessionId));
    if (needsStep) params.set('step', 'details');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [isEdit, initialSessionId, sessionIdFromQuery, searchParams, pathname, router]);

  useEffect(() => {
    if (!session) return;
    setName(session.name ?? '');
    setStartDate(session.startDate ?? '');
    setEndDate(session.endDate ?? '');
  }, [session]);

  const setStepState = (next: { step: Step; id?: number | null }) => {
    const params = new URLSearchParams(searchParams.toString());
    const id = next.id === undefined ? sessionId : next.id;
    if (id != null) params.set('sessionId', String(id));
    else params.delete('sessionId');
    params.set('step', next.step);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const effectiveStep: Step =
    step === 'done' && sessionId == null ? 'details' : step;

  const goBack = () => {
    const p = prevWizardStep(STEPS, effectiveStep);
    if (p) setStepState({ step: p });
  };

  const submit = () => {
    if (isEdit || sessionId != null) {
      updateMutation.mutate(
        {
          id: sessionId!,
          body: { name: name.trim(), startDate, endDate },
        },
        {
          onSuccess: (row) => {
            toastSuccess('Session updated');
            setStepState({ step: 'done', id: row.id });
          },
          onError: (e) => toastError('Could not update session', e.message),
        },
      );
      return;
    }
    if (!campusQuery) return;
    createMutation.mutate(
      {
        campusId: Number(campusQuery),
        name: name.trim(),
        startDate,
        endDate,
      },
      {
        onSuccess: (row) => {
          toastSuccess('Session created');
          setStepState({ step: 'done', id: row.id });
        },
        onError: (e) => toastError('Could not create session', e.message),
      },
    );
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const steps = STEPS.map((s) => ({
    id: s,
    ...STEP_META[s],
    reachable: s === 'details' || sessionId != null,
  }));

  if (!campusQuery && !isEdit) {
    return (
      <div className="space-y-5">
        <EmptyState
          title="Select a campus"
          description="Sessions are scoped to the campus in the shell switcher."
          className="bg-card shadow-[var(--shadow-card)]"
          action={
            <Button asChild variant="outline" size="sm">
              <a href={STRUCTURE_SESSIONS}>Back to structure</a>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <AdminWizardShell
      backHref={STRUCTURE_SESSIONS}
      backLabel="Back to sessions"
      title={isEdit ? 'Edit session' : 'New session'}
      description={
        isEdit
          ? 'Update the academic year name and calendar dates.'
          : 'Create an academic year for the current campus. Terms are managed after creation.'
      }
      titleAddon={
        session?.name ? (
          <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-800">
            {session.name}
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
        isPending={isEdit && detail.isPending && !session}
        error={isEdit ? detail.error : null}
        onRetry={() => void detail.refetch()}
      >
        {effectiveStep === 'details' ? (
          <AdminWizardStepCard
            title="Session calendar"
            description="Name the year and set the inclusive start and end dates."
          >
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div className="grid gap-1.5">
                <Label required htmlFor="session-name">
                  Name
                </Label>
                <Input
                  id="session-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2026/2027"
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>Start date</Label>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Select start"
                  aria-label="Session start"
                />
              </div>
              <div className="grid gap-1.5">
                <Label required>End date</Label>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Select end"
                  aria-label="Session end"
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={!name.trim() || !startDate || !endDate || pending}
                  className="bg-teal-700 hover:bg-teal-800"
                >
                  {pending
                    ? 'Saving…'
                    : isEdit || sessionId != null
                      ? 'Save & continue'
                      : 'Create & continue'}
                </Button>
              </div>
            </form>
          </AdminWizardStepCard>
        ) : null}

        {effectiveStep === 'done' && session ? (
          <WizardDone
            title={isEdit ? 'Session updated' : 'Session created'}
            description="Activate the session and manage terms from the structure hub."
            summary={
              <div className="rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)]">
                <p className="font-semibold">{session.name}</p>
                {session.startDate && session.endDate ? (
                  <p className="text-xs text-muted-foreground">
                    {session.startDate} → {session.endDate}
                  </p>
                ) : null}
              </div>
            }
            primaryHref={STRUCTURE_SESSIONS}
            primaryLabel="View sessions"
            secondaryHref="/admin/classes"
            secondaryLabel="Class management"
            onAnother={
              !isEdit
                ? () => {
                    router.replace(pathname);
                  }
                : undefined
            }
            anotherLabel="Add another session"
          />
        ) : null}

        {effectiveStep === 'done' && sessionId != null && !session ? (
          <Loader variant="inline" label="Loading session" />
        ) : null}
      </QueryState>
    </AdminWizardShell>
  );
}
