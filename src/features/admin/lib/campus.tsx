'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from '@/lib/auth/permissions';

const COOKIE = 'sms_campus_id';
const DENSITY_KEY = 'sms.admin.density';

export type AdminDensity = 'compact' | 'comfortable';

function readCampusCookie(): number | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!match?.[1]) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

function writeCampusCookie(id: number | null) {
  if (typeof document === 'undefined') return;
  if (id === null) {
    document.cookie = `${COOKIE}=; path=/; max-age=0; SameSite=Lax`;
    return;
  }
  document.cookie = `${COOKIE}=${id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

function readDensity(): AdminDensity {
  if (typeof window === 'undefined') return 'comfortable';
  return window.localStorage.getItem(DENSITY_KEY) === 'compact' ? 'compact' : 'comfortable';
}

type CampusContextValue = {
  campusId: number | null;
  setCampusId: (id: number | null) => void;
  campusIds: number[];
  density: AdminDensity;
  setDensity: (d: AdminDensity) => void;
  campusQuery: string | undefined;
};

const CampusContext = createContext<CampusContextValue | null>(null);

export function AdminCampusProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const campusIds = user?.campusIds ?? [];

  const [campusId, setCampusIdState] = useState<number | null>(() => {
    const fromCookie = readCampusCookie();
    // Empty campusIds = unrestricted — accept any cookie campus.
    if (fromCookie !== null && (campusIds.length === 0 || campusIds.includes(fromCookie))) {
      return fromCookie;
    }
    return campusIds.length === 1 ? campusIds[0]! : null;
  });

  const [density, setDensityState] = useState<AdminDensity>(readDensity);

  useEffect(() => {
    if (campusId !== null && campusIds.length > 0 && !campusIds.includes(campusId)) {
      setCampusIdState(campusIds.length === 1 ? campusIds[0]! : null);
    } else if (campusId === null && campusIds.length === 1) {
      setCampusIdState(campusIds[0]!);
    }
  }, [campusId, campusIds]);

  // Empty campusIds = unrestricted (system / bootstrap admin). They may select any campus.
  const isUnrestricted = campusIds.length === 0;

  const setCampusId = useCallback(
    (id: number | null) => {
      if (id === null) {
        setCampusIdState(null);
        writeCampusCookie(null);
        return;
      }
      if (isUnrestricted || campusIds.includes(id)) {
        setCampusIdState(id);
        writeCampusCookie(id);
      }
    },
    [campusIds, isUnrestricted],
  );

  const setDensity = useCallback((d: AdminDensity) => {
    setDensityState(d);
    window.localStorage.setItem(DENSITY_KEY, d);
  }, []);

  const resolvedCampusId = useMemo(() => {
    if (campusIds.length === 1) return campusIds[0]!;
    if (campusId === null) return null;
    if (isUnrestricted || campusIds.includes(campusId)) return campusId;
    return null;
  }, [campusId, campusIds, isUnrestricted]);

  const value = useMemo<CampusContextValue>(
    () => ({
      campusId: resolvedCampusId,
      setCampusId,
      campusIds,
      density,
      setDensity,
      campusQuery: resolvedCampusId != null ? String(resolvedCampusId) : undefined,
    }),
    [resolvedCampusId, campusIds, density, setCampusId, setDensity],
  );

  return <CampusContext.Provider value={value}>{children}</CampusContext.Provider>;
}

export function useAdminCampus(): CampusContextValue {
  const ctx = useContext(CampusContext);
  if (!ctx) {
    throw new Error('useAdminCampus must be used within AdminCampusProvider');
  }
  return ctx;
}
