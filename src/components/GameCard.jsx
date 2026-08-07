import React from "react";
import { Image } from "@/components/ui/image";
import { Link } from "react-router-dom";
import { Lock, Play } from "lucide-react";
import GameArt from "@/components/GameArt";

export default function GameCard({ game }) {
  const isSlot = game.category === "slots";
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group relative block aspect-[9/6] sm:aspect-[1.04/1] rounded-xl overflow-hidden bg-[#161616] border border-white/20 hover:border-lime/60 active:scale-[0.98] transition"
    >
      {isSlot && game.image ? (
        <Image src={game.image} fittingType="fill" className="absolute inset-0 w-full h-full grayscale-[15%] group-hover:grayscale-0 group-hover:scale-[1.04] transition duration-500" />
      ) : (
        <GameArt slug={game.slug} className="absolute inset-0 group-hover:scale-[1.04] transition duration-500" />
      )}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      {game.playable === false && (
        <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/80 text-[9px] font-bold text-white/70">
          <Lock className="w-2.5 h-2.5" /> SOON
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 flex items-end justify-between gap-2">
        <p className="font-display text-base sm:text-lg uppercase leading-none tracking-tight text-white line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {game.name}
        </p>
        {game.playable !== false && (
          <span className="shrink-0 flex items-center gap-0.5 px-2 py-1 rounded-full bg-lime text-black text-[9px] font-black uppercase leading-none">
            <Play className="w-2.5 h-2.5 fill-black" /> Play
          </span>
        )}
      </div>
    </Link>
  );
}