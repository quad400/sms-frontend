'use client';

import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { TablePagination } from '@/components/patterns/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/cn';
import type { LessonPlan } from '../../api/academics';
import { QueryState } from '../../lib/shared';
import {
  LESSON_PLANS_UI_MOCK,
  hodBadge,
  lessonPlanExtraForId,
} from './ui-mock';

export type LessonPlanTab = '' | 'submitted' | 'approved' | 'overdue' | 'draft';

export function LessonPlansTable({
  rows,
  isPending,
  error,
  onRetry,
  density,
  weekLabel,
  department,
  onDepartmentChange,
  stage,
  onStageChange,
  tab,
  onTabChange,
  tabCounts,
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  onOpen,
}: {
  rows: LessonPlan[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  weekLabel: string;
  department: string;
  onDepartmentChange: (v: string) => void;
  stage: string;
  onStageChange: (v: string) => void;
  tab: LessonPlanTab;
  onTabChange: (v: LessonPlanTab) => void;
  tabCounts: { all: number; pending: number; approved: number; overdue: number };
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onOpen: (id: number) => void;
}) {
  const tabs: Array<{ id: LessonPlanTab; label: string; count: number; danger?: boolean }> = [
    { id: '', label: 'All', count: tabCounts.all },
    { id: 'submitted', label: 'Pending Review', count: tabCounts.pending },
    { id: 'approved', label: 'Approved', count: tabCounts.approved },
    { id: 'overdue', label: 'Overdue', count: tabCounts.overdue, danger: true },
  ];

  const columns: DataTableColumn<LessonPlan>[] = useMemo(
    () => [
      {
        id: 'faculty',
        header: 'Faculty Member',
        cell: (r) => {
          const extra = lessonPlanExtraForId(r.id, r.status);
          const name = r.staffName ?? `Staff #${r.staffId ?? '—'}`;
          const initials = name
            .split(/\s+/)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[11px] font-semibold text-teal-800">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{extra.role}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'subject',
        header: 'Subject & Class',
        cell: (r) => (
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-foreground">
              {r.subjectName ?? `Subject ${r.subjectId}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {r.className ?? `Class ${r.classId}`}
              {r.weekNumber != null ? ` · Week ${r.weekNumber}` : ''}
            </p>
          </div>
        ),
      },
      {
        id: 'topic',
        header: 'Topic & Objectives',
        cell: (r) => {
          const extra = lessonPlanExtraForId(r.id, r.status);
          return (
            <div className="max-w-[14rem] text-sm">
              <p className="truncate font-semibold">{r.title || extra.topic.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {r.objectives?.slice(0, 60) || extra.topic.blurb}
              </p>
            </div>
          );
        },
      },
      {
        id: 'submitted',
        header: 'Submitted',
        cell: (r) => {
          const extra = lessonPlanExtraForId(r.id, r.status);
          const late = extra.uiStatus === 'overdue';
          return (
            <div className="text-sm">
              <p className="font-medium tabular-nums">{extra.submittedAt}</p>
              <p
                className={cn(
                  'text-[11px] font-semibold',
                  late ? 'text-rose-700' : 'text-muted-foreground',
                )}
              >
                {extra.submittedLabel}
              </p>
            </div>
          );
        },
      },
      {
        id: 'hod',
        header: 'HOD Status',
        cell: (r) => {
          const extra = lessonPlanExtraForId(r.id, r.status);
          const badge = hodBadge(extra.uiStatus);
          return (
            <Badge variant={badge.variant} size="sm">
              {badge.label}
            </Badge>
          );
        },
      },
      {
        id: 'doc',
        header: 'Document',
        cell: (r) => {
          const extra = lessonPlanExtraForId(r.id, r.status);
          return (
            <button
              type="button"
              className="inline-flex max-w-[9rem] items-center gap-1.5 text-left text-xs font-semibold text-teal-700 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(r.id);
              }}
            >
              <FileText className="size-3.5 shrink-0" />
              <span className="truncate">{extra.doc}</span>
            </button>
          );
        },
      },
    ],
    [onOpen],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9 pointer-events-none">
            {weekLabel}
          </Button>
          <Select
            value={department || 'all'}
            onValueChange={(v) => onDepartmentChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 w-[11rem]" aria-label="Department">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              {LESSON_PLANS_UI_MOCK.departments.map((d) => (
                <SelectItem key={d.value || 'all'} value={d.value || 'all'}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={stage || 'all'}
            onValueChange={(v) => onStageChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 w-[13rem]" aria-label="Stage">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              {LESSON_PLANS_UI_MOCK.stages.map((s) => (
                <SelectItem key={s.value || 'all'} value={s.value || 'all'}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id || 'all'}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'bg-teal-700 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {t.label}
                <span
                  className={cn(
                    'tabular-nums',
                    active
                      ? 'text-white/80'
                      : t.danger
                        ? 'rounded-full bg-rose-100 px-1.5 text-rose-800'
                        : '',
                  )}
                >
                  ({t.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <QueryState isPending={isPending} error={error} onRetry={onRetry}>
        <DataTable
          columns={columns}
          rows={rows}
          density={density}
          minRows={Math.min(pageSize, 6)}
          onRowClick={(r) => onOpen(r.id)}
          empty={
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No lesson plans in this queue.
            </p>
          }
          className="shadow-[var(--shadow-card)]"
        />
        <TablePagination
          page={page}
          pages={pages}
          total={total}
          pageSize={pageSize}
          onPageChange={onPageChange}
          noun="faculty submissions"
        />
      </QueryState>
    </div>
  );
}
