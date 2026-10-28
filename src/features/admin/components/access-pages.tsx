'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/patterns/confirm-dialog';
import { EntityHeader } from '@/components/patterns/entity-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PermissionGate, useSession } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  usePermissions,
  useRole,
  useSaveRole,
} from '../hooks/use-roles';
import { QueryState } from '../lib/shared';
import type { PermissionRow, RoleRow } from '../types';

export { UsersPage, RolesListPage } from './access';

const MATRIX_ACTIONS = ['list', 'read', 'create', 'update', 'delete'] as const;

function memberCount(role: RoleRow) {
  return role.userCount ?? 0;
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
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
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
      <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
        Access & Settings · Role matrix
      </p>
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
                  Back to roles
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/access/users">View users</Link>
                </Button>
                <PermissionGate permission="rbac.role.update">
                  <Button
                    type="button"
                    disabled={!dirty}
                    className="bg-teal-700 hover:bg-teal-800"
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
