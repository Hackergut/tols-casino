import React from "react";
import { Image } from "@/components/ui/image";
import { Link } from "react-router-dom";
import { Lock, Play } from "lucide-react";
import GameArt from "@/components/GameArt";

export default function GameCard({ game }) {
  const isSlot = game.category === "slots";
  return (
    <Link to={`/game/${game.slug}`} className="group relative block aspect-[1.04/1] rounded-xl overflow-hidden bg-card border border-white/15 hover:border-lime/60 active:scale-[0.98] transition">
      {isSlot && game.image ? (
        <Image src={game.image} fittingType="fill" className="absolute inset-0 w-full h-full grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.03] transition duration-500" />
      ) : (
        <GameArt slug={game.slug} className="absolute inset-0 group-hover:scale-[1.03] transition duration-500" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
      {game.playable === false && <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/80 text-[9px] font-bold text-white/70"><Lock className="w-2.5 h-2.5" /> SOON</span>}
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
        <p className="font-display text-lg sm:text-xl uppercase leading-none tracking-tight text-white line-clamp-2">{game.name}</p>
      </div>
      {game.playable !== false && <span className="absolute right-2.5 bottom-2.5 w-7 h-7 rounded-full bg-lime text-black items-center justify-center opacity-0 group-hover:flex group-hover:opacity-100 transition"><Play className="w-3.5 h-3.5 fill-black" /></span>}
    </Link>
  );
}