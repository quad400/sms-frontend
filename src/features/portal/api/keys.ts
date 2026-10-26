export const portalKeys = {
  all: ['portal'] as const,
  me: () => [...portalKeys.all, 'me'] as const,
  overview: () => [...portalKeys.all, 'overview'] as const,
  timetable: () => [...portalKeys.all, 'timetable'] as const,
  attendance: (from?: string, to?: string) =>
    [...portalKeys.all, 'attendance', from ?? '', to ?? ''] as const,
  results: () => [...portalKeys.all, 'results'] as const,
  reportCards: () => [...portalKeys.all, 'report-cards'] as const,
  invoices: () => [...portalKeys.all, 'invoices'] as const,
  lessonNotes: () => [...portalKeys.all, 'lesson-notes'] as const,
  liveSessions: () => [...portalKeys.all, 'live-sessions'] as const,
  announcements: () => [...portalKeys.all, 'announcements'] as const,
  events: () => [...portalKeys.all, 'events'] as const,
  library: () => [...portalKeys.all, 'library'] as const,
  medical: () => [...portalKeys.all, 'medical'] as const,
  chatChannels: () => [...portalKeys.all, 'chat', 'channels'] as const,
  chatMessages: (channelId: string) =>
    [...portalKeys.all, 'chat', 'messages', channelId] as const,
};
