'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { flattenShellNav, type ShellNavGroup } from '@/components/shells/shell-nav';

export function ShellCommandPalette({
  open,
  onOpenChange,
  groups,
  placeholder = 'Search…',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: ShellNavGroup[];
  placeholder?: string;
}) {
  const router = useRouter();
  const items = useMemo(() => flattenShellNav(groups), [groups]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={placeholder} />
      <CommandList>
        <CommandEmpty>No matching pages.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.tabLabel ?? ''} ${item.href}`}
                onSelect={() => {
                  onOpenChange(false);
                  router.push(item.href);
                }}
              >
                <Icon />
                <span>{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
