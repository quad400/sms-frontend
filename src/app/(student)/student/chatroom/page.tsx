import { ModuleGate } from '@/components/patterns/module-gate';
import { StudentChatroom } from '@/features/portal';
import { STUDENT_MODULE_FLAGS } from '@/lib/config/feature-flags';

export default function StudentChatroomPage() {
  return (
    <ModuleGate moduleFlag={STUDENT_MODULE_FLAGS.studentChat}>
      <StudentChatroom />
    </ModuleGate>
  );
}
