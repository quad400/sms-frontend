'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  approveLessonPlan,
  createLessonNote,
  createLessonPlan,
  deleteLessonNote,
  fetchLessonNotes,
  fetchLessonPlans,
  submitLessonPlan,
  updateLessonNote,
  updateLessonPlan,
} from '../api/lessons';
import { staffKeys } from '../api/keys';
import type {
  LessonNote,
  LessonNoteDraft,
  LessonNotePatch,
  LessonPlan,
  LessonPlanDraft,
  LessonPlanPatch,
  Paginated,
} from '../types';

type Filters = { classId?: number; subjectId?: number; termId?: number; status?: string };

export function useLessonPlans(filters: Filters = {}, enabled = true) {
  return useQuery<Paginated<LessonPlan>, ApiClientError>({
    queryKey: staffKeys.lessonPlans({ ...filters }),
    queryFn: () => fetchLessonPlans(filters),
    enabled,
  });
}

export function useLessonNotes(filters: Filters = {}, enabled = true) {
  return useQuery<Paginated<LessonNote>, ApiClientError>({
    queryKey: staffKeys.lessonNotes({ ...filters }),
    queryFn: () => fetchLessonNotes(filters),
    enabled,
  });
}

function useInvalidateLessons() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [...staffKeys.all, 'lesson-plans'] });
    void queryClient.invalidateQueries({ queryKey: [...staffKeys.all, 'lesson-notes'] });
    void queryClient.invalidateQueries({ queryKey: staffKeys.overview() });
    void queryClient.invalidateQueries({ queryKey: staffKeys.approvalsCount() });
  };
}

export function useCreateLessonPlan() {
  const invalidate = useInvalidateLessons();
  return useMutation<LessonPlan, ApiClientError, LessonPlanDraft>({
    mutationFn: createLessonPlan,
    onSuccess: invalidate,
  });
}

export function useUpdateLessonPlan() {
  const invalidate = useInvalidateLessons();
  return useMutation<LessonPlan, ApiClientError, { id: number; patch: LessonPlanPatch }>({
    mutationFn: ({ id, patch }) => updateLessonPlan(id, patch),
    onSuccess: invalidate,
  });
}

export function useSubmitLessonPlan() {
  const invalidate = useInvalidateLessons();
  return useMutation<LessonPlan, ApiClientError, number>({
    mutationFn: submitLessonPlan,
    onSuccess: invalidate,
  });
}

export function useApproveLessonPlan() {
  const invalidate = useInvalidateLessons();
  return useMutation<LessonPlan, ApiClientError, number>({
    mutationFn: approveLessonPlan,
    onSuccess: invalidate,
  });
}

export function useCreateLessonNote() {
  const invalidate = useInvalidateLessons();
  return useMutation<LessonNote, ApiClientError, LessonNoteDraft>({
    mutationFn: createLessonNote,
    onSuccess: invalidate,
  });
}

export function useUpdateLessonNote() {
  const invalidate = useInvalidateLessons();
  return useMutation<LessonNote, ApiClientError, { id: number; patch: LessonNotePatch }>({
    mutationFn: ({ id, patch }) => updateLessonNote(id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteLessonNote() {
  const invalidate = useInvalidateLessons();
  return useMutation<void, ApiClientError, number>({
    mutationFn: deleteLessonNote,
    onSuccess: invalidate,
  });
}
