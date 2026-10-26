'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalEvents } from '../api/get-events';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalEvents>>;

export function usePortalEvents() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.events(),
    queryFn: fetchPortalEvents,
  });
}
