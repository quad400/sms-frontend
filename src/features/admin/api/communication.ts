import { proxyDelete, proxyGet, proxyPatch, proxyPost } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated } from '../types';

export type Announcement = {
  id: number;
  title: string;
  body?: string;
  status: string;
  publishedAt?: string | null;
  targets?: Array<Record<string, unknown>>;
  deliveryEstimate?: number | null;
};

export type MessageThread = {
  id: number;
  subject?: string;
  updatedAt?: string;
  participants?: Array<Record<string, unknown>>;
  lastMessage?: string | null;
};

export type SchoolEvent = {
  id: number;
  title: string;
  startsAt: string;
  endsAt?: string | null;
  location?: string | null;
  allDay?: boolean;
};

export type Reminder = {
  id: number;
  name: string;
  channel?: string;
  schedule?: string;
  isActive?: boolean;
};

export type NotificationTemplate = {
  id: number;
  name: string;
  channel: string;
  subject?: string | null;
  body?: string;
  isActive?: boolean;
};

export type Delivery = {
  id: number;
  channel?: string;
  status: string;
  recipient?: string;
  createdAt?: string;
  error?: string | null;
};

export function listAnnouncements(params?: { page?: number }): Promise<Paginated<Announcement>> {
  return proxyGet('/api/v1/announcements', {
    page: String(params?.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function createAnnouncement(body: Record<string, unknown>) {
  return proxyPost<Announcement>('/api/v1/announcements', body);
}

export function updateAnnouncement(id: number, body: Record<string, unknown>) {
  return proxyPatch(`/api/v1/announcements/${id}`, body);
}

export function publishAnnouncement(id: number) {
  return proxyPost(`/api/v1/announcements/${id}/publish`, {});
}

export function deleteAnnouncement(id: number) {
  return proxyDelete(`/api/v1/announcements/${id}`);
}

export function listThreads(params?: { page?: number }): Promise<Paginated<MessageThread>> {
  return proxyGet('/api/v1/messages/threads', {
    page: String(params?.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function getThread(id: number) {
  return proxyGet(`/api/v1/messages/threads/${id}`);
}

export function createThread(body: Record<string, unknown>) {
  return proxyPost('/api/v1/messages/threads', body);
}

export function sendMessage(threadId: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/messages/threads/${threadId}/messages`, body);
}

export function listEvents(params?: { page?: number; from?: string; to?: string }): Promise<Paginated<SchoolEvent>> {
  return proxyGet('/api/v1/events', {
    page: String(params?.page ?? 1),
    pageSize: String(PAGE_SIZE),
    from: params?.from,
    to: params?.to,
  });
}

export function createEvent(body: Record<string, unknown>) {
  return proxyPost<SchoolEvent>('/api/v1/events', body);
}

export function updateEvent(id: number, body: Record<string, unknown>) {
  return proxyPatch(`/api/v1/events/${id}`, body);
}

export function deleteEvent(id: number) {
  return proxyDelete(`/api/v1/events/${id}`);
}

export function listReminders(params?: { page?: number }): Promise<Paginated<Reminder>> {
  return proxyGet('/api/v1/reminders', {
    page: String(params?.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function createReminder(body: Record<string, unknown>) {
  return proxyPost<Reminder>('/api/v1/reminders', body);
}

export function updateReminder(id: number, body: Record<string, unknown>) {
  return proxyPatch(`/api/v1/reminders/${id}`, body);
}

export function listNotificationTemplates(params?: {
  page?: number;
}): Promise<Paginated<NotificationTemplate>> {
  return proxyGet('/api/v1/notification-templates', {
    page: String(params?.page ?? 1),
    pageSize: String(PAGE_SIZE),
  });
}

export function createNotificationTemplate(body: Record<string, unknown>) {
  return proxyPost<NotificationTemplate>('/api/v1/notification-templates', body);
}

export function updateNotificationTemplate(id: number, body: Record<string, unknown>) {
  return proxyPatch(`/api/v1/notification-templates/${id}`, body);
}

export function previewNotificationTemplate(id: number, data?: Record<string, unknown>) {
  return proxyPost(`/api/v1/notification-templates/${id}/preview`, { data });
}

export function listDeliveries(params?: {
  page?: number;
  status?: string;
}): Promise<Paginated<Delivery>> {
  return proxyGet('/api/v1/notifications/deliveries', {
    page: String(params?.page ?? 1),
    pageSize: String(PAGE_SIZE),
    status: params?.status,
  });
}

export function retryDelivery(id: number) {
  return proxyPost(`/api/v1/notifications/deliveries/${id}/retry`, {});
}
