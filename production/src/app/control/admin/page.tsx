'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAdminStore, PAGE_LABELS } from '@/stores/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, ShieldCheck } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Loading Spinner                                                    */
/* ------------------------------------------------------------------ */
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dynamic imports for ALL 32 admin modules (avoid OOM)               */
/* ------------------------------------------------------------------ */
const DashboardPage = dynamic(
  () => import('@/components/admin/modules/dashboard-page').then((m) => ({ default: m.DashboardPage })),
  { loading: () => <PageLoader /> },
);
const UsersPage = dynamic(
  () => import('@/components/admin/modules/users-page').then((m) => ({ default: m.UsersPage })),
  { loading: () => <PageLoader /> },
);
const DepositsPage = dynamic(
  () => import('@/components/admin/modules/deposits-page').then((m) => ({ default: m.DepositsPage })),
  { loading: () => <PageLoader /> },
);
const WithdrawalsPage = dynamic(
  () => import('@/components/admin/modules/withdrawals-page').then((m) => ({ default: m.WithdrawalsPage })),
  { loading: () => <PageLoader /> },
);
const WalletsPage = dynamic(
  () => import('@/components/admin/modules/wallets-page').then((m) => ({ default: m.WalletsPage })),
  { loading: () => <PageLoader /> },
);
const GamesCatalogPage = dynamic(
  () => import('@/components/admin/modules/games-catalog-page').then((m) => ({ default: m.GamesCatalogPage })),
  { loading: () => <PageLoader /> },
);
const SlotGamesPage = dynamic(
  () => import('@/components/admin/modules/slot-games-page').then((m) => ({ default: m.SlotGamesPage })),
  { loading: () => <PageLoader /> },
);
const CasinoLobbyPage = dynamic(
  () => import('@/components/admin/modules/casino-lobby-page').then((m) => ({ default: m.CasinoLobbyPage })),
  { loading: () => <PageLoader /> },
);
const BetsPage = dynamic(
  () => import('@/components/admin/modules/bets-page').then((m) => ({ default: m.BetsPage })),
  { loading: () => <PageLoader /> },
);
const DemoSessionsPage = dynamic(
  () => import('@/components/admin/modules/demo-sessions-page').then((m) => ({ default: m.DemoSessionsPage })),
  { loading: () => <PageLoader /> },
);
const JackpotPage = dynamic(
  () => import('@/components/admin/modules/jackpot-page').then((m) => ({ default: m.JackpotPage })),
  { loading: () => <PageLoader /> },
);
const TournamentsPage = dynamic(
  () => import('@/components/admin/modules/tournaments-page').then((m) => ({ default: m.TournamentsPage })),
  { loading: () => <PageLoader /> },
);
const TournamentEntriesPage = dynamic(
  () => import('@/components/admin/modules/tournament-entries-page').then((m) => ({ default: m.TournamentEntriesPage })),
  { loading: () => <PageLoader /> },
);
const MarketplacePage = dynamic(
  () => import('@/components/admin/modules/marketplace-page').then((m) => ({ default: m.MarketplacePage })),
  { loading: () => <PageLoader /> },
);
const CollectiblesPage = dynamic(
  () => import('@/components/admin/modules/collectibles-page').then((m) => ({ default: m.CollectiblesPage })),
  { loading: () => <PageLoader /> },
);
const CardPacksPage = dynamic(
  () => import('@/components/admin/modules/card-packs-page').then((m) => ({ default: m.CardPacksPage })),
  { loading: () => <PageLoader /> },
);
const CardPullsPage = dynamic(
  () => import('@/components/admin/modules/card-pulls-page').then((m) => ({ default: m.CardPullsPage })),
  { loading: () => <PageLoader /> },
);
const HouseEarningsPage = dynamic(
  () => import('@/components/admin/modules/house-earnings-page').then((m) => ({ default: m.HouseEarningsPage })),
  { loading: () => <PageLoader /> },
);
const AffiliatesPage = dynamic(
  () => import('@/components/admin/modules/affiliates-page').then((m) => ({ default: m.AffiliatesPage })),
  { loading: () => <PageLoader /> },
);
const ReferralsPage = dynamic(
  () => import('@/components/admin/modules/referrals-page').then((m) => ({ default: m.ReferralsPage })),
  { loading: () => <PageLoader /> },
);
const CommissionsPage = dynamic(
  () => import('@/components/admin/modules/commissions-page').then((m) => ({ default: m.CommissionsPage })),
  { loading: () => <PageLoader /> },
);
const SettingsPage = dynamic(
  () => import('@/components/admin/modules/settings-page').then((m) => ({ default: m.SettingsPage })),
  { loading: () => <PageLoader /> },
);
const ResponsibleGamingPage = dynamic(
  () => import('@/components/admin/modules/responsible-gaming-page').then((m) => ({ default: m.ResponsibleGamingPage })),
  { loading: () => <PageLoader /> },
);
const ChatPage = dynamic(
  () => import('@/components/admin/modules/chat-page').then((m) => ({ default: m.ChatPage })),
  { loading: () => <PageLoader /> },
);
const CrmTeamPage = dynamic(
  () => import('@/components/admin/modules/crm/crm-team-page').then((m) => ({ default: m.CrmTeamPage })),
  { loading: () => <PageLoader /> },
);
const CrmTasksPage = dynamic(
  () => import('@/components/admin/modules/crm/crm-tasks-page').then((m) => ({ default: m.CrmTasksPage })),
  { loading: () => <PageLoader /> },
);
const CrmChatPage = dynamic(
  () => import('@/components/admin/modules/crm/crm-chat-page').then((m) => ({ default: m.CrmChatPage })),
  { loading: () => <PageLoader /> },
);
const CrmEmailsPage = dynamic(
  () => import('@/components/admin/modules/crm/crm-emails-page').then((m) => ({ default: m.CrmEmailsPage })),
  { loading: () => <PageLoader /> },
);
const PlayerAnalyticsPage = dynamic(
  () => import('@/components/admin/modules/ops/player-analytics-page').then((m) => ({ default: m.PlayerAnalyticsPage })),
  { loading: () => <PageLoader /> },
);
const OpControlsPage = dynamic(
  () => import('@/components/admin/modules/ops/op-controls-page').then((m) => ({ default: m.OpControlsPage })),
  { loading: () => <PageLoader /> },
);
const DepositTrackerPage = dynamic(
  () => import('@/components/admin/modules/ops/deposit-tracker-page').then((m) => ({ default: m.DepositTrackerPage })),
  { loading: () => <PageLoader /> },
);
const TelegramAlertsPage = dynamic(
  () => import('@/components/admin/modules/ops/telegram-alerts-page').then((m) => ({ default: m.TelegramAlertsPage })),
  { loading: () => <PageLoader /> },
);

