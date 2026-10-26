'use client';

import { useMemo, useState } from 'react';
import { BookOpenCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { useLessonPlans } from '../../hooks/use-lessons';
import { useStaffLookups } from '../../hooks/use-staff-lookups';
import { formatDate } from '../../lib/format';
import { QueryState } from '../../lib/shared';
import type { LessonPlan } from '../../types';
import { EmptyPanel } from '../shared/panel';
import { StatusBadge } from '../shared/status-badge';
import { LessonPlanSheet } from './lesson-plan-sheet';

export function LessonPlansTab() {
  const { can } = useSession();
  const lookups = useStaffLookups();
  const plans = useLessonPlans();
  const [selected, setSelected] = useState<LessonPlan | null>(null);
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () => [...(plans.data?.data ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [plans.data],
  );
  const canCreate = can('academics.lesson-plan.create');

  function openPlan(plan: LessonPlan | null) {
    setSelected(plan);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      {canCreate ? (
        <div className="flex justify-end">
          <Button type="button" onClick={() => openPlan(null)}>
            <Plus className="size-4" aria-hidden />
            New plan
          </Button>
        </div>
      ) : null}

      <QueryState
        isPending={plans.isPending}
        error={plans.error}
        onRetry={() => void plans.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <EmptyPanel
            icon={BookOpenCheck}
            title="No lesson plans yet"
            description="Plan a lesson, save it as a draft and submit it for approval when it’s ready."
            action={
              canCreate ? (
                <Button type="button" onClick={() => openPlan(null)}>
                  <Plus className="size-4" aria-hidden />
                  New plan
                </Button>
              ) : undefined
            }
          />
        }
      >
        <ul className="grid gap-2.5">
          {rows.map((plan) => (
            <li key={plan.id}>
              <button
                type="button"
                onClick={() => openPlan(plan)}
                className="flex w-full items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="min-w-0 space-y-1">
                  <span className="block truncate font-medium">{plan.title}</span>
                  <span className="block text-xs text-muted-foreground">
                    {lookups.className(plan.classId)} · {lookups.subjectName(plan.subjectId)}
                    {plan.weekNumber ? ` · Week ${plan.weekNumber}` : ''} ·{' '}
                    {lookups.termLabel(plan.termId)}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Updated {formatDate(plan.updatedAt)}
                  </span>
                </span>
                <StatusBadge status={plan.status} />
              </button>
            </li>
          ))}
        </ul>
      </QueryState>

      <LessonPlanSheet open={open} onOpenChange={setOpen} plan={selected} />
    </div>
  );
}
