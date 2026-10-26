'use client';

import { useMutation } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  postAbsenceRequest,
  postTeacherTicket,
  type AbsenceRequestBody,
  type AbsenceRequestResult,
  type TeacherTicketBody,
  type TeacherTicketResult,
} from '../api/post-timetable-requests';

export function usePostAbsenceRequest() {
  return useMutation<AbsenceRequestResult, ApiClientError, AbsenceRequestBody>({
    mutationFn: postAbsenceRequest,
  });
}

export function usePostTeacherTicket() {
  return useMutation<TeacherTicketResult, ApiClientError, TeacherTicketBody>({
    mutationFn: postTeacherTicket,
  });
}