/* ------------------------------------------------------------------ */
/*  Page Router                                                        */
/* ------------------------------------------------------------------ */
function PageRouter() {
  const { currentPage } = useAdminStore();

  switch (currentPage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'users':
      return <UsersPage />;
    case 'deposits':
      return <DepositsPage />;
    case 'withdrawals':
      return <WithdrawalsPage />;
    case 'wallets':
      return <WalletsPage />;
    case 'games-catalog':
      return <GamesCatalogPage />;
    case 'slot-games':
      return <SlotGamesPage />;
    case 'casino-lobby':
      return <CasinoLobbyPage />;
    case 'bets':
      return <BetsPage />;
    case 'demo-sessions':
      return <DemoSessionsPage />;
    case 'jackpot':
      return <JackpotPage />;
    case 'tournaments':
      return <TournamentsPage />;
    case 'tournament-entries':
      return <TournamentEntriesPage />;
    case 'marketplace':
      return <MarketplacePage />;
    case 'collectibles':
      return <CollectiblesPage />;
    case 'card-packs':
      return <CardPacksPage />;
    case 'card-pulls':
      return <CardPullsPage />;
    case 'house-earnings':
      return <HouseEarningsPage />;
    case 'affiliates':
      return <AffiliatesPage />;
    case 'referrals':
      return <ReferralsPage />;
    case 'commissions':
      return <CommissionsPage />;
    case 'settings':
      return <SettingsPage />;
    case 'responsible-gaming':
      return <ResponsibleGamingPage />;
    case 'chat':
      return <ChatPage />;
    case 'crm-team':
      return <CrmTeamPage />;
    case 'crm-tasks':
      return <CrmTasksPage />;
    case 'crm-chat':
      return <CrmChatPage />;
    case 'crm-emails':
      return <CrmEmailsPage />;
    case 'player-analytics':
      return <PlayerAnalyticsPage />;
    case 'op-controls':
      return <OpControlsPage />;
    case 'deposit-tracker':
      return <DepositTrackerPage />;
    case 'telegram-alerts':
      return <TelegramAlertsPage />;
    default:
      return <DashboardPage />;
  }
}

/* ------------------------------------------------------------------ */
/*  Password Gate                                                       */
/* ------------------------------------------------------------------ */
function PasswordGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const valid = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin2024';
      if (password === valid) {
        try {
          localStorage.setItem('tols_admin_auth', 'true');
        } catch {
          /* noop */
        }
        window.location.reload();
      } else {
        setError('Invalid password');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    },
    [password],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background">
      <div
        className={`w-full max-w-sm rounded-xl border border-border/50 bg-card p-8 shadow-2xl ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-3 shadow-lg shadow-primary/20">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">Admin Access</h1>
          <p className="text-xs text-muted-foreground mt-1">Enter admin password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Password"
            autoFocus
            className="h-11"
          />
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <Button type="submit" className="w-full h-11 font-semibold">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Header with logout                                             */
/* ------------------------------------------------------------------ */
function PageHeader() {
  const { currentPage } = useAdminStore();
  const label = PAGE_LABELS[currentPage] || 'Dashboard';

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem('tols_admin_auth');
    } catch {
      /* noop */
    }
    window.location.reload();
  }, []);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-muted-foreground hover:text-destructive gap-1.5"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Default Export                                                      */
/* ------------------------------------------------------------------ */
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('tols_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  if (!authenticated) {
    return <PasswordGate />;
  }

  return (
    <>
      <PageHeader />
      <PageRouter />
    </>
  );
}
