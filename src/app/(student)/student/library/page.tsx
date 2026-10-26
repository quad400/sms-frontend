import { ModuleGate } from '@/components/patterns/module-gate';
import { StudentLibrary } from '@/features/portal';
import { STUDENT_MODULE_FLAGS } from '@/lib/config/feature-flags';

export default function StudentLibraryPage() {
  return (
    <ModuleGate moduleFlag={STUDENT_MODULE_FLAGS.library}>
      <StudentLibrary />
    </ModuleGate>
  );
}
