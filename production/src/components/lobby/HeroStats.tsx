"use client";

// Hero banner + live stats bar for the lobby — extracted from page.tsx (Phase 2).
import { Sparkles, Users, TrendingUp, Trophy, Gamepad2 } from "lucide-react";
import { formatNum, type CasinoStats } from "./lobby-types";

export function HeroBanner({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-lime/15 bg-gradient-to-br from-lime/10 via-surface to-lime/5">
      <div className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-lime" />
            <span className="text-xs font-bold uppercase tracking-widest text-lime">Featured Game</span>
          </div>
          <h2 className="mb-2 text-2xl font-black text-foreground sm:text-3xl">Crash X</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Provably fair crash game with 99% RTP. Watch the multiplier soar and cash out before it crashes!
          </p>
        </div>
        <button
          onClick={onPlay}
          className="btn-press shrink-0 rounded-xl bg-lime px-8 py-3 text-sm font-bold uppercase tracking-wide text-bg transition-transform hover:scale-105"
        >
          Play Now
        </button>
      </div>
      <div className="gradient-line w-full" />
    </div>
  );
}

const STAT_STYLES = {
  lime: { chip: "bg-lime/10", icon: "text-lime" },
  vip: { chip: "bg-vip/10", icon: "text-vip" },
  pending: { chip: "bg-pending/10", icon: "text-pending" },
  neutral: { chip: "bg-secondary", icon: "text-muted-foreground" },
} as const;

function StatCard({ tone, icon: Icon, label, value, valueClass }: {
  tone: keyof typeof STAT_STYLES;
  icon: typeof Users;
  label: string;
  value: string;
  valueClass?: string;
}) {
  const s = STAT_STYLES[tone];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-surface p-3">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.chip}`}>
        <Icon className={`h-4 w-4 ${s.icon}`} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`font-mono text-sm font-bold tabular-nums ${valueClass ?? "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}

export function LiveStatsBar({ stats }: { stats: CasinoStats | null }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard tone="lime" icon={Users} label="Online" value={stats ? formatNum(stats.onlinePlayers) : "—"} />
      <StatCard tone="vip" icon={TrendingUp} label="Total Bets" value={stats ? formatNum(stats.totalBets) : "—"} />
      <StatCard tone="pending" icon={Trophy} label="Jackpot" value={stats ? `$${formatNum(stats.jackpot)}` : "—"} valueClass="text-pending" />
      <StatCard tone="neutral" icon={Gamepad2} label="Wagered" value={stats ? `$${formatNum(stats.totalWagered)}` : "—"} />
    </div>
  );
}
