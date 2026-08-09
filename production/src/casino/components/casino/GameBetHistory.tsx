"use client";

import { useQuery } from "@tanstack/react-query";
import { History, TrendingUp } from "lucide-react";
import { formatCurrency, timeAgo } from "@/lib/types";

interface BetItem {
  id: string;
  gameName: string;
  amount: number;
  multiplier: number;
  payout: number;
  result: "win" | "lose";
  createdAt: string;
}

export function GameBetHistory({ gameSlug, gameName }: { gameSlug: string; gameName: string }) {
  const { data } = useQuery<{ total: number; bets: BetItem[] }>({
    queryKey: ["game-history", gameSlug],
    queryFn: async () => {
      const r = await fetch(`/api/bets/history?game=${gameSlug}&limit=10`);
      const j = await r.json();
      return j.data;
    },
    refetchInterval: 5000,
  });

  const bets = data?.bets || [];
  if (bets.length === 0) return null;

  const wins = bets.filter((b) => b.result === "win").length;
  const totalWagered = bets.reduce((s, b) => s + b.amount, 0);

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border/50 bg-card/40">
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-muted-foreground" />
          <span className=" text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your Recent {gameName} Bets
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span>{wins}/{bets.length} wins</span>
          <span>{formatCurrency(totalWagered)} wagered</span>
        </div>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {bets.map((b) => {
          const won = b.result === "win";
          return (
            <div key={b.id} className="flex items-center gap-3 border-b border-border/30 px-3 py-1.5 text-xs transition-colors hover:bg-secondary/30">
              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${won ? "bg-lime/10 text-lime" : "bg-red-500/10 text-red-400"}`} style={won ? { background: "color-mix(in oklab, var(--color-lime) 10%, transparent)", color: "var(--color-lime)" } : {}}>
                {won ? "W" : "L"}
              </span>
              <span className="font-mono text-muted-foreground">{formatCurrency(b.amount)}</span>
              <span className="font-mono font-bold" style={{ color: won ? "var(--color-lime)" : "var(--color-muted-foreground)" }}>
                {b.multiplier > 0 ? `${b.multiplier.toFixed(2)}×` : "—"}
              </span>
              <span className="flex-1 text-right font-mono font-bold" style={{ color: won ? "var(--color-lime)" : "var(--color-loss)" }}>
                {won ? "+" + formatCurrency(b.payout) : "—"}
              </span>
              <span className="w-12 text-right text-[10px] text-muted-foreground">{timeAgo(b.createdAt)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
