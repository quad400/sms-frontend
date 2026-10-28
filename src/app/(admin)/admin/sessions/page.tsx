'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Sessions live under Structure → Sessions & terms. */
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/campuses?tab=sessions');
  }, [router]);
  return <p className="text-sm text-muted-foreground">Redirecting…</p>;
}
