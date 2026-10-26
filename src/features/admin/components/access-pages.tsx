'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { DataTable, type DataTableColumn } from '@/components/patterns/data-table';
import { EntityHeader } from '@/components/patterns/entity-header';
import { FilterBar, FilterSelect } from '@/components/patterns/filter-bar';
import { PageHeader } from '@/components/patterns/page-header';
import { StatusBadge } from '@/components/patterns/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ApiClientError } from '@/lib/api/errors';
import { PermissionGate, useSession } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useCreateRole,
  useDeleteRole,
  useDuplicateRole,
  usePermissions,
  useRole,
  useRoles,
  useSaveRole,
} from '../hooks/use-roles';
import { useCampuses } from '../hooks/use-structure';
import {
  useActivateUser,
  useCreateUser,
  useDeactivateUser,
  useReplaceUserCampuses,
  useReplaceUserRoles,
  useResetUserPassword,
  useUsers,
} from '../hooks/use-users';
import { useAdminCampus } from '../lib/campus';
import { QueryState } from '../lib/shared';
import type { PermissionRow, RoleRow, UserRow } from '../types';

export function UsersPage() {
  const { density, campusQuery } = useAdminCampus();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const users = useUsers({
    page,
    q: q || undefined,
    type: type || undefined,
    campusId: campusQuery,
  });
  const roles = useRoles();
  const campuses = useCampuses();

  const columns: DataTableColumn<UserRow>[] = [
    { id: 'name', header: 'Name', cell: (r) => r.displayName },
    { id: 'type', header: 'Type', cell: (r) => r.type },
    { id: 'email', header: 'Email', cell: (r) => r.email ?? '—' },
    {
      id: 'roles',
      header: 'Roles',
      cell: (r) => r.roles?.map((x) => x.name).join(', ') || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (r) => <StatusBadge status={r?.status} />,
    },
  ];

  const total = users.data?.meta.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / (users.data?.meta.pageSize ?? 10)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description={`${total} users`}
        actions={
          <PermissionGate permission="users.user.create">
            <Button type="button" onClick={() => setCreateOpen(true)}>
              Create user
            </Button>
          </PermissionGate>
        }
      />
      <FilterBar search={q} onSearchChange={(v) => { setQ(v); setPage(1); }}>
        <FilterSelect
          label="Type"
          value={type}
          onChange={(v) => { setType(v); setPage(1); }}
          options={[
            { value: 'staff', label: 'Staff' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
      </FilterBar>
      <QueryState isPending={users.isPending} error={users.error} onRetry={() => void users.refetch()}>
        <DataTable
          columns={columns}
          rows={users.data?.data ?? []}
          density={density}
          onRowClick={(r) => setSelected(r)}
        />
      </QueryState>
      {pages > 1 ? (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-xs text-muted-foreground">Page {page}/{pages}</span>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      ) : null}

      <UserDrawer
        user={selected}
        roles={roles.data ?? []}
        campuses={campuses.data ?? []}
        onClose={() => setSelected(null)}
      />
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function UserDrawer({
  user,
  roles,
  campuses,
  onClose,
}: {
  user: UserRow | null;
  roles: RoleRow[];
  campuses: Array<{ id: number; name: string }>;
  onClose: () => void;
}) {
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [campusIds, setCampusIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user) return;
    setRoleIds(user.roleIds ?? user.roles?.map((r) => r.id) ?? []);
    setCampusIds(user.campusIds ?? []);
  }, [user]);

  const saveRoles = useReplaceUserRoles(user?.id);
  const saveCampuses = useReplaceUserCampuses(user?.id);
  const activate = useActivateUser(user?.id);
  const deactivate = useDeactivateUser(user?.id);
  const reset = useResetUserPassword(user?.id);

  return (
    <Sheet open={!!user} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{user?.displayName ?? 'User'}</SheetTitle>
        </SheetHeader>
        {user ? (
          <div className="mt-4 space-y-4 text-sm">
            <p className="text-muted-foreground">{user.email} · {user.type}</p>
            <StatusBadge status={user?.status} />
            <div>
              <h3 className="mb-2 font-semibold">Roles</h3>
              <div className="space-y-1">
                {roles.map((r) => (
                  <label key={r.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={roleIds.includes(r.id)}
                      onChange={(e) =>
                        setRoleIds((prev) =>
                          e.target.checked ? [...prev, r.id] : prev.filter((id) => id !== r.id),
                        )
                      }
                    />
                    {r.name}
                  </label>
                ))}
              </div>
              <PermissionGate permission="rbac.user.assign-roles">
                <Button className="mt-2" size="sm" disabled={saveRoles.isPending} onClick={() =>
                    saveRoles.mutate(roleIds, {
                      onSuccess: () => toastSuccess('Roles updated'),
                      onError: (e) => toastError('Could not update roles', e.message),
                    })
                  }>
                  Save roles
                </Button>
              </PermissionGate>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Campuses</h3>
              <div className="space-y-1">
                {campuses.map((c) => (
                  <label key={c.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={campusIds.includes(c.id)}
                      onChange={(e) =>
                        setCampusIds((prev) =>
                          e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                        )
                      }
                    />
                    {c.name}
                  </label>
                ))}
              </div>
              <PermissionGate permission="rbac.user.assign-campuses">
                <Button className="mt-2" size="sm" disabled={saveCampuses.isPending} onClick={() =>
                    saveCampuses.mutate(campusIds, {
                      onSuccess: () => toastSuccess('Campus access updated'),
                      onError: (e) => toastError('Could not update campuses', e.message),
                    })
                  }>
                  Save campuses
                </Button>
              </PermissionGate>
            </div>
            <div className="flex flex-wrap gap-2">
              <PermissionGate permission="users.user.activate">
                <Button size="sm" variant="outline" onClick={() =>
                    activate.mutate(undefined, {
                      onSuccess: () => toastSuccess('User activated'),
                      onError: (e) => toastError('Could not activate', e.message),
                    })
                  }
                >
                  Activate
                </Button>
              </PermissionGate>
              <PermissionGate permission="users.user.deactivate">
                <Button size="sm" variant="outline" onClick={() =>
                    deactivate.mutate(undefined, {
                      onSuccess: () => toastSuccess('User deactivated'),
                      onError: (e) => toastError('Could not deactivate', e.message),
                    })
                  }
                >
                  Deactivate
                </Button>
              </PermissionGate>
              <PermissionGate permission="users.user.reset-password">
                <Button size="sm" variant="outline" onClick={() =>
                    reset.mutate(undefined, {
                      onSuccess: () => toastSuccess('Reset link sent'),
                      onError: (e) => toastError('Could not reset', e.message),
                    })
                  }
                >
                  Reset password
                </Button>
              </PermissionGate>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const form = useForm({
    defaultValues: { displayName: '', email: '', password: '', type: 'staff' as 'staff' | 'admin' },
  });
  const create = useCreateUser();

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create user"
      description="Staff and admin accounts only. Parents and students are system-created."
      confirmLabel="Create"
      isPending={create.isPending}
      onConfirm={() => {
        const v = form.getValues();
        create.mutate(v, {
          onSuccess: () => {
            toastSuccess('User created');
            onOpenChange(false);
            form.reset();
          },
          onError: (e) => toastError('Could not create', e.message),
        });
      }}
    >
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>Display name</Label>
          <Input {...form.register('displayName', { required: true })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Email</Label>
          <Input type="email" {...form.register('email')} />
        </div>
        <div className="grid gap-1.5">
          <Label>Password</Label>
          <Input type="password" {...form.register('password', { required: true })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Type</Label>
          <select className="h-10 rounded-md border border-border bg-background px-2 text-sm" {...form.register('type')}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </ConfirmDialog>
  );
}

const MATRIX_ACTIONS = ['list', 'read', 'create', 'update', 'delete'] as const;

function permissionCount(role: RoleRow) {
  return role.permissionCount ?? role.permissionKeys?.length ?? 0;
}

function memberCount(role: RoleRow) {
  return role.userCount ?? 0;
}

export function RolesListPage() {
  const { density } = useAdminCampus();
  const router = useRouter();
  const roles = useRoles();
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [q, setQ] = useState('');

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

  const create = useCreateRole();
  const duplicate = useDuplicateRole();
  const remove = useDeleteRole();

  const handleDuplicate = (role: RoleRow) =>
    duplicate.mutate(role, {
      onSuccess: (created) => {
        toastSuccess('Role duplicated');
        router.push(`/admin/access/roles/${created.id}`);
      },
      onError: (e) => toastError('Could not duplicate', e.message),
    });

  const handleCreate = () =>
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

  const handleDelete = (id: number) =>
    remove.mutate(id, {
      onSuccess: () => {
        toastSuccess('Role deleted');
        setDeleteTarget(null);
      },
      onError: (e) => {
        if (e instanceof ApiClientError && e.mapped.code === 'ROLE_ASSIGNED') {
          toastError('Cannot delete', e.message);
          return;
        }
        toastError('Could not delete', e.message);
      },
    });

  const columns: DataTableColumn<RoleRow>[] = [
    {
      id: 'name',
      header: 'Role',
      cell: (r) => (
        <div className="min-w-0">
          <Link className="font-medium text-primary hover:underline" href={`/admin/access/roles/${r.id}`}>
            {r.name}
          </Link>
          {r.isSystem ? (
            <span className="ml-2 inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              System
            </span>
          ) : null}
          {r.description ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{r.description}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: 'users',
      header: 'Members',
      cell: (r) => (
        <Link
          href="/admin/access/users"
          className="tabular-nums text-primary hover:underline"
          title="Manage members from Users"
        >
          {memberCount(r)}
        </Link>
      ),
    },
    {
      id: 'perms',
      header: 'Permissions',
      cell: (r) => <span className="tabular-nums">{permissionCount(r)}</span>,
    },
    {
      id: 'actions',
      header: '',
      cell: (r) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/admin/access/roles/${r.id}`}>Edit</Link>
          </Button>
          <PermissionGate permission="rbac.role.create">
            <Button
              size="sm"
              variant="ghost"
              disabled={duplicate.isPending}
              onClick={() => handleDuplicate(r)}
            >
              Duplicate
            </Button>
          </PermissionGate>
          {!r.isSystem ? (
            <PermissionGate permission="rbac.role.delete">
              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(r)}>
                Delete
              </Button>
            </PermissionGate>
          ) : null}
        </div>
      ),
    },
  ];

  const totalMembers = (roles.data ?? []).reduce((sum, r) => sum + memberCount(r), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Roles"
        description={`${roles.data?.length ?? 0} roles · ${totalMembers} total assignments`}
        actions={
          <PermissionGate permission="rbac.role.create">
            <Button type="button" onClick={() => setCreateOpen(true)}>
              New role
            </Button>
          </PermissionGate>
        }
      />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search roles…" />
      <QueryState isPending={roles.isPending} error={roles.error} onRetry={() => void roles.refetch()}>
        <DataTable
          columns={columns}
          rows={filtered}
          density={density}
          onRowClick={(r) => router.push(`/admin/access/roles/${r.id}`)}
        />
      </QueryState>

      <ConfirmDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create role"
        description="After creating, assign permissions on the role detail page."
        confirmLabel="Create"
        isPending={create.isPending}
        onConfirm={() => {
          if (!newName.trim()) {
            toastError('Name required');
            return;
          }
          handleCreate();
        }}
      >
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Bursar" />
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
            ? `This role has ${memberCount(deleteTarget)} assigned member${memberCount(deleteTarget) === 1 ? '' : 's'}. Reassign them on the Users page before deleting.`
            : 'This permanently removes the role. Permissions will no longer apply via this role.'
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
          handleDelete(deleteTarget.id);
        }}
      >
        {deleteTarget && memberCount(deleteTarget) > 0 ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/access/users">Open Users</Link>
          </Button>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}

function PermissionMatrix({
  perms,
  selected,
  readOnly,
  onToggle,
  onToggleResource,
}: {
  perms: PermissionRow[];
  selected: Set<string>;
  readOnly: boolean;
  onToggle: (key: string, on: boolean) => void;
  onToggleResource: (keys: string[], allOn: boolean) => void;
}) {
  const { resources, otherByResource, actionMaps } = useMemo(() => {
    const actionMaps = new Map<string, Map<string, PermissionRow>>();
    const otherByResource = new Map<string, PermissionRow[]>();
    for (const p of perms) {
      if ((MATRIX_ACTIONS as readonly string[]).includes(p.action)) {
        const actions = actionMaps.get(p.resource) ?? new Map<string, PermissionRow>();
        actions.set(p.action, p);
        actionMaps.set(p.resource, actions);
      } else {
        const list = otherByResource.get(p.resource) ?? [];
        list.push(p);
        otherByResource.set(p.resource, list);
      }
    }
    const resources = [...new Set([...actionMaps.keys(), ...otherByResource.keys()])].sort();
    return { resources, otherByResource, actionMaps };
  }, [perms]);

  if (resources.length === 0) {
    return <p className="text-sm text-muted-foreground">No permissions in this module.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-2 py-2 font-medium">Resource</th>
            {MATRIX_ACTIONS.map((a) => (
              <th key={a} className="px-2 py-2 text-center font-medium">
                {a}
              </th>
            ))}
            <th className="px-2 py-2 font-medium">Other</th>
            <th className="px-2 py-2 text-center font-medium">All</th>
          </tr>
        </thead>
        <tbody>
          {resources.map((resource) => {
            const actions = actionMaps.get(resource) ?? new Map();
            const others = otherByResource.get(resource) ?? [];
            const rowKeys = [
              ...MATRIX_ACTIONS.map((a) => actions.get(a)?.key).filter(Boolean) as string[],
              ...others.map((p) => p.key),
            ];
            const allOn = rowKeys.length > 0 && rowKeys.every((k) => selected.has(k));
            return (
              <tr key={resource} className="border-b border-border/70">
                <td className="px-2 py-2 font-medium capitalize">{resource.replace(/-/g, ' ')}</td>
                {MATRIX_ACTIONS.map((action) => {
                  const p = actions.get(action);
                  if (!p) {
                    return (
                      <td key={action} className="px-2 py-2 text-center text-muted-foreground/40">
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={action} className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        className="size-4"
                        title={`${p.key}${p.description ? ` — ${p.description}` : ''}`}
                        checked={selected.has(p.key)}
                        disabled={readOnly}
                        onChange={(e) => onToggle(p.key, e.target.checked)}
                        aria-label={p.key}
                      />
                    </td>
                  );
                })}
                <td className="px-2 py-2">
                  {others.length === 0 ? (
                    <span className="text-muted-foreground/40">—</span>
                  ) : (
                    <ul className="space-y-1">
                      {others.map((p) => (
                        <li key={p.key}>
                          <label className="flex items-center gap-2" title={p.description ?? p.key}>
                            <input
                              type="checkbox"
                              className="size-4"
                              checked={selected.has(p.key)}
                              disabled={readOnly}
                              onChange={(e) => onToggle(p.key, e.target.checked)}
                            />
                            <span className="text-xs">{p.action}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    className="size-4"
                    checked={allOn}
                    disabled={readOnly || rowKeys.length === 0}
                    onChange={() => onToggleResource(rowKeys, allOn)}
                    aria-label={`Toggle all ${resource}`}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function RoleEditorPage({ roleId }: { roleId: number }) {
  const { user, can } = useSession();
  const router = useRouter();
  const role = useRole(roleId);
  const permissions = usePermissions();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('');
  const [activeModule, setActiveModule] = useState<string | null>(null);

  useEffect(() => {
    if (!role.data) return;
    setName(role.data.name);
    setDescription(role.data.description ?? '');
    setSelected(new Set(role.data.permissionKeys ?? []));
  }, [role.data]);

  const modules = useMemo(() => {
    const list = permissions.data ?? [];
    const map = new Map<string, { label: string; perms: PermissionRow[] }>();
    for (const p of list) {
      if (
        moduleFilter &&
        !p.module.toLowerCase().includes(moduleFilter.toLowerCase()) &&
        !(p.moduleName ?? '').toLowerCase().includes(moduleFilter.toLowerCase()) &&
        !p.key.toLowerCase().includes(moduleFilter.toLowerCase())
      ) {
        continue;
      }
      const entry = map.get(p.module) ?? { label: p.moduleName ?? p.module, perms: [] };
      entry.perms.push(p);
      map.set(p.module, entry);
    }
    return [...map.entries()].sort(([, a], [, b]) => a.label.localeCompare(b.label));
  }, [permissions.data, moduleFilter]);

  const currentModule = activeModule ?? modules[0]?.[0] ?? null;
  const currentEntry = modules.find(([m]) => m === currentModule)?.[1];
  const modulePerms = currentEntry?.perms ?? [];

  const initialKeys = useMemo(() => new Set(role.data?.permissionKeys ?? []), [role.data]);
  const added = [...selected].filter((k) => !initialKeys.has(k));
  const removed = [...initialKeys].filter((k) => !selected.has(k));
  const dirty =
    added.length + removed.length > 0 ||
    name !== (role.data?.name ?? '') ||
    description !== (role.data?.description ?? '');

  const strippingOwnRoleEdit =
    !!user &&
    can('rbac.role.update') &&
    removed.includes('rbac.role.update') &&
    !selected.has('rbac.role.update');

  const readOnly = !!role.data?.isSystem;
  const members = memberCount(role.data ?? { id: roleId, name: '' });

  const save = useSaveRole(roleId);

  const handleSave = () => {
    if (strippingOwnRoleEdit) {
      toastError('Could not save', 'You cannot remove your own last role-edit permission.');
      return;
    }
    save.mutate(
      {
        details: readOnly ? undefined : { name, description },
        permissionKeys: [...selected],
      },
      {
        onSuccess: () => {
          toastSuccess('Role saved');
          setConfirmOpen(false);
        },
        onError: (e) => toastError('Could not save', e.message),
      },
    );
  };

  const toggleKey = (key: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const toggleKeys = (keys: string[], allOn: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const k of keys) {
        if (allOn) next.delete(k);
        else next.add(k);
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <QueryState
        isPending={role.isPending}
        error={role.error}
        onRetry={() => void role.refetch()}
      >
        {role.data ? (
          <EntityHeader
            title={name || role.data.name}
            subtitle={description || role.data.description || undefined}
            status={role.data.isSystem ? 'system' : 'custom'}
            meta={
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <span className="font-medium text-foreground">{members}</span> member
                  {members === 1 ? '' : 's'}
                </span>
                <span>
                  <span className="font-medium text-foreground">{selected.size}</span> permission
                  {selected.size === 1 ? '' : 's'} selected
                </span>
                <span>
                  Catalogue has{' '}
                  <span className="font-medium text-foreground">{permissions.data?.length ?? '…'}</span>
                </span>
                {dirty ? (
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900">
                    {added.length + removed.length} unsaved permission change
                    {added.length + removed.length === 1 ? '' : 's'}
                  </span>
                ) : null}
              </div>
            }
            actions={
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/access/roles')}>
                  Back
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/access/users">View users</Link>
                </Button>
                <PermissionGate permission="rbac.role.update">
                  <Button
                    type="button"
                    disabled={!dirty}
                    onClick={() => setConfirmOpen(true)}
                  >
                    Save changes
                  </Button>
                </PermissionGate>
              </div>
            }
            banner={
              readOnly ? (
                <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                  System role — name is locked. Permission changes may be restricted by policy.
                </div>
              ) : null
            }
          />
        ) : null}
      </QueryState>

      <QueryState
        isPending={permissions.isPending}
        error={permissions.error}
        onRetry={() => void permissions.refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={readOnly} />
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={readOnly}
              placeholder="What this role can do"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
          <div className="space-y-2">
            <Input
              placeholder="Filter modules…"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            />
            <ul className="max-h-[28rem] space-y-1 overflow-auto rounded-xl border border-border p-2">
              {modules.map(([mod, { label, perms }]) => {
                const on = perms.filter((p) => selected.has(p.key)).length;
                return (
                  <li key={mod}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${
                        currentModule === mod ? 'bg-muted font-medium' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setActiveModule(mod)}
                    >
                      <span className="truncate">{label}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {on}/{perms.length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-xl border border-border p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-heading font-semibold">{currentEntry?.label ?? currentModule}</h2>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={readOnly || modulePerms.length === 0}
                onClick={() => {
                  const keys = modulePerms.map((p) => p.key);
                  const allOn = keys.every((k) => selected.has(k));
                  toggleKeys(keys, allOn);
                }}
              >
                Toggle module
              </Button>
            </div>
            <PermissionMatrix
              perms={modulePerms}
              selected={selected}
              readOnly={readOnly}
              onToggle={toggleKey}
              onToggleResource={toggleKeys}
            />
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              Scope notes still apply at runtime (for example teachers remain limited to allocated classes
              even when a broader permission is granted).
            </p>
          </div>
        </div>
      </QueryState>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Save role permissions?"
        description={
          strippingOwnRoleEdit
            ? 'Blocked: this would remove your ability to edit roles.'
            : members > 0
              ? `Add ${added.length}, remove ${removed.length}. This role is assigned to ${members} member${members === 1 ? '' : 's'} — changes apply immediately.`
              : `Add ${added.length}, remove ${removed.length}.`
        }
        confirmLabel="Save"
        isPending={save.isPending}
        onConfirm={() => {
          if (strippingOwnRoleEdit) {
            toastError('Blocked', 'You cannot remove your own last role-edit permission.');
            return;
          }
          handleSave();
        }}
      >
        <ul className="max-h-40 overflow-auto text-xs text-muted-foreground">
          {added.map((k) => (
            <li key={`+${k}`}>+ {k}</li>
          ))}
          {removed.map((k) => (
            <li key={`-${k}`}>− {k}</li>
          ))}
        </ul>
      </ConfirmDialog>
    </div>
  );
}
