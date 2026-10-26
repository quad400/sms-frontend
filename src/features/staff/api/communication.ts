import { proxyGet, proxyPost } from '@/lib/api/proxy-fetch';
import type {
  AnnouncementRecord,
  CalendarEvent,
  MessageThread,
  MessageThreadDetail,
  ThreadMessage,
} from '../types';

export function fetchThreads(): Promise<MessageThread[]> {
  return proxyGet<MessageThread[]>('/api/v1/messages/threads');
}

export function fetchThread(id: number): Promise<MessageThreadDetail> {
  return proxyGet<MessageThreadDetail>(`/api/v1/messages/threads/${id}`);
}

export function sendThreadMessage(
  threadId: number,
  body: { clientRef: string; body: string },
): Promise<ThreadMessage> {
  return proxyPost<ThreadMessage>(`/api/v1/messages/threads/${threadId}/messages`, body);
}

export function fetchAnnouncements(): Promise<AnnouncementRecord[]> {
  return proxyGet<AnnouncementRecord[]>('/api/v1/announcements', { status: 'published' });
}

export function fetchEvents(): Promise<CalendarEvent[]> {
  return proxyGet<CalendarEvent[]>('/api/v1/events');
}
