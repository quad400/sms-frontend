'use client';

import { useMemo, useState } from 'react';
import { Download, Plus, RefreshCw, Search, Settings2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { PageHeader } from '@/components/patterns/page-header';
import { TablePagination } from '@/components/patterns/table-pagination';
import { StatusBadge } from '@/components/patterns/status-badge';
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
import type { UserRow } from '../../types';
import { useRoles } from '../../hooks/use-roles';
import { useCampuses } from '../../hooks/use-structure';
import { useUsers } from '../../hooks/use-users';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';
import { InviteUserWizard } from './invite-user-wizard';
import { UserDetailPanel } from './user-detail-panel';
import { UsersSummary } from './users-summary';
import { ACCESS_UI_MOCK, userExtraForId } from './ui-mock';

export function UsersPage() {
  const { density, campusQuery } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('active');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const users = useUsers({
    page,
    q: q || undefined,
    type: type || undefined,
    status: status || undefined,
    campusId: campusQuery,
  });
  const roles = useRoles();
  const campuses = useCampuses();

  const rows = useMemo(() => {
    let data = users.data?.data ?? [];
    if (roleFilter) {
      const rid = Number(roleFilter);
      data = data.filter(
        (u) =>
          u.roleIds?.includes(rid) ||
          u.roles?.some((r) => r.id === rid),
      );
    }
    return data;
  }, [users.data?.data, roleFilter]);

  const selected =
    rows.find((u) => u.id === selectedId) ??
    (users.data?.data ?? []).find((u) => u.id === selectedId) ??
    null;

  const total = users.data?.meta.total ?? 0;
  const pageSize = users.data?.meta.pageSize ?? 10;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const columns: DataTableColumn<UserRow>[] = useMemo(
    () => [
      {
        id: 'user',
        header: 'User & Profile',
        cell: (r) => {
          const extra = userExtraForId(r.id);
          const initials = r.displayName
            .split(/\s+/)
            .map((p) => p[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return (
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-semibold text-teal-800">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{r.email ?? '—'}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{extra.staffCode}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: 'role',
        header: 'Role & Scope',
        cell: (r) => (
          <div className="min-w-0 text-sm">
            <p className="font-semibold capitalize">{r.type}</p>
            <p className="truncate text-xs text-muted-foreground">
              {r.roles?.map((x) => x.name).join(', ') || 'No roles'}
            </p>
          </div>
        ),
      },
      {
        id: 'mfa',
        header: '2FA Status',
        cell: (r) => {
          const { mfa } = userExtraForId(r.id);
          return (
            <Badge variant={mfa.variant} size="sm">
              {mfa.label}
            </Badge>
          );
        },
      },
      {
        id: 'login',
        header: 'Last Login',
        cell: (r) => {
          const extra = userExtraForId(r.id);
          return (
            <div className="text-sm">
              <p className="font-medium">{r.lastLoginAt?.slice(0, 16) || extra.lastLogin}</p>
              <p className="text-[11px] text-muted-foreground">
                {extra.ip} · {extra.location}
              </p>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: (r) => <StatusBadge status={r.status} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
            Access & Settings · Users
          </p>
          <PageHeader
            title="Portal Users & Access Directory"
            description="Provision accounts, enforce MFA, and govern campus-scoped roles across the institution."
          />
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            {ACCESS_UI_MOCK.syncLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled>
              <Download className="size-4" />
              Export Directory
            </Button>
            <PermissionGate permission="users.user.create">
              <Button
                type="button"
                size="sm"
                className="bg-teal-700 hover:bg-teal-800"
                onClick={() => setInviteOpen(true)}
              >
                <Plus className="size-4" />
                Invite User
              </Button>
            </PermissionGate>
          </div>
        </div>
      </div>

      <UsersSummary total={total} />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-card)] lg:flex-row lg:items-center">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or email…"
            className="h-9 pl-8"
          />
        </div>
        <Select
          value={roleFilter || 'all'}
          onValueChange={(v) => {
            setRoleFilter(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[10rem]" aria-label="Role filter">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {(roles.data ?? []).map((r) => (
              <SelectItem key={r.id} value={String(r.id)}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={type || 'all'}
          onValueChange={(v) => {
            setType(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[8rem]" aria-label="Type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status || 'all'}
          onValueChange={(v) => {
            setStatus(v === 'all' ? '' : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[9rem]" aria-label="Status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Status: All</SelectItem>
            <SelectItem value="active">Status: Active</SelectItem>
            <SelectItem value="inactive">Status: Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button type="button" variant="outline" size="icon" className="size-9" disabled>
          <Settings2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-9"
          onClick={() => void users.refetch()}
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{rows.length}</span> showing of{' '}
            {total.toLocaleString()}
          </p>
          <QueryState
            isPending={users.isPending}
            error={users.error}
            onRetry={() => void users.refetch()}
          >
            <DataTable
              columns={columns}
              rows={rows}
              density={density}
              minRows={Math.min(pageSize, 6)}
              onRowClick={(r) => setSelectedId(r.id)}
              className={cn(
                'shadow-[var(--shadow-card)]',
                selectedId != null && '[&_tbody_tr]:cursor-pointer',
              )}
              empty={
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No users match these filters.
                </p>
              }
            />
            <TablePagination
              page={page}
              pages={pages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              noun="users"
            />
          </QueryState>
        </div>

        {selected ? (
          <UserDetailPanel
            user={selected}
            roles={roles.data ?? []}
            campuses={campuses.data ?? []}
          />
        ) : (
          <aside className="hidden rounded-xl border border-dashed border-border bg-card/50 p-6 text-center lg:block lg:sticky lg:top-4">
            <p className="font-heading text-sm font-semibold">User identity dossier</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Select a directory row to review MFA, scopes, roles, and campus access.
            </p>
          </aside>
        )}
      </div>

      <InviteUserWizard open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
}
