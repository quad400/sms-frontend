'use client';

import { useMemo } from 'react';
import { useStaffLookups } from './use-staff-lookups';
import { useStaffAllocations, useStaffMe } from './use-staff-me';

export type TeachingClass = {
  classId: number;
  sessionId: number | undefined;
  subjectIds: number[];
  formTeacher: boolean;
};

/**
 * Classes this teacher may work with: current allocations plus classes they are form teacher
 * of. Pickers are built from this so a teacher never sees an option they cannot use.
 */
export function useTeachingClasses() {
  const allocations = useStaffAllocations();
  const me = useStaffMe();
  const lookups = useStaffLookups();

  const classes = useMemo<TeachingClass[]>(() => {
    const activeSessions = new Set(lookups.activeTerms.map((term) => term.sessionId));
    const inScope = (sessionId: number | undefined) =>
      activeSessions.size === 0 || (sessionId !== undefined && activeSessions.has(sessionId));

    const byClass = new Map<number, TeachingClass>();
    for (const allocation of allocations.data ?? []) {
      if (!inScope(allocation.sessionId)) continue;
      const entry = byClass.get(allocation.classId) ?? {
        classId: allocation.classId,
        sessionId: allocation.sessionId,
        subjectIds: [],
        formTeacher: false,
      };
      if (!entry.subjectIds.includes(allocation.subjectId)) entry.subjectIds.push(allocation.subjectId);
      byClass.set(allocation.classId, entry);
    }

    const staffId = me.data?.staffId;
    if (staffId !== undefined) {
      for (const row of lookups.classes) {
        if (row.formTeacherStaffId !== staffId || !inScope(row.sessionId)) continue;
        const entry = byClass.get(row.id) ?? {
          classId: row.id,
          sessionId: row.sessionId,
          subjectIds: [],
          formTeacher: false,
        };
        entry.formTeacher = true;
        byClass.set(row.id, entry);
      }
    }

    return [...byClass.values()].sort((a, b) =>
      lookups.className(a.classId).localeCompare(lookups.className(b.classId), undefined, {
        numeric: true,
      }),
    );
  }, [allocations.data, lookups, me.data?.staffId]);

  return {
    classes,
    isPending: allocations.isPending,
    error: allocations.error,
    refetch: () => void allocations.refetch(),
  };
}
