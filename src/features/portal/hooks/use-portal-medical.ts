'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalMedical } from '../api/get-medical';
import { portalKeys } from '../api/keys';

export function usePortalMedical() {
  return useQuery<unknown, ApiClientError>({
    queryKey: portalKeys.medical(),
    queryFn: fetchPortalMedical,
  });
}
