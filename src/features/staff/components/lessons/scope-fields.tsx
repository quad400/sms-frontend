'use client';

import { useId, useMemo } from 'react';
import { useStaffLookups } from '../../hooks/use-staff-lookups';
import { useTeachingClasses } from '../../hooks/use-teaching-classes';
import { SelectField } from '../shared/fields';

export type Scope = { classId: string; subjectId: string; termId: string };

/**
 * Class → subject → term pickers built from the teacher's own allocations, so a teacher is
 * never offered a combination the backend would reject.
 */
export function ScopeFields({
  value,
  onChange,
  errors,
  disabled = false,
}: {
  value: Scope;
  onChange: (next: Scope) => void;
  errors?: Partial<Record<keyof Scope, string>>;
  disabled?: boolean;
}) {
  const ids = { classId: useId(), subjectId: useId(), termId: useId() };
  const lookups = useStaffLookups();
  const teaching = useTeachingClasses();

  const classes = teaching.classes.filter((entry) => entry.subjectIds.length > 0);
  const selected = classes.find((entry) => String(entry.classId) === value.classId);

  const terms = useMemo(() => {
    const sessionId = selected?.sessionId ?? lookups.classOf(Number(value.classId))?.sessionId;
    const scoped =
      sessionId === undefined ? lookups.terms : lookups.terms.filter((t) => t.sessionId === sessionId);
    return scoped.length > 0 ? scoped : lookups.terms;
  }, [lookups, selected?.sessionId, value.classId]);

  function termFor(classId: string): string {
    const sessionId = classes.find((entry) => String(entry.classId) === classId)?.sessionId;
    const pool = lookups.terms.filter((t) => sessionId === undefined || t.sessionId === sessionId);
    return String((pool.find((t) => t.isActive) ?? pool[0])?.id ?? '');
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SelectField
        id={ids.classId}
        label="Class"
        value={value.classId}
        disabled={disabled}
        aria-invalid={errors?.classId ? true : undefined}
        onChange={(event) => {
          const classId = event.target.value;
          const subjects = classes.find((entry) => String(entry.classId) === classId)?.subjectIds ?? [];
          onChange({
            classId,
            subjectId: subjects.length === 1 ? String(subjects[0]) : '',
            termId: classId ? termFor(classId) : '',
          });
        }}
        hint={errors?.classId}
      >
        <option value="">Select class</option>
        {classes.map((entry) => (
          <option key={entry.classId} value={entry.classId}>
            {lookups.className(entry.classId)}
          </option>
        ))}
      </SelectField>
      <SelectField
        id={ids.subjectId}
        label="Subject"
        value={value.subjectId}
        disabled={disabled || !selected}
        aria-invalid={errors?.subjectId ? true : undefined}
        onChange={(event) => onChange({ ...value, subjectId: event.target.value })}
        hint={errors?.subjectId}
      >
        <option value="">Select subject</option>
        {(selected?.subjectIds ?? []).map((id) => (
          <option key={id} value={id}>
            {lookups.subjectName(id)}
          </option>
        ))}
      </SelectField>
      <SelectField
        id={ids.termId}
        label="Term"
        value={value.termId}
        disabled={disabled || terms.length === 0}
        aria-invalid={errors?.termId ? true : undefined}
        onChange={(event) => onChange({ ...value, termId: event.target.value })}
        hint={errors?.termId}
      >
        <option value="">Select term</option>
        {terms.map((term) => (
          <option key={term.id} value={term.id}>
            {term.periodName}
            {term.isActive ? ' (current)' : ''}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
