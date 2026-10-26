'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  fetchAllLeaveRequests,
  fetchLeaveTypes,
  rejectLeaveRequest,
} from '../api/leave';
import { staffKeys } from '../api/keys';
import { PAGE_SIZE } from '../lib/paginate';
import type { LeaveRequest, LeaveRequestDraft, LeaveType, Paginated } from '../types';

export function useLeaveTypes() {
  return useQuery<LeaveType[], ApiClientError>({
    queryKey: staffKeys.leaveTypes(),
    queryFn: fetchLeaveTypes,
    staleTime: 10 * 60_000,
  });
}

export function useLeaveRequests(
  params: { status?: string; staffId?: number } = {},
  enabled = true,
) {
  return useQuery<Paginated<LeaveRequest>, ApiClientError>({
    queryKey: staffKeys.leaveRequests({ ...params }),
    queryFn: async () => {
      const data = await fetchAllLeaveRequests(params);
      return { data, meta: { page: 1, pageSize: PAGE_SIZE, total: data.length } };
    },
    enabled,
  });
}

function useInvalidateLeave() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [...staffKeys.all, 'leave-requests'] });
    void queryClient.invalidateQueries({ queryKey: staffKeys.approvalsCount() });
  };
}

export function useCreateLeaveRequest() {
  const invalidate = useInvalidateLeave();
  return useMutation<LeaveRequest, ApiClientError, LeaveRequestDraft>({
    mutationFn: createLeaveRequest,
    onSuccess: invalidate,
  });
}

export function useCancelLeaveRequest() {
  const invalidate = useInvalidateLeave();
  return useMutation<LeaveRequest, ApiClientError, number>({
    mutationFn: cancelLeaveRequest,
    onSuccess: invalidate,
  });
}

export function useApproveLeaveRequest() {
  const invalidate = useInvalidateLeave();
  return useMutation<LeaveRequest, ApiClientError, { id: number; note?: string }>({
    mutationFn: ({ id, note }) => approveLeaveRequest(id, note),
    onSuccess: invalidate,
  });
}

export function useRejectLeaveRequest() {
  const invalidate = useInvalidateLeave();
  return useMutation<LeaveRequest, ApiClientError, { id: number; reason: string }>({
    mutationFn: ({ id, reason }) => rejectLeaveRequest(id, reason),
    onSuccess: invalidate,
  });
}
