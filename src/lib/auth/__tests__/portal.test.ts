import { describe, expect, it } from 'vitest';
import {
  canAccessItPortal,
  isSafeInternalPath,
  portalHomeForUserType,
  resolvePostLoginPath,
} from '@/lib/auth/portal';

describe('portal helpers', () => {
  it('maps user types to homes', () => {
    expect(portalHomeForUserType('admin')).toBe('/admin');
    expect(portalHomeForUserType('staff')).toBe('/staff');
    expect(portalHomeForUserType('parent')).toBe('/parent');
    expect(portalHomeForUserType('student')).toBe('/student');
  });

  it('accepts only safe internal next paths', () => {
    expect(isSafeInternalPath('/admin')).toBe(true);
    expect(isSafeInternalPath('//evil.com')).toBe(false);
    expect(isSafeInternalPath('https://evil.com')).toBe(false);
  });

  it('prefers safe next over default portal', () => {
    expect(
      resolvePostLoginPath({ userType: 'admin', permissions: [] }, '/admin/students'),
    ).toBe('/admin/students');
    expect(resolvePostLoginPath({ userType: 'staff', permissions: [] }, null)).toBe('/staff');
  });

  it('detects IT portal permissions', () => {
    expect(canAccessItPortal(['backup.backup.list'])).toBe(true);
    expect(canAccessItPortal(['students.student.list'])).toBe(false);
  });
});
