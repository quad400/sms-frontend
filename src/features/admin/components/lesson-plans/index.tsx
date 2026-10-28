'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useApproveLessonPlan,
  useLessonPlan,
  useLessonPlans,
} from '../../hooks/use-academics';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { LessonPlansHeader } from './lesson-plans-header';
import { LessonPlansSummary } from './lesson-plans-summary';
import {
  LessonPlansTable,
  type LessonPlanTab,
} from './lesson-plans-table';
import { hodBadge, lessonPlanExtraForId, LESSON_PLANS_UI_MOCK } from './ui-mock';

export function LessonPlansList() {
  const { density } = useAdminCampus();
  const [tab, setTab] = useState<LessonPlanTab>('submitted');
  const [page, setPage] = useState(1);
  const [department, setDepartment] = useState('');
  const [stage, setStage] = useState('');
  const [selected, setSelected] = useState<number | null>(null);

  const apiStatus =
    tab === 'overdue' || tab === ''
      ? undefined
      : tab === 'submitted'
        ? 'submitted'
        : tab;

  const list = useLessonPlans({ status: apiStatus, page });
  const detail = useLessonPlan(selected);
  const approve = useApproveLessonPlan();

  const rows = useMemo(() => {
    let data = list.data?.data ?? [];
    if (tab === 'overdue') {
      data = data.filter((r) => lessonPlanExtraForId(r.id, r.status).uiStatus === 'overdue');
    }
    if (department) {
      data = data.filter((r) => {
        const role = lessonPlanExtraForId(r.id, r.status).role.toLowerCase();
        return role.includes(department === 'sciences' ? 'scien' : department.slice(0, 4));
      });
    }
    return data;
  }, [list.data?.data, tab, department]);

  const tabCounts = useMemo(() => {
    const all = list.data?.meta.total ?? (list.data?.data?.length ?? 0);
    const mock = LESSON_PLANS_UI_MOCK.summary;
    return {
      all: all || mock.awaiting + mock.approved + mock.overdue,
      pending: mock.awaiting,
      approved: mock.approved,
      overdue: mock.overdue,
    };
  }, [list.data]);

  const total = list.data?.meta.total ?? rows.length;
  const pageSize = list.data?.meta.pageSize ?? 10;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const approvePlan = (id: number) => {
    approve.mutate(id, {
      onSuccess: () => {
        toastSuccess('Lesson plan approved');
        setSelected(null);
      },
      onError: (e) => toastError('Could not approve', e.message),
    });
  };

  const selectedExtra =
    detail.data != null
      ? lessonPlanExtraForId(detail.data.id, detail.data.status)
      : null;
  const selectedHod = selectedExtra ? hodBadge(selectedExtra.uiStatus) : null;

  return (
    <div className="space-y-5">
      <LessonPlansHeader
        onDigest={() =>
          toastSuccess('Pacing digest', 'Week 8 summary queued for HODs.')
        }
        onReminders={() =>
          toastSuccess(
            'Reminders sent',
            `${LESSON_PLANS_UI_MOCK.summary.reminders} faculty notified.`,
          )
        }
      />

      <LessonPlansSummary
        awaiting={tabCounts.pending}
        approved={tabCounts.approved}
        overdue={tabCounts.overdue}
      />

      <LessonPlansTable
        rows={rows}
        isPending={list.isPending}
        error={list.error}
        onRetry={() => void list.refetch()}
        density={density}
        weekLabel="Term 2 · Week 8"
        department={department}
        onDepartmentChange={(v) => {
          setDepartment(v);
          setPage(1);
        }}
        stage={stage}
        onStageChange={(v) => {
          setStage(v);
          setPage(1);
        }}
        tab={tab}
        onTabChange={(v) => {
          setTab(v);
          setPage(1);
        }}
        tabCounts={tabCounts}
        page={page}
        pages={pages}
        total={total}
        pageSize={pageSize}
        onPageChange={setPage}
        onOpen={setSelected}
      />

      <Sheet open={selected != null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="text-left">
            <SheetTitle>{detail.data?.title ?? 'Lesson plan'}</SheetTitle>
            <SheetDescription>
              {[
                detail.data?.subjectName,
                detail.data?.className,
                detail.data?.weekNumber != null
                  ? `Week ${detail.data.weekNumber}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ') || 'Review scheme of work submission'}
            </SheetDescription>
          </SheetHeader>

          <QueryState
            isPending={detail.isPending}
            error={detail.error}
            onRetry={() => void detail.refetch()}
          >
            {detail.data ? (
              <div className="mt-5 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {selectedHod ? (
                    <Badge variant={selectedHod.variant} size="sm">
                      {selectedHod.label}
                    </Badge>
                  ) : null}
                  {selectedExtra ? (
                    <Badge variant="secondary" size="sm">
                      {selectedExtra.submittedLabel}
                    </Badge>
                  ) : null}
                </div>

                {detail.data.staffName || selectedExtra?.role ? (
                  <div className="rounded-xl border border-border bg-muted/30 p-3 text-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Faculty
                    </p>
                    <p className="mt-1 font-semibold">
                      {detail.data.staffName ?? 'Unassigned'}
                    </p>
                    {selectedExtra ? (
                      <p className="text-xs text-muted-foreground">{selectedExtra.role}</p>
                    ) : null}
                  </div>
                ) : null}

                {detail.data.objectives ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Objectives
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {detail.data.objectives}
                    </p>
                  </div>
                ) : selectedExtra ? (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Topic
                    </p>
                    <p className="mt-1 text-sm font-semibold">{selectedExtra.topic.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedExtra.topic.blurb}
                    </p>
                  </div>
                ) : null}

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Content
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                    {detail.data.content || 'No content provided.'}
                  </p>
                </div>

                {selectedExtra ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                    Document · {selectedExtra.doc}
                  </p>
                ) : null}

                <PermissionGate permission="academics.lesson-plan.approve">
                  {detail.data.status === 'submitted' ? (
                    <Button
                      type="button"
                      className="w-full bg-teal-700 hover:bg-teal-800"
                      disabled={approve.isPending}
                      onClick={() => approvePlan(selected!)}
                    >
                      {approve.isPending ? 'Approving…' : 'Approve lesson plan'}
                    </Button>
                  ) : null}
                </PermissionGate>
              </div>
            ) : null}
          </QueryState>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export { LessonPlansList as LessonPlansPage };
