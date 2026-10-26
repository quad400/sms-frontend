'use client';

import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import type { ApiClientError } from '@/lib/api/errors';
import { getDashboard } from '../api/dashboards';
import { adminKeys } from '../api/keys';
import type { DashboardSnapshot } from '../types';
import { useApplications } from './use-admissions';
import { useAnnouncements } from './use-communication';
import { useDebtors } from './use-fees';
import { useLeaveRequests } from './use-leave';
import { useStaffList } from './use-staff';
import { useStudents } from './use-students';

export type DashboardKey = 'overview' | 'attendance' | 'fees' | 'enrolment' | 'academics';

/** Fetches the four admin home dashboard snapshots in parallel. */
export function useAdminDashboards(campusId: string | undefined, enabled: boolean) {
  const results = useQueries({
    queries: (['overview', 'attendance', 'fees', 'enrolment'] as const).map((key) => ({
      queryKey: [...adminKeys.dashboards(campusId), key],
      queryFn: () => getDashboard(key, campusId),
      enabled,
    })),
  }) as UseQueryResult<DashboardSnapshot, ApiClientError>[];

  const [overview, attendance, fees, enrolment] = results;
  return {
    overview,
    attendance,
    fees,
    enrolment,
    isPending: results.some((r) => r.isPending),
    isFetching: results.some((r) => r.isFetching),
  };
}

export type DashboardCan = (permission: string) => boolean;

/**
 * Live enrichment for the admin home dashboard.
 * Each query is enabled only when the principal has the matching permission.
 */
export function useAdminDashboardLive(
  campusId: string | undefined,
  can: DashboardCan,
  enabled: boolean,
) {
  const students = useStudents(
    { page: 1, campusId },
    enabled && can('students.student.list'),
  );
  const staff = useStaffList(
    { page: 1, campusId },
    enabled && can('staff.staff.list'),
  );
  const leavePending = useLeaveRequests(
    { page: 1, status: 'pending' },
    enabled && can('staff.leave.list'),
  );
  const debtors = useDebtors(
    { page: 1, campusId },
    enabled && can('fees.debtor.list'),
  );
  const applications = useApplications(
    {},
    enabled && can('admissions.application.list'),
  );
  const announcements = useAnnouncements(
    1,
    enabled && can('communication.announcement.list'),
  );

  return {
    studentsTotal: students.data?.meta?.total ?? null,
    staffTotal: staff.data?.meta?.total ?? null,
    leavePendingTotal: leavePending.data?.meta?.total ?? null,
    debtorsTotal: debtors.data?.meta?.total ?? null,
    applicationsTotal: applications.data?.meta?.total ?? null,
    announcements: announcements.data?.data ?? [],
    isPending:
      (can('students.student.list') && students.isPending) ||
      (can('staff.staff.list') && staff.isPending) ||
      (can('staff.leave.list') && leavePending.isPending) ||
      (can('fees.debtor.list') && debtors.isPending) ||
      (can('admissions.application.list') && applications.isPending) ||
      (can('communication.announcement.list') && announcements.isPending),
  };
}
