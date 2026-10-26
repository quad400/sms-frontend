import { proxyGet, proxyPatch } from '@/lib/api/proxy-fetch';
import type { AnnouncementItem, CalendarEvent, PortalMe } from '../types';

export function fetchAnnouncements(): Promise<AnnouncementItem[]> {
  return proxyGet<AnnouncementItem[]>('/api/v1/portal/announcements');
}

export function fetchEvents(): Promise<CalendarEvent[]> {
  return proxyGet<CalendarEvent[]>('/api/v1/portal/events');
}

export function fetchPortalMe(): Promise<PortalMe> {
  return proxyGet<PortalMe>('/api/v1/portal/me');
}

export function patchPortalContact(body: {
  phone?: string;
  email?: string | null;
  address?: string | null;
}): Promise<PortalMe> {
  return proxyPatch<PortalMe>('/api/v1/portal/me/contact', body);
}
