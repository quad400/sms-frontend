'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { AttentionList, type AttentionItem } from '@/components/patterns/attention-list';
import { MetricList, type MetricRow } from '@/components/patterns/metric-list';
import { MoneyText } from '@/components/patterns/money';
import { PageHeader } from '@/components/patterns/page-header';
import { SectionCard } from '@/components/patterns/section-card';
import { SparkBars, type SparkPoint } from '@/components/patterns/spark-bars';
import { StatCard } from '@/components/patterns/stat-card';
import { StatCardGrid } from '@/components/patterns/stat-card-grid';
import { useSession } from '@/lib/auth/permissions';
import { asRecord, str } from '@/lib/utils/record';
import { useAdminDashboardLive, useAdminDashboards } from '../hooks/use-dashboards';
import { useAdminCampus } from '../lib/campus';

function optNum(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function relativeUpdated(iso?: string | null): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  const mins = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (mins < 1) return 'Updated just now';
  return `Updated ${mins} min ago`;
}

function arrayOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function formatCount(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString();
}

export function AdminDashboard() {
  const { can } = useSession();
  const { campusQuery, campusId } = useAdminCampus();
  const allowed = can('reporting.dashboard.read');

  const snapshots = useAdminDashboards(campusQuery, allowed);
  const live = useAdminDashboardLive(campusQuery, can, allowed);

  if (!allowed) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" description="You don’t have access to this." />
      </div>
    );
  }

  const overviewPayload = asRecord(snapshots.overview.data?.payload);
  const attendancePayload = asRecord(snapshots.attendance.data?.payload);
  const feesPayload = asRecord(snapshots.fees.data?.payload);
  const enrolmentPayload = asRecord(snapshots.enrolment.data?.payload);

  const enrolledSnapshot = optNum(overviewPayload?.studentsEnrolled ?? overviewPayload?.enrolled);
  const enrolled = live.studentsTotal ?? enrolledSnapshot;
  const attendanceRate = optNum(attendancePayload?.rate);
  const presentToday = optNum(attendancePayload?.presentToday);
  const collectedMinor = optNum(feesPayload?.collectedMinor ?? feesPayload?.collected);
  const outstandingMinor = optNum(feesPayload?.outstandingMinor ?? feesPayload?.outstanding);

  const overviewUpdated = relativeUpdated(
    snapshots.overview.data?.generatedAt ??
      str(asRecord(snapshots.overview.data)?.refreshedAt),
  );
  const attendanceUpdated = relativeUpdated(
    snapshots.attendance.data?.generatedAt ??
      str(asRecord(snapshots.attendance.data)?.refreshedAt),
  );
  const feesUpdated = relativeUpdated(
    snapshots.fees.data?.generatedAt ?? str(asRecord(snapshots.fees.data)?.refreshedAt),
  );

  type Kpi = {
    id: string;
    label: string;
    value: ReactNode;
    href: string;
    show: boolean;
    updated?: string | null;
    hint?: string;
  };

  const kpis: Kpi[] = [
    {
      id: 'enrolled',
      label: 'Students enrolled',
      value: formatCount(enrolled),
      href: '/admin/students',
      show: can('students.student.list'),
      updated: overviewUpdated,
      hint: live.studentsTotal != null ? 'Live count' : undefined,
    },
    {
      id: 'staff',
      label: 'Staff on roll',
      value: formatCount(live.staffTotal),
      href: '/admin/staff',
      show: can('staff.staff.list'),
      hint:
        enrolled != null && live.staffTotal != null && live.staffTotal > 0
          ? `~${Math.round(enrolled / live.staffTotal)} students / staff`
          : undefined,
    },
    {
      id: 'attendance',
      label: 'Attendance today',
      value:
        attendanceRate != null
          ? `${attendanceRate}%`
          : presentToday != null
            ? formatCount(presentToday)
            : '—',
      href: '/admin/attendance',
      show: can('attendance.register.list'),
      updated: attendanceUpdated,
      hint: attendanceRate != null && presentToday != null ? `${formatCount(presentToday)} present` : undefined,
    },
    {
      id: 'collected',
      label: 'Fees collected (term)',
      value: <MoneyText minor={collectedMinor} className="font-heading text-2xl font-semibold" />,
      href: '/admin/fees/payments',
      show: can('fees.payment.list'),
      updated: feesUpdated,
    },
    {
      id: 'outstanding',
      label: 'Outstanding balance',
      value: <MoneyText minor={outstandingMinor} className="font-heading text-2xl font-semibold" />,
      href: '/admin/fees/debtors',
      show: can('fees.account.read'),
      updated: feesUpdated,
    },
    {
      id: 'debtors',
      label: 'Debtors',
      value: formatCount(live.debtorsTotal),
      href: '/admin/fees/debtors',
      show: can('fees.debtor.list'),
    },
    {
      id: 'leave',
      label: 'Pending leave',
      value: formatCount(live.leavePendingTotal),
      href: '/admin/leave',
      show: can('staff.leave.list'),
    },
    {
      id: 'applications',
      label: 'Open applications',
      value: formatCount(live.applicationsTotal),
      href: '/admin/admissions/applications',
      show: can('admissions.application.list'),
    },
  ].filter((k) => k.show);

  const attention = buildAttention({
    overviewPayload,
    attendancePayload,
    feesPayload,
    leavePending: live.leavePendingTotal,
    applications: live.applicationsTotal,
    can,
  });

  const trendPoints = toSparkPoints(
    arrayOf(attendancePayload?.trend ?? attendancePayload?.series),
  );
  const enrolmentRows = toMetricRows(
    arrayOf(enrolmentPayload?.byLevel ?? enrolmentPayload?.levels),
  );

  const announcementsLive = live.announcements;
  const announcementsSnapshot = arrayOf(
    overviewPayload?.announcements ?? overviewPayload?.latestAnnouncements,
  );
  const showAnnouncements = can('communication.announcement.list');

  const quickLinks = [
    { href: '/admin/students', label: 'Students', show: can('students.student.list') },
    { href: '/admin/attendance', label: 'Attendance', show: can('attendance.register.list') },
    { href: '/admin/fees/invoices', label: 'Invoices', show: can('fees.invoice.list') },
    { href: '/admin/result-sheets', label: 'Results', show: can('assessment.result.list') },
    { href: '/admin/admissions/applications', label: 'Admissions', show: can('admissions.application.list') },
    { href: '/admin/announcements', label: 'Announce', show: can('communication.announcement.list') },
    { href: '/admin/access/users', label: 'Users', show: can('users.user.list') },
  ].filter((l) => l.show);

  const scopeLabel =
    campusId != null ? `Campus filter applied` : 'All campuses in your scope';

  const loading = snapshots.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Operational snapshot for administrators. ${scopeLabel}.`}
      />

      <StatCardGrid skeletonCount={loading ? Math.max(kpis.length, 4) : 0}>
        {kpis.map((k) => (
          <StatCard
            key={k.id}
            label={k.label}
            value={k.value}
            href={k.href}
            updated={k.updated}
            hint={k.hint}
          />
        ))}
      </StatCardGrid>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {can('attendance.register.list') ? (
            <SectionCard
              title="Attendance trend"
              description="Last 14 snapshot points"
              action={{ label: 'Open registers', href: '/admin/attendance' }}
            >
              <SparkBars points={trendPoints} emptyLabel="No attendance snapshot yet" />
            </SectionCard>
          ) : null}
          {can('students.student.list') ? (
            <SectionCard
              title="Enrolment by level"
              action={{ label: 'Students', href: '/admin/students' }}
            >
              <MetricList rows={enrolmentRows} emptyLabel="No enrolment snapshot yet" />
            </SectionCard>
          ) : null}
        </div>

        <div className="space-y-4">
          <SectionCard title="Needs attention" description="Items that usually block the day">
            <AttentionList items={attention} />
          </SectionCard>

          {quickLinks.length > 0 ? (
            <SectionCard title="Quick links">
              <div className="flex flex-wrap gap-2">
                {quickLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:border-primary/40"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {showAnnouncements ? (
          <SectionCard
            title="Latest announcements"
            action={{ label: 'Manage', href: '/admin/announcements' }}
          >
            {announcementsLive.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {announcementsLive.slice(0, 6).map((a) => (
                  <li key={a.id} className="border-b border-border/60 py-1.5 last:border-0">
                    <span className="font-medium">{a.title}</span>
                    {a.status ? (
                      <span className="ml-2 text-xs text-muted-foreground">{a.status}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : announcementsSnapshot.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {announcementsSnapshot.slice(0, 6).map((a, i) => {
                  const rec = asRecord(a);
                  return (
                    <li key={i} className="border-b border-border/60 py-1.5 last:border-0">
                      {str(rec?.title) || 'Announcement'}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            )}
          </SectionCard>
        ) : null}

        {(can('fees.payment.list') || can('fees.account.read')) && (
          <SectionCard title="Fees snapshot" description={feesUpdated ?? undefined}>
            <dl className="grid gap-3 sm:grid-cols-2">
              {can('fees.payment.list') ? (
                <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Collected
                  </dt>
                  <dd className="mt-1">
                    <MoneyText minor={collectedMinor} className="text-lg font-semibold" />
                  </dd>
                </div>
              ) : null}
              {can('fees.account.read') ? (
                <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Outstanding
                  </dt>
                  <dd className="mt-1">
                    <MoneyText minor={outstandingMinor} className="text-lg font-semibold" />
                  </dd>
                </div>
              ) : null}
            </dl>
            {optNum(feesPayload?.reconciliationExceptions) != null &&
            (feesPayload?.reconciliationExceptions as number) > 0 &&
            can('fees.reconciliation.list') ? (
              <p className="mt-3 text-sm">
                <Link className="text-primary hover:underline" href="/admin/fees/reconciliation">
                  {String(feesPayload?.reconciliationExceptions)} reconciliation exceptions
                </Link>
              </p>
            ) : null}
          </SectionCard>
        )}
      </div>
    </div>
  );
}

function buildAttention({
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
  const push = (id: string, label: string, href: string, count: unknown, show: boolean) => {
    if (!show) return;
    const n = optNum(count);
    if (n != null && n > 0) items.push({ id, label, href, count: n });
  };

  push(
    'recon',
    'Reconciliation exceptions',
    '/admin/fees/reconciliation',
    feesPayload?.reconciliationExceptions,
    can('fees.reconciliation.list'),
  );
  push(
    'registers',
    'Registers not submitted',
    '/admin/attendance',
    attendancePayload?.unsubmittedRegisters,
    can('attendance.register.list'),
  );
  push(
    'results',
    'Result sheets awaiting approval',
    '/admin/result-sheets',
    overviewPayload?.resultSheetsPending,
    can('assessment.result.list'),
  );
  push(
    'offers',
    'Unpaid acceptance offers',
    '/admin/admissions/offers',
    overviewPayload?.unpaidOffers,
    can('admissions.application.list'),
  );
  push('leave', 'Pending leave requests', '/admin/leave', leavePending, can('staff.leave.list'));
  push(
    'apps',
    'Open applications',
    '/admin/admissions/applications',
    applications,
    can('admissions.application.list'),
  );

  for (const item of arrayOf(overviewPayload?.needsAttention)) {
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
    });
  }

  return items;
}

function toSparkPoints(points: unknown[]): SparkPoint[] {
  return points.map((p) => {
    const rec = asRecord(p);
    return {
      value: optNum(rec?.value ?? rec?.rate ?? p) ?? 0,
      label: str(rec?.date) || str(rec?.label) || undefined,
    };
  });
}

function toMetricRows(points: unknown[]): MetricRow[] {
  const rows = points.map((p, i) => {
    const rec = asRecord(p);
    return {
      id: String(i),
      label: str(rec?.level) || str(rec?.name) || `Level ${i + 1}`,
      value: optNum(rec?.count ?? rec?.value) ?? 0,
    };
  });
  const max = Math.max(...rows.map((r) => (typeof r.value === 'number' ? r.value : 0)), 1);
  return rows.map((r) => ({
    ...r,
    fraction: typeof r.value === 'number' ? r.value / max : 0,
  }));
}
