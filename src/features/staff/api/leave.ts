import { proxyGet, proxyPost } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE, fetchAllPages } from '../lib/paginate';
import type { LeaveRequest, LeaveRequestDraft, LeaveType, Paginated } from '../types';

export function fetchLeaveTypes(): Promise<LeaveType[]> {
  return proxyGet<LeaveType[]>('/api/v1/leave-types');
}

export function fetchLeaveRequests(params: {
  status?: string;
  staffId?: number;
  page?: number;
  pageSize?: number;
}): Promise<Paginated<LeaveRequest>> {
  const pageSize = Math.min(params.pageSize ?? PAGE_SIZE, PAGE_SIZE);
  return proxyGet<Paginated<LeaveRequest>>('/api/v1/leave-requests', {
    status: params.status,
    staffId: params.staffId === undefined ? undefined : String(params.staffId),
    page: params.page === undefined ? undefined : String(params.page),
    pageSize: String(pageSize),
  });
}

/** All leave requests matching filters (pages of ≤10). */
export function fetchAllLeaveRequests(params: {
  status?: string;
  staffId?: number;
} = {}): Promise<LeaveRequest[]> {
  return fetchAllPages((page, pageSize) =>
    fetchLeaveRequests({ ...params, page, pageSize }),
  );
}

export function createLeaveRequest(body: LeaveRequestDraft): Promise<LeaveRequest> {
  return proxyPost<LeaveRequest>('/api/v1/leave-requests', body);
}

export function cancelLeaveRequest(id: number): Promise<LeaveRequest> {
  return proxyPost<LeaveRequest>(`/api/v1/leave-requests/${id}/cancel`, {});
}

export function approveLeaveRequest(id: number, note?: string): Promise<LeaveRequest> {
  return proxyPost<LeaveRequest>(`/api/v1/leave-requests/${id}/approve`, note ? { note } : {});
}

export function rejectLeaveRequest(id: number, reason: string): Promise<LeaveRequest> {
  return proxyPost<LeaveRequest>(`/api/v1/leave-requests/${id}/reject`, { reason });
}
