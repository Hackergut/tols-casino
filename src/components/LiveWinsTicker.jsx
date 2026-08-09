import React, { useEffect, useState } from "react";
import { base44 } from "@/api/client";

const shorten = (id) => {
  if (!id) return "0x0…0000";
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
};
const initial = (name) => (String(name || "").trim().charAt(0) || "★").toUpperCase();

/**
 * "LIVE ONCHAIN WINS" ticker — real recent winning Bets only. Shows an honest
 * empty state until the first real win lands (no mock entries).
 */
export default function LiveWinsTicker() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    base44.entities.Bet
      .list("-created_date", 24)
      .then((list) => {
        if (!active || !list) return;
        const wins = list.filter((b) => b.result === "win" && b.payout > 0).slice(0, 12);
        setRows(
          wins.map((b) => ({
            game: b.game_name || b.game_id || "Game",
            amount: Number(b.payout),
            addr: shorten(b.created_by_id),
          }))
        );
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0e22]/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-black tracking-[0.18em] text-white/80 uppercase">Live onchain wins</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2.5 min-h-[58px] items-center">
        {loading ? (
          <span className="text-xs text-white/40 px-2">Loading live wins…</span>
        ) : rows.length === 0 ? (
          <span className="text-xs text-white/40 px-2">Waiting for the first on-chain win — play to be the first.</span>
        ) : (
          rows.map((r, i) => (
            <div
              key={i}
              className="shrink-0 flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl bg-[#11182e] border border-white/5"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a2046] to-[#0a0e22] border border-lime/20 flex items-center justify-center text-lime font-black text-xs">
                {initial(r.game)}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-black text-lime tabular-nums">
                  ${r.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-white/40 font-mono">{r.addr}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}