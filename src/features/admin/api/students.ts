import { proxyDelete, proxyGet, proxyPatch, proxyPost } from '@/lib/api/proxy-fetch';
import { PAGE_SIZE } from '../lib/paginate';
import type { Paginated, StudentRow } from '../types';

export type ListStudentsParams = {
  page?: number;
  q?: string;
  campusId?: string;
  classId?: string;
  status?: string;
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

export function listStudentGuardians(studentId: number) {
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

export function listStudentEnrolments(studentId: number) {
  return proxyGet(`/api/v1/students/${studentId}/enrolments`);
}

export function createEnrolment(studentId: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/students/${studentId}/enrolments`, body);
}

export function updateEnrolment(enrolmentId: number, body: Record<string, unknown>) {
  return proxyPatch(`/api/v1/enrolments/${enrolmentId}`, body);
}

export function createTransfer(studentId: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/students/${studentId}/transfers`, body);
}
