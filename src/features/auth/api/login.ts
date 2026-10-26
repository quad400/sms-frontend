import { ApiClientError, unwrap } from '@/lib/api/errors';
import { sessionApi } from '@/lib/api/session';
import { isSessionUser, type LoginBody, type LoginResult } from '../types';

export async function login(body: LoginBody): Promise<LoginResult> {
  const payload = await unwrap(sessionApi.POST('/api/session/login', { body }));

  if ('challenge' in payload && payload.challenge?.challengeToken) {
    return {
      kind: 'challenge',
      challengeToken: payload.challenge.challengeToken,
    };
  }

  if ('user' in payload && isSessionUser(payload.user)) {
    return { kind: 'success', user: payload.user };
  }

  throw new ApiClientError({
    kind: 'retry',
    message: 'Unable to sign in. Please try again.',
    code: 'INVALID_LOGIN_RESPONSE',
    requestId: '',
  });
}
