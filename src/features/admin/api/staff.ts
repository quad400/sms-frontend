import { proxyDelete, proxyGet, proxyPatch, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated, StaffRow } from '../types';

export function listStaff(params: {
  page?: number;
  q?: string;
  campusId?: string;
  status?: string;
  jobTitle?: string;
}): Promise<Paginated<StaffRow>> {
  return proxyGet('/api/v1/staff', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    q: params.q,
    campusId: params.campusId,
    status: params.status,
    jobTitle: params.jobTitle,
  });
}

export function getStaffMember(id: number): Promise<StaffRow> {
  return proxyGet(`/api/v1/staff/${id}`);
}

export function createStaffMember(body: Record<string, unknown>): Promise<StaffRow> {
  return proxyPost('/api/v1/staff', body);
}

export function updateStaffMember(id: number, body: Record<string, unknown>): Promise<StaffRow> {
  return proxyPatch(`/api/v1/staff/${id}`, body);
}

export function archiveStaffMember(id: number): Promise<void> {
  return proxyDelete(`/api/v1/staff/${id}`);
}

export function getStaffAllocations(id: number) {
  return proxyGet(`/api/v1/staff/${id}/allocations`);
}

export function putStaffAllocations(id: number, body: unknown) {
  return proxyPut(`/api/v1/staff/${id}/allocations`, body);
}
