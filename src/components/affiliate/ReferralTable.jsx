import React from "react";
import { Users } from "lucide-react";

export default function ReferralTable({ referrals, plan }) {
  const computeCommission = (r) => {
    if (plan === "cpa") return r.status === "deposited" ? 50 : 0;
    if (plan === "hybrid") return (r.status === "deposited" ? 50 : 0) + Math.max(0, r.net_loss) * 0.25;
    // revshare
    return Math.max(0, r.net_loss) * 0.25;
  };

  if (!referrals.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-12 text-center">
        <Users className="w-10 h-10 mx-auto text-white/15 mb-3" />
        <p className="text-white/40 font-medium">No invited players yet</p>
        <p className="text-xs text-white/30 mt-1">Share your link to start earning</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
      <div className="flex items-center gap-2 p-5 border-b border-white/5">
        <Users className="w-5 h-5 text-lime" />
        <h3 className="font-bold text-white">Invited players</h3>
        <span className="ml-auto text-xs text-white/40">{referrals.length} players</span>
      </div>
      <div className="overflow-x-auto">
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
                <td className="px-5 py-3.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums text-white/70">
                  ${r.total_wagered.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums text-white/70">
                  ${Math.max(0, r.net_loss).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className="px-5 py-3.5 text-right tabular-nums font-bold text-lime">
                  ${computeCommission(r).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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