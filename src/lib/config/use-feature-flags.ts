'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import {
  fetchFeatureFlags,
  isModuleEnabled,
  type FeatureFlags,
} from '@/lib/config/feature-flags';

export function useFeatureFlags() {
  const query = useQuery<FeatureFlags, ApiClientError>({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
    staleTime: 60_000,
  });

  return {
    ...query,
    isEnabled: (key: string) => isModuleEnabled(query.data, key),
  };
}
