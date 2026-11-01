'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function parseWizardStep<T extends string>(
  value: string | null,
  steps: readonly T[],
  fallback: T,
): T {
  if (value && (steps as readonly string[]).includes(value)) {
    return value as T;
  }
  return fallback;
}

export function nextWizardStep<T extends string>(
  steps: readonly T[],
  step: T,
): T | null {
  const i = steps.indexOf(step);
  if (i < 0 || i >= steps.length - 1) return null;
  return steps[i + 1] ?? null;
}

export function prevWizardStep<T extends string>(
  steps: readonly T[],
  step: T,
): T | null {
  const i = steps.indexOf(step);
  if (i <= 0) return null;
  return steps[i - 1] ?? null;
}

/**
 * Sync wizard step (+ optional entity id) to the URL search params.
 */
export function useWizardStepParam<T extends string>({
  steps,
  fallback,
  idKey,
}: {
  steps: readonly T[];
  fallback: T;
  idKey?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const step = parseWizardStep(searchParams.get('step'), steps, fallback);

  const idParam = idKey ? searchParams.get(idKey) : null;
  const entityId =
    idParam && Number.isFinite(Number(idParam)) ? Number(idParam) : null;

  const setStepState = useCallback(
    (next: { step: T; id?: number | null; extra?: Record<string, string | null> }) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', next.step);
      if (idKey && next.id !== undefined) {
        if (next.id != null) params.set(idKey, String(next.id));
        else params.delete(idKey);
      }
      if (next.extra) {
        for (const [k, v] of Object.entries(next.extra)) {
          if (v == null || v === '') params.delete(k);
          else params.set(k, v);
        }
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [idKey, pathname, router, searchParams],
  );

  const resetWizard = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  return { step, entityId, searchParams, setStepState, resetWizard, pathname, router };
}
