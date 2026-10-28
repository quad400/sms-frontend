'use client';

import { useMemo, useState } from 'react';
import {
  Archive,
  Columns3,
  Eye,
  Pencil,
  Search,
  Settings2,
  Users,
  X,
} from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { IconActionButton, IconActionLink } from '@/components/patterns/icon-action';
import { StatusBadge } from '@/components/patterns/status-badge';
import { TablePagination } from '@/components/patterns/table-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PermissionGate } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import { GENDER_CODES, labelForCode } from '../../lib/codes';
import { QueryState } from '../../lib/shared';
import { fullName, type StudentRow } from '../../types';
import type { SchoolClass } from '../../api/structure';
import { ageFromDob, avatarTone, initials } from './utils';
import { STUDENTS_UI_MOCK } from './ui-mock';
import { Checkbox } from '@/components/ui/checkbox';

export function StudentsTable({
  rows,
  isPending,
  error,
  onRetry,
  density,
  q,
  onQChange,
  classId,
  onClassIdChange,
  houseId,
  onHouseIdChange,
  status,
  onStatusChange,
  classes,
  houses,
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  onOpenStudent,
  onArchive,
}: {
  rows: StudentRow[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  q: string;
  onQChange: (v: string) => void;
  classId: string;
  onClassIdChange: (v: string) => void;
  houseId: string;
  onHouseIdChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  classes: SchoolClass[];
  houses: Array<{ id: number; name: string }>;
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onOpenStudent: (id: number) => void;
  onArchive: (id: number) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const columns: DataTableColumn<StudentRow>[] = useMemo(() => {
    return [
      {
        id: 'select',
        header: '',
        className: 'w-10',
        cell: (r) => (
          <Checkbox
            checked={selected.has(r.id)}
            aria-label={`Select ${r.studentNumber}`}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              setSelected((prev) => {
                const next = new Set(prev);
                if (checked === true) next.add(r.id);
                else next.delete(r.id);
                return next;
              });
            }}
          />
        ),
      },
      {
        id: 'student',
        header: 'Student & ID',
        cell: (r) => (
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                avatarTone(r.genderCode ?? r.gender),
              )}
            >
              {initials(r.firstName, r.lastName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {fullName(r.firstName, r.lastName, r.middleName)}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">{r.studentNumber}</p>
            </div>
          </div>
        ),
      },
      {
        id: 'class',
        header: 'Class',
        cell: (r) => (
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums">
            {r.className ?? '—'}
          </span>
        ),
      },
      {
        id: 'demo',
        header: 'Demographics',
        cell: (r) => {
          const code = r.genderCode ?? r.gender;
          const gender = labelForCode(GENDER_CODES, code);
          const age = ageFromDob(r.dateOfBirth);
          if (gender === '—' && age == null) return '—';
          return (
            <span className="text-sm text-muted-foreground">
              {gender !== '—' ? gender : null}
              {gender !== '—' && age != null ? ' · ' : null}
              {age != null ? `${age} yrs` : null}
            </span>
          );
        },
      },
      {
        id: 'guardian',
        header: 'Primary guardian',
        cell: (r) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{r.primaryGuardianName ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{r.primaryGuardianPhone ?? ''}</p>
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (r) => <StatusBadge status={r.statusCode ?? r.status ?? 'active'} />,
      },
      {
        id: 'actions',
        header: '',
        className: 'w-[7.5rem] text-right',
        cell: (r) => (
          <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
            <IconActionButton
              label="View student"
              icon={<Eye />}
              onClick={() => onOpenStudent(r.id)}
            />
            <PermissionGate permission="students.student.update">
              <IconActionLink
                label="Edit student"
                icon={<Pencil />}
                href={`/admin/students/${r.id}/edit`}
              />
            </PermissionGate>
            <PermissionGate permission="students.student.archive">
              <IconActionButton
                label="Archive student"
                icon={<Archive />}
                className="hover:text-danger"
                onClick={() => onArchive(r.id)}
              />
            </PermissionGate>
          </div>
        ),
      },
    ];
  }, [onArchive, onOpenStudent, selected]);

  const hasFilters = Boolean(status || classId || houseId || q);
  const resetFilters = () => {
    onStatusChange('');
    onClassIdChange('');
    onHouseIdChange('');
    onQChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)]">
        <label className="group relative flex min-w-56 flex-1 items-center gap-2 rounded-lg bg-muted/60 px-2 transition focus-within:bg-card focus-within:ring-2 focus-within:ring-teal-700/20">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700 transition group-focus-within:bg-teal-100">
            <Search className="size-4" aria-hidden />
          </span>
          <Input
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder="Search name or student ID…"
            aria-label="Search students"
            className="h-10 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          {q ? (
            <button
              type="button"
              onClick={() => onQChange('')}
              className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>
        <div className='flex flex-row gap-4'>

          <Select
            value={classId || 'all'}
            onValueChange={(v) => onClassIdChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="min-w-32" aria-label="Class">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm">
            <Settings2 className="size-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STUDENTS_UI_MOCK.statusTabs.map((tab) => {
          const active = status === tab.value || (status === '' && tab.value === 'active');
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onStatusChange(tab.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                active
                  ? 'bg-teal-700 text-white'
                  : tab.tone === 'danger'
                    ? 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80',
              )}
            >
              {tab.label} ({tab.count.toLocaleString()})
            </button>
          );
        })}
        {hasFilters ? (
          <button
            type="button"
            className="text-xs font-semibold text-teal-700 hover:underline"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        ) : null}
      </div>

      <QueryState isPending={isPending} error={error} onRetry={onRetry}>
        <div className="flex flex-col">
          <DataTable
            columns={columns}
            rows={rows}
            density={density}
            minRows={pageSize}
            onRowClick={(r) => onOpenStudent(r.id)}
            empty={
              <StudentsTableEmpty
                hasFilters={hasFilters}
                onResetFilters={resetFilters}
              />
            }
          />
          <TablePagination
            page={page}
            pages={pages}
            total={total}
            pageSize={pageSize}
            onPageChange={onPageChange}
            noun="students"
          />
        </div>
      </QueryState>
    </div>
  );
}

function StudentsTableEmpty({
  hasFilters,
  onResetFilters,
}: {
  hasFilters: boolean;
  onResetFilters: () => void;
}) {
  return (
    <div className="flex max-w-sm flex-col items-center px-6 py-8 text-center">
      <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <Users className="size-5" aria-hidden />
      </span>
      <p className="font-heading text-base font-semibold text-foreground">
        {hasFilters ? 'No students match these filters' : 'No students yet'}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {hasFilters
          ? 'Try clearing search, class, house, or status to widen the list.'
          : 'Add a student or import a roster to populate this directory.'}
      </p>
      {hasFilters ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onResetFilters}
        >
          Reset filters
        </Button>
      ) : null}
    </div>
  );
}
