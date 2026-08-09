'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useAdminStore, type AdminPage } from '@/stores/admin';
import {
  LayoutDashboard, Users, Wallet, ArrowDownToLine, ArrowUpFromLine,
  Gamepad2, Dice5, Play, Trophy, Timer, Store, Gem, Package,
  TrendingUp, UserPlus, Receipt, Settings, Shield, MessageSquare,
  BarChart3, Coins, Handshake, UserCheck, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type LucideIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface PageEntry {
  page: AdminPage;
  label: string;
  icon: LucideIcon;
  group: string;
}

const PAGES: PageEntry[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { page: 'users', label: 'Users', icon: Users, group: 'User Management' },
  { page: 'wallets', label: 'Wallets', icon: Wallet, group: 'User Management' },
  { page: 'deposits', label: 'Deposits', icon: ArrowDownToLine, group: 'Financial' },
  { page: 'withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine, group: 'Financial' },
  { page: 'house-earnings', label: 'House Earnings', icon: BarChart3, group: 'Financial' },
  { page: 'slot-games', label: 'Slot Games', icon: Gamepad2, group: 'Gaming' },
  { page: 'bets', label: 'Bets', icon: Dice5, group: 'Gaming' },
  { page: 'demo-sessions', label: 'Demo Sessions', icon: Play, group: 'Gaming' },
  { page: 'jackpot', label: 'Global Jackpot', icon: Trophy, group: 'Gaming' },
  { page: 'tournaments', label: 'Tournaments', icon: Timer, group: 'Tournaments' },
  { page: 'tournament-entries', label: 'Tournament Entries', icon: UserCheck, group: 'Tournaments' },
  { page: 'marketplace', label: 'Marketplace', icon: Store, group: 'Marketplace & NFTs' },
  { page: 'collectibles', label: 'Collectibles', icon: Gem, group: 'Marketplace & NFTs' },
  { page: 'card-packs', label: 'Card Packs', icon: Package, group: 'Marketplace & NFTs' },
  { page: 'card-pulls', label: 'Card Pulls', icon: Coins, group: 'Marketplace & NFTs' },
  { page: 'affiliates', label: 'Affiliates', icon: Handshake, group: 'Affiliate & Referral' },
  { page: 'referrals', label: 'Referrals', icon: UserPlus, group: 'Affiliate & Referral' },
  { page: 'commissions', label: 'Commissions', icon: Receipt, group: 'Affiliate & Referral' },
  { page: 'settings', label: 'Settings', icon: Settings, group: 'Platform' },
  { page: 'responsible-gaming', label: 'Responsible Gaming', icon: Shield, group: 'Platform' },
  { page: 'chat', label: 'Chat Messages', icon: MessageSquare, group: 'Platform' },
];

const GROUP_ORDER = [
  'Overview',
  'User Management',
  'Financial',
  'Gaming',
  'Tournaments',
  'Marketplace & NFTs',
  'Affiliate & Referral',
  'Platform',
];

// Module-level recent pages tracking (last 5 unique)
const MAX_RECENT = 5;
const recentPages: AdminPage[] = [];

export function pushRecentPage(page: AdminPage) {
  // Remove if already exists, then prepend
  const idx = recentPages.indexOf(page);
  if (idx > -1) recentPages.splice(idx, 1);
  recentPages.unshift(page);
  // Trim to max
  while (recentPages.length > MAX_RECENT) recentPages.pop();
}

// Module-level open callback so the header button can trigger it
let _openFn: (() => void) | null = null;
export function openCommandPalette() {
  _openFn?.();
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setCurrentPage, currentPage } = useAdminStore();

  // Register open function
  useEffect(() => {
    _openFn = () => setOpen(true);
    return () => { _openFn = null; };
  }, []);

  // Cmd+K / Ctrl+K to toggle
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const handleSelect = useCallback(
    (page: AdminPage) => {
      setCurrentPage(page);
      pushRecentPage(page);
      setOpen(false);
    },
    [setCurrentPage]
  );

  // Build recent entries (exclude current page)
  const recentEntries = recentPages
    .filter((p) => p !== currentPage)
    .slice(0, 5)
    .map((p) => PAGES.find((entry) => entry.page === p))
    .filter((e): e is PageEntry => !!e);

  // Group pages by group
  const groupedPages = GROUP_ORDER.map((group) => ({
    group,
    pages: PAGES.filter((p) => p.group === group),
  }));

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No pages found.</CommandEmpty>

        {/* Recently viewed */}
        {recentEntries.length > 0 && (
          <>
            <CommandGroup heading="Recently viewed">
              {recentEntries.map((entry) => (
                <CommandItem
                  key={`recent-${entry.page}`}
                  value={entry.label}
                  onSelect={() => handleSelect(entry.page)}
                >
                  <Clock className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{entry.label}</span>
                  <span className={cn(
                    'ml-auto text-xs text-muted-foreground',
                    entry.page === currentPage && 'text-primary font-medium'
                  )}>
                    {entry.group}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* All pages grouped */}
        {groupedPages.map(({ group, pages }) => (
          <CommandGroup key={group} heading={group}>
            {pages.map((entry) => {
              const Icon = entry.icon;
              return (
                <CommandItem
                  key={entry.page}
                  value={entry.label}
                  onSelect={() => handleSelect(entry.page)}
                  className={cn(
                    entry.page === currentPage && 'bg-accent/50'
                  )}
                >
                  <Icon className="mr-2 h-4 w-4 shrink-0" />
                  <span>{entry.label}</span>
                  {entry.page === currentPage && (
                    <span className="ml-auto text-xs text-primary font-medium">
                      Current
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
