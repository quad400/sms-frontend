'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { asRecord, str } from '@/lib/utils/record';
import { adminKeys } from '../api/keys';
import {
  executePromotion,
  getPromotion,
  previewPromotion,
  reversePromotion,
} from '../api/promotions';

export type PromotionScope = {
  campusId: number;
  fromSessionId: number;
  toSessionId: number;
};

export type PromotionDecision = {
  studentId: number;
  outcomeCode: string;
  destinationClassId?: number;
};

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'reversed']);

/** Polls the promotion job every 2s until it reaches a terminal status. */
export function usePromotion(id: number | null) {
  return useQuery<unknown, ApiClientError>({
    queryKey: adminKeys.promotion(id ?? 0),
    queryFn: () => getPromotion(id!),
    enabled: id != null,
    refetchInterval: (q) => {
      const status = str(asRecord(q.state.data)?.status).toLowerCase();
      if (!status || TERMINAL_STATUSES.has(status)) return false;
      return 2000;
    },
  });
}

export function usePreviewPromotion() {
  return useMutation<unknown, ApiClientError, PromotionScope>({
    mutationFn: (scope) => previewPromotion({ ...scope }),
  });
}

export function useExecutePromotion() {
  return useMutation<
    unknown,
    Error,
    PromotionScope & { batchId: string | number | null; decisions: PromotionDecision[] }
  >({
    mutationFn: async ({ batchId, decisions, ...scope }) => {
      if (batchId == null) throw new Error('Missing batch');
      // Re-preview with decisions when API accepts them
      await previewPromotion({ ...scope, decisions }).catch(() => null);
      return executePromotion({ batchId });
    },
  });
}

export function useReversePromotion(jobId: number | null) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, string>({
    mutationFn: (reason) => reversePromotion(jobId!, reason),
    onSuccess: () => {
      if (jobId != null) {
        void qc.invalidateQueries({ queryKey: adminKeys.promotion(jobId) });
      }
    },
  });
}
