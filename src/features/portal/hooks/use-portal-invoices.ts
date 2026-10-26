'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalInvoices } from '../api/get-invoices';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalInvoices>>;

export function usePortalInvoices() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.invoices(),
    queryFn: fetchPortalInvoices,
  });
}
