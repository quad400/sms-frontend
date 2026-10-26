'use client';

import { useAdminCampus } from '../lib/campus';
import { useCampuses } from '../hooks/use-structure';

export function CampusSwitcher() {
  const { campusId, setCampusId, campusIds } = useAdminCampus();
  const isUnrestricted = campusIds.length === 0;
  // Show when multi-campus scoped, or unrestricted (empty campusIds) so admins can pick a site.
  const showSwitcher = isUnrestricted || campusIds.length > 1;
  const campuses = useCampuses(showSwitcher);

  if (!showSwitcher) return null;

  const options = isUnrestricted
    ? (campuses.data ?? [])
    : (campuses.data ?? []).filter((c) => campusIds.includes(c.id));

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="hidden lg:inline">Campus</span>
      <select
        className="min-h-11 max-w-[8.5rem] rounded-md border border-border bg-background px-2 text-sm text-foreground sm:max-w-[10rem]"
        value={campusId ?? ''}
        onChange={(e) => {
          const v = e.target.value;
          setCampusId(v ? Number(v) : null);
        }}
        aria-label="Campus"
      >
        <option value="">{isUnrestricted ? 'Select campus…' : 'All campuses'}</option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DensityToggle() {
  const { density, setDensity } = useAdminCampus();
  return (
    <button
      type="button"
      className="hidden h-11 items-center rounded-md border border-border px-2 text-sm text-muted-foreground hover:bg-muted md:inline-flex"
      onClick={() => setDensity(density === 'compact' ? 'comfortable' : 'compact')}
      aria-label="Toggle table density"
    >
      {density === 'compact' ? 'Comfortable' : 'Compact'}
    </button>
  );
}
