import React from "react";
import { Users } from "lucide-react";
import { computeCommission } from "@/lib/affiliate";

export default function ReferralTable({ referrals, plan, commission_rate = 25, cpa_amount = 50 }) {
  if (!referrals.length) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-8 sm:p-12 text-center">
        <Users className="w-10 h-10 mx-auto text-white/15 mb-3" />
        <p className="text-white/40 font-medium">No invited players yet</p>
        <p className="text-xs text-white/30 mt-1">Share your link to start earning</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] overflow-hidden">
      <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-white/5">
        <Users className="w-5 h-5 text-lime shrink-0" />
        <h3 className="font-bold text-white">Invited players</h3>
        <span className="ml-auto text-xs text-white/40">{referrals.length} players</span>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden divide-y divide-white/5">
        {referrals.map((r) => (
          <div key={r.id} className="p-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-sm font-bold text-lime shrink-0">
                {r.player_alias?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white/80 truncate">{r.player_alias}</p>
                <div className="mt-0.5"><StatusBadge status={r.status} /></div>
              </div>
              <p className="text-base font-black text-lime tabular-nums shrink-0">
                ${computeCommission(r, { plan, commission_rate, cpa_amount }).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Metric label="Wagered" value={`$${r.total_wagered.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              <Metric label="Net loss" value={`$${Math.max(0, r.net_loss).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-white/40 border-b border-white/5">
              <th className="px-5 py-3 font-semibold">Player</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Wagered</th>
              <th className="px-5 py-3 font-semibold text-right">Net Loss</th>
              <th className="px-5 py-3 font-semibold text-right">Commission</th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-lime/10 border border-lime/20 flex items-center justify-center text-xs font-bold text-lime">
                      {r.player_alias?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="font-semibold text-white/80">{r.player_alias}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3.5 text-right tabular-nums text-white/70">
                  ${r.total_wagered.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums text-white/70">
                  ${Math.max(0, r.net_loss).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums font-bold text-lime">
                  ${computeCommission(r, { plan, commission_rate, cpa_amount }).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg bg-[#080808] border border-white/5 px-3 py-2">
      <p className="text-[10px] text-white/40 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-white/70 tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { label: "Active", cls: "bg-lime/10 text-lime border-lime/20" },
    deposited: { label: "Deposited", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    inactive: { label: "Inactive", cls: "bg-white/5 text-white/40 border-white/10" },
  };
  const s = map[status] || map.active;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.cls}`}>{s.label}</span>;
}