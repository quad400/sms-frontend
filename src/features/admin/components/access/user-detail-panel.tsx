'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/patterns/status-badge';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import { cn } from '@/lib/utils/cn';
import type { RoleRow, UserRow } from '../../types';
import {
  useActivateUser,
  useDeactivateUser,
  useReplaceUserCampuses,
  useReplaceUserRoles,
  useResetUserPassword,
} from '../../hooks/use-users';
import { ACCESS_UI_MOCK, userExtraForId } from './ui-mock';

export function UserDetailPanel({
  user,
  roles,
  campuses,
}: {
  user: UserRow;
  roles: RoleRow[];
  campuses: Array<{ id: number; name: string }>;
}) {
  const extra = userExtraForId(user.id);
  const [roleIds, setRoleIds] = useState<number[]>([]);
  const [campusIds, setCampusIds] = useState<number[]>([]);

  useEffect(() => {
    setRoleIds(user.roleIds ?? user.roles?.map((r) => r.id) ?? []);
    setCampusIds(user.campusIds ?? []);
  }, [user]);

  const saveRoles = useReplaceUserRoles(user.id);
  const saveCampuses = useReplaceUserCampuses(user.id);
  const activate = useActivateUser(user.id);
  const deactivate = useDeactivateUser(user.id);
  const reset = useResetUserPassword(user.id);

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)] lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]">
      <div className="border-b border-border p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={user.status} />
          <Badge variant="info" size="sm" className="font-mono">
            {extra.staffCode}
          </Badge>
        </div>
        <h2 className="mt-2 font-heading text-lg font-semibold tracking-tight">
          {user.displayName}
        </h2>
        <p className="text-xs text-muted-foreground">
          {user.email ?? 'No email'} · {user.type}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Last login {extra.lastLogin} · {extra.location}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <section className="rounded-xl border border-sky-100 bg-sky-50/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">
            Profile dossier
          </p>
          <div className="mt-2 flex items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-sm font-semibold text-teal-800">
              {user.displayName
                .split(/\s+/)
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            <div className="min-w-0 text-sm">
              <p className="font-semibold">{extra.title}</p>
              <p className="text-xs text-muted-foreground">{user.phone || 'No phone on file'}</p>
              <p className="text-xs text-muted-foreground">
                {campuses.find((c) => campusIds.includes(c.id))?.name ?? 'Campus access pending'}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Security & credential health
          </h3>
          <dl className="space-y-1.5 rounded-lg border border-border p-3 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">2FA</dt>
              <dd>
                <Badge variant={extra.mfa.variant} size="sm">
                  {extra.mfa.label}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Auth tier</dt>
              <dd className="font-medium">SSO / Workspace ready</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Last login IP</dt>
              <dd className="font-mono">{extra.ip}</dd>
            </div>
          </dl>
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Assigned access scopes
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ACCESS_UI_MOCK.scopeCards.map((s) => (
              <div
                key={s.domain}
                className={cn(
                  'rounded-lg border p-2.5',
                  s.tone === 'danger'
                    ? 'border-rose-200 bg-rose-50/50'
                    : s.tone === 'muted'
                      ? 'border-border bg-muted/30'
                      : 'border-border bg-background',
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.title}
                </p>
                <p className="mt-0.5 text-xs font-semibold">{s.domain}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Roles
          </h3>
          <ul className="max-h-36 space-y-1 overflow-auto rounded-lg border border-border p-2">
            {roles.map((r) => (
              <li key={r.id}>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-teal-700"
                    checked={roleIds.includes(r.id)}
                    onChange={(e) =>
                      setRoleIds((prev) =>
                        e.target.checked
                          ? [...prev, r.id]
                          : prev.filter((id) => id !== r.id),
                      )
                    }
                  />
                  {r.name}
                </label>
              </li>
            ))}
          </ul>
          <PermissionGate permission="rbac.user.assign-roles">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={saveRoles.isPending}
              onClick={() =>
                saveRoles.mutate(roleIds, {
                  onSuccess: () => toastSuccess('Roles updated'),
                  onError: (e) => toastError('Could not update roles', e.message),
                })
              }
            >
              Save roles
            </Button>
          </PermissionGate>
        </section>

        <section className="space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Campus access
          </h3>
          <ul className="max-h-28 space-y-1 overflow-auto rounded-lg border border-border p-2">
            {campuses.map((c) => (
              <li key={c.id}>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-teal-700"
                    checked={campusIds.includes(c.id)}
                    onChange={(e) =>
                      setCampusIds((prev) =>
                        e.target.checked
                          ? [...prev, c.id]
                          : prev.filter((id) => id !== c.id),
                      )
                    }
                  />
                  {c.name}
                </label>
              </li>
            ))}
          </ul>
          <PermissionGate permission="rbac.user.assign-campuses">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              disabled={saveCampuses.isPending}
              onClick={() =>
                saveCampuses.mutate(campusIds, {
                  onSuccess: () => toastSuccess('Campuses updated'),
                  onError: (e) => toastError('Could not update campuses', e.message),
                })
              }
            >
              Save campuses
            </Button>
          </PermissionGate>
        </section>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-border p-3">
        <PermissionGate permission="users.user.activate">
          <Button
            size="sm"
            variant="outline"
            disabled={activate.isPending}
            onClick={() =>
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
          <Button
            size="sm"
            variant="outline"
            className="text-danger"
            disabled={deactivate.isPending}
            onClick={() =>
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
          <Button
            size="sm"
            variant="outline"
            disabled={reset.isPending}
            onClick={() =>
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
    </aside>
  );
}
