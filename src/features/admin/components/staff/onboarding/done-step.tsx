'use client';

import Link from 'next/link';
import { CheckCircle2, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/patterns/status-badge';
import { fullName, type StaffRow } from '../../../types';
import { labelForCode, JOB_TITLE_CODES } from '../../../lib/codes';
import { avatarTone, initials } from '../utils';
import { cn } from '@/lib/utils/cn';

export function DoneStep({
  staff,
  onOnboardAnother,
}: {
  staff: StaffRow;
  onOnboardAnother: () => void;
}) {
  const status = staff.statusCode ?? staff.status ?? 'active';
  const job =
    staff.jobTitle ??
    labelForCode(JOB_TITLE_CODES, staff.jobTitleCode);

  return (
    <div className="mx-auto max-w-lg space-y-5 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        <CheckCircle2 className="size-7" />
      </span>
      <div className="space-y-1">
        <h2 className="font-heading text-xl font-semibold tracking-tight">
          Staff onboarded
        </h2>
        <p className="text-sm text-muted-foreground">
          The record is ready. You can open the full profile or onboard another
          member.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)]">
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold',
            avatarTone(staff.staffNumber ?? staff.firstName),
          )}
        >
          {initials(staff.firstName, staff.lastName)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {fullName(staff.firstName, staff.lastName, staff.middleName)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {staff.staffNumber}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <StatusBadge status={status} />
            {job && job !== '—' ? (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
                {job}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild className="bg-teal-700 hover:bg-teal-800">
          <Link href={`/admin/staff/${staff.id}`}>View profile</Link>
        </Button>
        <Button type="button" variant="outline" onClick={onOnboardAnother}>
          <Plus className="size-4" />
          Onboard another
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/staff">
            <Users className="size-4" />
            Directory
          </Link>
        </Button>
      </div>
    </div>
  );
}
