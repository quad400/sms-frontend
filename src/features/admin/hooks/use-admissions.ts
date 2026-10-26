'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import {
  assignTestCandidates,
  createEntranceTest,
  createIntake,
  getApplication,
  getCurrentAdmissionForm,
  issueOffer,
  listApplications,
  listEntranceTests,
  listIntakes,
  makeDecision,
  withdrawOffer,
  type Application,
  type EntranceTest,
  type Intake,
} from '../api/admissions';
import { adminKeys } from '../api/keys';
import type { Paginated } from '../types';

export function useIntakes(params: { campusId?: string; sessionId?: string } = {}) {
  return useQuery<Paginated<Intake>, ApiClientError>({
    queryKey: adminKeys.intakes({ ...params }),
    queryFn: () => listIntakes(params),
  });
}

export function useCreateIntake() {
  const qc = useQueryClient();
  return useMutation<Intake, ApiClientError, { name: string }>({
    mutationFn: (body) => createIntake(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.intakes({}) }),
  });
}

export function useApplications(
  params: { status?: string; intakeId?: string; levelId?: string } = {},
  enabled = true,
) {
  return useQuery<Paginated<Application>, ApiClientError>({
    queryKey: adminKeys.applications({
      status: params.status ?? '',
      intakeId: params.intakeId ?? '',
      levelId: params.levelId ?? '',
    }),
    queryFn: () =>
      listApplications({
        status: params.status || undefined,
        intakeId: params.intakeId || undefined,
        levelId: params.levelId || undefined,
      }),
    enabled,
  });
}

export function useApplication(applicationId: number) {
  return useQuery<Application, ApiClientError>({
    queryKey: adminKeys.application(applicationId),
    queryFn: () => getApplication(applicationId),
  });
}

function useInvalidateApplication(applicationId: number) {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: adminKeys.application(applicationId) });
}

export function useMakeDecision(applicationId: number) {
  const invalidate = useInvalidateApplication(applicationId);
  return useMutation<unknown, ApiClientError, string>({
    mutationFn: (decision) => makeDecision(applicationId, { decision }),
    onSuccess: invalidate,
  });
}

export function useIssueOffer(applicationId: number) {
  const invalidate = useInvalidateApplication(applicationId);
  return useMutation<unknown, ApiClientError, void>({
    mutationFn: () => issueOffer(applicationId, {}),
    onSuccess: invalidate,
  });
}

export function useWithdrawOffer(applicationId: number) {
  const invalidate = useInvalidateApplication(applicationId);
  return useMutation<unknown, ApiClientError, string | undefined>({
    mutationFn: (reason) => withdrawOffer(applicationId, reason),
    onSuccess: invalidate,
  });
}

export function useEntranceTests(params: { intakeId?: string } = {}) {
  return useQuery<Paginated<EntranceTest>, ApiClientError>({
    queryKey: adminKeys.entranceTests({ ...params }),
    queryFn: () => listEntranceTests(params),
  });
}

export function useCreateEntranceTest() {
  const qc = useQueryClient();
  return useMutation<EntranceTest, ApiClientError, { name: string }>({
    mutationFn: (body) => createEntranceTest(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.entranceTests({}) }),
  });
}

export function useAssignTestCandidates() {
  return useMutation<unknown, ApiClientError, { id: number; applicationIds: number[] }>({
    mutationFn: ({ id, applicationIds }) => assignTestCandidates(id, applicationIds),
  });
}

export function useAdmissionForm() {
  return useQuery<unknown, ApiClientError>({
    queryKey: adminKeys.admissionForm(),
    queryFn: getCurrentAdmissionForm,
  });
}
