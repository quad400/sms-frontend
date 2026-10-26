import { proxyGet, proxyPost } from '@/lib/api/proxy-fetch';

export type AdminInboxNotification = {
  id: number;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type AdminInboxPage = {
  data: AdminInboxNotification[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
};

const PAGE_SIZE = 20;

export function fetchAdminInbox(page: number): Promise<AdminInboxPage> {
  return proxyGet<AdminInboxPage>('/api/v1/notifications/inbox', {
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
}

export async function markAdminInboxRead(id: number): Promise<void> {
  await proxyPost(`/api/v1/notifications/inbox/${id}/read`, {});
}

export async function markAllAdminInboxRead(): Promise<void> {
  await proxyPost('/api/v1/notifications/inbox/read-all', {});
}
