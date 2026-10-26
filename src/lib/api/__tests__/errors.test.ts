import { describe, expect, it } from 'vitest';
import { ApiClientError, mapError, unwrap } from '@/lib/api/errors';

describe('mapError', () => {
  it('maps field errors for 400 with details', () => {
    const mapped = mapError({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid',
      details: { email: 'Required' },
      requestId: 'r1',
    });
    expect(mapped.kind).toBe('field');
    if (mapped.kind === 'field') {
      expect(mapped.fields.email).toBe('Required');
    }
  });

  it('maps license read-only', () => {
    const mapped = mapError({
      statusCode: 403,
      code: 'LICENSE_READ_ONLY',
      message: 'Read only',
      requestId: 'r2',
    });
    expect(mapped.kind).toBe('license');
  });

  it('maps permission 403 to a generic page message', () => {
    const mapped = mapError({
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Missing required permission portal.child.list.',
      requestId: 'r2b',
    });
    expect(mapped).toMatchObject({
      kind: 'page',
      status: 403,
      message: 'You don’t have access to this.',
      code: 'FORBIDDEN',
    });
  });

  it('maps 404 to page', () => {
    const mapped = mapError({
      statusCode: 404,
      code: 'NOT_FOUND',
      message: 'Missing',
      requestId: 'r3',
    });
    expect(mapped.kind).toBe('page');
  });
});

describe('unwrap', () => {
  it('returns data on success', async () => {
    const data = await unwrap(Promise.resolve({ data: { id: 1 } }));
    expect(data).toEqual({ id: 1 });
  });

  it('throws ApiClientError for API error bodies', async () => {
    await expect(
      unwrap(
        Promise.resolve({
          error: {
            statusCode: 404,
            code: 'NOT_FOUND',
            message: 'Missing',
            requestId: 'r1',
          },
        }),
      ),
    ).rejects.toBeInstanceOf(ApiClientError);
  });
});
