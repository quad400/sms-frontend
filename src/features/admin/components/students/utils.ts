import type { MetricRow } from '@/components/patterns/metric-list';
import type { House, SchoolClass } from '../../api/structure';

/** Fallback house stripe colours when the API does not set `colour`. */
export const HOUSE_PALETTE = [
  '#10b981',
  '#3b82f6',
  '#eab308',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
] as const;

export function ageFromDob(iso?: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const years = Math.floor((Date.now() - t) / (365.25 * 24 * 60 * 60 * 1000));
  return years >= 0 && years < 120 ? years : null;
}

export function initials(first?: string | null, last?: string | null): string {
  const a = (first ?? '').trim().charAt(0);
  const b = (last ?? '').trim().charAt(0);
  const s = `${a}${b}`.toUpperCase();
  return s || '?';
}

export function avatarTone(genderCode?: string | null): string {
  const g = (genderCode ?? '').toLowerCase();
  if (g === 'male' || g === 'm') return 'bg-sky-100 text-sky-800';
  if (g === 'female' || g === 'f') return 'bg-amber-100 text-amber-900';
  return 'bg-emerald-100 text-emerald-800';
}

export function capacityRows(classes: SchoolClass[]): MetricRow[] {
  const byLevel = new Map<string, { count: number; arms: number; capacity: number }>();
  for (const c of classes) {
    const label = c.levelName?.trim() || c.name || `Class ${c.id}`;
    const prev = byLevel.get(label) ?? { count: 0, arms: 0, capacity: 0 };
    const count = typeof c.studentCount === 'number' ? c.studentCount : 0;
    const cap =
      typeof (c as { capacity?: number }).capacity === 'number'
        ? ((c as { capacity?: number }).capacity as number)
        : 0;
    byLevel.set(label, {
      count: prev.count + count,
      arms: prev.arms + 1,
      capacity: prev.capacity + cap,
    });
  }
  const maxCount = Math.max(...[...byLevel.values()].map((x) => x.count), 1);
  const rows = [...byLevel.entries()].map(([label, v], i) => {
    const hasCap = v.capacity > 0;
    const denom = hasCap ? v.capacity : maxCount;
    const fraction = denom > 0 ? v.count / denom : 0;
    const over = hasCap && v.count > v.capacity;
    return {
      id: String(i),
      label: v.arms > 1 ? `${label} · ${v.arms} arms` : label,
      value: v.count,
      cap: hasCap ? v.capacity : null,
      fraction,
      barClassName: over ? 'bg-amber-500' : 'bg-emerald-500/85',
      valueClassName: over ? 'text-amber-700' : undefined,
    } satisfies MetricRow;
  });
  rows.sort((a, b) => String(a.label).localeCompare(String(b.label)));
  return rows;
}

export function houseCards(houses: House[]) {
  const sorted = [...houses].sort(
    (a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0) || a.name.localeCompare(b.name),
  );
  return sorted.map((h, i) => ({
    id: h.id,
    name: h.name,
    count: h.memberCount ?? 0,
    colour: h.colour ?? HOUSE_PALETTE[i % HOUSE_PALETTE.length]!,
    place: i + 1,
  }));
}
