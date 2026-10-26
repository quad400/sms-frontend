'use client';

import { GraduationCap } from 'lucide-react';
import { useAssessments, useScoreCounts } from '../../hooks/use-assessments';
import { useStaffLookups } from '../../hooks/use-staff-lookups';
import { useClassStudentCounts } from '../../hooks/use-structure';
import { QueryState } from '../../lib/shared';
import { AssessmentTable } from '../shared/assessment-table';
import { EmptyPanel } from '../shared/panel';

export function ClassScoresTab({ classId }: { classId: number }) {
  const assessments = useAssessments({ classId });
  const lookups = useStaffLookups();
  const rows = assessments.data?.data ?? [];
  const entered = useScoreCounts(rows.map((row) => row.id));
  const roster = useClassStudentCounts([classId]);

  return (
    <QueryState
      isPending={assessments.isPending}
      error={assessments.error}
      onRetry={() => void assessments.refetch()}
      isEmpty={rows.length === 0}
      empty={
        <EmptyPanel
          icon={GraduationCap}
          title="No assessments for this class"
          description="Tests and exams for your subjects in this class will be listed here."
        />
      }
    >
      <AssessmentTable
        assessments={rows}
        entered={entered}
        roster={roster}
        className={lookups.className}
        subjectName={lookups.subjectName}
        showClass={false}
      />
    </QueryState>
  );
}
