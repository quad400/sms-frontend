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

  if (error.statusCode === 403 || error.statusCode === 404) {
    return {
      kind: 'page',
      status: error.statusCode,
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
