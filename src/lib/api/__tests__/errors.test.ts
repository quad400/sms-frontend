import { describe, expect, it } from 'vitest';
import { mapError } from '@/lib/api/errors';

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
