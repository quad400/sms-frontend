import { proxyGet, proxyPost } from '@/lib/api/proxy-fetch';
import type { MessageThread, MessageThreadDetail, ThreadMessage } from '../types';

export function fetchThreads(): Promise<MessageThread[]> {
  return proxyGet<MessageThread[]>('/api/v1/messages/threads');
}

export function fetchThread(id: number): Promise<MessageThreadDetail> {
  return proxyGet<MessageThreadDetail>(`/api/v1/messages/threads/${id}`);
}

export function createThread(body: {
  subject: string;
  studentId: number;
  participantUserIds: number[];
}): Promise<MessageThread> {
  return proxyPost<MessageThread>('/api/v1/messages/threads', body);
}

export function sendThreadMessage(
  threadId: number,
  body: { clientRef: string; body: string },
): Promise<ThreadMessage> {
  return proxyPost<ThreadMessage>(`/api/v1/messages/threads/${threadId}/messages`, body);
}
