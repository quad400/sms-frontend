import { api } from '@/lib/api/client';
import { unwrap } from '@/lib/api/errors';
import type { PortalInvoices } from '../types';

export function fetchPortalInvoices(): Promise<PortalInvoices> {
  return unwrap(api.GET('/api/v1/portal/me/invoices'));
}
