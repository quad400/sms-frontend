import { proxyPostFormData } from '@/lib/api/proxy-fetch';

export type PortalMePhotoResult = {
  photoFileId: number;
  photoUrl: string;
};

export function postPortalMePhoto(file: File): Promise<PortalMePhotoResult> {
  const form = new FormData();
  form.append('file', file);
  return proxyPostFormData<PortalMePhotoResult>('/api/v1/portal/me/photo', form);
}
