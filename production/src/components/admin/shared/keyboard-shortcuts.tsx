'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/stores/admin';
import { openShortcutsModal } from './shortcuts-modal';

/**
 * Checks whether the active element is an editable input.
 */
function isEditable(e: KeyboardEvent): boolean {
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  const el = e.target as HTMLElement;
  return el.isContentEditable;
}

/**
 * Global keyboard shortcuts component.
 *
 * Handled shortcuts:
 * - Escape:       Close any open dialog (dispatches `tols:close-dialog`)
 * - Shift+/ (?):  Open keyboard shortcuts modal
 * - Alt+H:        Navigate to Dashboard
 * - R:            Refresh current page data (dispatches `tols:refresh`)
 * - Ctrl+B:       Toggle sidebar
 *
 * Note: Cmd+K / Ctrl+K is handled by CommandPalette directly.
 *
 * Wrap this around the main content area.
 */
export function KeyboardShortcuts({ children }: { children: React.ReactNode }) {
  const { setCurrentPage, toggleSidebar } = useAdminStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // -----------------------------------------------------------
      // Escape → close open dialogs
      // -----------------------------------------------------------
      if (e.key === 'Escape') {
        const event = new CustomEvent('tols:close-dialog');
        window.dispatchEvent(event);
        return;
      }

      // -----------------------------------------------------------
      // ? (Shift + /) → open shortcuts modal
      // -----------------------------------------------------------
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        openShortcutsModal();
        return;
      }

      // -----------------------------------------------------------
      // Alt+H → navigate to Dashboard
      // -----------------------------------------------------------
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        setCurrentPage('dashboard');
        return;
      }

      // -----------------------------------------------------------
      // R → refresh current page data (only when not in input)
      // -----------------------------------------------------------
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        if (!isEditable(e)) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('tols:refresh'));
          return;
        }
      }

      // -----------------------------------------------------------
      // Ctrl+B → toggle sidebar
      // -----------------------------------------------------------
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentPage, toggleSidebar]);

  return <>{children}</>;
}
