import type { AuthUserType, SessionUser } from '@/lib/auth/types';

const IT_PERMISSION_PREFIXES = [
  'system-update.',
  'backup.',
  'licensing.',
  'jobs.',
  'health.status.',
  'events.',
  'payments-gateway.',
] as const;

export function portalHomeForUserType(userType: AuthUserType): string {
  switch (userType) {
    case 'admin':
      return '/admin';
    case 'staff':
      return '/staff';
    case 'parent':
      return '/parent';
    case 'student':
      return '/student';
    default:
      return '/login';
  }
}

export function canAccessItPortal(permissions: string[]): boolean {
  return permissions.some((permission) =>
    IT_PERMISSION_PREFIXES.some((prefix) => permission.startsWith(prefix)),
  );
}

export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return false;
  }
  if (path.includes('\\') || path.includes('://')) {
    return false;
  }
  return true;
}

export function resolvePostLoginPath(
  user: Pick<SessionUser, 'userType' | 'permissions'>,
  next?: string | null,
): string {
  if (isSafeInternalPath(next)) {
    return next;
  }
  return portalHomeForUserType(user.userType);
}

export function portalMatchesPath(userType: AuthUserType, pathname: string): boolean {
  if (pathname.startsWith('/admin')) {
    return userType === 'admin';
  }
  if (pathname.startsWith('/staff')) {
    return userType === 'staff';
  }
  if (pathname.startsWith('/parent')) {
    return userType === 'parent';
  }
  if (pathname.startsWith('/student')) {
    return userType === 'student';
  }
  if (pathname.startsWith('/it')) {
    return true;
  }
  return true;
}
