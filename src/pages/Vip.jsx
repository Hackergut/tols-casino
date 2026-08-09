import React from "react";
import { Link } from "react-router-dom";
import { Crown, TrendingUp, Gift, Percent, ChevronLeft, Sparkles } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { VIP_TIERS, tierForWagered, nextTier } from "@/lib/vipTiers";
import AchievementsPanel from "@/components/AchievementsPanel";

export default function Vip() {
  const { wallet } = useWallet();
  const wagered = wallet?.total_wagered || 0;
  const current = tierForWagered(wagered);
  const next = nextTier(wagered);
  const progress = next
    ? Math.min(100, Math.max(0, ((wagered - current.min_wagered) / (next.min_wagered - current.min_wagered)) * 100))
    : 100;
  const remaining = next ? Math.max(0, next.min_wagered - wagered) : 0;

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-lime transition mb-6">
          <ChevronLeft className="w-4 h-4" /> Back to lobby
        </Link>

        {/* Current tier card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] p-6 sm:p-8 mb-8">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
            <div
              className="flex items-center justify-center w-20 h-20 rounded-2xl shrink-0"
              style={{ background: `${current.color}22`, border: `1px solid ${current.color}` }}
            >
              <Crown className="w-10 h-10" style={{ color: current.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Current tier
              </div>
              <h1 className="text-3xl sm:text-4xl font-black italic" style={{ color: current.color, textShadow: `0 0 24px ${current.color}55` }}>
                {current.name}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1.5 text-white/70">
                  <TrendingUp className="w-4 h-4 text-lime" />
                  Wagered volume: <b className="text-white tabular-nums">{wagered.toLocaleString()} USDT</b>
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <Percent className="w-4 h-4 text-lime" />
                  Cashback: <b className="text-white">{(current.cashback * 100).toFixed(0)}%</b>
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <Gift className="w-4 h-4 text-lime" />
                  Bonus multiplier: <b className="text-white">×{current.multiplier.toFixed(2)}</b>
                </span>
              </div>
            </div>
          </div>

          {/* Progress to next tier */}
          {next ? (
            <div className="relative mt-6">
              <div className="flex justify-between text-xs text-white/50 mb-2">
                <span>Next tier: <b style={{ color: next.color }}>{next.name}</b></span>
                <span className="tabular-nums">{remaining.toLocaleString()} USDT to go</span>
              </div>
              <div className="h-3 rounded-full bg-[#0d0d0d] border border-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${current.color}, ${next.color})`, boxShadow: `0 0 16px ${next.color}66` }}
                />
              </div>
            </div>
          ) : (
            <div className="relative mt-6 text-sm font-bold text-lime flex items-center gap-2">
              <Crown className="w-4 h-4" /> Max tier reached — enjoy all Diamond benefits!
            </div>
          )}
        </div>

        {/* Tiers table */}
        <h2 className="text-lg font-bold text-white/80 mb-4">All tiers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {VIP_TIERS.map((t) => {
            const reached = wagered >= t.min_wagered;
            const isCurrent = t.level === current.level;
            return (
              <div
                key={t.level}
                className={`relative rounded-xl border p-4 transition ${
                  isCurrent ? "border-lime/50 bg-lime/5" : reached ? "border-white/15 bg-[#1a1a1a]" : "border-white/5 bg-[#141414] opacity-70"
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5" style={{ color: t.color }} />
                  <span className="font-black text-lg" style={{ color: t.color }}>{t.name}</span>
                  {isCurrent && <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime text-black">CURRENT</span>}
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-white/60">
                    <span>Required volume</span>
                    <span className="text-white tabular-nums">{t.min_wagered.toLocaleString()} USDT</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Loss cashback</span>
                    <span className="text-white">{(t.cashback * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Bonus multiplier</span>
                    <span className="text-white">×{t.multiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Bonus level-up</span>
                    <span className="text-lime tabular-nums">+{t.level_up_bonus.toLocaleString()} USDT</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <AchievementsPanel />
        </div>

        <p className="text-xs text-white/40 mt-6 leading-relaxed">
          Your VIP tier is automatically calculated on total wagered volume. Reaching a new tier instantly credits the level-up bonus to your balance.
          Cashback is calculated on net losses and the bonus multiplier applies to rewards.
        </p>
      </div>
    </div>
  );
}