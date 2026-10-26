'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import {
  archiveStudent,
  createStudent,
  createTransfer,
  getStudent,
  listStudentEnrolments,
  listStudentGuardians,
  listStudents,
  updateStudent,
  type ListStudentsParams,
} from '../api/students';
import type { Paginated, StudentRow } from '../types';

export function useStudents(params: ListStudentsParams = {}, enabled = true) {
  return useQuery<Paginated<StudentRow>, ApiClientError>({
    queryKey: adminKeys.students({ ...params }),
    queryFn: () => listStudents(params),
    enabled,
  });
}

export function useStudent(id: number | null | undefined, enabled = true) {
  return useQuery<StudentRow, ApiClientError>({
    queryKey: adminKeys.student(id ?? 0),
    queryFn: () => getStudent(id!),
    enabled: enabled && id != null,
  });
}

export function useStudentGuardians(studentId: number, enabled = true) {
  return useQuery<unknown, ApiClientError>({
    queryKey: adminKeys.studentGuardians(studentId),
    queryFn: () => listStudentGuardians(studentId),
    enabled,
  });
}

export function useStudentEnrolments(studentId: number, enabled = true) {
  return useQuery<unknown, ApiClientError>({
    queryKey: adminKeys.studentEnrolments(studentId),
    queryFn: () => listStudentEnrolments(studentId),
    enabled,
  });
}

/** Creates a student, or updates one when `studentId` is provided. */
export function useSaveStudent(studentId?: number) {
  const qc = useQueryClient();
  return useMutation<StudentRow, ApiClientError, Record<string, unknown>>({
    mutationFn: (body) =>
      studentId != null ? updateStudent(studentId, body) : createStudent(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

export function useArchiveStudent() {
  const qc = useQueryClient();
  return useMutation<void, ApiClientError, number>({
    mutationFn: archiveStudent,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.all }),
  });
}

export type TransferInput = {
  typeCode: string;
  effectiveDate: string;
  destinationSchool?: string;
  reason: string;
};

export function useCreateTransfer(studentId: number) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, TransferInput>({
    mutationFn: (body) => createTransfer(studentId, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.student(studentId) }),
  });
}
