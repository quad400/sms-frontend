'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import {
  activateUser,
  createUser,
  deactivateUser,
  listUsers,
  replaceUserCampuses,
  replaceUserRoles,
  resetUserPassword,
} from '../api/users';
import type { Paginated, UserRow } from '../types';

export type UsersParams = {
  page?: number;
  q?: string;
  type?: string;
  status?: string;
  campusId?: string;
};

export function useUsers(params: UsersParams = {}) {
  return useQuery<Paginated<UserRow>, ApiClientError>({
    queryKey: adminKeys.users({ ...params }),
    queryFn: () => listUsers(params),
  });
}

function useInvalidateUsers() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: [...adminKeys.all, 'users'] });
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation<
    UserRow,
    ApiClientError,
    { displayName: string; email: string; password: string; type: string }
  >({
    mutationFn: (v) =>
      createUser({
        displayName: v.displayName,
        email: v.email || undefined,
        password: v.password,
        type: v.type,
      }),
    onSuccess: invalidate,
  });
}

export function useReplaceUserRoles(userId: number | undefined) {
  const invalidate = useInvalidateUsers();
  return useMutation<unknown, ApiClientError, number[]>({
    mutationFn: (roleIds) => replaceUserRoles(userId!, roleIds),
    onSuccess: invalidate,
  });
}

export function useReplaceUserCampuses(userId: number | undefined) {
  const invalidate = useInvalidateUsers();
  return useMutation<unknown, ApiClientError, number[]>({
    mutationFn: (campusIds) => replaceUserCampuses(userId!, campusIds),
    onSuccess: invalidate,
  });
}

export function useActivateUser(userId: number | undefined) {
  const invalidate = useInvalidateUsers();
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => activateUser(userId!),
    onSuccess: invalidate,
  });
}

export function useDeactivateUser(userId: number | undefined) {
  const invalidate = useInvalidateUsers();
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => deactivateUser(userId!),
    onSuccess: invalidate,
  });
}

export function useResetUserPassword(userId: number | undefined) {
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => resetUserPassword(userId!),
  });
}
