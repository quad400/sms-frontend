'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import {
  archiveStudent,
  createEnrolment,
  createStudent,
  createTransfer,
  getStudent,
  getStudentMedicalInfo,
  getStudentsSummary,
  linkStudentGuardian,
  listStudentEnrolments,
  listStudentGuardians,
  listStudents,
  putStudentMedicalInfo,
  unlinkStudentGuardian,
  updateEnrolment,
  updateStudent,
  updateStudentGuardian,
  type LinkedGuardian,
  type ListStudentsParams,
  type StudentEnrolment,
  type StudentMedicalInfo,
  type StudentMedicalInfoInput,
  type StudentsSummary,
} from '../api/students';
import { updateGuardian } from '../api/guardians';
import type { GuardianRow, Paginated, StudentRow } from '../types';

export function useStudents(params: ListStudentsParams = {}, enabled = true) {
  return useQuery<Paginated<StudentRow>, ApiClientError>({
    queryKey: adminKeys.students({ ...params }),
    queryFn: () => listStudents(params),
    enabled,
  });
}

export function useStudentsSummary(campusId?: string, enabled = true) {
  return useQuery<StudentsSummary, ApiClientError>({
    queryKey: adminKeys.studentsSummary(campusId),
    queryFn: () => getStudentsSummary(campusId),
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
  return useQuery<LinkedGuardian[], ApiClientError>({
    queryKey: adminKeys.studentGuardians(studentId),
    queryFn: () => listStudentGuardians(studentId),
    enabled,
  });
}

export function useStudentEnrolments(studentId: number, enabled = true) {
  return useQuery<StudentEnrolment[], ApiClientError>({
    queryKey: adminKeys.studentEnrolments(studentId),
    queryFn: () => listStudentEnrolments(studentId),
    enabled,
  });
}

export function useStudentMedical(studentId: number, enabled = true) {
  return useQuery<StudentMedicalInfo, ApiClientError>({
    queryKey: adminKeys.studentMedical(studentId),
    queryFn: () => getStudentMedicalInfo(studentId),
    enabled: enabled && studentId > 0,
  });
}

/** Creates a student, or updates one when `studentId` is provided. */
export function useSaveStudent(studentId?: number) {
  const qc = useQueryClient();
  return useMutation<StudentRow, ApiClientError, Record<string, unknown>>({
    mutationFn: (body) =>
      studentId != null ? updateStudent(studentId, body) : createStudent(body),
    onSuccess: (row) => {
      void qc.invalidateQueries({ queryKey: adminKeys.all });
      void qc.setQueryData(adminKeys.student(row.id), row);
    },
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

export function useLinkStudentGuardian(studentId: number) {
  const qc = useQueryClient();
  return useMutation<LinkedGuardian, ApiClientError, Record<string, unknown>>({
    mutationFn: (body) => linkStudentGuardian(studentId, body) as Promise<LinkedGuardian>,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.studentGuardians(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.student(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.studentsSummary() });
    },
  });
}

export type UpdateLinkedGuardianInput = {
  guardianId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  relationshipCode: string;
  isPrimaryContact: boolean;
  canPickUp: boolean;
  isFeePayer: boolean;
};

export function useUnlinkStudentGuardian(studentId: number) {
  const qc = useQueryClient();
  return useMutation<void, ApiClientError, number>({
    mutationFn: async (guardianId) => {
      await unlinkStudentGuardian(studentId, guardianId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.studentGuardians(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.student(studentId) });
    },
  });
}

/** Updates guardian profile + link flags for an already-linked guardian. */
export function useUpdateStudentGuardian(studentId: number) {
  const qc = useQueryClient();
  return useMutation<GuardianRow, ApiClientError, UpdateLinkedGuardianInput>({
    mutationFn: async ({
      guardianId,
      firstName,
      lastName,
      phone,
      email,
      address,
      occupation,
      relationshipCode,
      isPrimaryContact,
      canPickUp,
      isFeePayer,
    }) => {
      const row = await updateGuardian(guardianId, {
        firstName,
        lastName,
        phone,
        email: email || null,
        address: address || null,
        occupation: occupation || null,
      });
      await updateStudentGuardian(studentId, guardianId, {
        relationshipCode,
        isPrimaryContact,
        canPickUp,
        isFeePayer,
      });
      return row;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.studentGuardians(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.student(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.guardians({}) });
    },
  });
}

export function useCreateEnrolment(studentId: number) {
  const qc = useQueryClient();
  return useMutation<
    StudentEnrolment,
    ApiClientError,
    { sessionId: number; classId: number; enrolledAt?: string }
  >({
    mutationFn: (body) => createEnrolment(studentId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.studentEnrolments(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.student(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.studentsSummary() });
    },
  });
}

export function useUpdateEnrolment(studentId: number) {
  const qc = useQueryClient();
  return useMutation<
    StudentEnrolment,
    ApiClientError,
    { enrolmentId: number; classId: number }
  >({
    mutationFn: ({ enrolmentId, classId }) =>
      updateEnrolment(enrolmentId, { classId }) as Promise<StudentEnrolment>,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: adminKeys.studentEnrolments(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.student(studentId) });
      void qc.invalidateQueries({ queryKey: adminKeys.studentsSummary() });
    },
  });
}

export function useSaveStudentMedical(studentId: number) {
  const qc = useQueryClient();
  return useMutation<StudentMedicalInfo, ApiClientError, StudentMedicalInfoInput>({
    mutationFn: (body) => putStudentMedicalInfo(studentId, body),
    onSuccess: (data) => {
      qc.setQueryData(adminKeys.studentMedical(studentId), data);
      void qc.invalidateQueries({ queryKey: adminKeys.studentMedical(studentId) });
    },
  });
}
