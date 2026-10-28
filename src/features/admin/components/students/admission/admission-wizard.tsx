'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import { useStudent } from '../../../hooks/use-students';
import { QueryState } from '../../../lib/shared';
import type { StudentRow } from '../../../types';
import { DetailsStep } from './details-step';
import { DoneStep } from './done-step';
import { EnrolmentStep } from './enrolment-step';
import { GuardianStep } from './guardian-step';
import { MedicalStep } from './medical-step';
import {
  ADMISSION_STEP_META,
  ADMISSION_STEPS,
  nextAdmissionStep,
  parseAdmissionStep,
  prevAdmissionStep,
  type AdmissionStep,
} from './types';

export function AdmissionWizard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { can } = useSession();

  const studentIdParam = searchParams.get('studentId');
  const studentId =
    studentIdParam && Number.isFinite(Number(studentIdParam))
      ? Number(studentIdParam)
      : null;
  const step = parseAdmissionStep(searchParams.get('step'));

  const studentQuery = useStudent(studentId, studentId != null);
  const student = studentQuery.data ?? null;

  const setStepState = useCallback(
    (next: { studentId?: number | null; step: AdmissionStep }) => {
      const params = new URLSearchParams(searchParams.toString());
      const id = next.studentId === undefined ? studentId : next.studentId;
      if (id != null) params.set('studentId', String(id));
      else params.delete('studentId');
      params.set('step', next.step);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, studentId],
  );

  const goNext = useCallback(() => {
    const n = nextAdmissionStep(step);
    if (n) setStepState({ step: n });
  }, [setStepState, step]);

  const goBack = useCallback(() => {
    const p = prevAdmissionStep(step);
    if (p) setStepState({ step: p });
  }, [setStepState, step]);

  const onStudentCreated = useCallback(
    (row: StudentRow) => {
      setStepState({ studentId: row.id, step: 'guardian' });
    },
    [setStepState],
  );

  const onAdmitAnother = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  /** Steps that need a studentId cannot run without one. */
  const effectiveStep: AdmissionStep = useMemo(() => {
    if (step !== 'details' && step !== 'done' && studentId == null) return 'details';
    if (step === 'done' && studentId == null) return 'details';
    return step;
  }, [step, studentId]);

  const stepLocked = (s: AdmissionStep): boolean => {
    const perm = ADMISSION_STEP_META[s].permission;
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
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to directory
        </Link>
        <PageHeader
          title="Admit student"
          description="Create the student record, then add guardian, class enrolment, and medical details."
          titleAddon={
            student?.studentNumber ? (
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-teal-800">
                {student.studentNumber}
              </span>
            ) : null
          }
        />
      </div>

      <nav
        className="flex flex-wrap justify-between gap-1.5 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)]"
        aria-label="Admission steps"
      >
        {ADMISSION_STEPS.map((s, index) => {
          const meta = ADMISSION_STEP_META[s];
          const active = s === effectiveStep;
          const done =
            ADMISSION_STEPS.indexOf(s) < ADMISSION_STEPS.indexOf(effectiveStep);
          const locked = stepLocked(s);
          const reachable =
            s === 'details' ||
            (studentId != null && (done || active || s === 'done'));
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
                {locked && s !== 'done' ? <Lock className="size-3" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold">{meta.label}</span>
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
          label={ADMISSION_STEP_META[effectiveStep].label}
          onSkip={goNext}
          onBack={goBack}
        />
      ) : (
        <QueryState
          isPending={studentId != null && studentQuery.isPending && effectiveStep !== 'details'}
          error={studentId != null ? studentQuery.error : null}
          onRetry={() => void studentQuery.refetch()}
        >
          {effectiveStep === 'details' ? (
            <DetailsStep studentId={studentId} onCreated={onStudentCreated} />
          ) : null}

          {effectiveStep === 'guardian' && studentId != null ? (
            <GuardianStep
              studentId={studentId}
              onContinue={goNext}
              onSkip={goNext}
            />
          ) : null}

          {effectiveStep === 'enrolment' && studentId != null ? (
            <EnrolmentStep
              studentId={studentId}
              campusId={student?.campusId}
              onContinue={goNext}
              onSkip={goNext}
            />
          ) : null}

          {effectiveStep === 'medical' && studentId != null ? (
            <MedicalStep
              studentId={studentId}
              onContinue={goNext}
              onSkip={goNext}
            />
          ) : null}

          {effectiveStep === 'done' && student ? (
            <DoneStep student={student} onAdmitAnother={onAdmitAnother} />
          ) : null}

          {effectiveStep === 'done' && studentId != null && !student ? (
            <p className="text-sm text-muted-foreground">Loading student…</p>
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
        Your role is missing permission for this step. Skip it or ask an admin to grant access.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" className="bg-teal-700 hover:bg-teal-800" onClick={onSkip}>
          Skip step
        </Button>
      </div>
    </div>
  );
}
