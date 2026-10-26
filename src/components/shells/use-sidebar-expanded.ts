'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/lib/hooks/use-media-query';

const MD_QUERY = '(min-width: 768px)';
const LG_QUERY = '(min-width: 1024px)';

/**
 * Breakpoints:
 * - < md  — mobile: no sidebar (bottom bar only)
 * - md–lg — docked icon rail; toggle opens overlay with labels
 * - lg+   — docked sidebar, open by default (persisted); toggle collapses to icons
 */
export function useSidebarExpanded(storageKey: string) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const isMd = useMediaQuery(MD_QUERY);
  const isLg = useMediaQuery(LG_QUERY);

  useEffect(() => {
    try {
      if (!window.matchMedia(LG_QUERY).matches) {
        setSidebarExpanded(false);
        return;
      }
      const expanded = window.localStorage.getItem(storageKey);
      if (expanded === '1' || expanded === '0') {
        setSidebarExpanded(expanded === '1');
        return;
      }
      setSidebarExpanded(true);
    } catch {
      setSidebarExpanded(window.matchMedia(LG_QUERY).matches);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isMd) {
      setSidebarExpanded(false);
      return;
    }
    if (isLg) {
      try {
        const expanded = window.localStorage.getItem(storageKey);
        if (expanded === '1' || expanded === '0') {
          setSidebarExpanded(expanded === '1');
        } else {
          setSidebarExpanded(true);
        }
      } catch {
        setSidebarExpanded(true);
      }
    } else {
      // Tablet: keep docked as icons; overlay only when user expands.
      setSidebarExpanded(false);
    }
  }, [isMd, isLg, storageKey]);

  function setExpanded(next: boolean) {
    setSidebarExpanded(next);
    if (!isLg) return;
    try {
      window.localStorage.setItem(storageKey, next ? '1' : '0');
    } catch {
      // ignore
    }
  }

  return {
    isMd,
    isLg,
    isMobile: !isMd,
    sidebarExpanded,
    setExpanded,
    /** md+: docked sidebar (icons on tablet, full/icon on desktop). */
    showDocked: isMd,
    /** Icon rail when collapsed on lg+, or always on md–lg. */
    railCollapsed: !isLg || !sidebarExpanded,
    /** md–lg: overlay with labels when toggled open. */
    navSheetOpen: isMd && !isLg && sidebarExpanded,
  };
}
