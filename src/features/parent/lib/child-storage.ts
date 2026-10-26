const KEY = 'sms.parent.activeChildId';

export function readStoredChildId(): number | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export function writeStoredChildId(id: number): void {
  try {
    sessionStorage.setItem(KEY, String(id));
  } catch {
    // ignore
  }
}
