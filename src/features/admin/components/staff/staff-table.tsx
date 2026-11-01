'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Archive, Eye, Pencil, Phone, Search, X } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { EmptyState } from '@/components/patterns/empty-state';
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
import { formatDisplayDateOrDash } from '@/lib/format/date';
import { cn } from '@/lib/utils/cn';
import type { StaffSummary } from '../../api/staff';
import { GENDER_CODES, JOB_TITLE_CODES, STAFF_STATUS_CODES, labelForCode } from '../../lib/codes';
import { QueryState } from '../../lib/shared';
import { fullName, type StaffRow } from '../../types';
import { avatarTone, initials } from './utils';

export type StaffCategoryTab = {
  value: string;
  label: string;
  count: number;
};

export function StaffTable({
  rows,
  isPending,
  error,
  onRetry,
  density,
  q,
  onQChange,
  jobTitle,
  onJobTitleChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  categoryTabs,
  campusNameById,
  page,
  pages,
  total,
  pageSize,
  onPageChange,
  onArchive,
  onOpenStaff,
}: {
  rows: StaffRow[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  density: 'compact' | 'comfortable';
  q: string;
  onQChange: (v: string) => void;
  jobTitle: string;
  onJobTitleChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  categoryTabs: StaffCategoryTab[];
  campusNameById: Map<number, string>;
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onArchive: (id: number) => void;
  onOpenStaff: (id: number) => void;
}) {
  const columns: DataTableColumn<StaffRow>[] = useMemo(() => {
    return [
      {
        id: 'member',
        header: 'Staff member',
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
                  onClick={(e) => e.stopPropagation()}
                >
                  {name}
                </Link>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {r.staffNumber ?? `STA-${r.id}`}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'role',
        header: 'Role',
        cell: (r) => {
          const code = r.jobTitleCode ?? r.jobTitle;
          const title =
            r.jobTitleName ||
            r.jobTitle ||
            labelForCode(JOB_TITLE_CODES, code);
          const gender = labelForCode(GENDER_CODES, r.genderCode ?? r.gender);
          return (
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-foreground">{title !== '—' ? title : '—'}</p>
              {gender !== '—' ? (
                <p className="text-xs text-muted-foreground">{gender}</p>
              ) : null}
            </div>
          );
        },
      },
      {
        id: 'contact',
        header: 'Contact',
        cell: (r) => (
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{r.email ?? '—'}</p>
            {r.phone ? (
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="size-3" />
                {r.phone}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'campus',
        header: 'Campus',
        cell: (r) => (
          <span className="text-sm text-muted-foreground">
            {r.campusId != null
              ? campusNameById.get(r.campusId) ?? `Campus #${r.campusId}`
              : '—'}
          </span>
        ),
      },
      {
        id: 'hireDate',
        header: 'Hire date',
        cell: (r) => (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatDisplayDateOrDash(r.hireDate)}
          </span>
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
              label="View staff profile"
              icon={<Eye />}
              onClick={() => onOpenStaff(r.id)}
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
  }, [campusNameById, onArchive, onOpenStaff]);

  const hasFilters = Boolean(status || jobTitle || category || q);
  const resetFilters = () => {
    onStatusChange('active');
    onJobTitleChange('');
    onCategoryChange('');
    onQChange('');
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex w-full flex-row flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)]">
        <label className="group relative flex min-w-56 flex-1 items-center gap-2 rounded-lg bg-muted/60 px-2 transition focus-within:bg-card focus-within:ring-2 focus-within:ring-teal-700/20">
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

        <div className="flex flex-row flex-wrap items-center gap-2">
          <Select
            value={jobTitle || 'all'}
            onValueChange={(v) => onJobTitleChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="min-w-40" aria-label="Job title">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {JOB_TITLE_CODES.filter((j) =>
                ['teacher', 'head-teacher', 'principal', 'bursar', 'administrator', 'support'].includes(
                  j.code,
                ),
              ).map((j) => (
                <SelectItem key={j.code} value={j.code}>
                  {j.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={status || 'all'}
            onValueChange={(v) => onStatusChange(v === 'all' ? '' : v)}
          >
            <SelectTrigger className="min-w-36" aria-label="Status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STAFF_STATUS_CODES.map((s) => (
                <SelectItem key={s.code} value={s.code}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {categoryTabs.map((tab) => {
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

      <QueryState isPending={isPending} error={error} onRetry={onRetry} loaderVariant="table">
        <div className="flex flex-col">
          <DataTable
            columns={columns}
            rows={rows}
            density={density}
            minRows={Math.min(pageSize, 8)}
            onRowClick={(r) => onOpenStaff(r.id)}
            empty={
              <EmptyState
                title={hasFilters ? 'No staff match these filters' : 'No staff yet'}
                description={
                  hasFilters
                    ? 'Try clearing search, role, status, or category.'
                    : 'Onboard a staff member or import a roster to populate this directory.'
                }
                action={
                  hasFilters ? (
                    <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                      Reset filters
                    </Button>
                  ) : undefined
                }
              />
            }
          />
          <TablePagination
            page={page}
            pages={pages}
            total={total}
            pageSize={pageSize}
            onPageChange={onPageChange}
            noun="staff"
          />
        </div>
      </QueryState>
    </div>
  );
}

export function buildStaffCategoryTabs(summary: StaffSummary | undefined): StaffCategoryTab[] {
  return [
    { value: '', label: 'All staff', count: summary?.total ?? 0 },
    { value: 'teaching', label: 'Teaching', count: summary?.teaching ?? 0 },
    { value: 'non-teaching', label: 'Non-teaching', count: summary?.nonTeaching ?? 0 },
  ];
}
