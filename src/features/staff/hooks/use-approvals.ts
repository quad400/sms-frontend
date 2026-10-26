'use client';

import { useSession } from '@/lib/auth/permissions';
import { useLessonPlans } from './use-lessons';
import { useLeaveRequests } from './use-leave';
import { useResultSheets } from './use-assessments';

export const APPROVAL_PERMISSIONS = {
  results: 'assessment.result.approve',
  lessonPlans: 'academics.lesson-plan.approve',
  leave: 'staff.leave.decide',
} as const;

export type ApprovalCounts = {
  results: number;
  lessonPlans: number;
  leave: number;
  total: number;
};

/** Pending counts for the approval queues this user may act on. */
export function useApprovalCounts(): { counts: ApprovalCounts; canApprove: boolean } {
  const { can } = useSession();
  const canResults = can(APPROVAL_PERMISSIONS.results);
  const canPlans = can(APPROVAL_PERMISSIONS.lessonPlans);
  const canLeave = can(APPROVAL_PERMISSIONS.leave);

  const sheets = useResultSheets('submitted', canResults);
  const plans = useLessonPlans({ status: 'submitted' }, canPlans);
  const leave = useLeaveRequests({ status: 'pending' }, canLeave);

  const results = sheets.data?.meta.total ?? 0;
  const lessonPlans = plans.data?.meta.total ?? 0;
  // Own pending requests are listed too, but a user cannot decide their own.
  const leaveCount = leave.data?.meta.total ?? 0;

  return {
    canApprove: canResults || canPlans || canLeave,
    counts: {
      results,
      lessonPlans,
      leave: leaveCount,
      total: results + lessonPlans + leaveCount,
    },
  };
}
