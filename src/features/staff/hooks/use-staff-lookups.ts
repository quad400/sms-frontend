'use client';

import { useCallback, useMemo } from 'react';
import type { SchoolClass, Subject, Term } from '../types';
import { useClasses, useRooms, useSubjects, useTerms } from './use-structure';

export type StaffLookups = {
  classes: SchoolClass[];
  subjects: Subject[];
  terms: Term[];
  activeTerms: Term[];
  classOf: (id: number) => SchoolClass | undefined;
  className: (id: number) => string;
  subjectName: (id: number) => string;
  termLabel: (id: number) => string;
  roomName: (id: number | null) => string;
};

/** Id → display-name helpers; every lookup degrades to `Class #id` style labels. */
export function useStaffLookups(): StaffLookups {
  const classes = useClasses().data;
  const subjects = useSubjects().data;
  const terms = useTerms().data;
  const rooms = useRooms().data?.data;

  const classMap = useMemo(() => new Map((classes ?? []).map((row) => [row.id, row])), [classes]);
  const subjectMap = useMemo(
    () => new Map((subjects ?? []).map((row) => [row.id, row])),
    [subjects],
  );
  const termMap = useMemo(() => new Map((terms ?? []).map((row) => [row.id, row])), [terms]);
  const roomMap = useMemo(() => new Map((rooms ?? []).map((row) => [row.id, row])), [rooms]);

  const classOf = useCallback((id: number) => classMap.get(id), [classMap]);
  const className = useCallback((id: number) => classMap.get(id)?.name ?? `Class ${id}`, [classMap]);
  const subjectName = useCallback(
    (id: number) => subjectMap.get(id)?.name ?? `Subject ${id}`,
    [subjectMap],
  );
  const termLabel = useCallback(
    (id: number) => termMap.get(id)?.periodName ?? `Term ${id}`,
    [termMap],
  );
  const roomName = useCallback(
    (id: number | null) => (id === null ? '' : (roomMap.get(id)?.name ?? `Room ${id}`)),
    [roomMap],
  );

  return useMemo(
    () => ({
      classes: classes ?? [],
      subjects: subjects ?? [],
      terms: terms ?? [],
      activeTerms: (terms ?? []).filter((term) => term.isActive),
      classOf,
      className,
      subjectName,
      termLabel,
      roomName,
    }),
    [classes, subjects, terms, classOf, className, subjectName, termLabel, roomName],
  );
}
