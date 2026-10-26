'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalLibrary } from '../api/get-library';
import { portalKeys } from '../api/keys';

export function usePortalLibrary() {
  return useQuery<unknown, ApiClientError>({
    queryKey: portalKeys.library(),
    queryFn: fetchPortalLibrary,
  });
}
