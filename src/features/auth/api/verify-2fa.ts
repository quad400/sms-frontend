import { ApiClientError, isApiErrorBody, mapError } from '@/lib/api/errors';
import { isSessionUser, type Verify2faBody, type Verify2faResult } from '../types';

export async function verify2fa(body: Verify2faBody): Promise<Verify2faResult> {
  const response = await fetch('/api/session/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload: unknown = await response.json();

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      throw new ApiClientError(mapError(payload));
    }
    throw new ApiClientError({
      kind: 'retry',
      message: 'Unable to verify the code. Please try again.',
      code: 'UNKNOWN',
      requestId: '',
    });
  }

  if (payload && typeof payload === 'object' && 'user' in payload && isSessionUser(payload.user)) {
    return { user: payload.user };
  }

  throw new ApiClientError({
    kind: 'retry',
    message: 'Unable to verify the code. Please try again.',
    code: 'INVALID_2FA_RESPONSE',
    requestId: '',
  });
}
