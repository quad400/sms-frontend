'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  cancelImport,
  commitImport,
  createImport,
  getImport,
  getImportErrors,
  type ImportEntity,
  type ImportError,
  type ImportJob,
} from '../api/imports';
import { adminKeys } from '../api/keys';

const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled', 'validated', 'ready'];

export function useImportJob(jobId: number | null) {
  return useQuery<ImportJob, ApiClientError>({
    queryKey: adminKeys.importJob(jobId ?? 0),
    queryFn: () => getImport(jobId!),
    enabled: jobId != null,
    refetchInterval: (q) => {
      const status = String(q.state.data?.status ?? '').toLowerCase();
      return TERMINAL_STATUSES.includes(status) ? false : 1500;
    },
  });
}

export function useImportErrors(jobId: number | null, enabled: boolean) {
  return useQuery<ImportError[], ApiClientError>({
    queryKey: [...adminKeys.importJob(jobId ?? 0), 'errors'],
    queryFn: async () => {
      const res = await getImportErrors(jobId!);
      return Array.isArray(res) ? res : (res.data ?? []);
    },
    enabled: jobId != null && enabled,
  });
}

export function useUploadImport() {
  return useMutation<ImportJob, ApiClientError, { entity: ImportEntity; file: File }>({
    mutationFn: ({ entity, file }) => createImport(entity, file, true),
  });
}

export function useCommitImport(jobId: number | null) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => commitImport(jobId!),
    onSuccess: () => {
      if (jobId != null) void qc.invalidateQueries({ queryKey: adminKeys.importJob(jobId) });
    },
  });
}

export function useCancelImport(jobId: number | null) {
  const qc = useQueryClient();
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => cancelImport(jobId!),
    onSuccess: () => {
      if (jobId != null) void qc.invalidateQueries({ queryKey: adminKeys.importJob(jobId) });
    },
  });
}
