"use client";

// Lobby view: hero, stats, category tabs, games grid, live bets — extracted from page.tsx (Phase 2).
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { springs } from "@/casino/lib/motion";
import { HeroBanner, LiveStatsBar } from "./HeroStats";
import { LobbyGameCard } from "./GameCards";
import { CATEGORY_TABS, timeAgo, type CasinoStats, type LiveBet, type LobbyGame } from "./lobby-types";

export function LiveBetRow({ bet }: { bet: LiveBet }) {
  const won = bet.result === "win";
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/30">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
          style={{ background: bet.avatarColor + "30", color: bet.avatarColor }}
        >
          {bet.username[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground/70">{bet.username}</p>
          <p className="text-[10px] text-muted-foreground/70">{bet.gameName} · {timeAgo(bet.createdAt)}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-xs tabular-nums text-muted-foreground">${bet.amount.toFixed(2)}</span>
        <span className={`font-mono text-xs font-bold tabular-nums ${won ? "text-win" : "text-loss"}`}>
          {won ? "+" : ""}{(bet.payout - bet.amount).toFixed(2)}
        </span>
        <span className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums ${won ? "bg-win/10 text-win" : "bg-loss/10 text-loss"}`}>
          {bet.multiplier > 0 ? `${bet.multiplier.toFixed(2)}x` : "—"}
        </span>
      </div>
    </div>
  );
}

export function GamesGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton-shimmer aspect-[3/4] rounded-xl bg-surface" />
      ))}
    </div>
  );
}

export function EmptyGames({ label }: { label: string }) {
  return (
    <div className="py-16 text-center">
      <Gamepad2 className="mx-auto mb-3 h-12 w-12 text-lime/20" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function LobbyView({ games, loading, stats, liveBets, onGameClick, onPlayCrash }: {
  games: LobbyGame[];
  loading: boolean;
  stats: CasinoStats | null;
  liveBets: LiveBet[];
  onGameClick: (game: LobbyGame) => void;
  onPlayCrash: () => void;
}) {
  const [activeTab, setActiveTab] = useState("All");
  const reduced = useReducedMotion();

  const filteredGames = games.filter((g) => {
    switch (activeTab) {
      case "Popular": return g.popularity > 50;
      case "New": return g.isNew;
      case "Slots": return g.gameType === "external_slot";
      case "Originals": return g.gameType === "original";
      case "Live": return g.isLive;
      default: return true;
    }
  });

  return (
    <div className="space-y-6">
      <HeroBanner onPlay={onPlayCrash} />
      <LiveStatsBar stats={stats} />

      {/* Category Tabs */}
      <div className="scrollbar-hide -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative shrink-0 whitespace-nowrap rounded-lg border border-transparent px-4 py-2 text-xs font-semibold transition-colors duration-[var(--dur-fast)] ${
              activeTab === tab ? "text-lime" : "bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            {activeTab === tab && (
              <motion.span
                layoutId="lobby-cat-tab"
                transition={reduced ? { duration: 0 } : springs.snappy}
                className="absolute inset-0 rounded-lg border border-lime/20 bg-lime/10"
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        ))}
      </div>

      {/* Games Grid */}
      {loading ? (
        <GamesGridSkeleton />
      ) : filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredGames.map((game, i) => (
            <LobbyGameCard key={game.id || i} game={game} onClick={() => onGameClick(game)} />
          ))}
        </div>
      ) : (
        <EmptyGames label="No games in this category" />
      )}

      {/* Live Bets Feed */}
      {liveBets.length > 0 && (
        <div className="rounded-xl border border-lime/10 bg-surface p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-win" />
            <h3 className="text-sm font-semibold text-foreground/70">Live Bets</h3>
          </div>
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {liveBets.map((bet) => (
              <LiveBetRow key={bet.id} bet={bet} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
