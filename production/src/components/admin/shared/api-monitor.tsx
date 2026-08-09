'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Gauge, Trash2, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  getApiTimings,
  clearApiTimings,
  subscribeToTimings,
  type ApiTimingEntry,
} from '@/lib/tols-hooks';

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-500';
  if (status === 401 || status === 403) return 'text-amber-500';
  return 'text-red-500';
}

function statusBg(status: number): string {
  if (status >= 200 && status < 300) return 'bg-emerald-500';
  if (status === 401 || status === 403) return 'bg-amber-500';
  return 'bg-red-500';
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 1000) return 'just now';
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function formatEntity(entity: string): string {
  return entity
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function MiniBarChart({ timings }: { timings: ApiTimingEntry[] }) {
  const maxDur = useMemo(
    () => Math.max(...timings.map((t) => t.duration), 100),
    [timings]
  );

  if (timings.length === 0) {
    return (
      <div className="flex items-end gap-[3px] h-10 justify-center">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="w-full max-w-[14px] rounded-t bg-muted/40"
            style={{ height: '4px' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-[3px] h-10">
      {timings.map((t, i) => {
        const h = Math.max(4, (t.duration / maxDur) * 100);
        return (
          <div
            key={i}
            className="w-full max-w-[14px] rounded-t transition-all duration-300"
            style={{
              height: `${h}%`,
              backgroundColor:
                t.duration < 500
                  ? 'hsl(var(--chart-2))'
                  : t.duration < 1500
                    ? 'hsl(var(--chart-3))'
                    : 'hsl(var(--chart-5, 239 84% 67%))',
            }}
            title={`${t.entity}: ${t.duration}ms`}
          />
        );
      })}
    </div>
  );
}

export function ApiMonitor() {
  const [timings, setTimings] = useState<ApiTimingEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  // Subscribe to timing changes
  useEffect(() => {
    const update = () => setTimings(getApiTimings());
    const unsub = subscribeToTimings(update);
    update();
    return unsub;
  }, []);

  // Periodic refresh when popover is open (to update timeAgo)
  useEffect(() => {
    if (open) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 5000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  const recentTimings = useMemo(
    () => timings.slice(-10),
    [timings, tick]
  );

  const avgMs = useMemo(() => {
    if (recentTimings.length === 0) return 0;
    return Math.round(recentTimings.reduce((s, t) => s + t.duration, 0) / recentTimings.length);
  }, [recentTimings]);

  const handleClear = useCallback(() => {
    clearApiTimings();
    setTimings([]);
  }, []);

  const avgColor =
    avgMs === 0
      ? 'text-muted-foreground'
      : avgMs < 500
        ? 'text-emerald-500'
        : avgMs < 1500
          ? 'text-amber-500'
          : 'text-red-500';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
          aria-label="API Response Time Monitor"
        >
          <Gauge className={`h-4 w-4 ${avgColor}`} />
          {avgMs > 0 && (
            <span className="sr-only">Avg {avgMs}ms</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {/* Subtle gradient header accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-t-lg" />
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10">
              <Zap className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold">API Monitor</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClear}
            aria-label="Clear timing data"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        <Separator />

        {/* Average + Chart */}
        <div className="px-4 py-3">
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg Response</span>
            </div>
            <span className={`text-lg font-bold tabular-nums ${avgColor}`}>
              {avgMs > 0 ? `${avgMs}ms` : '—'}
            </span>
          </div>
          <MiniBarChart timings={recentTimings} />
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground/60">
            <span>{recentTimings.length > 0 ? `Last ${recentTimings.length}` : 'No data'}</span>
            <span>
              {recentTimings.length > 0
                ? `max ${Math.max(...recentTimings.map((t) => t.duration))}ms`
                : ''}
            </span>
          </div>
        </div>

        <Separator />

        {/* Recent list */}
        <ScrollArea className="max-h-56">
          {recentTimings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Gauge className="h-8 w-8 mb-2 opacity-30" />
              <span className="text-xs">No API calls recorded yet</span>
            </div>
          ) : (
            <div className="divide-y">
              {[...recentTimings].reverse().map((entry, i) => (
                <div
                  key={`${entry.timestamp}-${i}`}
                  className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-muted/30 transition-colors"
                >
                  {/* Status dot */}
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${statusBg(entry.status)}`}
                  />
                  {/* Entity */}
                  <span className="font-medium truncate flex-1 min-w-0">
                    {formatEntity(entry.entity)}
                  </span>
                  {/* Duration */}
                  <span
                    className={`font-mono tabular-nums shrink-0 ${
                      entry.duration < 500
                        ? 'text-emerald-500'
                        : entry.duration < 1500
                          ? 'text-amber-500'
                          : 'text-red-500'
                    }`}
                  >
                    {entry.duration}ms
                  </span>
                  {/* Status code */}
                  <Badge
                    variant="outline"
                    className={`h-5 px-1.5 text-[10px] font-mono border-0 ${statusColor(entry.status)}`}
                  >
                    {entry.status}
                  </Badge>
                  {/* Time ago */}
                  <span className="text-muted-foreground/60 shrink-0 w-12 text-right">
                    {timeAgo(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
