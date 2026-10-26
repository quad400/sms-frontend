'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalAnnouncements } from '../api/get-announcements';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalAnnouncements>>;

export function usePortalAnnouncements() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.announcements(),
    queryFn: fetchPortalAnnouncements,
  });
}
