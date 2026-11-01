'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { EmptyState } from '@/components/patterns/empty-state';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toastError, toastSuccess } from '@/lib/toast';
import { useCreateTimetable } from '../../hooks/use-academics';
import {
  useClasses,
  useSessions,
  useTerms,
} from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import {
  AdminWizardShell,
  AdminWizardStepCard,
} from '../wizards';

const STEPS = [{ id: 'placement', label: 'Placement', description: 'Class and term' }];

export function TimetableCreateWizard() {
  const router = useRouter();
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

  const create = useCreateTimetable();

  const [classId, setClassId] = useState(searchParams.get('classId') ?? '');
  const [termId, setTermId] = useState(searchParams.get('termId') ?? '');

  useEffect(() => {
    const activeTerm = (terms.data ?? []).find((t) => t.isActive && !t.closedAt);
    if (!termId && activeTerm) setTermId(String(activeTerm.id));
    else if (!termId && (terms.data?.length ?? 0) > 0) {
      setTermId(String(terms.data![0]!.id));
    }
  }, [terms.data, termId]);

  useEffect(() => {
    const fromUrl = searchParams.get('classId');
    if (fromUrl && fromUrl !== classId) setClassId(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const submit = () => {
    create.mutate(
      { classId: Number(classId), termId: Number(termId) },
      {
        onSuccess: (t) => {
          toastSuccess('Timetable created');
          router.push(`/admin/timetables/${t.id}`);
        },
        onError: (e) => toastError('Could not create timetable', e.message),
      },
    );
  };

  if (!campusQuery || !activeSession) {
    return (
      <EmptyState
        title={!campusQuery ? 'Select a campus' : 'No active session'}
        description="Timetables need a campus and active session before you can place a grid."
        className="bg-card shadow-[var(--shadow-card)]"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/timetables">Back to timetables</Link>
          </Button>
        }
      />
    );
  }

  return (
    <AdminWizardShell
      backHref="/admin/timetables"
      backLabel="Back to timetables"
      title="New timetable"
      description="Create a master grid for a class arm and term, then edit periods in the builder."
      titleAddon={
        activeSession.name ? (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800">
            {activeSession.name}
          </span>
        ) : null
      }
      steps={STEPS}
      activeStep="placement"
      onStepChange={() => undefined}
    >
      <AdminWizardStepCard
        title="Class & term"
        description="After create you will open the period builder for this arm."
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="grid gap-1.5">
            <Label required>Class arm</Label>
            <Select value={classId || undefined} onValueChange={setClassId}>
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
            <Select value={termId || undefined} onValueChange={setTermId}>
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
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button asChild variant="outline">
              <Link href="/admin/timetables">Cancel</Link>
            </Button>
            <Button
              type="submit"
              disabled={!classId || !termId || create.isPending}
              className="bg-teal-700 hover:bg-teal-800"
            >
              {create.isPending ? 'Creating…' : 'Create & open builder'}
            </Button>
          </div>
        </form>
      </AdminWizardStepCard>
    </AdminWizardShell>
  );
}
