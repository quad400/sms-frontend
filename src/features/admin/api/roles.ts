import { proxyDelete, proxyGet, proxyPatch, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import type { GroupedPermissionsResponse, Paginated, PermissionRow, RoleRow } from '../types';

export async function listRoles(): Promise<RoleRow[]> {
  const res = await proxyGet<Paginated<RoleRow> | RoleRow[]>('/api/v1/roles');
  return Array.isArray(res) ? res : (res.data ?? []);
}

export function getRole(id: number): Promise<RoleRow> {
  return proxyGet(`/api/v1/roles/${id}`);
}

export function createRole(body: Record<string, unknown>): Promise<RoleRow> {
  return proxyPost('/api/v1/roles', body);
}

export function updateRole(id: number, body: Record<string, unknown>): Promise<RoleRow> {
  return proxyPatch(`/api/v1/roles/${id}`, body);
}

export function deleteRole(id: number): Promise<void> {
  return proxyDelete(`/api/v1/roles/${id}`);
}

export function replaceRolePermissions(id: number, permissionKeys: string[]) {
  return proxyPut(`/api/v1/roles/${id}/permissions`, { permissionKeys });
}

export async function listPermissions(): Promise<PermissionRow[]> {
  const res = await proxyGet<
    GroupedPermissionsResponse | Paginated<PermissionRow> | PermissionRow[]
  >('/api/v1/permissions');

  if (Array.isArray(res)) return res;

  if (res && typeof res === 'object' && 'modules' in res && Array.isArray(res.modules)) {
    return res.modules.flatMap((mod) =>
      mod.permissions.map((p) => ({
        key: p.key,
        module: mod.key,
        moduleName: mod.name,
        resource: p.resource,
        action: p.action,
        description: p.description,
      })),
    );
  }

  return (res as Paginated<PermissionRow>).data ?? [];
}

/** Create a copy of a role (name + description), then copy its permission set. */
export async function duplicateRole(source: RoleRow): Promise<RoleRow> {
  const copyName = `${source.name} (copy)`;
  const created = await createRole({
    name: copyName,
    description: source.description ?? undefined,
  });
  const keys = source.permissionKeys ?? [];
  if (keys.length > 0) {
    await replaceRolePermissions(created.id, keys);
  }
  return getRole(created.id);
}
