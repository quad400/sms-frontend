'use client';

import { EmptyState } from '@/components/patterns/empty-state';
import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { StatusBadge } from '@/components/patterns/status-badge';
import { TablePagination } from '@/components/patterns/table-pagination';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils/cn';
import type { LessonNote } from '../../api/academics';
import type { SchoolClass, Subject, Term } from '../../api/structure';
import { QueryState } from '../../lib/shared';

export type LessonNoteTab = '' | 'submitted' | 'approved' | 'rejected' | 'draft';

export function LessonNotesTable({
  rows,
  isPending,
  error,
  onRetry,
  density,
  tab,
  onTabChange,
  tabCounts,
  classId,
  onClassIdChange,
  subjectId,
  onSubjectIdChange,
  termId,
  onTermIdChange,
  weekNumber,
  onWeekNumberChange,
  classes,
  subjects,
  terms,
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  onOpen,
}: {
  rows: LessonNote[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  tab: LessonNoteTab;
  onTabChange: (v: LessonNoteTab) => void;
  tabCounts: {
    all: number;
    submitted: number;
    approved: number;
    rejected: number;
  };
  classId: string;
  onClassIdChange: (v: string) => void;
  subjectId: string;
  onSubjectIdChange: (v: string) => void;
  termId: string;
  onTermIdChange: (v: string) => void;
  weekNumber: string;
  onWeekNumberChange: (v: string) => void;
  classes: SchoolClass[];
  subjects: Subject[];
  terms: Term[];
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onOpen: (row: LessonNote) => void;
}) {
  const tabs: Array<{ id: LessonNoteTab; label: string; count: number }> = [
    { id: 'submitted', label: 'Awaiting review', count: tabCounts.submitted },
    { id: 'approved', label: 'Approved', count: tabCounts.approved },
    { id: 'rejected', label: 'Rejected', count: tabCounts.rejected },
    { id: '', label: 'All', count: tabCounts.all },
  ];

  const columns: DataTableColumn<LessonNote>[] = useMemo(
    () => [
      {
        id: 'faculty',
        header: 'Faculty',
        cell: (r) => {
          const name = r.staffName ?? `Staff #${r.staffId}`;
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
              <p className="truncate font-semibold text-foreground">{name}</p>
            </div>
          );
        },
      },
      {
        id: 'scope',
        header: 'Subject & class',
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
        id: 'title',
        header: 'Title',
        cell: (r) => <p className="truncate text-sm font-medium">{r.title}</p>,
      },
      {
        id: 'doc',
        header: 'Document',
        cell: (r) => (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
            <FileText className="size-3.5" />
            {r.attachments.length > 0
              ? `${r.attachments.length} file${r.attachments.length === 1 ? '' : 's'}`
              : 'None'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (r) => <StatusBadge status={r.status} />,
      },
      {
        id: 'submitted',
        header: 'Updated',
        cell: (r) => (
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatWhen(r.updatedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id || 'all'}
                type="button"
                onClick={() => onTabChange(t.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'bg-teal-700 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {t.label} {t.count}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1">
            <Label className="text-[10px] text-muted-foreground">Term</Label>
            <Select
              value={termId || 'all'}
              onValueChange={(v) => onTermIdChange(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-[10rem]" aria-label="Term">
                <SelectValue placeholder="All terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All terms</SelectItem>
                {terms.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.periodName ?? t.name ?? `Term ${t.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] text-muted-foreground">Class</Label>
            <Select
              value={classId || 'all'}
              onValueChange={(v) => onClassIdChange(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-[11rem]" aria-label="Class">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] text-muted-foreground">Subject</Label>
            <Select
              value={subjectId || 'all'}
              onValueChange={(v) => onSubjectIdChange(v === 'all' ? '' : v)}
            >
              <SelectTrigger className="h-9 w-[11rem]" aria-label="Subject">
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] text-muted-foreground">Week</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={weekNumber}
              onChange={(e) => onWeekNumberChange(e.target.value)}
              placeholder="Any"
              className="h-9 w-20"
              aria-label="Week number"
            />
          </div>
        </div>
      </div>

      <QueryState isPending={isPending} error={error} onRetry={onRetry} loaderVariant="table">
        <div className="flex flex-col">
          <DataTable
            columns={columns}
            rows={rows}
            density={density}
            minRows={Math.min(pageSize, 8)}
            onRowClick={onOpen}
            empty={
              <EmptyState
                title="No lesson notes"
                description="Adjust filters or wait for teachers to submit weekly documents."
              />
            }
          />
          <TablePagination
            page={page}
            pages={pages}
            total={total}
            pageSize={pageSize}
            onPageChange={onPageChange}
            noun="lesson notes"
          />
        </div>
      </QueryState>
    </div>
  );
}

function formatWhen(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
