import { ApiClientError } from '@/lib/api/errors';
import { enqueueOutbox, newClientRef } from '@/lib/offline/outbox';

export type WriteResult<T> = { queued: false; data: T } | { queued: true };

/**
 * Sends a write immediately; when the device is offline (or the network request fails
 * before the server answers) the same request is stored in the offline outbox instead.
 * Server answers — including 4xx/5xx — are never queued: they surface to the caller.
 */
export async function sendOrQueue<T>(args: {
  method: 'PUT' | 'POST';
  path: string;
  body: unknown;
  send: () => Promise<T>;
}): Promise<WriteResult<T>> {
  const offline = typeof navigator !== 'undefined' && !navigator.onLine;
  if (!offline) {
    try {
      return { queued: false, data: await args.send() };
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
    }
  }
  await enqueueOutbox({
    clientRef: newClientRef(),
    method: args.method,
    path: args.path,
    body: args.body,
  });
  return { queued: true };
}
