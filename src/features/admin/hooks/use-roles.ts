'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import {
  createRole,
  deleteRole,
  duplicateRole,
  getRole,
  listPermissions,
  listRoles,
  replaceRolePermissions,
  updateRole,
} from '../api/roles';
import type { PermissionRow, RoleRow } from '../types';

export function useRoles(enabled = true) {
  return useQuery<RoleRow[], ApiClientError>({
    queryKey: adminKeys.roles(),
    queryFn: listRoles,
    enabled,
  });
}

export function useRole(id: number) {
  return useQuery<RoleRow, ApiClientError>({
    queryKey: adminKeys.role(id),
    queryFn: () => getRole(id),
  });
}

export function usePermissions() {
  return useQuery<PermissionRow[], ApiClientError>({
    queryKey: adminKeys.permissions(),
    queryFn: listPermissions,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation<RoleRow, ApiClientError, { name: string; description?: string }>({
    mutationFn: (body) => createRole(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.roles() }),
  });
}

export function useDuplicateRole() {
  const qc = useQueryClient();
  return useMutation<RoleRow, ApiClientError, RoleRow>({
    mutationFn: duplicateRole,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.roles() }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation<void, ApiClientError, number>({
    mutationFn: deleteRole,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.roles() }),
  });
}

export type SaveRoleInput = {
  /** When provided, the role name/description are updated before permissions. */
  details?: { name: string; description: string };
  permissionKeys: string[];
};

export function useSaveRole(roleId: number) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, SaveRoleInput>({
    mutationFn: async ({ details, permissionKeys }) => {
      if (details) await updateRole(roleId, details);
      return replaceRolePermissions(roleId, permissionKeys);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.role(roleId) });
      void qc.invalidateQueries({ queryKey: adminKeys.roles() });
    },
  });
}
