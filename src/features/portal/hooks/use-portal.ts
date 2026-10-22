'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchPortalAnnouncements,
  fetchPortalAttendance,
  fetchPortalEvents,
  fetchPortalInvoices,
  fetchPortalLessonNotes,
  fetchPortalMe,
  fetchPortalOverview,
  fetchPortalReportCards,
  fetchPortalResults,
  fetchPortalTimetable,
  portalKeys,
} from '../api/portal-api';

export function usePortalMe() {
  return useQuery({ queryKey: portalKeys.me(), queryFn: fetchPortalMe });
}

export function usePortalOverview() {
  return useQuery({ queryKey: portalKeys.overview(), queryFn: fetchPortalOverview });
}

export function usePortalTimetable() {
  return useQuery({
    queryKey: portalKeys.timetable(),
    queryFn: fetchPortalTimetable,
    staleTime: 60_000,
  });
}

export function usePortalAttendance() {
  return useQuery({ queryKey: portalKeys.attendance(), queryFn: fetchPortalAttendance });
}

export function usePortalResults() {
  return useQuery({ queryKey: portalKeys.results(), queryFn: fetchPortalResults });
}

export function usePortalReportCards() {
  return useQuery({ queryKey: portalKeys.reportCards(), queryFn: fetchPortalReportCards });
}

export function usePortalInvoices() {
  return useQuery({ queryKey: portalKeys.invoices(), queryFn: fetchPortalInvoices });
}

export function usePortalLessonNotes() {
  return useQuery({ queryKey: portalKeys.lessonNotes(), queryFn: fetchPortalLessonNotes });
}

export function usePortalAnnouncements() {
  return useQuery({ queryKey: portalKeys.announcements(), queryFn: fetchPortalAnnouncements });
}

export function usePortalEvents() {
  return useQuery({ queryKey: portalKeys.events(), queryFn: fetchPortalEvents });
}
