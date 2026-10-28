'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Copy,
  KeyRound,
  Plus,
  Shield,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { PageHeader } from '@/components/patterns/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiClientError } from '@/lib/api/errors';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import type { RoleRow } from '../../types';
import {
  useCreateRole,
  useDeleteRole,
  useDuplicateRole,
  useRoles,
} from '../../hooks/use-roles';
import { QueryState } from '../../lib/shared';
import { ACCESS_UI_MOCK } from './ui-mock';

function permissionCount(role: RoleRow) {
  return role.permissionCount ?? role.permissionKeys?.length ?? 0;
}

function memberCount(role: RoleRow) {
  return role.userCount ?? 0;
}

export function RolesListPage() {
  const router = useRouter();
  const roles = useRoles();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);

  const create = useCreateRole();
  const duplicate = useDuplicateRole();
  const remove = useDeleteRole();

  const filtered = useMemo(() => {
    const list = roles.data ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (r) =>
        r.name.toLowerCase().includes(needle) ||
        (r.description ?? '').toLowerCase().includes(needle),
    );
  }, [roles.data, q]);

  const selected =
    filtered.find((r) => r.id === activeId) ?? filtered[0] ?? null;

  const s = ACCESS_UI_MOCK.rolesSummary;
  const elevated = (roles.data ?? []).filter(
    (r) => permissionCount(r) > 40 || /admin|principal|bursar/i.test(r.name),
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
            Access & Settings · RBAC
          </p>
          <PageHeader
            title="Roles & Granular Permissions Governance"
            description="Zero-trust segregation of duties — configure least-privilege roles and enforce module permission nodes."
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" asChild>
            <Link href="/admin/access/audit">Audit RBAC Changes</Link>
          </Button>
          <PermissionGate permission="rbac.role.create">
            <Button
              type="button"
              size="sm"
              className="bg-teal-700 hover:bg-teal-800"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Create Custom Role
            </Button>
          </PermissionGate>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Configured Roles"
          value={`${roles.data?.length ?? s.activeRoles} Active`}
          icon={<KeyRound className="size-4" />}
          iconClass="bg-sky-50 text-sky-700"
        />
        <SummaryCard
          label="Permission Nodes"
          value={`${s.permissionNodes} Enforced`}
          icon={<Shield className="size-4" />}
          iconClass="bg-teal-50 text-teal-700"
        />
        <SummaryCard
          label="Elevated Privileges"
          value={`${elevated || s.elevated} High Governance`}
          icon={<ShieldCheck className="size-4" />}
          iconClass="bg-amber-50 text-amber-800"
        />
        <SummaryCard
          label="Least-Privilege Rate"
          value={`${s.leastPrivilege}%`}
          icon={<ShieldCheck className="size-4" />}
          iconClass="bg-emerald-50 text-emerald-700"
        >
          <p className="text-xs font-semibold text-emerald-700">{s.leastDelta}</p>
        </SummaryCard>
      </div>

      <QueryState
        isPending={roles.isPending}
        error={roles.error}
        onRetry={() => void roles.refetch()}
      >
        <nav
          className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-muted/40 p-2 shadow-[var(--shadow-card)]"
          aria-label="Roles"
        >
          {filtered.map((r) => {
            const active = (selected?.id ?? null) === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveId(r.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition',
                  active
                    ? 'bg-teal-700 text-white'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground',
                )}
              >
                <Shield className="size-3.5 opacity-80" />
                {r.name}
              </button>
            );
          })}
        </nav>

        <div className="relative max-w-xs">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter roles…"
            className="h-9"
          />
        </div>

        {selected ? (
          <article className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Shield className="size-5" />
                </span>
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-xl font-semibold tracking-tight">
                      {selected.name}
                    </h2>
                    {selected.isSystem ? (
                      <Badge variant="successSoft" size="sm">
                        System Core Role
                      </Badge>
                    ) : (
                      <Badge variant="secondary" size="sm">
                        Custom Role
                      </Badge>
                    )}
                    <Badge variant="info" size="sm">
                      {memberCount(selected)} Users Assigned
                    </Badge>
                  </div>
                  <Badge variant="soft" size="sm">
                    Scope · Campus-wide (Multi-entity)
                  </Badge>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    {selected.description ||
                      'Configure module permission nodes for this privilege profile. Changes apply to all assigned users immediately.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href="/admin/access/users">
                    View {memberCount(selected)} Users
                  </Link>
                </Button>
                <Button type="button" variant="outline" size="sm" asChild>
                  <Link href={`/admin/access/roles/${selected.id}`}>
                    Credential Constraints
                  </Link>
                </Button>
                <PermissionGate permission="rbac.role.create">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={duplicate.isPending}
                    onClick={() =>
                      duplicate.mutate(selected, {
                        onSuccess: (created) => {
                          toastSuccess('Role duplicated');
                          router.push(`/admin/access/roles/${created.id}`);
                        },
                        onError: (e) => toastError('Could not duplicate', e.message),
                      })
                    }
                  >
                    <Copy className="size-3.5" />
                    Duplicate
                  </Button>
                </PermissionGate>
                {!selected.isSystem ? (
                  <PermissionGate permission="rbac.role.delete">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-danger"
                      onClick={() => setDeleteTarget(selected)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </PermissionGate>
                ) : null}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <StatChip
                label="Permission nodes"
                value={String(permissionCount(selected))}
              />
              <StatChip label="Assigned users" value={String(memberCount(selected))} />
              <StatChip
                label="Governance"
                value={selected.isSystem ? 'Locked baseline' : 'Editable'}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Open the permission matrix to grant or revoke module actions for this role.
              </p>
              <Button asChild className="bg-teal-700 hover:bg-teal-800">
                <Link href={`/admin/access/roles/${selected.id}`}>
                  Open permission matrix
                </Link>
              </Button>
            </div>
          </article>
        ) : (
          <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
            No roles yet. Create a custom role to begin.
          </p>
        )}
      </QueryState>

      <ConfirmDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create custom role"
        description="After creating, assign permissions on the role matrix."
        confirmLabel="Create"
        isPending={create.isPending}
        onConfirm={() => {
          if (!newName.trim()) {
            toastError('Name required');
            return;
          }
          create.mutate(
            { name: newName.trim(), description: newDescription.trim() || undefined },
            {
              onSuccess: (role) => {
                toastSuccess('Role created');
                setCreateOpen(false);
                setNewName('');
                setNewDescription('');
                router.push(`/admin/access/roles/${role.id}`);
              },
              onError: (e) => toastError('Could not create', e.message),
            },
          );
        }}
      >
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label required>Name</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Bursar & Finance Lead"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What this role is for"
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title={`Delete “${deleteTarget?.name ?? ''}”?`}
        description={
          deleteTarget && memberCount(deleteTarget) > 0
            ? `This role has ${memberCount(deleteTarget)} assigned members. Reassign them first.`
            : 'This permanently removes the role.'
        }
        confirmLabel="Delete"
        destructive
        isPending={remove.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (memberCount(deleteTarget) > 0) {
            toastError('Cannot delete', 'Reassign members first.');
            return;
          }
          remove.mutate(deleteTarget.id, {
            onSuccess: () => {
              toastSuccess('Role deleted');
              setDeleteTarget(null);
              setActiveId(null);
            },
            onError: (e) => {
              if (e instanceof ApiClientError && e.mapped.code === 'ROLE_ASSIGNED') {
                toastError('Cannot delete', e.message);
                return;
              }
              toastError('Could not delete', e.message);
            },
          });
        }}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  iconClass,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconClass: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl', iconClass)}>
          {icon}
        </span>
      </div>
      <p className="mt-2 font-heading text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-heading text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}
