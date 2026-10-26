import { proxyGet, proxyPatch, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated, UserRow } from '../types';

export function listUsers(params: {
  page?: number;
  q?: string;
  type?: string;
  status?: string;
  campusId?: string;
}): Promise<Paginated<UserRow>> {
  return proxyGet('/api/v1/users', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    q: params.q,
    type: params.type,
    status: params.status,
    campusId: params.campusId,
  });
}

export function getUser(id: number): Promise<UserRow> {
  return proxyGet(`/api/v1/users/${id}`);
}

export function createUser(body: Record<string, unknown>): Promise<UserRow> {
  return proxyPost('/api/v1/users', body);
}

export function updateUser(id: number, body: Record<string, unknown>): Promise<UserRow> {
  return proxyPatch(`/api/v1/users/${id}`, body);
}

export function activateUser(id: number) {
  return proxyPost(`/api/v1/users/${id}/activate`, {});
}

export function deactivateUser(id: number) {
  return proxyPost(`/api/v1/users/${id}/deactivate`, {});
}

export function resetUserPassword(id: number) {
  return proxyPost(`/api/v1/users/${id}/reset-password`, {});
}

export function replaceUserRoles(id: number, roleIds: number[]) {
  return proxyPut(`/api/v1/users/${id}/roles`, { roleIds });
}

export function replaceUserCampuses(id: number, campusIds: number[]) {
  return proxyPut(`/api/v1/users/${id}/campus-access`, { campusIds });
}
