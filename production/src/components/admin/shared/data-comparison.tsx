'use client';

import React, { useMemo, useState } from 'react';
import {
  Download,
  Copy,
  Check,
  ArrowRightLeft,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ---------- Types ----------

interface DataComparisonProps {
  entity: string;
  items: [Record<string, unknown>, Record<string, unknown>];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------- Helpers ----------

function isObjectOrArray(val: unknown): boolean {
  return val !== null && typeof val === 'object' && !(val instanceof Date);
}

function formatValue(val: unknown): React.ReactNode {
  if (val === null || val === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (typeof val === 'boolean') {
    return <Badge variant={val ? 'default' : 'secondary'}>{val ? 'Yes' : 'No'}</Badge>;
  }
  if (isObjectOrArray(val)) {
    return (
      <pre className="text-xs font-mono bg-muted rounded p-2 max-w-[260px] overflow-x-auto whitespace-pre-wrap break-all">
        {JSON.stringify(val, null, 2)}
      </pre>
    );
  }
  if (typeof val === 'string') {
    // Try to detect long strings like hashes or addresses
    if (val.length > 64) {
      return (
        <span className="font-mono text-xs" title={val}>
          {val.slice(0, 20)}...{val.slice(-8)}
        </span>
      );
    }
  }
  return <span className="text-sm">{String(val)}</span>;
}

function valuesAreEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || a === undefined) return b === null || b === undefined;
  if (b === null || b === undefined) return false;
  if (isObjectOrArray(a) && isObjectOrArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return String(a) === String(b);
}

function getFieldLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\bid\b/gi, 'ID')
    .trim()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// ---------- Main Component ----------

export function DataComparison({ entity, items, open, onOpenChange }: DataComparisonProps) {
  const [copiedId, setCopiedId] = useState<'a' | 'b' | null>(null);

  // Collect all unique keys from both items
  const allKeys = useMemo(() => {
    const keySet = new Set<string>();
    Object.keys(items[0]).forEach((k) => keySet.add(k));
    Object.keys(items[1]).forEach((k) => keySet.add(k));
    // Put id at top, then sort rest
    const sorted = Array.from(keySet).sort((a, b) => {
      if (a === 'id') return -1;
      if (b === 'id') return 1;
      return a.localeCompare(b);
    });
    return sorted;
  }, [items]);

  const differences = useMemo(() => {
    let count = 0;
    allKeys.forEach((key) => {
      const a = items[0][key];
      const b = items[1][key];
      if (!valuesAreEqual(a, b)) count++;
    });
    return count;
  }, [items, allKeys]);

  const handleExportJSON = () => {
    const exportData = {
      entity,
      itemA: items[0],
      itemB: items[1],
      differences: allKeys
        .filter((key) => !valuesAreEqual(items[0][key], items[1][key]))
        .map((key) => ({
          field: key,
          itemA: items[0][key],
          itemB: items[1][key],
        })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comparison-${entity.toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Comparison exported as JSON');
  };

  const handleCopyId = (id: string, which: 'a' | 'b') => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(which);
      toast.success('ID copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const idA = String(items[0]?.id || '');
  const idB = String(items[1]?.id || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            Comparing {entity} Records
          </DialogTitle>
          <DialogDescription>
            Side-by-side comparison of two {entity} records
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">
            {allKeys.length} fields compared
          </span>
          <Separator orientation="vertical" className="h-4" />
          {differences === 0 ? (
            <Badge variant="default" className="gap-1">
              <Check className="h-3 w-3" />
              All fields identical
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 gap-1">
              {differences} difference{differences > 1 ? 's' : ''} found
            </Badge>
          )}
          <div className="ml-auto">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportJSON}>
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* ID row */}
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
          <span className="text-xs text-muted-foreground font-medium w-24 shrink-0">Record IDs</span>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <code className="text-xs font-mono bg-background px-2 py-1 rounded truncate flex-1">{idA}</code>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopyId(idA, 'a')}>
              {copiedId === 'a' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">vs</span>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <code className="text-xs font-mono bg-background px-2 py-1 rounded truncate flex-1">{idB}</code>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleCopyId(idB, 'b')}>
              {copiedId === 'b' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {/* Comparison table */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] bg-muted/30 sticky top-0">Field</TableHead>
                  <TableHead className="bg-muted/30 sticky top-0">
                    <div className="flex items-center gap-1.5">
                      Item A
                      <span className="text-xs font-normal text-muted-foreground font-mono">
                        {idA.length > 12 ? idA.slice(0, 8) + '...' : idA}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="bg-muted/30 sticky top-0">
                    <div className="flex items-center gap-1.5">
                      Item B
                      <span className="text-xs font-normal text-muted-foreground font-mono">
                        {idB.length > 12 ? idB.slice(0, 8) + '...' : idB}
                      </span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allKeys.map((key, index) => {
                  const valA = items[0][key];
                  const valB = items[1][key];
                  const isDiff = !valuesAreEqual(valA, valB);
                  const isIdRow = key === 'id';

                  return (
                    <TableRow
                      key={key}
                      className={cn(
                        isIdRow && 'bg-primary/[0.03]',
                        isDiff && !isIdRow && 'bg-amber-500/[0.06]'
                      )}
                    >
                      <TableCell className={cn('font-medium text-sm', isDiff && !isIdRow && 'text-amber-700 dark:text-amber-400')}>
                        {getFieldLabel(key)}
                      </TableCell>
                      <TableCell className={cn(isDiff && !isIdRow && 'bg-amber-500/[0.04]')}>
                        {formatValue(valA)}
                      </TableCell>
                      <TableCell className={cn(isDiff && !isIdRow && 'bg-amber-500/[0.04]')}>
                        {formatValue(valB)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
