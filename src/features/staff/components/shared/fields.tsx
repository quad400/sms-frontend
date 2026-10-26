import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

export const CONTROL_CLASS =
  'flex w-full rounded-sm border border-border bg-card px-3 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

export function SelectField({
  id,
  label,
  hint,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={cn(CONTROL_CLASS, 'h-10')} {...props}>
        {children}
      </select>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  hint,
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  hint?: string;
}) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={id}>{label}</Label>
      <textarea id={id} rows={rows} className={cn(CONTROL_CLASS, 'py-2')} {...props} />
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
