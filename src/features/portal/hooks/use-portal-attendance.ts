'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalAttendance } from '../api/get-attendance';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalAttendance>>;

export function usePortalAttendance(range?: { from?: string; to?: string }) {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.attendance(range?.from, range?.to),
    queryFn: () => fetchPortalAttendance(range),
  });
}
