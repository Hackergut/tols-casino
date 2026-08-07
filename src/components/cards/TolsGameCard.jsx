import React from "react";
import { Link } from "react-router-dom";
import { Lock, Play, ShieldCheck } from "lucide-react";
import GameArt from "@/components/GameArt";

// TOLS-style mini-game tile: neon lime HUD frame, corner brackets, provably
// fair stamp and a display-font nameplate. Used for every TOLS original so the
// whole platform shares one collectible-grade look.
export default function TolsGameCard({ game }) {
  const soon = game.playable === false;
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group relative block aspect-[9/6] sm:aspect-[1.04/1] rounded-xl overflow-hidden bg-[#0d0f0a] border-2 border-lime/25 hover:border-lime/70 active:scale-[0.98] transition"
      style={{ boxShadow: "inset 0 0 0 1px rgba(204,255,0,0.08)" }}
    >
      <GameArt slug={game.slug} className="absolute inset-0 group-hover:scale-[1.05] transition duration-500" />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/45 to-transparent" />

      {/* HUD corner brackets */}
      <Corner className="top-1.5 left-1.5 border-t-2 border-l-2 rounded-tl" />
      <Corner className="top-1.5 right-1.5 border-t-2 border-r-2 rounded-tr" />
      <Corner className="bottom-1.5 left-1.5 border-b-2 border-l-2 rounded-bl" />
      <Corner className="bottom-1.5 right-1.5 border-b-2 border-r-2 rounded-br" />

      <span className="absolute top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.22em] text-lime/80">
        TOLS Original
      </span>

      {soon && (
        <span className="absolute top-2 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/85 text-[9px] font-bold text-white/70">
          <Lock className="w-2.5 h-2.5" /> SOON
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
        <div className="flex items-end justify-between gap-2">
          <p className="font-display text-base sm:text-lg uppercase leading-none tracking-tight text-white line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {game.name}
          </p>
          {!soon && (
            <span className="shrink-0 flex items-center gap-0.5 px-2 py-1 rounded-full bg-lime text-black text-[9px] font-black uppercase leading-none glow-lime">
              <Play className="w-2.5 h-2.5 fill-black" /> Play
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-lime/70">
          <ShieldCheck className="w-3 h-3" /> Provably fair
        </div>
      </div>
    </Link>
  );
}

function Corner({ className }) {
  return <span className={`absolute w-4 h-4 border-lime/60 pointer-events-none ${className}`} />;
}