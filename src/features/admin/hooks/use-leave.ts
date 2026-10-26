'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import {
  approveLeave,
  listLeaveRequests,
  listLeaveTypes,
  putLeaveTypes,
  rejectLeave,
} from '../api/leave';
import type { LeaveRequest, LeaveType, Paginated } from '../types';

export type LeaveRequestsParams = { page?: number; status?: string; staffId?: string };

export function useLeaveRequests(params: LeaveRequestsParams = {}, enabled = true) {
  return useQuery<Paginated<LeaveRequest>, ApiClientError>({
    queryKey: adminKeys.leaveRequests({ ...params }),
    queryFn: () => listLeaveRequests(params),
    enabled,
  });
}

export function useLeaveTypes(enabled = true) {
  return useQuery<LeaveType[], ApiClientError>({
    queryKey: adminKeys.leaveTypes(),
    queryFn: async () => {
      const res = await listLeaveTypes();
      return Array.isArray(res) ? res : (res.data ?? []);
    },
    enabled,
  });
}

function useInvalidateLeaveRequests() {
  const qc = useQueryClient();
  return () =>
    void qc.invalidateQueries({ queryKey: [...adminKeys.all, 'leave-requests'] });
}

export function useApproveLeave() {
  const invalidate = useInvalidateLeaveRequests();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: approveLeave,
    onSuccess: invalidate,
  });
}

export function useRejectLeave() {
  const invalidate = useInvalidateLeaveRequests();
  return useMutation<unknown, ApiClientError, { id: number; reason: string }>({
    mutationFn: ({ id, reason }) => rejectLeave(id, reason),
    onSuccess: invalidate,
  });
}

export function useSaveLeaveTypes() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, LeaveType[]>({
    mutationFn: putLeaveTypes,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.leaveTypes() }),
  });
}
