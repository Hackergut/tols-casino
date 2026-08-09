import React from "react";
import { Image } from "@/components/ui/image";
import { Link } from "react-router-dom";
import { Lock, ExternalLink } from "lucide-react";
import GameArt from "@/components/GameArt";
import TolsGameCard from "@/components/cards/TolsGameCard";

export default function GameCard({ game }) {
  const isSlot = game.category === "slots";
  if (!isSlot) return <TolsGameCard game={game} />;
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group relative block aspect-[3/4] rounded-xl overflow-hidden bg-[#121212] border border-white/[0.06] hover:border-white/15 hover:-translate-y-0.5 transition duration-200 motion-safe:transform"
    >
      {isSlot && game.image ? (
        <Image src={game.image} fittingType="fill" className="absolute inset-0 w-full h-full group-hover:scale-[1.04] transition duration-500" />
      ) : (
        <GameArt slug={game.slug} className="absolute inset-0 group-hover:scale-[1.04] transition duration-500" />
      )}
      <div className="absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-full bg-black/60 border border-white/10 text-white/70 opacity-0 group-hover:opacity-100 transition">
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
      {game.playable === false && (
        <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-[9px] font-bold text-white/60 border border-white/10">
          <Lock className="w-2.5 h-2.5" /> SOON
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2">
        <p className="text-[12px] font-bold leading-tight text-white line-clamp-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {game.name}
        </p>
        <p className="text-[10px] text-white/40 truncate">{game.provider || "TOLS"}</p>
      </div>
    </Link>
  );
}