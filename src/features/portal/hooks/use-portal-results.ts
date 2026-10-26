'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalResults } from '../api/get-results';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalResults>>;

export function usePortalResults() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.results(),
    queryFn: fetchPortalResults,
  });
}
