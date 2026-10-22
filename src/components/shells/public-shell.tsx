import type { ReactNode } from 'react';
import { motion } from '@/lib/motion/classes';
import type { PublicSchoolProfile } from '@/lib/school/public-profile';

export function PublicShell({
  profile,
  children,
}: {
  profile: PublicSchoolProfile;
  children: ReactNode;
}) {
  return (
    <div
      className="auth-atmosphere flex min-h-screen flex-col"
      style={{ ['--brand' as string]: profile.brandColour }}
    >
      <header className="px-6 py-5">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div
            aria-hidden
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground"
          >
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <p className="text-lg font-semibold tracking-tight text-foreground">{profile.name}</p>
        </div>
      </header>
      <main className={`flex flex-1 items-center justify-center px-4 pb-16 ${motion.pageEnter}`}>
        {children}
      </main>
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
        {profile.name}
      </footer>
    </div>
  );
}
