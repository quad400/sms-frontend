'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalLiveSessions } from '../api/get-live-sessions';
import { portalKeys } from '../api/keys';

export function usePortalLiveSessions(options?: { enabled?: boolean }) {
  return useQuery<unknown, ApiClientError>({
    queryKey: portalKeys.liveSessions(),
    queryFn: fetchPortalLiveSessions,
    enabled: options?.enabled ?? true,
  });
}
