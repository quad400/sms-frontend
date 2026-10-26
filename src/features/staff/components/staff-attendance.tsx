'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ClipboardList, DoorOpen } from 'lucide-react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSession } from '@/lib/auth/permissions';
import { newClientRef } from '@/lib/offline/outbox';
import { toastError } from '@/lib/toast';
import { useOpenRegister, useRegisters } from '../hooks/use-attendance';
import { useStaffLookups } from '../hooks/use-staff-lookups';
import { useTeachingClasses } from '../hooks/use-teaching-classes';
import { formatDate, formatLongDate, localToday } from '../lib/format';
import { QueryState } from '../lib/shared';
import { EmptyPanel, Panel } from './shared/panel';
import { SelectField } from './shared/fields';
import { StatusBadge } from './shared/status-badge';

export function StaffAttendance({ initialClassId }: { initialClassId?: number }) {
  const ids = { classId: useId(), date: useId() };
  const router = useRouter();
  const { can } = useSession();
  const lookups = useStaffLookups();
  const teaching = useTeachingClasses();
  const [classChoice, setClassChoice] = useState<number | null>(initialClassId ?? null);
  const [date, setDate] = useState(localToday);
  // One intent = one clientRef: created with the form, regenerated only when the target changes.
  const [clientRef, setClientRef] = useState(newClientRef);

  const classId = classChoice ?? teaching.classes[0]?.classId ?? null;
  const today = localToday();

  const existing = useRegisters({ classId: classId ?? undefined, date }, classId !== null);
  const recent = useRegisters({ pageSize: 10 });
  const open = useOpenRegister();

  const register = existing.data?.data[0];
  const canOpen = can('attendance.register.open');

  function changeTarget(update: () => void) {
    update();
    setClientRef(newClientRef());
    open.reset();
  }

  function onOpen() {
    if (classId === null) return;
    open.mutate(
      { classId, date, clientRef },
      {
        onSuccess: (created) => router.push(`/staff/attendance/${created.id}`),
        onError: (error) => toastError('Could not open register', error.message),
      },
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        description="Pick a class and date, then take or review the register."
      />

      <QueryState
        isPending={teaching.isPending}
        error={teaching.error}
        onRetry={teaching.refetch}
        isEmpty={teaching.classes.length === 0}
        empty={
          <EmptyPanel
            icon={ClipboardList}
            title="No classes to take attendance for"
            description="You haven’t been allocated to a class this term."
          />
        }
      >
        <Panel>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              id={ids.classId}
              label="Class"
              value={classId ?? ''}
              onChange={(event) => changeTarget(() => setClassChoice(Number(event.target.value)))}
            >
              {teaching.classes.map((entry) => (
                <option key={entry.classId} value={entry.classId}>
                  {lookups.className(entry.classId)}
                </option>
              ))}
            </SelectField>
            <div className="grid gap-1.5">
              <Label htmlFor={ids.date}>Date</Label>
              <Input
                id={ids.date}
                type="date"
                value={date}
                max={today}
                onChange={(event) =>
                  changeTarget(() => setDate(event.target.value || localToday()))
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <QueryState
              isPending={existing.isPending && classId !== null}
              error={existing.error}
              onRetry={() => void existing.refetch()}
            >
              {register ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-3.5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {lookups.className(register.classId)} · {formatLongDate(register.date)}
                    </p>
                    <StatusBadge status={register.status} />
                  </div>
                  <Link
                    href={`/staff/attendance/${register.id}`}
                    className={buttonVariants({ variant: register.status === 'open' ? 'default' : 'outline' })}
                  >
                    <DoorOpen aria-hidden />
                    {register.status === 'open' ? 'Continue register' : 'View register'}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-3.5">
                  <p className="text-sm text-muted-foreground">
                    No register has been opened for {classId !== null ? lookups.className(classId) : 'this class'} on{' '}
                    {formatDate(date)}.
                  </p>
                  {canOpen ? (
                    <Button type="button" onClick={onOpen} disabled={open.isPending || classId === null}>
                      {open.isPending ? 'Opening…' : 'Open register'}
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      You don’t have permission to open registers.
                    </p>
                  )}
                </div>
              )}
            </QueryState>
          </div>
        </Panel>
      </QueryState>

      <Panel title="Recent registers" description="Your latest registers across all classes">
        <QueryState
          isPending={recent.isPending}
          error={recent.error}
          onRetry={() => void recent.refetch()}
          isEmpty={(recent.data?.data ?? []).length === 0}
          empty={
            <EmptyPanel
              icon={ClipboardList}
              title="No registers yet"
              description="Registers you open will be listed here."
            />
          }
        >
          <ul className="divide-y divide-border/70">
            {recent.data?.data.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/staff/attendance/${row.id}`}
                  className="group flex items-center gap-3 py-3 text-sm"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{lookups.className(row.classId)}</span>
                    <span className="block text-xs text-muted-foreground">{formatDate(row.date)}</span>
                  </span>
                  <StatusBadge status={row.status} />
                  <ChevronRight
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </QueryState>
      </Panel>
    </div>
  );
}
