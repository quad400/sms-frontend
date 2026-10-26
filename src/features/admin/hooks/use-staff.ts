'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import {
  archiveStaffMember,
  createStaffMember,
  getStaffAllocations,
  getStaffMember,
  listStaff,
  updateStaffMember,
} from '../api/staff';
import type { Paginated, StaffRow } from '../types';

export type StaffListParams = {
  page?: number;
  q?: string;
  campusId?: string;
  status?: string;
  jobTitle?: string;
};

export function useStaffList(params: StaffListParams = {}, enabled = true) {
  return useQuery<Paginated<StaffRow>, ApiClientError>({
    queryKey: adminKeys.staffList({ ...params }),
    queryFn: () => listStaff(params),
    enabled,
  });
}

export function useStaffMember(id: number | null | undefined, enabled = true) {
  return useQuery<StaffRow, ApiClientError>({
    queryKey: adminKeys.staffMember(id ?? 0),
    queryFn: () => getStaffMember(id!),
    enabled: enabled && id != null,
  });
}

export function useStaffAllocations(id: number, enabled = true) {
  return useQuery<unknown, ApiClientError>({
    queryKey: adminKeys.staffAllocations(id),
    queryFn: () => getStaffAllocations(id),
    enabled,
  });
}

export function useSaveStaff(staffId?: number) {
  const qc = useQueryClient();
  return useMutation<StaffRow, ApiClientError, Record<string, unknown>>({
    mutationFn: (body) =>
      staffId != null ? updateStaffMember(staffId, body) : createStaffMember(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

export function useArchiveStaff() {
  const qc = useQueryClient();
  return useMutation<void, ApiClientError, number>({
    mutationFn: archiveStaffMember,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.all }),
  });
}
