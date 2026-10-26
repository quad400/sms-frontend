'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalTimetable } from '../api/get-timetable';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalTimetable>>;

export function usePortalTimetable() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.timetable(),
    queryFn: fetchPortalTimetable,
    staleTime: 60_000,
  });
}
