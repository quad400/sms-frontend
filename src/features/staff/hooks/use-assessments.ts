'use client';

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  approveResultSheet,
  fetchAllResultSheets,
  fetchAssessments,
  fetchScoreCount,
  fetchScores,
  putScores,
  rejectResultSheet,
  scoresPath,
  submitAssessment,
} from '../api/assessments';
import { PAGE_SIZE } from '../lib/paginate';
import { staffKeys } from '../api/keys';
import { sendOrQueue, type WriteResult } from '../lib/queue';
import type { Assessment, Paginated, ResultSheet, Score, ScoreInput } from '../types';

type AssessmentFilters = { classId?: number; subjectId?: number; termId?: number; status?: string };

export function useAssessments(filters: AssessmentFilters = {}) {
  return useQuery<Paginated<Assessment>, ApiClientError>({
    queryKey: staffKeys.assessments({ ...filters }),
    queryFn: () => fetchAssessments(filters),
  });
}

/** Resolve one assessment from the (teacher-scoped) list; there is no single-get endpoint. */
export function useAssessment(id: number) {
  const list = useAssessments();
  return {
    ...list,
    data: list.data?.data.find((row) => row.id === id),
    notFound: !list.isPending && !list.error && !list.data?.data.some((row) => row.id === id),
  };
}

export function useScores(assessmentId: number) {
  return useQuery<Score[], ApiClientError>({
    queryKey: staffKeys.scores(assessmentId),
    queryFn: () => fetchScores(assessmentId),
  });
}

type ScoreCounts = Record<number, number | undefined>;

function combineScoreCounts(
  results: Array<{ data?: { assessmentId: number; total: number } }>,
): ScoreCounts {
  const out: ScoreCounts = {};
  for (const result of results) {
    if (result.data) out[result.data.assessmentId] = result.data.total;
  }
  return out;
}

/** Number of recorded scores per assessment (including absences). */
export function useScoreCounts(assessmentIds: number[]): ScoreCounts {
  return useQueries({
    queries: assessmentIds.map((assessmentId) => ({
      queryKey: staffKeys.scoreCount(assessmentId),
      queryFn: async () => ({ assessmentId, total: await fetchScoreCount(assessmentId) }),
      staleTime: 30_000,
      retry: false,
    })),
    combine: combineScoreCounts,
  });
}

type SaveResult = { assessmentId: number; scores: Score[] };

/** Saves scores online, or queues the PUT in the offline outbox. */
export function useSaveScores(assessmentId: number) {
  const queryClient = useQueryClient();
  return useMutation<WriteResult<SaveResult>, ApiClientError, ScoreInput[]>({
    mutationFn: (scores) =>
      sendOrQueue({
        method: 'PUT',
        path: scoresPath(assessmentId),
        body: { scores },
        send: () => putScores(assessmentId, scores),
      }),
    onSuccess: (result) => {
      if (result.queued) return;
      // Merge the server's answer right away so cells never flash stale values.
      queryClient.setQueryData<Score[]>(staffKeys.scores(assessmentId), (previous) => {
        const byStudent = new Map((previous ?? []).map((row) => [row.studentId, row]));
        for (const row of result.data.scores) byStudent.set(row.studentId, row);
        return [...byStudent.values()];
      });
      void queryClient.invalidateQueries({ queryKey: staffKeys.scoreCount(assessmentId) });
    },
  });
}

export function useSubmitAssessment(assessmentId: number) {
  const queryClient = useQueryClient();
  return useMutation<Assessment, ApiClientError, void>({
    mutationFn: () => submitAssessment(assessmentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...staffKeys.all, 'assessments'] });
      void queryClient.invalidateQueries({ queryKey: staffKeys.scores(assessmentId) });
      void queryClient.invalidateQueries({ queryKey: staffKeys.overview() });
    },
  });
}

export function useResultSheets(status: string | undefined, enabled = true) {
  return useQuery<Paginated<ResultSheet>, ApiClientError>({
    queryKey: staffKeys.resultSheets({ status }),
    queryFn: async () => {
      const data = await fetchAllResultSheets({ status });
      return { data, meta: { page: 1, pageSize: PAGE_SIZE, total: data.length } };
    },
    enabled,
  });
}

function useInvalidateApprovals() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: [...staffKeys.all, 'result-sheets'] });
    void queryClient.invalidateQueries({ queryKey: staffKeys.approvalsCount() });
  };
}

export function useApproveResultSheet() {
  const invalidate = useInvalidateApprovals();
  return useMutation<ResultSheet, ApiClientError, { id: number; reason?: string }>({
    mutationFn: ({ id, reason }) => approveResultSheet(id, reason),
    onSuccess: invalidate,
  });
}

export function useRejectResultSheet() {
  const invalidate = useInvalidateApprovals();
  return useMutation<ResultSheet, ApiClientError, { id: number; reason: string }>({
    mutationFn: ({ id, reason }) => rejectResultSheet(id, reason),
    onSuccess: invalidate,
  });
}
