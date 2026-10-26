'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiClientError } from '@/lib/api/errors';
import { fetchPortalLessonNotes } from '../api/get-lesson-notes';
import { portalKeys } from '../api/keys';

type Data = Awaited<ReturnType<typeof fetchPortalLessonNotes>>;

export function usePortalLessonNotes() {
  return useQuery<Data, ApiClientError>({
    queryKey: portalKeys.lessonNotes(),
    queryFn: fetchPortalLessonNotes,
  });
}
