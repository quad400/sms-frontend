type Params = Record<string, string | number | undefined>;

export const parentKeys = {
  all: ['parent'] as const,
  children: () => [...parentKeys.all, 'children'] as const,
  overview: (studentId: number) => [...parentKeys.all, 'overview', studentId] as const,
  attendance: (studentId: number, from: string, to: string) =>
    [...parentKeys.all, 'attendance', studentId, from, to] as const,
  results: (studentId: number) => [...parentKeys.all, 'results', studentId] as const,
  reportCards: (studentId: number) => [...parentKeys.all, 'report-cards', studentId] as const,
  timetable: (studentId: number) => [...parentKeys.all, 'timetable', studentId] as const,
  invoices: (studentId: number) => [...parentKeys.all, 'invoices', studentId] as const,
  receipts: (studentId: number) => [...parentKeys.all, 'receipts', studentId] as const,
  invoice: (studentId: number, invoiceId: number) =>
    [...parentKeys.all, 'invoice', studentId, invoiceId] as const,
  announcements: () => [...parentKeys.all, 'announcements'] as const,
  events: () => [...parentKeys.all, 'events'] as const,
  me: () => [...parentKeys.all, 'me'] as const,
  threads: () => [...parentKeys.all, 'threads'] as const,
  thread: (id: number) => [...parentKeys.all, 'thread', id] as const,
  inbox: (page: number) => [...parentKeys.all, 'inbox', page] as const,
  inboxAll: () => [...parentKeys.all, 'inbox'] as const,
  downloadUrl: (fileId: number) => [...parentKeys.all, 'download-url', fileId] as const,
  params: (params: Params) => params,
};
