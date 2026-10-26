import { ModuleGate } from '@/components/patterns/module-gate';
import { StudentMedical } from '@/features/portal';
import { STUDENT_MODULE_FLAGS } from '@/lib/config/feature-flags';

export default function StudentMedicalPage() {
  return (
    <ModuleGate moduleFlag={STUDENT_MODULE_FLAGS.health}>
      <StudentMedical />
    </ModuleGate>
  );
}
