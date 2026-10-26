import { notFound } from 'next/navigation';
import { StaffClassDetail } from '@/features/staff';

export default async function StaffClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId: raw } = await params;
  const classId = Number(raw);
  if (!Number.isInteger(classId) || classId <= 0) notFound();
  return <StaffClassDetail classId={classId} />;
}
