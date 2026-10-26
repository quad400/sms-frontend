import { notFound } from 'next/navigation';
import { StaffScoreEntry } from '@/features/staff';

export default async function StaffScoreEntryPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId: raw } = await params;
  const assessmentId = Number(raw);
  if (!Number.isInteger(assessmentId) || assessmentId <= 0) notFound();
  return <StaffScoreEntry assessmentId={assessmentId} />;
}
