export type AuthUserType = 'admin' | 'staff' | 'parent' | 'student';

export type SessionUser = {
  id: number;
  displayName: string;
  email: string | null;
  userType: AuthUserType;
  permissions: string[];
  campusIds: number[];
};

export type AuthSuccessBody = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SessionUser;
};

export type AuthChallengeBody = {
  requires2fa: true;
  challengeToken: string;
};

export function isAuthChallenge(value: unknown): value is AuthChallengeBody {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as AuthChallengeBody).requires2fa === true &&
    typeof (value as AuthChallengeBody).challengeToken === 'string'
  );
}

export function isAuthSuccess(value: unknown): value is AuthSuccessBody {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const body = value as AuthSuccessBody;
  return (
    typeof body.accessToken === 'string' &&
    typeof body.refreshToken === 'string' &&
    !!body.user &&
    typeof body.user.id === 'number' &&
    typeof body.user.userType === 'string'
  );
}
