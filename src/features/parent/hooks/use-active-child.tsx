'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { childPath } from '@/components/shells/parent-nav';
import { readStoredChildId, writeStoredChildId } from '../lib/child-storage';
import type { ParentChild } from '../types';
import { useChildren } from './use-children';

type ActiveChildContextValue = {
  children: ParentChild[];
  activeChild: ParentChild | null;
  activeChildId: number | null;
  isPending: boolean;
  error: Error | null;
  selectChild: (id: number) => void;
  childHref: (suffix: string) => string;
  refetch: () => void;
};

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

function childSuffixFromPath(pathname: string): string | null {
  const match = pathname.match(/\/parent\/children\/\d+(\/.*)?$/);
  if (!match) return null;
  return match[1] && match[1] !== '/' ? match[1] : '';
}

export function ActiveChildProvider({ children: node }: { children: ReactNode }) {
  const list = useChildren();
  const params = useParams<{ studentId?: string }>();
  const pathname = usePathname();
  const router = useRouter();

  const rows = list.data ?? [];
  const paramId = params.studentId ? Number(params.studentId) : null;
  const validParam =
    paramId !== null && Number.isFinite(paramId) && rows.some((row) => row.id === paramId)
      ? paramId
      : null;

  const activeChildId = useMemo(() => {
    if (validParam !== null) return validParam;
    if (rows.length === 0) return null;
    const stored = readStoredChildId();
    if (stored !== null && rows.some((row) => row.id === stored)) return stored;
    return rows[0]!.id;
  }, [validParam, rows]);

  const activeChild = useMemo(
    () => rows.find((row) => row.id === activeChildId) ?? null,
    [rows, activeChildId],
  );

  useEffect(() => {
    if (activeChildId !== null) writeStoredChildId(activeChildId);
  }, [activeChildId]);

  const selectChild = useCallback(
    (id: number) => {
      writeStoredChildId(id);
      const suffix = childSuffixFromPath(pathname);
      if (suffix !== null) {
        router.push(childPath(id, suffix || ''));
        return;
      }
      // Stay on non-child routes (home, messages, …) but keep selection for next deep link.
      router.refresh();
    },
    [pathname, router],
  );

  const childHref = useCallback(
    (suffix: string) => {
      const id = activeChildId ?? rows[0]?.id;
      if (id === undefined) return '/parent';
      return childPath(id, suffix);
    },
    [activeChildId, rows],
  );

  const value = useMemo<ActiveChildContextValue>(
    () => ({
      children: rows,
      activeChild,
      activeChildId,
      isPending: list.isPending,
      error: list.error,
      selectChild,
      childHref,
      refetch: () => void list.refetch(),
    }),
    [rows, activeChild, activeChildId, list.isPending, list.error, selectChild, childHref, list],
  );

  return <ActiveChildContext.Provider value={value}>{node}</ActiveChildContext.Provider>;
}

export function useActiveChild(): ActiveChildContextValue {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) {
    throw new Error('useActiveChild must be used within ActiveChildProvider');
  }
  return ctx;
}
