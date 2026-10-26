import { proxyGet, proxyPost, proxyPostFormData } from '@/lib/api/proxy-fetch';

export type ImportEntity =
  | 'students'
  | 'guardians'
  | 'staff'
  | 'scores'
  | 'fee-structures'
  | 'opening-balances';

export type ImportJob = {
  id: number;
  entity: string;
  status: string;
  validRows?: number;
  errorRows?: number;
  totalRows?: number;
};

export type ImportError = {
  row: number;
  column?: string;
  message: string;
};

export function downloadImportTemplate(entity: ImportEntity) {
  return proxyGet<Blob | { url?: string; csv?: string }>(`/api/v1/import-templates/${entity}`);
}

export function createImport(entity: ImportEntity, file: File, dryRun = true) {
  const form = new FormData();
  form.append('file', file);
  const path = `/api/v1/imports?entity=${encodeURIComponent(entity)}&dryRun=${dryRun ? 'true' : 'false'}`;
  return proxyPostFormData<ImportJob>(path, form);
}

export function getImport(id: number) {
  return proxyGet<ImportJob>(`/api/v1/imports/${id}`);
}

export function getImportErrors(id: number) {
  return proxyGet<ImportError[] | { data: ImportError[] }>(`/api/v1/imports/${id}/errors`);
}

export function commitImport(id: number) {
  return proxyPost(`/api/v1/imports/${id}/commit`, {});
}

export function cancelImport(id: number) {
  return proxyPost(`/api/v1/imports/${id}/cancel`, {});
}
