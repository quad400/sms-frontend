import { proxyGet, proxyPost } from '@/lib/api/proxy-fetch';

export function previewPromotion(body: Record<string, unknown>) {
  return proxyPost('/api/v1/promotions/previews', body);
}

export function executePromotion(body: { batchId: string | number }) {
  return proxyPost('/api/v1/promotions', body);
}

export function getPromotion(id: number) {
  return proxyGet(`/api/v1/promotions/${id}`);
}

export function reversePromotion(id: number, reason: string) {
  return proxyPost(`/api/v1/promotions/${id}/reverse`, { reason });
}
