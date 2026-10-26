'use client';

import { useQuery } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { fetchStaffAllocations, fetchStaffMe, fetchStaffOverview } from '../api/me';
import { staffKeys } from '../api/keys';
import type { StaffAllocation, StaffMe, StaffOverview } from '../types';

export function useStaffMe() {
  return useQuery<StaffMe, ApiClientError>({
    queryKey: staffKeys.me(),
    queryFn: fetchStaffMe,
    staleTime: 5 * 60_000,
  });
}

export function useStaffOverview() {
  return useQuery<StaffOverview, ApiClientError>({
    queryKey: staffKeys.overview(),
    queryFn: fetchStaffOverview,
    refetchOnWindowFocus: true,
  });
}

export function useStaffAllocations() {
  return useQuery<StaffAllocation[], ApiClientError>({
    queryKey: staffKeys.allocations(),
    queryFn: () => fetchStaffAllocations(),
    staleTime: 5 * 60_000,
  });
}
