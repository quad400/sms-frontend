'use client';

import { use } from 'react';
import { RoleEditorPage } from '@/features/admin/components/access-pages';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RoleEditorPage roleId={Number(id)} />;
}
