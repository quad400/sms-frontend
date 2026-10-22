'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import type { SessionUser } from '@/lib/auth/types';

type PermissionsContextValue = {
  user: SessionUser | null;
  can: (permission: string) => boolean;
};

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  const can = useCallback(
    (permission: string) => {
      if (!user) {
        return false;
      }
      return user.permissions.includes(permission);
    },
    [user],
  );

  const value = useMemo(() => ({ user, can }), [user, can]);

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}

export function useSession(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}

export function usePermissions() {
  const { can, user } = useSession();
  return { can, permissions: user?.permissions ?? [] };
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = usePermissions();
  if (!can(permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
