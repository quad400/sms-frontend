import type { ReactNode } from 'react';

/** Floating save/submit bar. Sits above the phone tab bar and docks bottom-right on desktop. */
export function StickyActions({ status, children }: { status: ReactNode; children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-[4.75rem] z-30 border-t border-border bg-card/95 px-4 py-3 shadow-[var(--shadow-popover)] backdrop-blur md:inset-x-auto md:bottom-4 md:right-4 md:rounded-2xl md:border md:px-4">
      <div className="mx-auto flex max-w-3xl items-center justify-end gap-2">
        <span className="mr-auto text-xs text-muted-foreground md:mr-4" aria-live="polite">
          {status}
        </span>
        {children}
      </div>
    </div>
  );
}
