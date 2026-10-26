import { proxyPost } from '@/lib/api/proxy-fetch';

export type AbsenceRequestBody = {
  /** YYYY-MM-DD */
  date: string;
  reason: string;
  note?: string;
  periodLabels?: string[];
};

export type AbsenceRequestResult = {
  id: number;
  date: string;
  reason: string;
  status: string;
};

export type TeacherTicketBody = {
  subjectId?: number;
  subjectName?: string;
  message: string;
};

export type TeacherTicketResult = {
  id: number;
  subjectName: string | null;
  message: string;
  status: string;
};

export function postAbsenceRequest(body: AbsenceRequestBody): Promise<AbsenceRequestResult> {
  return proxyPost<AbsenceRequestResult>('/api/v1/portal/me/absence-requests', body);
}

export function postTeacherTicket(body: TeacherTicketBody): Promise<TeacherTicketResult> {
  return proxyPost<TeacherTicketResult>('/api/v1/portal/me/teacher-tickets', body);
}
