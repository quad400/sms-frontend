'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalOverview } from '../api/get-overview';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalOverview>>;

export function usePortalOverview() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.overview(),
    queryFn: fetchPortalOverview,
  });
}
