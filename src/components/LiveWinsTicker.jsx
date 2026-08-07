import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const DEMO = [
  { game: "Neon Vault", amount: 297.6, addr: "0xd1…b3a5" },
  { game: "Dice", amount: 116.11, addr: "0x7f…92c1" },
  { game: "Crash", amount: 87.5, addr: "0x3a…44e0" },
  { game: "Plinko", amount: 65.93, addr: "0x9c…1b7d" },
  { game: "Mines", amount: 42.18, addr: "0x21…fe88" },
  { game: "Limbo", amount: 158.0, addr: "0x4e…7a02" },
];

const shorten = (id) => {
  if (!id) return "0x0…0000";
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 4)}…${s.slice(-4)}` : s;
};
const initial = (name) => (String(name || "").trim().charAt(0) || "★").toUpperCase();

/**
 * "LIVE ONCHAIN WINS" horizontal ticker. Pulls real recent winning Bets and
 * falls back to demo rows so the feed always looks alive.
 */
export default function LiveWinsTicker() {
  const [rows, setRows] = useState(DEMO);

  useEffect(() => {
    let active = true;
    base44.entities.Bet.list("-created_date", 24)
      .then((list) => {
        if (!active || !list) return;
        const wins = list.filter((b) => b.result === "win" && b.payout > 0).slice(0, 12);
        if (wins.length) {
          setRows(
            wins.map((b) => ({
              game: b.game_name || b.game_id || "Game",
              amount: Number(b.payout),
              addr: shorten(b.created_by_id),
            }))
          );
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0e22]/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[11px] font-black tracking-[0.18em] text-white/80 uppercase">Live onchain wins</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-3 py-2.5">
        {rows.map((r, i) => (
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
        ))}
      </div>
    </div>
  );
}