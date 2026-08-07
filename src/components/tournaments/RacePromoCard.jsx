import React from "react";
import { Flag, Trophy, Flame, ArrowRight } from "lucide-react";

// Designed promotional hero card for the weekly wager race. Matches the
// TOLS neon-tech look: dark gradient, lime accents, diagonal speed lines.
export default function RacePromoCard({ totalPrize = 0, activeCount = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-lime/30 bg-gradient-to-br from-[#16180c] via-[#0d0d0d] to-[#0d0d0d] p-6 sm:p-8">
      {/* speed lines */}
      <div className="absolute inset-0 opacity-30 pointer-events-none bg-grid" />
      <div className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-lime/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-10 pointer-events-none">
        <Flag className="w-44 h-44 text-lime" strokeWidth={1} />
      </div>

      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime/15 text-lime text-[11px] font-black uppercase tracking-widest mb-4">
          <Flame className="w-3.5 h-3.5" /> Weekly Race · Live Now
        </div>
        <h2 className="font-display uppercase leading-[0.95] text-3xl sm:text-5xl text-white drop-shadow">
          THE <span className="text-lime">GRAND</span><br />WAGER RACE
        </h2>
        <p className="mt-3 text-sm sm:text-base text-white/70 max-w-md">
          Race against the world — every USDT you wager moves you up the leaderboard. Top players split the pot every week.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5">
            <div className="text-[10px] font-bold uppercase text-white/40 flex items-center gap-1"><Trophy className="w-3 h-3" /> Prize pot</div>
            <div className="text-2xl font-black text-lime tabular-nums">{Number(totalPrize || 0).toLocaleString()}<span className="text-xs text-white/40 ml-1">USDT</span></div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5">
            <div className="text-[10px] font-bold uppercase text-white/40 flex items-center gap-1"><Flag className="w-3 h-3" /> Active races</div>
            <div className="text-2xl font-black text-white tabular-nums">{activeCount}</div>
          </div>
          <div className="flex items-center gap-2 h-11 px-4 rounded-xl bg-lime text-black font-black text-sm">
            Start racing <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}