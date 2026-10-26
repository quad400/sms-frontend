import { proxyGet, proxyPost } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { InboxNotification, Paginated } from '../types';

export function fetchInbox(
  page: number,
  pageSize = PAGE_SIZE,
): Promise<Paginated<InboxNotification>> {
  return proxyGet<Paginated<InboxNotification>>('/api/v1/notifications/inbox', {
    page: String(page),
    pageSize: String(Math.min(pageSize, PAGE_SIZE)),
  });
}

export async function markInboxRead(id: number): Promise<void> {
  await proxyPost(`/api/v1/notifications/inbox/${id}/read`, {});
}

export async function markAllInboxRead(): Promise<void> {
  await proxyPost('/api/v1/notifications/inbox/read-all', {});
}
