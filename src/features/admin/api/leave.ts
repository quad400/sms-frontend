import { proxyGet, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { LeaveRequest, LeaveType, Paginated } from '../types';

export function listLeaveTypes(): Promise<LeaveType[] | Paginated<LeaveType>> {
  return proxyGet('/api/v1/leave-types');
}

export function putLeaveTypes(body: unknown) {
  return proxyPut('/api/v1/leave-types', body);
}

export function listLeaveRequests(params: {
  page?: number;
  status?: string;
  staffId?: string;
}): Promise<Paginated<LeaveRequest>> {
  return proxyGet('/api/v1/leave-requests', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    status: params.status,
    staffId: params.staffId,
  });
}

export function approveLeave(id: number) {
  return proxyPost(`/api/v1/leave-requests/${id}/approve`, {});
}

export function rejectLeave(id: number, reason: string) {
  return proxyPost(`/api/v1/leave-requests/${id}/reject`, { reason });
}
