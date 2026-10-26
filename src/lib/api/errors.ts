export type ApiErrorBody = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  requestId: string;
};

export type MappedError =
  | { kind: 'field'; fields: Record<string, string>; message: string; code: string; requestId: string }
  | { kind: 'toast'; message: string; code: string; requestId: string }
  | { kind: 'page'; status: 403 | 404; message: string; code: string; requestId: string }
  | { kind: 'retry'; message: string; code: string; requestId: string }
  | { kind: 'license'; message: string; code: string; requestId: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  const record = asRecord(value);
  return (
    !!record &&
    typeof record.statusCode === 'number' &&
    typeof record.code === 'string' &&
    typeof record.message === 'string' &&
    typeof record.requestId === 'string'
  );
}

export class ApiClientError extends Error {
  readonly mapped: MappedError;

  constructor(mapped: MappedError) {
    super(mapped.message);
    this.name = 'ApiClientError';
    this.mapped = mapped;
  }
}

type OpenApiResult<T> = { data?: T; error?: unknown; response?: Response };

/**
 * Unwraps an openapi-fetch result into typed data.
 * Throws {@link ApiClientError} when the client returns an error payload.
 */
export async function unwrap<T>(promise: Promise<OpenApiResult<T>>): Promise<T> {
  const { data, error } = await promise;
  if (error !== undefined) {
    if (isApiErrorBody(error)) {
      throw new ApiClientError(mapError(error));
    }
    throw new ApiClientError({
      kind: 'retry',
      message: 'Something went wrong. Please try again.',
      code: 'UNKNOWN',
      requestId: '',
    });
  }
  return data as T;
}

export function mapError(error: ApiErrorBody): MappedError {
  if (error.code === 'LICENSE_READ_ONLY' || error.code === 'MODULE_NOT_LICENSED') {
    return {
      kind: 'license',
      message: error.message,
      code: error.code,
      requestId: error.requestId,
    };
  }

  if (error.statusCode === 400 && error.details) {
    const fields: Record<string, string> = {};
    const details = asRecord(error.details);
    if (details) {
      for (const [key, value] of Object.entries(details)) {
        if (typeof value === 'string') {
          fields[key] = value;
        } else if (Array.isArray(value) && typeof value[0] === 'string') {
          fields[key] = value[0];
        }
      }
    }
    return {
      kind: 'field',
      fields,
      message: error.message,
      code: error.code,
      requestId: error.requestId,
    };
  }

  if (error.statusCode === 403) {
    return {
      kind: 'page',
      status: 403,
      // Never surface permission keys or backend wording to the UI.
      message: 'You don’t have access to this.',
      code: error.code,
      requestId: error.requestId,
    };
  }

  if (error.statusCode === 404) {
    return {
      kind: 'page',
      status: 404,
      message: error.message,
      code: error.code,
      requestId: error.requestId,
    };
  }

  if (error.statusCode === 409 || error.statusCode === 422) {
    return {
      kind: 'toast',
      message: error.message,
      code: error.code,
      requestId: error.requestId,
    };
  }

  if (error.statusCode >= 500 || error.statusCode === 0) {
    return {
      kind: 'retry',
      message: error.message || 'Something went wrong. Please try again.',
      code: error.code,
      requestId: error.requestId,
    };
  }

  return {
    kind: 'toast',
    message: error.message,
    code: error.code,
    requestId: error.requestId,
  };
}
