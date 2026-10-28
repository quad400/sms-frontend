'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import { useStaffMember } from '../../../hooks/use-staff';
import { QueryState } from '../../../lib/shared';
import type { StaffRow } from '../../../types';
import { AllocationsStep } from './allocations-step';
import { ContactStep } from './contact-step';
import { DetailsStep } from './details-step';
import { DoneStep } from './done-step';
import {
  ONBOARDING_STEP_META,
  ONBOARDING_STEPS,
  nextOnboardingStep,
  parseOnboardingStep,
  prevOnboardingStep,
  type OnboardingStep,
} from './types';

export function StaffOnboardingWizard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can } = useSession();

  const staffIdParam = searchParams.get('staffId');
  const staffId =
    staffIdParam && Number.isFinite(Number(staffIdParam))
      ? Number(staffIdParam)
      : null;
  const step = parseOnboardingStep(searchParams.get('step'));

  const staffQuery = useStaffMember(staffId, staffId != null);
  const staff = staffQuery.data ?? null;

  const setStepState = useCallback(
    (next: { staffId?: number | null; step: OnboardingStep }) => {
      const params = new URLSearchParams(searchParams.toString());
      const id = next.staffId === undefined ? staffId : next.staffId;
      if (id != null) params.set('staffId', String(id));
      else params.delete('staffId');
      params.set('step', next.step);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, staffId],
  );

  const goNext = useCallback(() => {
    const n = nextOnboardingStep(step);
    if (n) setStepState({ step: n });
  }, [setStepState, step]);

  const goBack = useCallback(() => {
    const p = prevOnboardingStep(step);
    if (p) setStepState({ step: p });
  }, [setStepState, step]);

  const onStaffCreated = useCallback(
    (row: StaffRow) => {
      setStepState({ staffId: row.id, step: 'contact' });
    },
    [setStepState],
  );

  const onOnboardAnother = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  const effectiveStep: OnboardingStep = useMemo(() => {
    if (step !== 'details' && step !== 'done' && staffId == null) return 'details';
    if (step === 'done' && staffId == null) return 'details';
    return step;
  }, [step, staffId]);

  const stepLocked = (s: OnboardingStep): boolean => {
    const perm = ONBOARDING_STEP_META[s].permission;
    if (!perm) return false;
    return !can(perm);
  };

  const showLocked =
    effectiveStep !== 'details' &&
    effectiveStep !== 'done' &&
    stepLocked(effectiveStep);

  return (
    <div className="mx-auto space-y-5">
      <div className="space-y-3">
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to directory
        </Link>
        <PageHeader
          title="Onboard staff"
          description="Create the staff record, then add contact details and teaching allocations."
          titleAddon={
            staff?.staffNumber ? (
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-teal-800">
                {staff.staffNumber}
              </span>
            ) : null
          }
        />
      </div>

      <nav
        className="flex flex-wrap justify-between gap-1.5 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)]"
        aria-label="Onboarding steps"
      >
        {ONBOARDING_STEPS.map((s, index) => {
          const meta = ONBOARDING_STEP_META[s];
          const active = s === effectiveStep;
          const done =
            ONBOARDING_STEPS.indexOf(s) <
            ONBOARDING_STEPS.indexOf(effectiveStep);
          const locked = stepLocked(s);
          const reachable =
            s === 'details' ||
            (staffId != null && (done || active || s === 'done'));
          return (
            <button
              key={s}
              type="button"
              disabled={!reachable || (locked && s !== 'done')}
              onClick={() => {
                if (!reachable) return;
                if (locked && s !== 'done') return;
                setStepState({ step: s });
              }}
              className={cn(
                'inline-flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left transition sm:flex-none',
                active
                  ? 'bg-teal-700 text-white'
                  : done
                    ? 'bg-teal-50 text-teal-900 hover:bg-teal-100'
                    : 'text-muted-foreground hover:bg-muted',
                locked && !active ? 'opacity-60' : null,
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  active
                    ? 'bg-white/20 text-white'
                    : done
                      ? 'bg-teal-700 text-white'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {locked && s !== 'done' ? (
                  <Lock className="size-3" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">
                  {meta.label}
                </span>
                <span
                  className={cn(
                    'hidden truncate text-[11px] sm:block',
                    active ? 'text-white/80' : 'text-muted-foreground',
                  )}
                >
                  {meta.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {effectiveStep !== 'details' && effectiveStep !== 'done' ? (
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" onClick={goBack}>
            Back
          </Button>
        </div>
      ) : null}

      {showLocked ? (
        <LockedStep
          label={ONBOARDING_STEP_META[effectiveStep].label}
          onSkip={goNext}
          onBack={goBack}
        />
      ) : (
        <QueryState
          isPending={
            staffId != null &&
            staffQuery.isPending &&
            effectiveStep !== 'details'
          }
          error={staffId != null ? staffQuery.error : null}
          onRetry={() => void staffQuery.refetch()}
        >
          {effectiveStep === 'details' ? (
            <DetailsStep staffId={staffId} onCreated={onStaffCreated} />
          ) : null}

          {effectiveStep === 'contact' && staffId != null ? (
            <ContactStep
              staffId={staffId}
              onContinue={goNext}
              onSkip={goNext}
            />
          ) : null}

          {effectiveStep === 'allocations' && staffId != null ? (
            <AllocationsStep
              staffId={staffId}
              campusId={staff?.campusId}
              onContinue={goNext}
              onSkip={goNext}
            />
          ) : null}

          {effectiveStep === 'done' && staff ? (
            <DoneStep staff={staff} onOnboardAnother={onOnboardAnother} />
          ) : null}

          {effectiveStep === 'done' && staffId != null && !staff ? (
            <p className="text-sm text-muted-foreground">Loading staff…</p>
          ) : null}
        </QueryState>
      )}
    </div>
  );
}

function LockedStep({
  label,
  onSkip,
  onBack,
}: {
  label: string;
  onSkip: () => void;
  onBack: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)]">
      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Lock className="size-5" />
      </span>
      <p className="font-heading text-base font-semibold">
        You cannot complete {label.toLowerCase()}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Your role is missing permission for this step. Skip it or ask an admin to
        grant access.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          className="bg-teal-700 hover:bg-teal-800"
          onClick={onSkip}
        >
          Skip step
        </Button>
      </div>
    </div>
  );
}
