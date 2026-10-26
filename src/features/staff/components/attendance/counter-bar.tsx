import { cn } from '@/lib/utils/cn';
import type { AttendanceMark } from '../../types';
import { MARK_LABEL, MARK_ORDER, MARK_STYLE } from './mark-config';

export function CounterBar({ counts }: { counts: Record<AttendanceMark, number> }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Attendance totals">
      {MARK_ORDER.map((mark) => (
        <li
          key={mark}
          className={cn(
            'flex items-baseline gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold',
            MARK_STYLE[mark],
          )}
        >
          <span className="font-mono text-base tabular-nums">{counts[mark]}</span>
          {MARK_LABEL[mark]}
        </li>
      ))}
    </ul>
  );
}
