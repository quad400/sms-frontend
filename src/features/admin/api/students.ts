import { proxyDelete, proxyGet, proxyPatch, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated, StudentRow } from '../types';

export type ListStudentsParams = {
  page?: number;
  q?: string;
  campusId?: string;
  classId?: string;
  status?: string;
};

export type StudentsSummary = {
  totalEnrolled: number;
  enrolledThisTerm: number;
  male: number;
  female: number;
  active: number;
  byStatus: Record<string, number>;
  byGender: Record<string, number>;
  attendanceRate: number | null;
  attendanceWindowDays: number;
};

export function listStudents(params: ListStudentsParams = {}): Promise<Paginated<StudentRow>> {
  return proxyGet('/api/v1/students', {
    page: String(params.page ?? 1),
    pageSize: String(PAGE_SIZE),
    q: params.q,
    campusId: params.campusId,
    classId: params.classId,
    status: params.status,
  });
}

export function getStudentsSummary(campusId?: string): Promise<StudentsSummary> {
  return proxyGet('/api/v1/students/summary', {
    campusId,
  });
}

export function getStudent(id: number): Promise<StudentRow> {
  return proxyGet(`/api/v1/students/${id}`);
}

export function createStudent(body: Record<string, unknown>): Promise<StudentRow> {
  return proxyPost('/api/v1/students', body);
}

export function updateStudent(id: number, body: Record<string, unknown>): Promise<StudentRow> {
  return proxyPatch(`/api/v1/students/${id}`, body);
}

export function archiveStudent(id: number): Promise<void> {
  return proxyDelete(`/api/v1/students/${id}`);
}

export type LinkedGuardian = {
  id: number;
  studentId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  occupation?: string | null;
  relationship: string;
  isPrimaryContact: boolean;
  canPickUp: boolean;
  isFeePayer: boolean;
};

export type StudentEnrolment = {
  id: number;
  studentId: number;
  classId: number;
  sessionId: number;
  status: string;
  enrolledAt: string;
  endedAt?: string | null;
};

export function listStudentGuardians(studentId: number): Promise<LinkedGuardian[]> {
  return proxyGet(`/api/v1/students/${studentId}/guardians`);
}

export function linkStudentGuardian(studentId: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/students/${studentId}/guardians`, body);
}

export function updateStudentGuardian(
  studentId: number,
  guardianId: number,
  body: Record<string, unknown>,
) {
  return proxyPatch(`/api/v1/students/${studentId}/guardians/${guardianId}`, body);
}

export function unlinkStudentGuardian(studentId: number, guardianId: number) {
  return proxyDelete(`/api/v1/students/${studentId}/guardians/${guardianId}`);
}

export function listStudentEnrolments(studentId: number): Promise<StudentEnrolment[]> {
  return proxyGet(`/api/v1/students/${studentId}/enrolments`);
}

export function createEnrolment(
  studentId: number,
  body: { sessionId: number; classId: number; enrolledAt?: string },
): Promise<StudentEnrolment> {
  return proxyPost(`/api/v1/students/${studentId}/enrolments`, body);
}

export function updateEnrolment(enrolmentId: number, body: Record<string, unknown>) {
  return proxyPatch(`/api/v1/enrolments/${enrolmentId}`, body);
}

export function createTransfer(studentId: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/students/${studentId}/transfers`, body);
}

export type StudentMedicalInfo = {
  studentId: number;
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  emergencyNotes: string | null;
  updatedAt: string | null;
};

export type StudentMedicalInfoInput = {
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  emergencyNotes: string | null;
};

export function getStudentMedicalInfo(studentId: number): Promise<StudentMedicalInfo> {
  return proxyGet(`/api/v1/students/${studentId}/medical-info`);
}

export function putStudentMedicalInfo(
  studentId: number,
  body: StudentMedicalInfoInput,
): Promise<StudentMedicalInfo> {
  return proxyPut(`/api/v1/students/${studentId}/medical-info`, body);
}
