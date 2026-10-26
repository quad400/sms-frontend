import { proxyGet, proxyPatch, proxyPost, proxyPut } from '@/lib/api/proxy-fetch';
import type { Paginated } from '../types';

export type Intake = {
  id: number;
  name: string;
  sessionId?: number;
  status?: string;
  opensAt?: string | null;
  closesAt?: string | null;
  capacities?: Array<Record<string, unknown>>;
};

export type Application = {
  id: number;
  applicantName?: string;
  status: string;
  intakeId?: number;
  createdAt?: string;
  decision?: string | null;
  offerStatus?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type EntranceTest = {
  id: number;
  name: string;
  intakeId?: number;
  scheduledAt?: string | null;
  status?: string;
};

function asPaginated<T>(res: Paginated<T> | T[]): Paginated<T> {
  if (Array.isArray(res)) {
    return { data: res, meta: { page: 1, pageSize: res.length, total: res.length } };
  }
  return res;
}

/** Backend returns a full array (no page/pageSize whitelist). */
export async function listIntakes(params?: {
  campusId?: string;
  sessionId?: string;
}): Promise<Paginated<Intake>> {
  const res = await proxyGet<Paginated<Intake> | Intake[]>('/api/v1/intakes', {
    campusId: params?.campusId,
    sessionId: params?.sessionId,
  });
  return asPaginated(res);
}

export function createIntake(body: Record<string, unknown>) {
  return proxyPost<Intake>('/api/v1/intakes', body);
}

export function updateIntake(id: number, body: Record<string, unknown>) {
  return proxyPatch<Intake>(`/api/v1/intakes/${id}`, body);
}

/** Backend whitelist: status, levelId, intakeId only. */
export async function listApplications(params: {
  status?: string;
  intakeId?: string;
  levelId?: string;
}): Promise<Paginated<Application>> {
  const res = await proxyGet<Paginated<Application> | Application[]>('/api/v1/applications', {
    status: params.status,
    intakeId: params.intakeId,
    levelId: params.levelId,
  });
  return asPaginated(res);
}

export function getApplication(id: number) {
  return proxyGet<Application>(`/api/v1/applications/${id}`);
}

export function updateApplication(id: number, body: Record<string, unknown>) {
  return proxyPatch(`/api/v1/applications/${id}`, body);
}

export function makeDecision(id: number, body: { decision: string; reason?: string }) {
  return proxyPost(`/api/v1/applications/${id}/decision`, body);
}

export function issueOffer(id: number, body: Record<string, unknown>) {
  return proxyPost(`/api/v1/applications/${id}/offer`, body);
}

export function withdrawOffer(id: number, reason?: string) {
  return proxyPost(`/api/v1/applications/${id}/offer/withdraw`, { reason });
}

export async function listEntranceTests(params?: {
  intakeId?: string;
}): Promise<Paginated<EntranceTest>> {
  const res = await proxyGet<Paginated<EntranceTest> | EntranceTest[]>('/api/v1/entrance-tests', {
    intakeId: params?.intakeId,
  });
  return asPaginated(res);
}

export function createEntranceTest(body: Record<string, unknown>) {
  return proxyPost<EntranceTest>('/api/v1/entrance-tests', body);
}

export function assignTestCandidates(id: number, applicationIds: number[]) {
  return proxyPost(`/api/v1/entrance-tests/${id}/candidates`, { applicationIds });
}

export function recordTestResults(id: number, results: Array<Record<string, unknown>>) {
  return proxyPut(`/api/v1/entrance-tests/${id}/results`, { results });
}

export function getCurrentAdmissionForm() {
  return proxyGet('/api/v1/admission-forms/current');
}
