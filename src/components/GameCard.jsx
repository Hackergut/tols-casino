import React from "react";
import { Image } from "@/components/ui/image";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

export default function GameCard({ game }) {
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] border border-white/10 hover:border-lime/40 transition duration-300"
    >
      <div className="absolute inset-0 bg-grid opacity-20" />
      {game.image ? (
        <Image src={game.image} fittingType="fit" className="absolute inset-0 w-full h-full object-contain p-3 group-hover:scale-105 transition duration-500" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black italic" style={{ color: "#ccff00", textShadow: "0 0 24px rgba(204,255,0,0.4)" }}>
            {game.name.split(" ")[0]}
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <p className="text-white text-sm font-bold truncate">{game.name}</p>
      </div>
      {!game.playable && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur text-[10px] font-bold text-white/70">
          <Lock className="w-2.5 h-2.5" /> SOON
        </div>
      )}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition px-2.5 py-1 rounded-full bg-lime text-black text-xs font-black">
        PLAY
      </div>
    </Link>
  );
}