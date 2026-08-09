'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  Zap,
  Eye,
  TableProperties,
  Keyboard,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Shortcut data                                                      */
/* ------------------------------------------------------------------ */

interface ShortcutEntry {
  keys: string[];
  label: string;
  description: string;
}

interface ShortcutGroup {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  shortcuts: ShortcutEntry[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    icon: Navigation,
    shortcuts: [
      { keys: ['Ctrl', 'K'], label: 'Command Palette', description: 'Open the command palette to search pages' },
      { keys: ['Alt', 'H'], label: 'Home / Dashboard', description: 'Navigate to the dashboard' },
      { keys: ['Alt', '1–9'], label: 'Quick Page Switch', description: 'Switch to pages 1–9 in the sidebar' },
    ],
  },
  {
    title: 'Actions',
    icon: Zap,
    shortcuts: [
      { keys: ['N'], label: 'New / Create', description: 'Create a new item (when not in an input)' },
      { keys: ['R'], label: 'Refresh Data', description: 'Refresh current page data' },
      { keys: ['E'], label: 'Export', description: 'Export current table data' },
      { keys: ['Esc'], label: 'Close Dialog', description: 'Close any open dialog or modal' },
    ],
  },
  {
    title: 'View',
    icon: Eye,
    shortcuts: [
      { keys: ['Ctrl', 'B'], label: 'Toggle Sidebar', description: 'Show or hide the sidebar panel' },
      { keys: ['Ctrl', '⇧', 'D'], label: 'Toggle Theme', description: 'Switch between light and dark mode' },
      { keys: ['F'], label: 'Toggle Fullscreen', description: 'Enter or exit fullscreen mode' },
    ],
  },
  {
    title: 'Data Table',
    icon: TableProperties,
    shortcuts: [
      { keys: ['↑', '↓'], label: 'Navigate Rows', description: 'Move up or down through table rows' },
      { keys: ['Space'], label: 'Select Row', description: 'Select or deselect the focused row' },
      { keys: ['⇧', 'Space'], label: 'Select All', description: 'Select or deselect all visible rows' },
      { keys: ['Enter'], label: 'View Details', description: 'Open the detail view for the selected row' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Kbd component                                                       */
/* ------------------------------------------------------------------ */

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="inline-flex items-center justify-center min-w-[26px] h-[26px] px-2 rounded-md border border-border/80 bg-muted/60 text-[12px] font-mono font-medium text-foreground shadow-[0_1px_0_1px_rgba(0,0,0,0.06)]"
      role="text"
    >
      {children}
    </kbd>
  );
}

/* ------------------------------------------------------------------ */
/*  Module-level open callback                                          */
/* ------------------------------------------------------------------ */

let _openShortcutsFn: (() => void) | null = null;
export function openShortcutsModal() {
  _openShortcutsFn?.();
}

/* ------------------------------------------------------------------ */
/*  ShortcutsModal component                                            */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'tols-remember-shortcuts';

function getStoredRememberShortcuts(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);
  const rememberShortcuts = useSyncExternalStore(
    (cb) => {
      window.addEventListener('storage', cb);
      return () => window.removeEventListener('storage', cb);
    },
    getStoredRememberShortcuts,
    () => false
  );

  // Register open function
  useEffect(() => {
    _openShortcutsFn = () => setOpen(true);
    return () => {
      _openShortcutsFn = null;
    };
  }, []);

  const handleToggleRemember = useCallback((checked: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, String(checked));
      // Dispatch a storage event so useSyncExternalStore re-reads
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    } catch {
      // ignore
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[580px] p-0 overflow-hidden"
        aria-label="Keyboard Shortcuts"
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="p-6 space-y-5"
            >
              {/* Header */}
              <DialogHeader className="space-y-2 pb-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                    <Keyboard className="h-4 w-4" />
                  </div>
                  <DialogTitle className="text-lg">Keyboard Shortcuts</DialogTitle>
                </div>
                <DialogDescription>
                  Speed up your workflow with these keyboard shortcuts.
                </DialogDescription>
              </DialogHeader>

              {/* Shortcut groups */}
              <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                {SHORTCUT_GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <section key={group.title} aria-label={`${group.title} shortcuts`}>
                      {/* Group header with gradient underline */}
                      <div className="flex items-center gap-2 mb-3 relative pb-2">
                        <GroupIcon className="h-3.5 w-3.5 text-primary/70" />
                        <h3 className="text-sm font-semibold text-foreground tracking-wide">
                          {group.title}
                        </h3>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
                      </div>

                      {/* Shortcuts grid */}
                      <div className="grid gap-2">
                        {group.shortcuts.map((shortcut) => (
                          <div
                            key={shortcut.label}
                            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-muted/40 transition-colors"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium text-foreground truncate">
                                {shortcut.label}
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {shortcut.description}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {shortcut.keys.map((key, i) => (
                                <React.Fragment key={`${shortcut.label}-${key}-${i}`}>
                                  {i > 0 && (
                                    <span className="text-muted-foreground/50 text-xs mx-0.5">
                                      +
                                    </span>
                                  )}
                                  <Kbd>{key}</Kbd>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Footer with toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Switch
                    id="remember-shortcuts"
                    checked={rememberShortcuts}
                    onCheckedChange={handleToggleRemember}
                    aria-label="Show shortcut hints in the UI"
                  />
                  <Label
                    htmlFor="remember-shortcuts"
                    className="text-sm text-muted-foreground cursor-pointer select-none"
                  >
                    Show shortcut hints
                  </Label>
                </div>
                <span className="text-[11px] text-muted-foreground/50">
                  Press <Kbd>?</Kbd> to reopen
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
