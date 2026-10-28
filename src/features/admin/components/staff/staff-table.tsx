'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Archive, ClipboardList, Eye, IdCard, Pencil, Search, Settings2, X } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { IconActionButton, IconActionLink } from '@/components/patterns/icon-action';
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
import { PermissionGate } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import { QueryState } from '../../lib/shared';
import { fullName, type StaffRow } from '../../types';
import { STAFF_UI_MOCK, staffExtraForIndex } from './ui-mock';
import { avatarTone, initials } from './utils';

const STATUS_TODAY_VARIANT = {
  checked_in: 'successSoft',
  duty: 'warning',
  leave: 'dangerSoft',
} as const;

export function StaffTable({
  rows,
  isPending,
  error,
  onRetry,
  density,
  q,
  onQChange,
  department,
  onDepartmentChange,
  employment,
  onEmploymentChange,
  category,
  onCategoryChange,
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  onArchive,
}: {
  rows: StaffRow[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  q: string;
  onQChange: (v: string) => void;
  department: string;
  onDepartmentChange: (v: string) => void;
  employment: string;
  onEmploymentChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onArchive: (id: number) => void;
}) {
  const columns: DataTableColumn<StaffRow>[] = useMemo(() => {
    return [
      {
        id: 'member',
        header: 'Faculty / Staff Member',
        cell: (r) => {
          const name = fullName(r.firstName, r.lastName, r.middleName);
          return (
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  avatarTone(r.staffNumber ?? name),
                )}
              >
                {initials(r.firstName, r.lastName)}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/admin/staff/${r.id}`}
                  className="truncate font-semibold text-foreground hover:text-teal-700 hover:underline"
                >
                  {name}
                </Link>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {r.staffNumber ?? `STA-${r.id}`}
                </p>
                {r.email ? (
                  <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        id: 'dept',
        header: 'Department & Designation',
        cell: (r) => {
          const extra = staffExtraForIndex(r.id);
          return (
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-foreground">{extra.department}</p>
              <p className="text-muted-foreground">
                {r.jobTitle ?? r.jobTitleCode ?? extra.designation}
              </p>
              {extra.classLabel ? (
                <p className="text-xs text-muted-foreground">{extra.classLabel}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'schedule',
        header: 'Assigned Schedule & Subjects',
        cell: (r) => {
          const extra = staffExtraForIndex(r.id);
          return (
            <div className="max-w-[14rem] text-sm">
              <p className="truncate font-medium">{extra.subjects}</p>
              <p className="text-xs text-muted-foreground">
                {extra.periods != null
                  ? `${extra.periods} periods/wk`
                  : extra.shiftHours != null
                    ? `${extra.shiftHours} hrs/wk Shift`
                    : '—'}
              </p>
            </div>
          );
        },
      },
      {
        id: 'load',
        header: 'Workload Load',
        cell: (r) => {
          const extra = staffExtraForIndex(r.id);
          if (extra.periods == null || extra.periodCap == null) {
            return (
              <span className="text-xs text-muted-foreground">
                {extra.shiftHours != null ? `${extra.shiftHours} hrs/wk` : '—'}
              </span>
            );
          }
          const pct = Math.round((extra.periods / extra.periodCap) * 100);
          return (
            <div className="min-w-[7rem] space-y-1">
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="font-semibold tabular-nums">{pct}%</span>
                <span className="text-muted-foreground tabular-nums">
                  {extra.periods}/{extra.periodCap} per.
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-teal-700"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        id: 'today',
        header: 'Status Today',
        cell: (r) => {
          const extra = staffExtraForIndex(r.id);
          return (
            <Badge
              size="sm"
              variant={STATUS_TODAY_VARIANT[extra.statusToday.kind]}
            >
              {extra.statusToday.label}
            </Badge>
          );
        },
      },
      {
        id: 'contract',
        header: 'Contract',
        cell: (r) => {
          const extra = staffExtraForIndex(r.id);
          return (
            <Badge size="sm" variant="info">
              {extra.contract}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        className: 'w-[5.5rem] text-right',
        cell: (r) => (
          <div className="flex justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
            <IconActionLink
              label="View staff profile"
              icon={<Eye />}
              href={`/admin/staff/${r.id}`}
            />
            <PermissionGate permission="staff.staff.update">
              <IconActionLink
                label="Edit staff"
                icon={<Pencil />}
                href={`/admin/staff/${r.id}/edit`}
              />
            </PermissionGate>
            <PermissionGate permission="staff.staff.archive">
              <IconActionButton
                label="Archive staff"
                icon={<Archive />}
                className="hover:text-danger"
                onClick={() => onArchive(r.id)}
              />
            </PermissionGate>
          </div>
        ),
      },
    ];
  }, [onArchive]);

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-row items-center justify-between w-full gap-2 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)]">
        <div className="flex flex-row items-center gap-2">
          <label className="group relative flex min-w-80 flex-1 items-center gap-2 rounded-lg bg-muted/60 px-2 transition focus-within:bg-card focus-within:ring-1 focus-within:ring-teal-700/20">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700 transition group-focus-within:bg-teal-100">
              <Search className="size-4" aria-hidden />
            </span>
            <Input
              value={q}
              onChange={(e) => onQChange(e.target.value)}
              placeholder="Search staff by name or ID…"
              aria-label="Search staff"
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
        </div>

        <div className="flex flex-row items-center gap-2">
          <Select
            value={department || 'all'}
            onValueChange={(v) => onDepartmentChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="max-w-50" aria-label="Department">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {STAFF_UI_MOCK.departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={employment || 'all'}
            onValueChange={(v) => onEmploymentChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="max-w-50" aria-label="Employment">
              <SelectValue placeholder="Employment: All" />
            </SelectTrigger>
            <SelectContent>
              {STAFF_UI_MOCK.employmentTypes.map((e) => (
                <SelectItem key={e.value || 'all'} value={e.value || 'all'}>
                  {e.label}
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
        {STAFF_UI_MOCK.categoryTabs.map((tab) => {
          const active = category === tab.value;
          return (
            <button
              key={tab.value || 'all'}
              type="button"
              onClick={() => onCategoryChange(tab.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                active
                  ? 'bg-teal-700 text-white'
                  : 'bg-sky-50 text-sky-900 hover:bg-sky-100',
              )}
            >
              {tab.label} {tab.count}
            </button>
          );
        })}
      </div>

      <QueryState isPending={isPending} error={error} onRetry={onRetry}>
        <div className="flex flex-col">
          <DataTable
            columns={columns}
            rows={rows}
            density={density}
            minRows={Math.min(pageSize, 8)}
            empty={
              <div className="flex max-w-sm flex-col items-center px-6 py-8 text-center">
                <p className="font-heading text-base font-semibold">No staff found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting search or filters, or onboard a new staff member.
                </p>
              </div>
            }
          />
          <TablePagination
            page={page}
            pages={pages}
            total={total}
            pageSize={pageSize}
            onPageChange={onPageChange}
            noun="staff personnel"
          />
        </div>
      </QueryState>
    </div>
  );
}
