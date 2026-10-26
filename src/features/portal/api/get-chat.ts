import { proxyGet } from '@/lib/api/proxy-fetch';

export function fetchPortalChatChannels(): Promise<unknown> {
  return proxyGet('/api/v1/portal/me/chat/channels');
}

export function fetchPortalChatMessages(channelId: string): Promise<unknown> {
  return proxyGet(`/api/v1/portal/me/chat/channels/${channelId}/messages`);
}
