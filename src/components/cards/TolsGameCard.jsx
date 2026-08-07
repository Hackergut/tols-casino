import React from "react";
import { Link } from "react-router-dom";
import { Lock, Play, ShieldCheck } from "lucide-react";
import GameArt from "@/components/GameArt";

// TOLS mini-game tile — same graded-slab language as the trading-card
// marketplace tiles: dark panel, floating framed art with mirror reflection,
// spec row and a primary action.
export default function TolsGameCard({ game }) {
  const soon = game.playable === false;
  const frame = "#ccff00";

  return (
    <Link
      to={`/game/${game.slug}`}
      className="group relative block rounded-2xl bg-[#16181c] border border-white/8 overflow-hidden transition hover:border-lime/40 active:scale-[0.99]"
      style={{ boxShadow: `inset 0 0 0 1px ${frame}14` }}
    >
      {soon && (
        <span className="absolute top-2.5 right-2.5 z-20 inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-black/85 text-white/70">
          <Lock className="w-3 h-3" /> SOON
        </span>
      )}

      {/* Slab stage */}
      <div className="relative px-4 pt-4 pb-2" style={{ background: `radial-gradient(120% 80% at 50% 0%, ${frame}1f, transparent 70%)` }}>
        <div
          className="relative mx-auto w-[64%] aspect-[3/4] rounded-lg overflow-hidden border-2 bg-[#0a0a0a]"
          style={{ borderColor: frame, boxShadow: `0 10px 30px -12px ${frame}` }}
        >
          <GameArt slug={game.slug} className="absolute inset-0 group-hover:scale-[1.05] transition duration-500" />
          <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
        {/* reflection */}
        <div className="relative mx-auto w-[64%] h-8 mt-0.5 overflow-hidden opacity-25 [transform:scaleY(-1)]">
          <GameArt slug={game.slug} className="absolute inset-x-0 bottom-0 w-full h-24" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16181c] via-[#16181c]/70 to-transparent" />
        </div>
      </div>

      {/* Meta */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-lime">TOLS Original</span>
          <span className="text-[10px] text-white/30">·</span>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider truncate">Mini game</span>
        </div>
        <h4 className="mt-1 font-display text-lg uppercase tracking-tight text-white leading-snug line-clamp-1">{game.name}</h4>

        <div className="mt-3 pt-3 border-t border-white/8 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-white/40">House edge</div>
            <div className="text-sm font-black text-white tabular-nums">1%</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/40">Fairness</div>
            <div className="text-sm font-black text-white inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-lime" />Provable</div>
          </div>
        </div>

        <span
          className={`mt-3 w-full h-10 rounded-xl text-sm font-black transition inline-flex items-center justify-center gap-1 ${
            soon ? "border-2 border-white/15 text-white/40" : "bg-lime text-black group-hover:opacity-90"
          }`}
        >
          {soon ? "Coming soon" : <><Play className="w-4 h-4 fill-black" /> Play now</>}
        </span>
      </div>
    </Link>
  );
}