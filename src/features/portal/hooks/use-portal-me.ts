'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalMe } from '../api/get-me';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalMe>>;

export function usePortalMe() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.me(),
    queryFn: fetchPortalMe,
  });
}
