import type { paths } from '@/lib/api/schema';

type JsonOf<Op> = Op extends { responses: { 200: { content: { 'application/json': infer D } } } }
  ? D
  : unknown;

export type PortalMe = JsonOf<paths['/api/v1/portal/me']['get']>;
export type PortalOverview = JsonOf<paths['/api/v1/portal/me/overview']['get']>;
export type PortalTimetable = JsonOf<paths['/api/v1/portal/me/timetable']['get']>;
export type PortalAttendance = JsonOf<paths['/api/v1/portal/me/attendance']['get']>;
export type PortalResults = JsonOf<paths['/api/v1/portal/me/results']['get']>;
export type PortalReportCards = JsonOf<paths['/api/v1/portal/me/report-cards']['get']>;
export type PortalInvoices = JsonOf<paths['/api/v1/portal/me/invoices']['get']>;
export type PortalLessonNotes = JsonOf<paths['/api/v1/portal/me/lesson-notes']['get']>;
export type PortalAnnouncements = JsonOf<paths['/api/v1/portal/announcements']['get']>;
export type PortalEvents = JsonOf<paths['/api/v1/portal/events']['get']>;
