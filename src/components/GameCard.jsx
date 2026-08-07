import React from "react";
import { Image } from "@/components/ui/image";
import { Link } from "react-router-dom";
import { Lock, Play } from "lucide-react";
import GameArt from "@/components/GameArt";

export default function GameCard({ game }) {
  const accent = game.accent || "#ccff00";
  const isSlot = game.category === "slots";
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-b from-[#161d3a] to-[#0a0e22] border border-white/10 hover:border-lime/50 active:scale-[0.97] transition-all duration-300 hover:-translate-y-1"
    >
      <div className="absolute inset-0 bg-grid opacity-[0.06] group-hover:opacity-20 transition duration-300" />
      <div
        className="absolute -inset-2 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 40%, ${accent}22, transparent 70%)` }}
      />
      {isSlot ? (
        game.image ? (
          <Image src={game.image} fittingType="fill" className="absolute inset-0 w-full h-full group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#1a2046] to-[#0a0e22]">
            <span className="text-2xl sm:text-3xl font-black italic px-2 text-center leading-tight" style={{ color: accent, textShadow: `0 0 28px ${accent}66` }}>
              {game.name.split(" ")[0]}
            </span>
          </div>
        )
      ) : (
        <GameArt slug={game.slug} className="absolute inset-0 group-hover:scale-105 transition duration-500" />
      )}

      <div className="absolute top-2 inset-x-2 flex items-center justify-between">
        {game.playable === false ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[10px] font-bold text-white/70">
            <Lock className="w-2.5 h-2.5" /> SOON
          </span>
        ) : game.provider ? (
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[9px] font-bold text-white/80 max-w-[62%] truncate">
            {game.provider}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-[9px] font-bold uppercase tracking-wide" style={{ color: accent }}>
            TOLS
          </span>
        )}
        {game.rtp ? (
          <span className="px-1.5 py-0.5 rounded-full bg-lime/15 backdrop-blur text-[9px] font-bold text-lime">{game.rtp}%</span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <p className="text-white text-[11px] sm:text-sm font-bold leading-tight line-clamp-2">{game.name}</p>
        {game.volatility ? <p className="text-[10px] text-white/40 truncate">{game.volatility} vol</p> : null}
      </div>

      {game.playable !== false && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40 backdrop-blur-[2px]">
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-lime text-black text-xs font-black glow-lime">
            <Play className="w-3.5 h-3.5 fill-black" /> PLAY
          </span>
        </div>
      )}
    </Link>
  );
}