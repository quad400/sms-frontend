const DB_NAME = 'sms-staff-offline';
const STORE = 'outbox';
const DB_VERSION = 1;

/** Fired on `window` after an item is queued (UI may refresh pending counts). */
export const OUTBOX_CHANGED_EVENT = 'sms:outbox-changed';
/** Fired on `window` after a flush that delivered at least one item (UI may refetch). */
export const OUTBOX_FLUSHED_EVENT = 'sms:outbox-flushed';

function emit(name: string): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(name));
}

export type OutboxItem = {
  clientRef: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body: unknown;
  createdAt: string;
  attempts: number;
  lastError?: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'clientRef' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Failed to open offline DB'));
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Transaction failed'));
    tx.onabort = () => reject(tx.error ?? new Error('Transaction aborted'));
  });
}

export function newClientRef(): string {
  return crypto.randomUUID();
}

export async function enqueueOutbox(
  item: Omit<OutboxItem, 'createdAt' | 'attempts'> & { createdAt?: string; attempts?: number },
): Promise<OutboxItem> {
  const row: OutboxItem = {
    ...item,
    createdAt: item.createdAt ?? new Date().toISOString(),
    attempts: item.attempts ?? 0,
  };
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).put(row);
  await txDone(tx);
  db.close();
  emit(OUTBOX_CHANGED_EVENT);
  return row;
}

export async function listOutbox(): Promise<OutboxItem[]> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readonly');
  const req = tx.objectStore(STORE).getAll();
  const rows = await new Promise<OutboxItem[]>((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as OutboxItem[]) ?? []);
    req.onerror = () => reject(req.error ?? new Error('Failed to list outbox'));
  });
  await txDone(tx);
  db.close();
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeOutbox(clientRef: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(clientRef);
  await txDone(tx);
  db.close();
}

export async function updateOutboxError(clientRef: string, lastError: string): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  const existing = await new Promise<OutboxItem | undefined>((resolve, reject) => {
    const req = store.get(clientRef);
    req.onsuccess = () => resolve(req.result as OutboxItem | undefined);
    req.onerror = () => reject(req.error ?? new Error('Failed to read outbox item'));
  });
  if (existing) {
    store.put({ ...existing, attempts: existing.attempts + 1, lastError });
  }
  await txDone(tx);
  db.close();
}

/** Flush queued mutations through `/api/proxy`. Returns remaining failed count. */
export async function flushOutbox(
  fetchFn: (item: OutboxItem) => Promise<Response> = defaultFetch,
): Promise<{ flushed: number; failed: number }> {
  const items = await listOutbox();
  let flushed = 0;
  let failed = 0;
  for (const item of items) {
    try {
      const res = await fetchFn(item);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        await updateOutboxError(item.clientRef, text || `HTTP ${res.status}`);
        failed += 1;
        continue;
      }
      await removeOutbox(item.clientRef);
      flushed += 1;
    } catch (err) {
      await updateOutboxError(
        item.clientRef,
        err instanceof Error ? err.message : 'Network error',
      );
      failed += 1;
    }
  }
  // Only FLUSHED here — CHANGED would re-enter listeners that call flush again.
  if (flushed > 0) emit(OUTBOX_FLUSHED_EVENT);
  return { flushed, failed };
}

async function defaultFetch(item: OutboxItem): Promise<Response> {
  const path = item.path.replace(/^\/api\/v1\//, '');
  return fetch(`/api/proxy/${path}`, {
    method: item.method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: item.body === undefined ? undefined : JSON.stringify(item.body),
  });
}
