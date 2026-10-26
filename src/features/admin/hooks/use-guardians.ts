'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { getGuardian, listGuardians, resetUserPassword, updateGuardian } from '../api/guardians';
import { adminKeys } from '../api/keys';
import type { GuardianRow, Paginated } from '../types';

export type GuardiansParams = { page?: number; q?: string };

export function useGuardians(params: GuardiansParams = {}) {
  return useQuery<Paginated<GuardianRow>, ApiClientError>({
    queryKey: adminKeys.guardians({ ...params }),
    queryFn: () => listGuardians(params),
  });
}

export function useGuardian(id: number) {
  return useQuery<GuardianRow, ApiClientError>({
    queryKey: adminKeys.guardian(id),
    queryFn: () => getGuardian(id),
  });
}

export type GuardianContactInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export function useUpdateGuardian(id: number) {
  const qc = useQueryClient();
  return useMutation<GuardianRow, ApiClientError, GuardianContactInput>({
    mutationFn: (values) => updateGuardian(id, values),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.guardian(id) }),
  });
}

/** Sends a password reset link for the guardian's linked user account. */
export function useResetGuardianPassword() {
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: resetUserPassword,
  });
}
