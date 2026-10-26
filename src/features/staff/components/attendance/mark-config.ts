import type { AttendanceMark } from '../../types';

export const MARK_ORDER: AttendanceMark[] = ['present', 'absent', 'late', 'excused'];

export const MARK_LABEL: Record<AttendanceMark, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  excused: 'Excused',
};

export const MARK_SHORT: Record<AttendanceMark, string> = {
  present: 'P',
  absent: 'A',
  late: 'L',
  excused: 'E',
};

/** Colour plus letter plus word — never colour alone. */
export const MARK_STYLE: Record<AttendanceMark, string> = {
  present: 'bg-success/15 text-success border-success/30',
  absent: 'bg-danger/15 text-danger border-danger/30',
  late: 'bg-amber-500/15 text-amber-800 border-amber-500/30',
  excused: 'bg-muted text-muted-foreground border-border',
};

export function isMark(value: string): value is AttendanceMark {
  return (MARK_ORDER as string[]).includes(value);
}

export function nextMark(current: string): AttendanceMark {
  const index = MARK_ORDER.indexOf(isMark(current) ? current : 'present');
  return MARK_ORDER[(index + 1) % MARK_ORDER.length]!;
}
