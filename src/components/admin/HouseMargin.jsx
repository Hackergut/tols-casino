import React, { useMemo } from "react";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";
import { RTP_ORIGINALS } from "@/lib/gameEngine";

// Theoretical RTP for a game_id (originals/table from the calibrated engine).
function theoreticalRtpFor(gid) {
  if (gid && RTP_ORIGINALS[gid] != null) return RTP_ORIGINALS[gid];
  return null;
}

export default function HouseMargin({ earnings = [] }) {
  const rows = useMemo(() => {
    const map = {};
    earnings.forEach((e) => {
      const gid = (e.game_id || "").toLowerCase();
      const key = gid || (e.game_name || "unknown").toLowerCase();
      if (!map[key]) {
        map[key] = { game_id: gid, name: e.game_name || e.game_id || "Unknown", wagered: 0, paid: 0, net: 0, count: 0 };
      }
      map[key].wagered += e.wager || 0;
      map[key].paid += e.payout || 0;
      map[key].net += e.house_profit || 0;
      map[key].count += 1;
    });
    return Object.values(map)
      .map((g) => {
        const rtpTheo = theoreticalRtpFor(g.game_id);
        const actualRtp = g.wagered > 0 ? g.paid / g.wagered : null;
        const theoEdge = rtpTheo != null ? (1 - rtpTheo) * 100 : null;
        const actualEdge = actualRtp != null ? (1 - actualRtp) * 100 : null;
        const delta = theoEdge != null && actualEdge != null ? actualEdge - theoEdge : null;
        return {
          ...g,
          wagered: +g.wagered.toFixed(2),
          net: +g.net.toFixed(2),
          rtpTheoPct: rtpTheo != null ? rtpTheo * 100 : null,
          actualRtpPct: actualRtp != null ? actualRtp * 100 : null,
          theoEdge,
          actualEdge,
          delta,
        };
      })
      .sort((a, b) => b.wagered - a.wagered);
  }, [earnings]);

  const totals = useMemo(() => {
    const wagered = rows.reduce((s, r) => s + r.wagered, 0);
    const paid = rows.reduce((s, r) => s + (r.wagered > 0 ? r.wagered - r.net : 0), 0);
    const net = rows.reduce((s, r) => s + r.net, 0);
    const count = rows.reduce((s, r) => s + r.count, 0);
    const actualEdge = wagered > 0 ? (net / wagered) * 100 : 0;
    return { wagered, net, count, actualEdge };
  }, [rows]);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-lime" /> House margin by game
        </h3>
        <span className="text-xs text-white/40">Theoretical RTP vs actual payout</span>
      </div>
      <p className="text-xs text-white/40 mb-4">
        Compares each game's calibrated theoretical return with the realized payout from settled bets. Positive Δ = house over-performing vs expectation.
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-8">No settled bets in the ledger yet.</p>
      ) : (
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] text-white/40 uppercase border-b border-white/5">
                <th className="py-2 px-2">Game</th>
                <th className="py-2 px-2 text-right">Bets</th>
                <th className="py-2 px-2 text-right">Wagered</th>
                <th className="py-2 px-2 text-right">Theo. RTP</th>
                <th className="py-2 px-2 text-right">Actual RTP</th>
                <th className="py-2 px-2 text-right">Theo. edge</th>
                <th className="py-2 px-2 text-right">Actual edge</th>
                <th className="py-2 px-2 text-right">Δ vs expected</th>
                <th className="py-2 px-2 text-right">Net profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.game_id || r.name} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2.5 px-2 font-semibold text-white">{r.name}</td>
                  <td className="py-2.5 px-2 text-right text-white/50">{r.count}</td>
                  <td className="py-2.5 px-2 text-right text-white/70 tabular-nums">{r.wagered.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="py-2.5 px-2 text-right text-white/60 tabular-nums">{r.rtpTheoPct != null ? `${r.rtpTheoPct.toFixed(2)}%` : "—"}</td>
                  <td className="py-2.5 px-2 text-right text-white/80 tabular-nums">{r.actualRtpPct != null ? `${r.actualRtpPct.toFixed(2)}%` : "—"}</td>
                  <td className="py-2.5 px-2 text-right text-white/60 tabular-nums">{r.theoEdge != null ? `${r.theoEdge.toFixed(2)}%` : "—"}</td>
                  <td className={`py-2.5 px-2 text-right font-bold tabular-nums ${r.actualEdge >= 0 ? "text-lime" : "text-red-400"}`}>
                    {r.actualEdge != null ? `${r.actualEdge.toFixed(2)}%` : "—"}
                  </td>
                  <td className={`py-2.5 px-2 text-right tabular-nums ${r.delta == null ? "text-white/30" : r.delta >= 0 ? "text-lime" : "text-red-400"}`}>
                    {r.delta == null ? "—" : `${r.delta >= 0 ? "+" : ""}${r.delta.toFixed(2)}%`}
                  </td>
                  <td className={`py-2.5 px-2 text-right font-bold tabular-nums ${r.net >= 0 ? "text-lime" : "text-red-400"}`}>
                    {r.net >= 0 ? "+" : ""}{r.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-lime/20">
                <td className="py-2.5 px-2 font-black text-white">Total</td>
                <td className="py-2.5 px-2 text-right text-white/60 tabular-nums">{totals.count}</td>
                <td className="py-2.5 px-2 text-right font-bold text-white tabular-nums">{totals.wagered.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                <td className="py-2.5 px-2 text-right text-white/30">—</td>
                <td className="py-2.5 px-2 text-right text-white/30">—</td>
                <td className="py-2.5 px-2 text-right text-white/30">—</td>
                <td className="py-2.5 px-2 text-right font-black text-lime tabular-nums">{totals.actualEdge.toFixed(2)}%</td>
                <td className="py-2.5 px-2 text-right text-white/30">—</td>
                <td className={`py-2.5 px-2 text-right font-black tabular-nums ${totals.net >= 0 ? "text-lime" : "text-red-400"}`}>
                  {totals.net >= 0 ? "+" : ""}{totals.net.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="flex items-center gap-4 mt-4 text-[11px] text-white/40">
        <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-lime" /> Δ ≥ 0: house edge above theoretical</span>
        <span className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-red-400" /> Δ &lt; 0: players running hotter than expected</span>
      </div>
    </div>
  );
}