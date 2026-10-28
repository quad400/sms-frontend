'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { adminKeys } from '../api/keys';
import {
  activateSession,
  activateTerm,
  closeTerm,
  createCampus,
  createClass,
  createHouse,
  createLevel,
  createSession,
  createSubject,
  deleteClass,
  getClass,
  getSession,
  listCampuses,
  listClasses,
  listCurriculumSubjects,
  listHouses,
  listLevels,
  listSessions,
  listSubjects,
  listTerms,
  putCurriculumSubjects,
  updateCampus,
  updateClass,
  updateHouse,
  updateSubject,
  updateTerm,
  type Campus,
  type CurriculumSubject,
  type House,
  type Level,
  type SchoolClass,
  type Session,
  type Subject,
  type Term,
} from '../api/structure';

export function useCampuses(enabled = true) {
  return useQuery<Campus[], ApiClientError>({
    queryKey: adminKeys.campuses(),
    queryFn: listCampuses,
    enabled,
  });
}

export function useSaveCampus() {
  const qc = useQueryClient();
  return useMutation<
    Campus,
    ApiClientError,
    { editId?: number; code?: string; name: string }
  >({
    mutationFn: ({ editId, code, name }) =>
      editId ? updateCampus(editId, { name }) : createCampus({ code, name }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.campuses() }),
  });
}

export function useSessions(campusId?: string) {
  return useQuery<Session[], ApiClientError>({
    queryKey: adminKeys.sessions(),
    queryFn: () => listSessions(campusId),
  });
}

export function useSession(id: number | null) {
  return useQuery<Session, ApiClientError>({
    queryKey: adminKeys.session(id ?? 0),
    queryFn: () => getSession(id!),
    enabled: id != null,
  });
}

export function useTerms(sessionId?: string, enabled = true) {
  return useQuery<Term[], ApiClientError>({
    queryKey: adminKeys.terms(sessionId),
    queryFn: () => listTerms(sessionId),
    enabled,
  });
}

export function useActivateSession() {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: activateSession,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.sessions() }),
  });
}

export function useActivateTerm(sessionId?: number | null) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: activateTerm,
    onSuccess: () => {
      if (sessionId != null) {
        void qc.invalidateQueries({ queryKey: adminKeys.terms(String(sessionId)) });
      }
    },
  });
}

export function useCloseTerm(sessionId?: number | null) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: closeTerm,
    onSuccess: () => {
      if (sessionId != null) {
        void qc.invalidateQueries({ queryKey: adminKeys.terms(String(sessionId)) });
      }
    },
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation<
    Session,
    ApiClientError,
    { campusId: number; name: string; startDate: string; endDate: string }
  >({
    mutationFn: createSession,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.sessions() }),
  });
}

export function useUpdateTermHolidays() {
  return useMutation<
    Term,
    ApiClientError,
    { termId: number; holidays: Array<{ name: string; date: string }> }
  >({
    mutationFn: ({ termId, holidays }) => updateTerm(termId, { holidays }),
  });
}

export function useClasses(params?: {
  campusId?: string;
  sessionId?: string;
  levelId?: string;
  key?: string;
}) {
  const key = params?.key ?? `${params?.campusId ?? ''}-${params?.sessionId ?? ''}`;
  return useQuery<SchoolClass[], ApiClientError>({
    queryKey: adminKeys.classes(key),
    queryFn: () =>
      listClasses({
        campusId: params?.campusId,
        sessionId: params?.sessionId,
        levelId: params?.levelId,
      }),
  });
}

export function useClass(id: number, enabled = true) {
  return useQuery<SchoolClass, ApiClientError>({
    queryKey: adminKeys.class(id),
    queryFn: () => getClass(id),
    enabled: enabled && Number.isFinite(id) && id > 0,
  });
}

export function useLevels() {
  return useQuery<Level[], ApiClientError>({
    queryKey: adminKeys.levels(),
    queryFn: listLevels,
  });
}

export function useCreateClass(invalidateKey: string) {
  const qc = useQueryClient();
  return useMutation<SchoolClass, ApiClientError, Record<string, unknown>>({
    mutationFn: createClass,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.classes(invalidateKey) }),
  });
}

export function useUpdateClass(invalidateKey?: string) {
  const qc = useQueryClient();
  return useMutation<
    SchoolClass,
    ApiClientError,
    { id: number; body: Record<string, unknown> }
  >({
    mutationFn: ({ id, body }) => updateClass(id, body),
    onSuccess: (row) => {
      if (invalidateKey) {
        void qc.invalidateQueries({ queryKey: adminKeys.classes(invalidateKey) });
      }
      void qc.invalidateQueries({ queryKey: [...adminKeys.all, 'classes'] });
      void qc.invalidateQueries({ queryKey: adminKeys.class(row.id) });
    },
  });
}

export function useDeleteClass(invalidateKey?: string) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, number>({
    mutationFn: deleteClass,
    onSuccess: (_data, id) => {
      if (invalidateKey) {
        void qc.invalidateQueries({ queryKey: adminKeys.classes(invalidateKey) });
      }
      void qc.invalidateQueries({ queryKey: [...adminKeys.all, 'classes'] });
      void qc.removeQueries({ queryKey: adminKeys.class(id) });
    },
  });
}

export function useCreateLevel() {
  const qc = useQueryClient();
  return useMutation<Level, ApiClientError, Record<string, unknown>>({
    mutationFn: createLevel,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.levels() }),
  });
}

export function useSubjects() {
  return useQuery<Subject[], ApiClientError>({
    queryKey: adminKeys.subjects(),
    queryFn: listSubjects,
  });
}

export function useCurriculumSubjects(levelId?: string) {
  return useQuery<CurriculumSubject[], ApiClientError>({
    queryKey: adminKeys.curriculum(levelId),
    queryFn: () => listCurriculumSubjects(levelId || undefined),
  });
}

export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation<Subject, ApiClientError, { code: string; name: string }>({
    mutationFn: createSubject,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.subjects() }),
  });
}

export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation<Subject, ApiClientError, { id: number; body: Record<string, unknown> }>({
    mutationFn: ({ id, body }) => updateSubject(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.subjects() }),
  });
}

export function useSaveCurriculum(levelId: string) {
  const qc = useQueryClient();
  return useMutation<
    unknown,
    ApiClientError,
    Array<{ subjectId: number; isCompulsory?: boolean }>
  >({
    mutationFn: (subjects) => putCurriculumSubjects(Number(levelId), subjects),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.curriculum(levelId) }),
  });
}

export function useHouses(campusId?: string) {
  return useQuery<House[], ApiClientError>({
    queryKey: adminKeys.houses(campusId),
    queryFn: () => listHouses(campusId),
  });
}

export function useCreateHouse(campusId?: string) {
  const qc = useQueryClient();
  return useMutation<House, ApiClientError, Record<string, unknown>>({
    mutationFn: createHouse,
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.houses(campusId) }),
  });
}

export function useUpdateHouse(campusId?: string) {
  const qc = useQueryClient();
  return useMutation<House, ApiClientError, { id: number; body: Record<string, unknown> }>({
    mutationFn: ({ id, body }) => updateHouse(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.houses(campusId) }),
  });
}
