import { PermissionGate } from '@/lib/auth/permissions';

export default function AdminHomePage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Admin home</h1>
      <p className="text-sm text-muted-foreground">
        You are signed in. Feature areas will appear here as they are built.
      </p>
      <PermissionGate permission="reporting.dashboard.read">
        <p className="text-sm">Dashboard reporting is available to your account.</p>
      </PermissionGate>
    </div>
  );
}
