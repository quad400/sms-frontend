import { proxyDelete, proxyGet, proxyPatch, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import type { Paginated } from '../types';

export type Campus = {
  id: number;
  name: string;
  code?: string;
  addressLine?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive?: boolean;
  studentCount?: number;
};

export type SchoolClass = {
  id: number;
  campusId: number;
  sessionId: number;
  levelId: number;
  armId?: number;
  armName?: string;
  levelName?: string;
  name: string;
  formTeacherStaffId?: number | null;
  studentCount?: number;
};

export type Session = {
  id: number;
  campusId?: number;
  name: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  terms?: Term[];
};

export type Term = {
  id: number;
  sessionId: number;
  period?: string;
  periodName?: string;
  name?: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  closedAt?: string | null;
  holidays?: Array<{ id?: number; name: string; date: string }>;
};

export type Subject = { id: number; code: string; name: string; isActive?: boolean };
export type Level = {
  id: number;
  name: string;
  /** Stage code from API (`primary` | `jss` | `ss`). */
  stage?: string;
  stageName?: string;
  /** @deprecated prefer `stage` */
  stageCode?: string;
  ordinal?: number;
};
export type House = {
  id: number;
  campusId: number;
  name: string;
  colour?: string | null;
  memberCount?: number;
};
export type CurriculumSubject = {
  levelId: number;
  subjectId: number;
  isCompulsory?: boolean;
};

async function asList<T>(res: Paginated<T> | T[]): Promise<T[]> {
  return Array.isArray(res) ? res : (res.data ?? []);
}

export async function listCampuses(): Promise<Campus[]> {
  return asList(await proxyGet<Paginated<Campus> | Campus[]>('/api/v1/campuses'));
}

export function createCampus(body: Record<string, unknown>) {
  return proxyPost<Campus>('/api/v1/campuses', body);
}

export function updateCampus(id: number, body: Record<string, unknown>) {
  return proxyPatch<Campus>(`/api/v1/campuses/${id}`, body);
}

export async function listClasses(params?: {
  campusId?: string;
  sessionId?: string;
  levelId?: string;
}): Promise<SchoolClass[]> {
  return asList(
    await proxyGet<Paginated<SchoolClass> | SchoolClass[]>('/api/v1/classes', {
      campusId: params?.campusId,
      sessionId: params?.sessionId,
      levelId: params?.levelId,
    }),
  );
}

export function createClass(body: Record<string, unknown>) {
  return proxyPost<SchoolClass>('/api/v1/classes', body);
}

export function getClass(id: number) {
  return proxyGet<SchoolClass>(`/api/v1/classes/${id}`);
}

export function updateClass(id: number, body: Record<string, unknown>) {
  return proxyPatch<SchoolClass>(`/api/v1/classes/${id}`, body);
}

export function deleteClass(id: number) {
  return proxyDelete(`/api/v1/classes/${id}`);
}

export async function listSessions(campusId?: string): Promise<Session[]> {
  return asList(
    await proxyGet<Paginated<Session> | Session[]>('/api/v1/sessions', {
      campusId,
    }),
  );
}

export function getSession(id: number) {
  return proxyGet<Session>(`/api/v1/sessions/${id}`);
}

export function createSession(body: Record<string, unknown>) {
  return proxyPost<Session>('/api/v1/sessions', body);
}

export function updateSession(id: number, body: Record<string, unknown>) {
  return proxyPatch<Session>(`/api/v1/sessions/${id}`, body);
}

export function activateSession(id: number) {
  return proxyPost(`/api/v1/sessions/${id}/activate`, {});
}

export async function listTerms(sessionId?: string): Promise<Term[]> {
  return asList(
    await proxyGet<Paginated<Term> | Term[]>('/api/v1/terms', {
      sessionId,
    }),
  );
}

export function updateTerm(id: number, body: Record<string, unknown>) {
  return proxyPatch<Term>(`/api/v1/terms/${id}`, body);
}

export function activateTerm(id: number) {
  return proxyPost(`/api/v1/terms/${id}/activate`, {});
}

export function closeTerm(id: number) {
  return proxyPost(`/api/v1/terms/${id}/close`, {});
}

export async function listSubjects(): Promise<Subject[]> {
  return asList(await proxyGet<Paginated<Subject> | Subject[]>('/api/v1/subjects'));
}

export function createSubject(body: Record<string, unknown>) {
  return proxyPost<Subject>('/api/v1/subjects', body);
}

export function updateSubject(id: number, body: Record<string, unknown>) {
  return proxyPatch<Subject>(`/api/v1/subjects/${id}`, body);
}

export async function listLevels(): Promise<Level[]> {
  return asList(await proxyGet<Paginated<Level> | Level[]>('/api/v1/levels'));
}

export function createLevel(body: Record<string, unknown>) {
  return proxyPost<Level>('/api/v1/levels', body);
}

export async function listCurriculumSubjects(levelId?: string): Promise<CurriculumSubject[]> {
  return asList(
    await proxyGet<Paginated<CurriculumSubject> | CurriculumSubject[]>(
      '/api/v1/curriculum-subjects',
      { levelId },
    ),
  );
}

export function putCurriculumSubjects(
  levelId: number,
  subjects: Array<{ subjectId: number; isCompulsory?: boolean }>,
) {
  return proxyPut(`/api/v1/levels/${levelId}/curriculum-subjects`, { subjects });
}

export async function listHouses(campusId?: string): Promise<House[]> {
  return asList(
    await proxyGet<Paginated<House> | House[]>('/api/v1/houses', {
      campusId,
    }),
  );
}

export function createHouse(body: Record<string, unknown>) {
  return proxyPost<House>('/api/v1/houses', body);
}

export function updateHouse(id: number, body: Record<string, unknown>) {
  return proxyPatch<House>(`/api/v1/houses/${id}`, body);
}
