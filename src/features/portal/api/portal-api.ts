import { api } from '@/lib/api/client';
import { isApiErrorBody, mapError, type MappedError } from '@/lib/api/errors';

export class PortalApiError extends Error {
  readonly mapped: MappedError;

  constructor(mapped: MappedError) {
    super(mapped.message);
    this.name = 'PortalApiError';
    this.mapped = mapped;
  }
}

async function unwrap<T>(promise: Promise<{ data?: T; error?: unknown }>): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    if (isApiErrorBody(error)) {
      throw new PortalApiError(mapError(error));
    }
    throw new PortalApiError({
      kind: 'retry',
      message: 'Something went wrong. Please try again.',
      code: 'UNKNOWN',
      requestId: '',
    });
  }
  return data as T;
}

export function fetchPortalMe() {
  return unwrap(api.GET('/api/v1/portal/me'));
}

export function fetchPortalOverview() {
  return unwrap(api.GET('/api/v1/portal/me/overview'));
}

export function fetchPortalTimetable() {
  return unwrap(api.GET('/api/v1/portal/me/timetable'));
}

export function fetchPortalAttendance() {
  return unwrap(api.GET('/api/v1/portal/me/attendance'));
}

export function fetchPortalResults() {
  return unwrap(api.GET('/api/v1/portal/me/results'));
}

export function fetchPortalReportCards() {
  return unwrap(api.GET('/api/v1/portal/me/report-cards'));
}

export function fetchPortalInvoices() {
  return unwrap(api.GET('/api/v1/portal/me/invoices'));
}

export function fetchPortalLessonNotes() {
  return unwrap(api.GET('/api/v1/portal/me/lesson-notes'));
}

export function fetchPortalAnnouncements() {
  return unwrap(api.GET('/api/v1/portal/announcements'));
}

export function fetchPortalEvents() {
  return unwrap(api.GET('/api/v1/portal/events'));
}

export const portalKeys = {
  all: ['portal'] as const,
  me: () => [...portalKeys.all, 'me'] as const,
  overview: () => [...portalKeys.all, 'overview'] as const,
  timetable: () => [...portalKeys.all, 'timetable'] as const,
  attendance: () => [...portalKeys.all, 'attendance'] as const,
  results: () => [...portalKeys.all, 'results'] as const,
  reportCards: () => [...portalKeys.all, 'report-cards'] as const,
  invoices: () => [...portalKeys.all, 'invoices'] as const,
  lessonNotes: () => [...portalKeys.all, 'lesson-notes'] as const,
  announcements: () => [...portalKeys.all, 'announcements'] as const,
  events: () => [...portalKeys.all, 'events'] as const,
};
