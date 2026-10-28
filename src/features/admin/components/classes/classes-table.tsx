'use client';

import { useMemo } from 'react';
import { Eye, Search, Settings2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { TablePagination } from '@/components/patterns/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import type { Level, SchoolClass } from '../../api/structure';
import { QueryState } from '../../lib/shared';
import { classExtraForId } from './ui-mock';

export function ClassesTable({
  rows,
  allRows,
  levels,
  staffNames,
  isPending,
  error,
  onRetry,
  density,
  q,
  onQChange,
  levelId,
  onLevelIdChange,
  selectedId,
  onSelect,
  page,
  pages,
  total,
  pageSize,
  onPageChange,
}: {
  rows: SchoolClass[];
  /** Full unfiltered-by-page list used for level pill availability. */
  allRows: SchoolClass[];
  levels: Level[];
  staffNames: Map<number, string>;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  q: string;
  onQChange: (v: string) => void;
  levelId: string;
  onLevelIdChange: (v: string) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const levelPills = useMemo(() => {
    const used = new Set(allRows.map((r) => r.levelId));
    const ordered = [...levels].sort(
      (a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0) || a.name.localeCompare(b.name),
    );
    const withArms = ordered.filter((l) => used.has(l.id));
    return [{ id: '', label: 'All Levels' }, ...withArms.map((l) => ({ id: String(l.id), label: l.name }))];
  }, [levels, allRows]);

  const columns: DataTableColumn<SchoolClass>[] = useMemo(
    () => [
      {
        id: 'arm',
        header: 'Class Arm',
        cell: (r) => {
          const extra = classExtraForId(r.id);
          const over = extra.enrolled > extra.capacity;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-2 shrink-0 rounded-full',
                    over ? 'bg-rose-500' : r.formTeacherStaffId ? 'bg-emerald-500' : 'bg-amber-400',
                  )}
                  aria-hidden
                />
                <span className="font-semibold text-foreground">{r.name}</span>
              </div>
              <p className="mt-0.5 pl-4 text-[11px] text-muted-foreground">
                Prefect · {extra.prefect}
              </p>
            </div>
          );
        },
      },
      {
        id: 'division',
        header: 'Division / Track',
        cell: (r) => {
          const { division } = classExtraForId(r.id);
          return (
            <Badge variant={division.variant} size="sm">
              {division.label}
            </Badge>
          );
        },
      },
      {
        id: 'formMaster',
        header: 'Form Master',
        cell: (r) => {
          const extra = classExtraForId(r.id);
          if (!r.formTeacherStaffId) {
            return <span className="text-sm text-amber-700">Unassigned</span>;
          }
          const name = staffNames.get(r.formTeacherStaffId) ?? `Staff #${r.formTeacherStaffId}`;
          return (
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{extra.department}</p>
            </div>
          );
        },
      },
      {
        id: 'homeroom',
        header: 'Homeroom',
        cell: (r) => {
          const { homeroom } = classExtraForId(r.id);
          return <span className="text-sm font-medium tabular-nums">{homeroom}</span>;
        },
      },
      {
        id: 'enrolled',
        header: 'Enrolled',
        cell: (r) => {
          const real = r.studentCount;
          const extra = classExtraForId(r.id);
          const enrolled = real ?? extra.enrolled;
          const capacity = extra.capacity;
          const over = enrolled > capacity;
          const full = enrolled >= capacity;
          const under = enrolled < capacity - 5;
          return (
            <div className="space-y-0.5">
              <span
                className={cn(
                  'inline-flex rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums',
                  over
                    ? 'bg-rose-50 text-rose-800'
                    : full
                      ? 'bg-emerald-50 text-emerald-800'
                      : under
                        ? 'bg-sky-50 text-sky-800'
                        : 'bg-emerald-50 text-emerald-800',
                )}
              >
                {enrolled} / {capacity}
              </span>
              {over ? (
                <p className="text-[11px] font-medium text-rose-700">
                  +{enrolled - capacity} Over
                </p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'inspect',
        header: 'Inspect',
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
    [onSelect, selectedId, staffNames],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {levelPills.map((pill) => {
            const active = levelId === pill.id;
            return (
              <button
                key={pill.id || 'all'}
                type="button"
                onClick={() => onLevelIdChange(pill.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  active
                    ? 'bg-teal-700 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
                )}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => onQChange(e.target.value)}
              placeholder="Filter arm, tutor, room…"
              className="h-9 pl-8"
              aria-label="Filter class arms"
            />
          </div>
          <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" disabled>
            <Settings2 className="size-4" />
            <span className="sr-only">Filters</span>
          </Button>
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
              No class arms match these filters.
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
          noun="Class Arms"
        />
      </QueryState>
    </div>
  );
}
