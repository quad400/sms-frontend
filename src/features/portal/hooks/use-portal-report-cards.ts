'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalReportCards } from '../api/get-report-cards';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalReportCards>>;

export function usePortalReportCards() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.reportCards(),
    queryFn: fetchPortalReportCards,
  });
}
