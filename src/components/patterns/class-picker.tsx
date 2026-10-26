'use client';

import { FilterSelect } from '@/components/patterns/filter-bar';

export function ClassPicker({
  value,
  onChange,
  classes,
  label = 'Class',
  emptyLabel = 'All classes',
}: {
  value: string;
  onChange: (value: string) => void;
  classes: Array<{ id: number; name: string }>;
  label?: string;
  emptyLabel?: string;
}) {
  return (
    <FilterSelect
      label={label}
      value={value}
      onChange={onChange}
      emptyLabel={emptyLabel}
      options={classes.map((c) => ({ value: String(c.id), label: c.name }))}
    />
  );
}
