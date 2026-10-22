import { describe, expect, it } from 'vitest';
import { accessTokenNeedsRefresh, decodeJwtExp } from '@/lib/auth/cookie-names';

function makeToken(expSecondsFromNow: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }),
  ).toString('base64url');
  return `${header}.${payload}.sig`;
}

describe('cookie jwt helpers', () => {
  it('decodes exp', () => {
    const token = makeToken(120);
    const exp = decodeJwtExp(token);
    expect(exp).toBeTypeOf('number');
  });

  it('flags near-expiry tokens for refresh', () => {
    expect(accessTokenNeedsRefresh(makeToken(30))).toBe(true);
    expect(accessTokenNeedsRefresh(makeToken(120))).toBe(false);
  });
});
