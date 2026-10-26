import { proxyGet, proxyPatch, proxyPost } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { GuardianRow, Paginated } from '../types';

export function listGuardians(params: {
  page?: number;
  q?: string;
}): Promise<Paginated<GuardianRow>> {
  return proxyGet('/api/v1/guardians', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    q: params.q,
  });
}

export function getGuardian(id: number): Promise<GuardianRow> {
  return proxyGet(`/api/v1/guardians/${id}`);
}

export function updateGuardian(id: number, body: Record<string, unknown>): Promise<GuardianRow> {
  return proxyPatch(`/api/v1/guardians/${id}`, body);
}

export function resetUserPassword(userId: number): Promise<unknown> {
  return proxyPost(`/api/v1/users/${userId}/reset-password`, {});
}
