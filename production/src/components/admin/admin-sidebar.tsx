'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Gamepad2,
  Dice1,
  Play,
  Trophy,
  UserCheck,
  Store,
  Gem,
  Package,
  HandCoins,
  Handshake,
  UserPlus,
  Receipt,
  Settings,
  Shield,
  MessageSquare,
  Sun,
  Moon,
  ChevronLeft,
  ChevronDown,
  Coins,
  Menu,
  CheckSquare,
  MessageCircle,
  Mail,
  BarChart3,
  Sliders,
  TrendingUp,
  Bell,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStore, type AdminPage } from '@/stores/admin';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

const NAV_DESCRIPTIONS: Record<AdminPage, string> = {
  dashboard: 'Platform overview and key metrics',
  users: 'Manage user accounts and profiles',
  wallets: 'View and manage user wallets',
  deposits: 'View deposit transactions',
  withdrawals: 'Process withdrawal requests',
  'house-earnings': 'Platform revenue analytics',
  'slot-games': 'Manage slot game library',
  'games-catalog': 'Full game catalog with 375+ slots & original games',
  'casino-lobby': 'Full casino frontend — lobby, games, betting, wallet',
  bets: 'View betting history and details',
  'demo-sessions': 'Track demo play sessions',
  jackpot: 'Global jackpot configuration',
  tournaments: 'Manage tournament events',
  'tournament-entries': 'View tournament participation',
  marketplace: 'Marketplace listings and orders',
  collectibles: 'Manage NFT collectibles',
  'card-packs': 'Configure card pack offerings',
  'card-pulls': 'Track card pull history',
  affiliates: 'Manage affiliate partnerships',
  referrals: 'Track referral program activity',
  commissions: 'Commission payouts and history',
  settings: 'Platform configuration',
  'responsible-gaming': 'Responsible gaming policies',
  chat: 'View chat messages and moderation',
  'crm-team': 'Internal team management and roles',
  'crm-tasks': 'Task board with assignments and mentions',
  'crm-chat': 'Internal team chat and messaging',
  'crm-emails': 'Email inbox, compose and templates',
  'player-analytics': 'Player streaks, win/loss analytics',
  'op-controls': 'Control player outcomes and RTP',
  'deposit-tracker': 'Deposit tracking by registration',
  'telegram-alerts': 'Telegram notification alerts',
};

