import React from "react";
import { MousePointerClick, UserPlus, DollarSign, TrendingUp, Clock } from "lucide-react";

export default function AffiliateStats({ affiliate, referrals }) {
  const clicks = affiliate?.total_clicks ?? 0;
  const conversions = referrals.filter((r) => r.status === "deposited").length;
  const conversionRate = clicks > 0 ? ((conversions / clicks) * 100).toFixed(1) : "0.0";

  const cards = [
    { label: "Total clicks", value: clicks, icon: MousePointerClick, accent: "text-white" },
    { label: "Signups", value: affiliate?.total_referrals ?? referrals.length, icon: UserPlus, accent: "text-white" },
    { label: "Conversions", value: conversions, sub: `${conversionRate}% rate`, icon: UserPlus, accent: "text-lime" },
    { label: "Wagering volume", value: `$${(affiliate?.total_wagered ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: TrendingUp, accent: "text-white" },
    { label: "Total commissions", value: `$${(affiliate?.total_commission ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: DollarSign, accent: "text-lime" },
    { label: "Pending payout", value: `$${(affiliate?.pending_commission ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: Clock, accent: "text-yellow-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="rounded-xl border border-white/10 bg-[#111] p-3 sm:p-4">
            <Icon className={`w-5 h-5 ${c.accent} mb-1.5 sm:mb-2`} />
            <p className="text-lg sm:text-xl font-black text-white tabular-nums leading-tight">{c.value}</p>
            <p className="text-[11px] sm:text-xs text-white/40 font-medium mt-0.5 leading-tight">{c.label}</p>
            {c.sub && <p className="text-[10px] text-lime/80 font-bold mt-0.5">{c.sub}</p>}
          </div>
        );
      })}
    </div>
  );
}