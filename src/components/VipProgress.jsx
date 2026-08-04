import React from "react";
import { Link } from "react-router-dom";
import { Crown } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { tierForWagered, nextTier } from "@/lib/vipTiers";

function useVipProgress() {
  const { wallet, vipTier } = useWallet();
  const wagered = wallet?.total_wagered || 0;
  const current = vipTier || tierForWagered(wagered);
  const next = nextTier(wagered);
  const progress = next
    ? Math.min(100, Math.max(0, ((wagered - current.min_wagered) / (next.min_wagered - current.min_wagered)) * 100))
    : 100;
  const remaining = next ? Math.max(0, next.min_wagered - wagered) : 0;
  return { current, next, progress, remaining, wagered };
}

// Compact badge for the header bar (hidden on mobile)
export function VipProgressBadge() {
  const { current, next, progress, remaining } = useVipProgress();
  return (
    <Link
      to="/vip"
      title={`VIP: ${current.name}${next ? ` → ${next.name}` : ""}`}
      className="hidden sm:flex flex-col justify-center py-1.5 px-3 rounded-xl border transition hover:opacity-90 shrink-0"
      style={{ borderColor: `${current.color}55` }}
    >
      <div className="flex items-center gap-1.5 leading-none" style={{ color: current.color }}>
        <Crown className="w-3.5 h-3.5" />
        <span className="text-xs font-black">{current.name}</span>
        {next && <span className="text-[10px] font-bold text-white/40 ml-0.5">→ {next.name}</span>}
      </div>
      <div className="mt-1 w-28 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${current.color}, ${next ? next.color : current.color})` }}
        />
      </div>
      <div className="mt-0.5 text-[9px] text-white/40 leading-none tabular-nums">
        {next ? `${remaining.toLocaleString()} USDT to go` : "MAX tier reached"}
      </div>
    </Link>
  );
}

// Fuller card for the profile dropdown
export function VipProgressCard() {
  const { current, next, progress, remaining, wagered } = useVipProgress();
  return (
    <Link to="/vip" className="block px-4 py-3 hover:bg-white/5 transition">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-sm font-black" style={{ color: current.color }}>
          <Crown className="w-4 h-4" /> {current.name}
        </span>
        {next ? (
          <span className="text-[11px] font-bold text-white/40">
            Next: <span style={{ color: next.color }}>{next.name}</span>
          </span>
        ) : (
          <span className="text-[11px] font-bold text-lime">MAX TIER</span>
        )}
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${current.color}, ${next ? next.color : current.color})` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-white/40 tabular-nums">
        <span>{wagered.toLocaleString()} USDT wagered</span>
        {next && <span>{remaining.toLocaleString()} to next</span>}
      </div>
    </Link>
  );
}