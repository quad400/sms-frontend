export const ACCESS_COOKIE = 'sms_access';
export const REFRESH_COOKIE = 'sms_refresh';
export const PORTAL_COOKIE = 'sms_portal';

/** Decode JWT payload without verifying (expiry check only). Edge-safe. */
export function decodeJwtExp(token: string): number | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }
  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf8');
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export function accessTokenNeedsRefresh(token: string, skewSeconds = 60): boolean {
  const exp = decodeJwtExp(token);
  if (exp === null) {
    return true;
  }
  return exp * 1000 <= Date.now() + skewSeconds * 1000;
}
