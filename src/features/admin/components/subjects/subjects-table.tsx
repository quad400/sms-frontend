'use client';

import { useMemo } from 'react';
import { Eye, Search } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { TablePagination } from '@/components/patterns/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/patterns/status-badge';
import { cn } from '@/lib/utils/cn';
import type { Subject } from '../../api/structure';
import { QueryState } from '../../lib/shared';
import { SUBJECTS_UI_MOCK, subjectExtraForId } from './ui-mock';

export function SubjectsTable({
  rows,
  allCount,
  isPending,
  error,
  onRetry,
  density,
  q,
  onQChange,
  department,
  onDepartmentChange,
  tier,
  onTierChange,
  selectedId,
  onSelect,
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  departmentCounts,
}: {
  rows: Subject[];
  allCount: number;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  q: string;
  onQChange: (v: string) => void;
  department: string;
  onDepartmentChange: (v: string) => void;
  tier: string;
  onTierChange: (v: string) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  departmentCounts: Record<string, number>;
}) {
  const columns: DataTableColumn<Subject>[] = useMemo(
    () => [
      {
        id: 'subject',
        header: 'Subject & Code',
        cell: (r) => {
          const extra = subjectExtraForId(r.id, r.code);
          return (
            <div className="min-w-0">
              <p className="font-semibold text-foreground">{r.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{r.code}</p>
              {extra.compulsory ? (
                <Badge variant="soft" size="sm" className="mt-1">
                  Compulsory Core
                </Badge>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'department',
        header: 'Department',
        cell: (r) => {
          const { department } = subjectExtraForId(r.id, r.code);
          return (
            <Badge variant="info" size="sm">
              {department}
            </Badge>
          );
        },
      },
      {
        id: 'levels',
        header: 'Applicable Levels',
        cell: (r) => {
          const { levelSpan } = subjectExtraForId(r.id, r.code);
          return <span className="text-sm font-medium">{levelSpan}</span>;
        },
      },
      {
        id: 'lead',
        header: 'Lead Specialist',
        cell: (r) => {
          const { lead } = subjectExtraForId(r.id, r.code);
          const initials = lead.name
            .split(/\s+/)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[11px] font-semibold text-teal-800">
                {initials}
              </span>
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">{lead.name}</p>
                <p className="truncate text-xs text-muted-foreground">{lead.title}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'periods',
        header: 'Periods / WK',
        cell: (r) => {
          const { periods } = subjectExtraForId(r.id, r.code);
          return (
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {periods} p/wk
            </span>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: (r) => (
          <StatusBadge status={r.isActive === false ? 'inactive' : 'active'} />
        ),
      },
      {
        id: 'inspect',
        header: '',
        className: 'w-14',
        cell: (r) => {
          const active = selectedId === r.id;
          return (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Inspect ${r.name}`}
              aria-pressed={active}
              className={cn(
                'size-8',
                active ? 'bg-teal-50 text-teal-700' : 'text-muted-foreground',
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(r.id);
              }}
            >
              <Eye className="size-4" />
            </Button>
          );
        },
      },
    ],
    [onSelect, selectedId],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {SUBJECTS_UI_MOCK.departments.map((d) => {
            const count =
              d.id === ''
                ? allCount
                : (departmentCounts[d.id] ?? 0);
            const active = department === d.id;
            return (
              <button
                key={d.id || 'all'}
                type="button"
                onClick={() => onDepartmentChange(d.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'bg-teal-700 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {d.label}
                <span className={cn('ml-1 tabular-nums', active ? 'text-white/80' : '')}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => onQChange(e.target.value)}
              placeholder="Filter subjects or code…"
              className="h-9 pl-8"
              aria-label="Filter subjects"
            />
          </div>
          <Select
            value={tier || 'all'}
            onValueChange={(v) => onTierChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="h-9 w-[10.5rem]" aria-label="Tier filter">
              <SelectValue placeholder="Tier: All" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS_UI_MOCK.tiers.map((t) => (
                <SelectItem key={t.value || 'all'} value={t.value || 'all'}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <QueryState isPending={isPending} error={error} onRetry={onRetry}>
        <DataTable
          columns={columns}
          rows={rows}
          density={density}
          minRows={Math.min(pageSize, 8)}
          onRowClick={(r) => onSelect(r.id)}
          empty={
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No subjects match these filters.
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
          noun="subjects"
        />
      </QueryState>
    </div>
  );
}
