'use client';

import {
  CalendarDays,
  ClipboardList,
  Download,
  GraduationCap,
  IdCard,
  MapPin,
  Megaphone,
  Receipt,
  Scale,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { MoneyText } from '@/components/patterns/money';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/permissions';
import { asArray, asRecord } from '@/lib/utils/record';
import { useAdminDashboardLive, useAdminDashboards } from '../../hooks/use-dashboards';
import { useCampuses } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { AnnouncementsCard } from './announcements-card';
import { AttendanceTrend } from './attendance-trend';
import { EnrolmentByLevel } from './enrolment-by-level';
import { FeesSnapshot } from './fees-snapshot';
import { DashboardKpiGrid, type DashboardKpi } from './kpi-grid';
import {
  agingBuckets,
  buildAttention,
  formatCount,
  optNum,
  snapshotTime,
  toEnrolmentRows,
  toSparkPoints,
} from './map';
import { NeedsAttention } from './needs-attention';
import { QuickLinks } from './quick-links';

export function AdminDashboard() {
  const { can } = useSession();
  const { campusQuery, campusId } = useAdminCampus();
  const campuses = useCampuses(true);
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
  const capacity = optNum(overviewPayload?.capacity ?? overviewPayload?.enrolmentCap);
  const enrolled = live.studentsTotal ?? enrolledSnapshot;
  const attendanceRate = optNum(attendancePayload?.rate);
  const presentToday = optNum(attendancePayload?.presentToday);
  const absentToday = optNum(attendancePayload?.absentToday);
  const collectedMinor = optNum(feesPayload?.collectedMinor ?? feesPayload?.collected);
  const outstandingMinor = optNum(feesPayload?.outstandingMinor ?? feesPayload?.outstanding);
  const targetMinor = optNum(feesPayload?.targetMinor ?? feesPayload?.termTargetMinor);
  const paidFraction =
    optNum(feesPayload?.paidFraction) ??
    (collectedMinor != null && targetMinor != null && targetMinor > 0
      ? collectedMinor / targetMinor
      : null);
  const accountCount = optNum(feesPayload?.accountCount ?? feesPayload?.studentAccounts);
  const overdueDebtors = optNum(feesPayload?.overdueOver30 ?? feesPayload?.debtorsOver30);
  const trendTarget = optNum(attendancePayload?.target ?? attendancePayload?.targetRate);
  const applicationsDelta = optNum(
    overviewPayload?.applicationsThisWeek ?? overviewPayload?.openApplicationsDelta,
  );
  const intakeLabel =
    typeof overviewPayload?.intake === 'string' ? overviewPayload.intake : null;

  const capacityHint =
    enrolled != null && capacity != null && capacity > 0
      ? `${((enrolled / capacity) * 100).toFixed(1)}% capacity`
      : null;
  const enrolledHint =
    live.studentsTotal != null || capacityHint ? (
      <>
        {live.studentsTotal != null ? <span className="text-emerald-700">Live count</span> : null}
        {capacityHint ? (
          <span>
            {live.studentsTotal != null ? ' · ' : null}
            {capacityHint}
          </span>
        ) : null}
      </>
    ) : undefined;
  const applicationsHint =
    intakeLabel || (applicationsDelta != null && applicationsDelta !== 0) ? (
      <>
        {intakeLabel}
        {applicationsDelta != null && applicationsDelta !== 0 ? (
          <span className="text-emerald-700">
            {intakeLabel ? ' · ' : null}+{applicationsDelta} this week
          </span>
        ) : null}
      </>
    ) : undefined;

  const kpis: DashboardKpi[] = (
    [
    {
      id: 'enrolled',
      label: 'Students enrolled',
      value: formatCount(enrolled),
      href: '/admin/students',
      icon: <GraduationCap />,
      accent: 'emerald',
      show: can('students.student.list'),
      updated: snapshotTime(snapshots.overview.data),
      hint: enrolledHint,
    },
    {
      id: 'staff',
      label: 'Staff on roll',
      value: formatCount(live.staffTotal),
      href: '/admin/staff',
      icon: <IdCard />,
      accent: 'sky',
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
      icon: <UserCheck />,
      accent: 'brand',
      show: can('attendance.register.list'),
      updated: snapshotTime(snapshots.attendance.data),
      hint:
        presentToday != null || absentToday != null ? (
          <span>
            {presentToday != null ? `${formatCount(presentToday)} present` : null}
            {absentToday != null ? (
              <span className="text-danger"> {formatCount(absentToday)} absent</span>
            ) : null}
          </span>
        ) : undefined,
    },
    {
      id: 'collected',
      label: 'Fees collected (term)',
      value: <MoneyText minor={collectedMinor} className="font-heading text-2xl font-semibold" />,
      href: '/admin/fees/payments',
      icon: <Wallet />,
      accent: 'emerald',
      show: can('fees.payment.list'),
      updated: snapshotTime(snapshots.fees.data),
      hint:
        paidFraction != null ? (
          <span className="block">
            <span className="mb-1 block h-1.5 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-emerald-500/80"
                style={{ width: `${Math.min(100, Math.max(0, paidFraction * 100))}%` }}
              />
            </span>
            {Math.round(paidFraction * 100)}%
          </span>
        ) : undefined,
    },
    {
      id: 'outstanding',
      label: 'Outstanding balance',
      value: (
        <MoneyText
          minor={outstandingMinor}
          className="font-heading text-2xl font-semibold text-amber-700"
        />
      ),
      href: '/admin/fees/debtors',
      icon: <Receipt />,
      accent: 'amber',
      tone: 'warning',
      show: can('fees.account.read'),
      updated: snapshotTime(snapshots.fees.data),
      hint:
        accountCount != null ? `Across ${accountCount.toLocaleString()} student accounts` : undefined,
    },
    {
      id: 'debtors',
      label: 'Debtors',
      value: formatCount(live.debtorsTotal),
      href: '/admin/fees/debtors',
      icon: <Scale />,
      accent: 'rose',
      show: can('fees.debtor.list'),
      hint: overdueDebtors != null ? `Overdue > 30 days · ${overdueDebtors}` : undefined,
    },
    {
      id: 'leave',
      label: 'Pending leave',
      value: formatCount(live.leavePendingTotal),
      href: '/admin/leave',
      icon: <CalendarDays />,
      accent: 'violet',
      show: can('staff.leave.list'),
      hint: live.leavePendingTotal ? 'Staff requests awaiting sign-off' : undefined,
    },
    {
      id: 'applications',
      label: 'Open applications',
      value: formatCount(live.applicationsTotal),
      href: '/admin/admissions/applications',
      icon: <UserPlus />,
      accent: 'sky',
      show: can('admissions.application.list'),
      hint: applicationsHint,
    },
  ] satisfies Array<DashboardKpi & { show: boolean }>
  )
    .filter((k) => k.show)
    .map(({ show: _show, ...k }) => k);

  const attention = buildAttention({
    overviewPayload,
    attendancePayload,
    feesPayload,
    leavePending: live.leavePendingTotal,
    applications: live.applicationsTotal,
    can,
  });

  const trendPoints = toSparkPoints(
    asArray(attendancePayload?.trend ?? attendancePayload?.series),
  );
  const enrolmentRows = toEnrolmentRows(
    asArray(enrolmentPayload?.byLevel ?? enrolmentPayload?.levels),
  );
  const genderLegend = enrolmentRows.some((r) => (r.segments?.length ?? 0) > 0);

  const quickLinks = [
    { href: '/admin/students', label: 'Students', icon: GraduationCap, accent: 'emerald' as const, show: can('students.student.list') },
    { href: '/admin/attendance', label: 'Attendance', icon: UserCheck, accent: 'brand' as const, show: can('attendance.register.list') },
    { href: '/admin/fees/invoices', label: 'Invoices', icon: Receipt, accent: 'amber' as const, show: can('fees.invoice.list') },
    { href: '/admin/admissions/applications', label: 'Admissions', icon: UserPlus, accent: 'sky' as const, show: can('admissions.application.list') },
    { href: '/admin/announcements', label: 'Announce', icon: Megaphone, accent: 'violet' as const, show: can('communication.announcement.list') },
    { href: '/admin/access/users', label: 'Users', icon: Users, accent: 'slate' as const, show: can('users.user.list') },
    { href: '/admin/timetables', label: 'Timetables', icon: ClipboardList, accent: 'rose' as const, show: can('academics.timetable.list') },
    { href: '/admin/result-sheets', label: 'Results', icon: GraduationCap, accent: 'emerald' as const, show: can('assessment.result.list') },
  ].filter((l) => l.show);

  const selectedCampus = campuses.data?.find((c) => c.id === campusId);
  const campusChip =
    selectedCampus?.name ?? (campusId != null ? `Campus ${campusId}` : 'All campuses in your scope');

  const liveChip = live.isPending ? (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      Updating
    </span>
  ) : live.studentsTotal != null || live.staffTotal != null ? (
    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
      Live
    </span>
  ) : null;

  const loading = snapshots.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        titleAddon={liveChip}
        description={`Operational snapshot for administrators. ${campusId != null ? 'Campus filter applied' : 'All campuses in your scope'}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="size-3.5" />
              {campusChip}
            </span>
            {can('reporting.report.list') || can('reporting.dashboard.read') ? (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/reports">
                  <Download className="size-4" />
                  Export brief
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <DashboardKpiGrid kpis={kpis} loading={loading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {can('attendance.register.list') ? (
            <AttendanceTrend points={trendPoints} target={trendTarget} />
          ) : null}
          {can('students.student.list') ? (
            <EnrolmentByLevel rows={enrolmentRows} genderLegend={genderLegend} />
          ) : null}
        </div>
        <NeedsAttention items={attention} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {can('communication.announcement.list') ? (
          <AnnouncementsCard
            live={live.announcements}
            snapshot={asArray(overviewPayload?.announcements ?? overviewPayload?.latestAnnouncements)}
          />
        ) : null}
        {(can('fees.payment.list') || can('fees.account.read')) && (
          <FeesSnapshot
            collectedMinor={collectedMinor}
            outstandingMinor={outstandingMinor}
            targetMinor={targetMinor}
            paidFraction={paidFraction}
            aging={agingBuckets(feesPayload)}
            showCollected={can('fees.payment.list')}
            showOutstanding={can('fees.account.read')}
            description={snapshotTime(snapshots.fees.data) ?? undefined}
          />
        )}
      </div>

      <QuickLinks links={quickLinks} />
    </div>
  );
}
