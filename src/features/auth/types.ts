import type { components } from '@/lib/api/schema';
import type { SessionUser } from '@/lib/auth/types';

export function isSessionUser(value: unknown): value is SessionUser {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const user = value as SessionUser;
  return (
    typeof user.id === 'number' &&
    typeof user.displayName === 'string' &&
    typeof user.userType === 'string' &&
    Array.isArray(user.permissions) &&
    Array.isArray(user.campusIds)
  );
}

export type LoginBody = {
  identifier: string;
  password: string;
};

export type Verify2faBody = {
  code: string;
  challengeToken: string;
};

export type LoginSuccess = {
  kind: 'success';
  user: SessionUser;
};

export type LoginChallenge = {
  kind: 'challenge';
  challengeToken: string;
};

export type LoginResult = LoginSuccess | LoginChallenge;

export type Verify2faResult = {
  user: SessionUser;
};

export type ForgotPasswordBody = components['schemas']['ForgotPasswordDto'];
export type ResetPasswordBody = components['schemas']['ResetPasswordDto'];
