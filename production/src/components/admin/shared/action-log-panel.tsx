'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ScrollText,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Navigation,
  CheckCircle2,
  XCircle,
  X,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAdminStore, type ActionLogEntry } from '@/stores/admin';

// ─── Action icon & color mapping ───────────────────────────────────────────

const ACTION_CONFIG: Record<
  ActionLogEntry['action'],
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  create: {
    icon: Plus,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    label: 'Create',
  },
  update: {
    icon: Pencil,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10',
    label: 'Update',
  },
  delete: {
    icon: Trash2,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
    label: 'Delete',
  },
  view: {
    icon: Eye,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    label: 'View',
  },
  navigate: {
    icon: Navigation,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    label: 'Navigate',
  },
};

// ─── Relative time formatting ──────────────────────────────────────────────

function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Time grouping ─────────────────────────────────────────────────────────

interface TimeGroup {
  label: string;
  entries: ActionLogEntry[];
}

function groupByTime(entries: ActionLogEntry[]): TimeGroup[] {
  const now = Date.now();
  const groups: TimeGroup[] = [];

  const justNow: ActionLogEntry[] = [];
  const fiveMinAgo: ActionLogEntry[] = [];
  const earlierToday: ActionLogEntry[] = [];
  const previous: ActionLogEntry[] = [];

  for (const entry of entries) {
    const diff = now - entry.timestamp.getTime();
    const minutes = diff / 60000;

    if (minutes < 1) {
      justNow.push(entry);
    } else if (minutes < 5) {
      fiveMinAgo.push(entry);
    } else if (minutes < 24 * 60) {
      earlierToday.push(entry);
    } else {
      previous.push(entry);
    }
  }

  if (justNow.length > 0) groups.push({ label: 'Just now', entries: justNow });
  if (fiveMinAgo.length > 0) groups.push({ label: '5 minutes ago', entries: fiveMinAgo });
  if (earlierToday.length > 0) groups.push({ label: 'Earlier today', entries: earlierToday });
  if (previous.length > 0) groups.push({ label: 'Previous', entries: previous });

  return groups;
}

// ─── Log entry row ─────────────────────────────────────────────────────────

function LogEntryRow({ entry }: { entry: ActionLogEntry }) {
  const config = ACTION_CONFIG[entry.action];
  const Icon = config.icon;
  const StatusIcon = entry.status === 'success' ? CheckCircle2 : XCircle;
  const statusColor = entry.status === 'success' ? 'text-emerald-500' : 'text-red-500';

  const truncatedId = entry.entityId
    ? entry.entityId.length > 8
      ? `#${entry.entityId.slice(0, 8)}...`
      : `#${entry.entityId}`
    : '';

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 hover:bg-muted/40 transition-colors rounded-md">
      {/* Action icon */}
      <div className={`rounded-md p-1.5 shrink-0 mt-0.5 ${config.bg}`}>
        <Icon className={`h-3.5 w-3.5 ${config.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium truncate">{entry.entity}</span>
          {truncatedId && (
            <span className="text-xs text-muted-foreground font-mono shrink-0">
              {truncatedId}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.details}</p>
      </div>

      {/* Status + time */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <StatusIcon className={`h-3.5 w-3.5 ${statusColor}`} />
        <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">
          {formatTimeAgo(entry.timestamp)}
        </span>
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
        <ScrollText className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">No activity logged</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        Admin actions will appear here
      </p>
    </div>
  );
}

// ─── Main Action Log Panel ────────────────────────────────────────────────

export function ActionLogPanel() {
  const actionLog = useAdminStore((s) => s.actionLog);
  const clearActionLog = useAdminStore((s) => s.clearActionLog);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(actionLog.length);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Periodic refresh when popover is open (to update relative timestamps)
  useEffect(() => {
    if (open) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 10000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    if (open && actionLog.length > prevCountRef.current) {
      // Use requestAnimationFrame to ensure the DOM has updated
      requestAnimationFrame(() => {
        const viewport = scrollRef.current?.querySelector(
          '[data-slot="scroll-area-viewport"]'
        ) as HTMLElement | null;
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      });
    }
    prevCountRef.current = actionLog.length;
  }, [actionLog.length, open]);

  // Count entries from the last 5 minutes for badge
  const recentCount = useMemo(() => {
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    return actionLog.filter((e) => e.timestamp.getTime() > fiveMinAgo).length;
  }, [actionLog, tick]);

  // Group entries (reversed so newest first)
  const groups = useMemo(
    () => groupByTime([...actionLog].reverse()),
    [actionLog, tick]
  );

  const handleClear = useCallback(() => {
    clearActionLog();
  }, [clearActionLog]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <ScrollText className="h-4 w-4" />
          {recentCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1">
              <span className="text-[10px] font-bold leading-none text-primary-foreground">
                {recentCount > 99 ? '99+' : recentCount}
              </span>
            </span>
          )}
          <span className="sr-only">Action Log</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-[380px] p-0">
        {/* Subtle gradient header accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-t-lg" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
              <ScrollText className="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Action Log</h3>
            {actionLog.length > 0 && (
              <Badge variant="secondary" className="text-xs tabular-nums">
                {actionLog.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {actionLog.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleClear}
                aria-label="Clear action log"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div ref={scrollRef}>
          <ScrollArea className="max-h-[400px]">
            {actionLog.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="py-1">
                {groups.map((group) => (
                  <div key={group.label}>
                    {/* Group header */}
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                        {group.label}
                      </span>
                    </div>
                    {/* Group entries */}
                    <div className="px-1">
                      {group.entries.map((entry) => (
                        <LogEntryRow key={entry.id} entry={entry} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
