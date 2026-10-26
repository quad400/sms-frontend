import { proxyGet } from '@/lib/api/proxy-fetch';
import type { StaffAllocation, StaffMe, StaffOverview } from '../types';

export function fetchStaffMe(): Promise<StaffMe> {
  return proxyGet<StaffMe>('/api/v1/staff/me');
}

export function fetchStaffOverview(): Promise<StaffOverview> {
  return proxyGet<StaffOverview>('/api/v1/staff/me/overview');
}

export function fetchStaffAllocations(sessionId?: number): Promise<StaffAllocation[]> {
  return proxyGet<StaffAllocation[]>('/api/v1/staff/me/allocations', {
    sessionId: sessionId === undefined ? undefined : String(sessionId),
  });
}
