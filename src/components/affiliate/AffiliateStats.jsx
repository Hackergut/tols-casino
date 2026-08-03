import React from "react";
import { MousePointerClick, UserPlus, DollarSign, TrendingUp, Clock } from "lucide-react";

export default function AffiliateStats({ affiliate, referrals }) {
  const activeReferrals = referrals.filter((r) => r.status !== "inactive").length;
  const deposited = referrals.filter((r) => r.status === "deposited").length;

  const cards = [
    { label: "Click totali", value: affiliate?.total_clicks ?? 0, icon: MousePointerClick, accent: "text-white" },
    { label: "Registrazioni", value: affiliate?.total_referrals ?? referrals.length, icon: UserPlus, accent: "text-white" },
    { label: "Giocatori attivi", value: activeReferrals, icon: UserPlus, accent: "text-lime" },
    { label: "Volume scommesse", value: `$${(affiliate?.total_wagered ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, accent: "text-white" },
    { label: "Commissioni totali", value: `$${(affiliate?.total_commission ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: DollarSign, accent: "text-lime" },
    { label: "In attesa di payout", value: `$${(affiliate?.pending_commission ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: Clock, accent: "text-yellow-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="rounded-xl border border-white/10 bg-[#111] p-4">
            <Icon className={`w-5 h-5 ${c.accent} mb-2`} />
            <p className="text-xl font-black text-white tabular-nums">{c.value}</p>
            <p className="text-xs text-white/40 font-medium mt-0.5">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}