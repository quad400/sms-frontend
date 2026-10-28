import type { AttentionItem } from '@/components/patterns/attention-list';
import type { MetricRow } from '@/components/patterns/metric-list';
import type { SparkPoint } from '@/components/patterns/spark-bars';
import { asArray, asRecord, str } from '@/lib/utils/record';

export function optNum(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function relativeUpdated(iso?: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return 'Updated just now';
  return `Updated ${mins} min ago`;
}

export function formatCount(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

export function relativeTime(iso?: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const diff = Date.now() - t;
  if (diff < 0) return null;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function snapshotTime(data: { generatedAt?: string | null } | undefined): string | null {
  if (!data) return null;
  const iso = data.generatedAt ?? str(asRecord(data)?.refreshedAt) ?? null;
  return relativeUpdated(iso);
}

export function toSparkPoints(points: unknown[]): SparkPoint[] {
  return points.map((p, i) => {
    const rec = asRecord(p);
    const offset = points.length - 1 - i;
    return {
      value: optNum(rec?.value ?? rec?.rate ?? p) ?? 0,
      label: str(rec?.date) || str(rec?.label) || (offset === 0 ? 'Today' : `D-${offset}`),
    };
  });
}

export function toEnrolmentRows(points: unknown[]): MetricRow[] {
  const rows = points.map((p, i) => {
    const rec = asRecord(p);
    const count = optNum(rec?.count ?? rec?.value ?? rec?.enrolled) ?? 0;
    const cap = optNum(rec?.cap ?? rec?.capacity);
    const male = optNum(rec?.male ?? rec?.maleCount);
    const female = optNum(rec?.female ?? rec?.femaleCount);
    const denom = cap != null && cap > 0 ? cap : Math.max(count, 1);
    const segments =
      male != null || female != null
        ? [
            {
              key: 'male',
              fraction: (male ?? 0) / denom,
              className: 'bg-emerald-500/80',
            },
            {
              key: 'female',
              fraction: (female ?? 0) / denom,
              className: 'bg-sky-400/70',
            },
          ]
        : undefined;
    return {
      id: String(i),
      label: str(rec?.level) || str(rec?.name) || `Level ${i + 1}`,
      value: count,
      cap,
      fraction: count / denom,
      segments,
    } satisfies MetricRow;
  });
  return rows;
}

export function agingBuckets(payload: Record<string, unknown> | null): Array<{
  id: string;
  label: string;
  minor: number;
  overdue?: boolean;
}> {
  if (!payload) return [];
  const nested = asRecord(payload.aging) ?? asRecord(payload.overdueAging);
  const out: Array<{ id: string; label: string; minor: number; overdue?: boolean }> = [];
  const push = (id: string, label: string, value: unknown, overdue?: boolean) => {
    const n = optNum(value);
    if (n != null) out.push({ id, label, minor: n, overdue });
  };
  if (nested) {
    push('lt15', '<15d', nested.under15 ?? nested.lt15 ?? nested['<15'], false);
    push('gt30', '>30d', nested.over30 ?? nested.gt30 ?? nested['>30'], true);
  }
  push('lt15', '<15d', payload.agingUnder15Minor ?? payload.agingLt15Minor, false);
  push('gt30', '>30d', payload.agingOver30Minor ?? payload.agingGt30Minor, true);
  const seen = new Set<string>();
  return out.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });
}

export function buildAttention({
  overviewPayload,
  attendancePayload,
  feesPayload,
  leavePending,
  applications,
  can,
}: {
  overviewPayload: Record<string, unknown> | null;
  attendancePayload: Record<string, unknown> | null;
  feesPayload: Record<string, unknown> | null;
  leavePending: number | null;
  applications: number | null;
  can: (p: string) => boolean;
}): AttentionItem[] {
  const items: AttentionItem[] = [];
  const push = (
    id: string,
    label: string,
    href: string,
    count: unknown,
    show: boolean,
    extra?: { detail?: string | null; actionLabel?: string | null },
  ) => {
    if (!show) return;
    const n = optNum(count);
    if (n != null && n > 0) {
      items.push({
        id,
        label,
        href,
        count: n,
        detail: extra?.detail,
        actionLabel: extra?.actionLabel,
      });
    }
  };

  push(
    'recon',
    'Reconciliation exceptions',
    '/admin/fees/reconciliation',
    feesPayload?.reconciliationExceptions,
    can('fees.reconciliation.list'),
    { actionLabel: 'Review' },
  );
  push(
    'registers',
    'Registers not submitted',
    '/admin/attendance',
    attendancePayload?.unsubmittedRegisters,
    can('attendance.register.list'),
    { actionLabel: 'Open' },
  );
  push(
    'results',
    'Result sheets awaiting approval',
    '/admin/result-sheets',
    overviewPayload?.resultSheetsPending,
    can('assessment.result.list'),
    { actionLabel: 'Review' },
  );
  push(
    'offers',
    'Unpaid acceptance offers',
    '/admin/admissions/offers',
    overviewPayload?.unpaidOffers,
    can('admissions.application.list'),
    { actionLabel: 'Inspect' },
  );
  push('leave', 'Pending leave requests', '/admin/leave', leavePending, can('staff.leave.list'), {
    actionLabel: 'Assign relief',
    detail: 'Staff requests awaiting sign-off',
  });
  push(
    'apps',
    'Open applications',
    '/admin/admissions/applications',
    applications,
    can('admissions.application.list'),
    { actionLabel: 'Review' },
  );

  for (const item of asArray(overviewPayload?.needsAttention)) {
    const rec = asRecord(item);
    if (!rec) continue;
    const label = str(rec.label) || str(rec.title);
    const href = str(rec.href) || '/admin';
    if (!label) continue;
    items.push({
      id: `snap-${label}-${href}`,
      label,
      href,
      count: optNum(rec.count),
      detail: str(rec.detail) || str(rec.description) || null,
      actionLabel: str(rec.actionLabel) || str(rec.action) || 'Review',
    });
  }

  return items;
}
