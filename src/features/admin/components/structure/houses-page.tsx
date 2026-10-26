'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionGate } from '@/lib/auth/permissions';
import { toastError, toastSuccess } from '@/lib/toast';
import type { House } from '../../api/structure';
import { useCreateHouse, useHouses, useUpdateHouse } from '../../hooks/use-structure';
import { useAdminCampus } from '../../lib/campus';
import { QueryState } from '../../lib/shared';

export function HousesPage() {
  const { campusQuery } = useAdminCampus();
  const houses = useHouses(campusQuery);
  const updateHouseMutation = useUpdateHouse(campusQuery);
  const [name, setName] = useState('');
  const [colour, setColour] = useState('#2563eb');

  const createHouseMutation = useCreateHouse(campusQuery);
  const create = {
    isPending: createHouseMutation.isPending,
    mutate: () =>
      createHouseMutation.mutate(
        { campusId: Number(campusQuery), name, colour },
        {
          onSuccess: () => {
            toastSuccess('House created');
            setName('');
          },
          onError: (e) => toastError('Could not create', e.message),
        },
      ),
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Houses"
        actions={
          <PermissionGate permission="school-structure.house.create">
            <div className="flex flex-wrap gap-2">
              <Input
                className="max-w-[10rem]"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                className="h-10 w-14 p-1"
                type="color"
                value={colour}
                onChange={(e) => setColour(e.target.value)}
              />
              <Button
                type="button"
                disabled={!name || !campusQuery || create.isPending}
                onClick={() => create.mutate()}
              >
                Add
              </Button>
            </div>
          </PermissionGate>
        }
      />
      <QueryState
        isPending={houses.isPending}
        error={houses.error}
        onRetry={() => void houses.refetch()}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {(houses.data ?? []).map((h: House) => (
            <div key={h.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="size-4 rounded-full" style={{ background: h.colour || '#94a3b8' }} />
                <h2 className="font-heading font-semibold">{h.name}</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{h.memberCount ?? 0} members</p>
              <PermissionGate permission="school-structure.house.update">
                <Button
                  className="mt-2"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateHouseMutation.mutate(
                      { id: h.id, body: { colour } },
                      {
                        onSuccess: () => toastSuccess('Colour updated'),
                        onError: (e) => toastError('Failed', e.message),
                      },
                    )
                  }
                >
                  Apply colour
                </Button>
              </PermissionGate>
            </div>
          ))}
        </div>
      </QueryState>
    </div>
  );
}
