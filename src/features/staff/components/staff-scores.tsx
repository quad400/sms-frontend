'use client';

import { useId, useMemo, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { useAssessments, useScoreCounts } from '../hooks/use-assessments';
import { useStaffLookups } from '../hooks/use-staff-lookups';
import { useClassStudentCounts } from '../hooks/use-structure';
import { useTeachingClasses } from '../hooks/use-teaching-classes';
import { QueryState } from '../lib/shared';
import { AssessmentTable } from './shared/assessment-table';
import { SelectField } from './shared/fields';
import { EmptyPanel, Panel } from './shared/panel';

const COUNT_LIMIT = 40;

export function StaffScores() {
  const ids = { classId: useId(), subjectId: useId(), termId: useId() };
  const lookups = useStaffLookups();
  const teaching = useTeachingClasses();
  const [classId, setClassId] = useState<number | undefined>();
  const [subjectId, setSubjectId] = useState<number | undefined>();
  const [termId, setTermId] = useState<number | undefined>();

  const assessments = useAssessments({ classId, subjectId, termId });

  // Pickers only offer what the teacher is allocated to.
  const subjectOptions = useMemo(() => {
    const scoped = classId
      ? teaching.classes.filter((entry) => entry.classId === classId)
      : teaching.classes;
    return [...new Set(scoped.flatMap((entry) => entry.subjectIds))];
  }, [classId, teaching.classes]);

  const rows = useMemo(
    () =>
      [...(assessments.data?.data ?? [])].sort((a, b) => {
        if ((a.status === 'draft') !== (b.status === 'draft')) return a.status === 'draft' ? -1 : 1;
        return (b.assessmentDate ?? b.createdAt).localeCompare(a.assessmentDate ?? a.createdAt);
      }),
    [assessments.data],
  );

  const entered = useScoreCounts(rows.slice(0, COUNT_LIMIT).map((row) => row.id));
  const roster = useClassStudentCounts([...new Set(rows.map((row) => row.classId))]);

  const terms = lookups.terms;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Scores"
        description="Enter and submit scores for your tests and exams."
      />

      <Panel>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField
            id={ids.classId}
            label="Class"
            value={classId ?? ''}
            onChange={(event) => {
              setClassId(event.target.value ? Number(event.target.value) : undefined);
              setSubjectId(undefined);
            }}
          >
            <option value="">All my classes</option>
            {teaching.classes.map((entry) => (
              <option key={entry.classId} value={entry.classId}>
                {lookups.className(entry.classId)}
              </option>
            ))}
          </SelectField>
          <SelectField
            id={ids.subjectId}
            label="Subject"
            value={subjectId ?? ''}
            onChange={(event) =>
              setSubjectId(event.target.value ? Number(event.target.value) : undefined)
            }
          >
            <option value="">All my subjects</option>
            {subjectOptions.map((id) => (
              <option key={id} value={id}>
                {lookups.subjectName(id)}
              </option>
            ))}
          </SelectField>
          <SelectField
            id={ids.termId}
            label="Term"
            value={termId ?? ''}
            onChange={(event) => setTermId(event.target.value ? Number(event.target.value) : undefined)}
          >
            <option value="">All terms</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.periodName}
                {term.isActive ? ' (current)' : ''}
              </option>
            ))}
          </SelectField>
        </div>
      </Panel>

      <QueryState
        isPending={assessments.isPending}
        error={assessments.error}
        onRetry={() => void assessments.refetch()}
        isEmpty={rows.length === 0}
        empty={
          <EmptyPanel
            icon={GraduationCap}
            title="No assessments found"
            description="Tests and exams for your classes and subjects will appear here once they’re set up."
          />
        }
      >
        <AssessmentTable
          assessments={rows}
          entered={entered}
          roster={roster}
          className={lookups.className}
          subjectName={lookups.subjectName}
        />
      </QueryState>
    </div>
  );
}