interface NavGroup {
  label: string;
  items: { page: AdminPage; label: string; icon: React.ReactNode; badge?: boolean }[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Overview',
    items: [{ page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> }],
  },
  {
    label: 'User Management',
    items: [
      { page: 'users', label: 'Users', icon: <Users className="h-4 w-4" /> },
      { page: 'wallets', label: 'Wallets', icon: <Wallet className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Financial',
    items: [
      { page: 'deposits', label: 'Deposits', icon: <ArrowDownToLine className="h-4 w-4" /> },
      { page: 'withdrawals', label: 'Withdrawals', icon: <ArrowUpFromLine className="h-4 w-4" />, badge: true },
      { page: 'house-earnings', label: 'House Earnings', icon: <HandCoins className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Gaming',
    items: [
      { page: 'casino-lobby', label: 'Casino', icon: <Gamepad2 className="h-4 w-4" />, badge: true },
      { page: 'games-catalog', label: 'Games Catalog', icon: <Layers className="h-4 w-4" /> },
      { page: 'slot-games', label: 'Slot Games', icon: <Dice1 className="h-4 w-4" /> },
      { page: 'bets', label: 'Bets', icon: <Dice1 className="h-4 w-4" />, badge: true },
      { page: 'demo-sessions', label: 'Demo Sessions', icon: <Play className="h-4 w-4" /> },
      { page: 'jackpot', label: 'Global Jackpot', icon: <Trophy className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Tournaments',
    items: [
      { page: 'tournaments', label: 'Tournaments', icon: <Trophy className="h-4 w-4" /> },
      { page: 'tournament-entries', label: 'Entries', icon: <UserCheck className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Marketplace & NFTs',
    items: [
      { page: 'marketplace', label: 'Marketplace', icon: <Store className="h-4 w-4" /> },
      { page: 'collectibles', label: 'Collectibles', icon: <Gem className="h-4 w-4" /> },
      { page: 'card-packs', label: 'Card Packs', icon: <Package className="h-4 w-4" /> },
      { page: 'card-pulls', label: 'Card Pulls', icon: <Handshake className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Affiliate & Referral',
    items: [
      { page: 'affiliates', label: 'Affiliates', icon: <Handshake className="h-4 w-4" /> },
      { page: 'referrals', label: 'Referrals', icon: <UserPlus className="h-4 w-4" /> },
      { page: 'commissions', label: 'Commissions', icon: <Receipt className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Platform',
    items: [
      { page: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
      { page: 'responsible-gaming', label: 'Responsible Gaming', icon: <Shield className="h-4 w-4" /> },
      { page: 'chat', label: 'Chat Messages', icon: <MessageSquare className="h-4 w-4" /> },
    ],
  },
  {
    label: 'CRM & Team',
    items: [
      { page: 'crm-team', label: 'Team CRM', icon: <Users className="h-4 w-4" /> },
      { page: 'crm-tasks', label: 'Tasks', icon: <CheckSquare className="h-4 w-4" />, badge: true },
      { page: 'crm-chat', label: 'Team Chat', icon: <MessageCircle className="h-4 w-4" /> },
      { page: 'crm-emails', label: 'Emails', icon: <Mail className="h-4 w-4" /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { page: 'player-analytics', label: 'Player Analytics', icon: <BarChart3 className="h-4 w-4" />, badge: true },
      { page: 'op-controls', label: 'Ops Control', icon: <Sliders className="h-4 w-4" /> },
      { page: 'deposit-tracker', label: 'Deposit Tracker', icon: <TrendingUp className="h-4 w-4" /> },
      { page: 'telegram-alerts', label: 'Telegram Alerts', icon: <Bell className="h-4 w-4" />, badge: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Noise SVG data-URL used as a subtle texture overlay                 */
/* ------------------------------------------------------------------ */
const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ------------------------------------------------------------------ */
/*  Group Header   collapsible with rotating chevron                   */
/* ------------------------------------------------------------------ */
function NavGroupHeader({
  label,
  isExpanded,
  onToggle,
}: {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="group/ghdr relative flex w-full items-center gap-2 px-3 pb-1.5 pt-3 cursor-pointer"
      aria-expanded={isExpanded}
    >
      <motion.span
        className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80 flex-1 text-left"
      >
        {label}
      </motion.span>
      <motion.div
        animate={{ rotate: isExpanded ? 0 : -90 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="text-muted-foreground/50"
      >
        <ChevronDown className="h-3 w-3" />
      </motion.div>
      {/* gradient underline decoration */}
      <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Single Nav Item                                                     */
/* ------------------------------------------------------------------ */
function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavGroup['items'][number];
  isActive: boolean;
  collapsed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 rounded-lg text-sm font-medium relative group/navitem',
        collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2.5 min-h-12',
        'transition-all duration-200',
        /* base → hover gradient slides from left */
        !isActive && 'text-muted-foreground hover:text-foreground',
        /* active state text color */
        isActive && 'text-primary'
      )}
    >
      {/* Hover: gradient background that slides in from left */}
      <span className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
        <span
          className={cn(
            'absolute inset-0 -translate-x-full group-hover/navitem:translate-x-0 transition-transform duration-300 ease-out',
            isActive
              ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-transparent'
              : 'bg-gradient-to-r from-accent/60 via-accent/30 to-transparent'
          )}
        />
      </span>

      {/* Active: pill-shaped slide-in highlight */}
      {isActive && (
        <motion.div
          layoutId="active-nav-pill"
          className="absolute inset-0 rounded-lg bg-primary/[0.08]"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}

      {/* Active: glowing left border indicator */}
      {isActive && (
        <motion.span
          layoutId="active-nav-border"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            boxShadow: '0 0 8px 2px hsl(var(--primary) / 0.45)',
          }}
        />
      )}

      {/* icon */}
      <span className="relative z-10 transition-transform duration-200 group-hover/navitem:scale-110">
        {item.icon}
      </span>

      {/* label */}
      {!collapsed && (
        <span className="relative z-10 truncate flex-1 text-left">{item.label}</span>
      )}

      {/* badge */}
      {item.badge && (
        <span
          className={cn(
            'relative z-10 w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse',
            collapsed && 'absolute top-1.5 right-1.5'
          )}
        />
      )}

      {/* Hover: glow / shadow effect */}
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover/navitem:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: '0 0 14px 0px hsl(var(--primary)/0.12)' }} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile Sidebar Navigation                                          */
/* ------------------------------------------------------------------ */
function MobileSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { currentPage, setCurrentPage } = useAdminStore();

  return (
    <ScrollArea className="flex-1 py-2 px-2">
      <nav className="space-y-0.5">
        {navGroups.map((group, gi) => (
          <React.Fragment key={group.label}>
            {gi > 0 && <div className="my-2 h-px bg-border/30 mx-1" />}
            {/* Mobile: always show group label (no collapse) */}
            <div className="relative px-3 pt-3 pb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">
                {group.label}
              </span>
              <span className="absolute bottom-0 left-3 right-3 h-px bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
            </div>
            {group.items.map((item) => {
              const isActive = currentPage === item.page;
              return (
                <NavItem
                  key={item.page}
                  item={item}
                  isActive={isActive}
                  onClick={() => {
                    setCurrentPage(item.page);
                    onNavigate?.();
                  }}
                />
              );
            })}
          </React.Fragment>
        ))}
      </nav>
    </ScrollArea>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme Toggle   rotating icon + glow                                */
/* ------------------------------------------------------------------ */
function ThemeToggleButton({
  collapsed,
  onClick,
}: {
  collapsed?: boolean;
  onClick: () => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        'text-muted-foreground hover:text-foreground hover:bg-accent/50',
        collapsed ? 'justify-center px-2' : 'justify-start',
        'group/theme-btn relative'
      )}
    >
      {/* glow on hover */}
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover/theme-btn:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: '0 0 18px 2px hsl(var(--primary)/0.18)' }} />
      <motion.span
        animate={{ rotate: isDark ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative z-10"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </motion.span>
      {!collapsed && <span className="relative z-10 ml-2">Toggle Theme</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapse Toggle   rotating chevron + visual feedback               */
/* ------------------------------------------------------------------ */
function CollapseButton({
  sidebarOpen,
  onClick,
}: {
  sidebarOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
        'text-muted-foreground hover:text-foreground hover:bg-accent/50',
        sidebarOpen ? 'justify-start' : 'justify-center px-2',
        'group/collapse-btn relative'
      )}
    >
      {/* subtle glow on hover */}
      <span className="absolute inset-0 rounded-lg opacity-0 group-hover/collapse-btn:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: '0 0 14px 2px hsl(var(--primary)/0.12)' }} />
      <motion.span
        animate={{ rotate: sidebarOpen ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        className="relative z-10"
      >
        <ChevronLeft className="h-4 w-4" />
      </motion.span>
      {sidebarOpen && <span className="relative z-10 ml-2">Collapse</span>}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop Sidebar Navigation                                          */
/* ------------------------------------------------------------------ */
function DesktopSidebarNav({
  currentPage,
  setCurrentPage,
  sidebarOpen,
}: {
  currentPage: AdminPage;
  setCurrentPage: (page: AdminPage) => void;
  sidebarOpen: boolean;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      initial[g.label] = true;
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <ScrollArea className="h-full py-2 px-2">
      <nav className="space-y-0.5">
        {navGroups.map((group, gi) => {
          const isGroupExpanded = expandedGroups[group.label] ?? true;

          return (
            <React.Fragment key={group.label}>
              {gi > 0 && <div className="my-2 h-px bg-border/30 mx-1" />}
              {sidebarOpen && (
                <NavGroupHeader
                  label={group.label}
                  isExpanded={isGroupExpanded}
                  onToggle={() => toggleGroup(group.label)}
                />
              )}
              {!sidebarOpen && gi > 0 && <div className="py-1" />}
              <AnimatePresence initial={false}>
                {(!sidebarOpen || isGroupExpanded) && (
                  <motion.div
                    key={`${group.label}-items`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    {group.items.map((item) => {
                      const isActive = currentPage === item.page;
                      return (
                        <Tooltip key={item.page}>
                          <TooltipTrigger asChild>
                            <NavItem
                              item={item}
                              isActive={isActive}
                              collapsed={!sidebarOpen}
                              onClick={() => setCurrentPage(item.page)}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px]">
                              {NAV_DESCRIPTIONS[item.page]}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          );
        })}
      </nav>
    </ScrollArea>
  );
}

/** Mobile hamburger button to be placed in the sticky header */
export function MobileMenuButton() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  if (!isMobile) return null;

  return (
    <>
      {/* Backdrop blur on sheet overlay + smoother slide-in timing */}
      <style>{`
        [data-slot="sheet-overlay"] {
          -webkit-backdrop-filter: blur(8px) saturate(1.2);
          backdrop-filter: blur(8px) saturate(1.2);
          background: rgba(0,0,0,0.4) !important;
        }
        [data-side="left"][data-slot="sheet-content"] {
          transition-timing-function: cubic-bezier(0.32, 0.72, 0, 1) !important;
        }
      `}</style>
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-gradient-to-b from-card via-card to-card/95"
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {/* Brand header */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
              <Coins className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div className="flex flex-col group/brand">
              <span className="font-bold text-base tracking-tight leading-tight transition-opacity duration-200 group-hover/brand:opacity-70">
                TOLS Admin
              </span>
              <span className="text-[10px] text-muted-foreground/70 leading-tight transition-opacity duration-200 group-hover/brand:opacity-100">
                Management Console
              </span>
            </div>
          </div>
          {/* Navigation   items get min-h-12 for better touch targets */}
          <MobileSidebarNav onNavigate={() => setOpen(false)} />
          {/* Footer controls */}
          <div className="border-t border-border/50 p-2 space-y-1 shrink-0">
            <div className="min-h-12 flex items-center">
              <ThemeToggleButton
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Desktop sidebar   hidden on mobile */
export function AdminSidebar() {
  const isMobile = useIsMobile();
  const { currentPage, setCurrentPage, sidebarOpen, toggleSidebar } = useAdminStore();
  const { theme, setTheme } = useTheme();

  if (isMobile) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <style>{`
        .sidebar-noise {
          background-image: ${NOISE_TEXTURE};
          background-repeat: repeat;
          background-size: 128px 128px;
        }
      `}</style>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex flex-col border-r border-border/50 relative',
          sidebarOpen ? 'w-64' : 'w-16',
          'shadow-[4px_0_24px_-4px_rgba(0,0,0,0.08)]'
        )}
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-card" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-background/80" />
        <div className="absolute inset-0 sidebar-noise" />

        {/* Content sits above background */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Subtle gradient line at top of sidebar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />

          {/* Logo / Brand */}
          <div className="flex items-center gap-3 px-4 h-14 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/20">
              <Coins className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div
              className={cn(
                'flex flex-col group/brand overflow-hidden transition-all duration-300',
                sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'
              )}
            >
              <span className="font-bold text-base tracking-tight leading-tight transition-opacity duration-200 group-hover/brand:opacity-70 whitespace-nowrap">
                TOLS Admin
              </span>
              <span className="text-[10px] text-muted-foreground/70 leading-tight transition-opacity duration-200 group-hover/brand:opacity-100 whitespace-nowrap">
                Management Console
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-hidden">
            <DesktopSidebarNav
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              sidebarOpen={sidebarOpen}
            />
          </div>

          {/* Footer Controls */}
          <div className="border-t border-border/50 p-2 space-y-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <ThemeToggleButton
                  collapsed={!sidebarOpen}
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Toggle Theme</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <CollapseButton sidebarOpen={sidebarOpen} onClick={toggleSidebar} />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{sidebarOpen ? 'Collapse' : 'Expand'} Sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
