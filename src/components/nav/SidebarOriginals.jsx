import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import GameArt from "@/components/GameArt";
import { GAMES } from "@/lib/games";

// Originals thumbnail grid inside the sidebar (jackpot.bet style)
export default function SidebarOriginals({ onNavigate }) {
  const originals = GAMES.filter((g) => g.category === "originals").slice(0, 6);
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
      <div className="grid grid-cols-2 gap-1.5">
        {originals.map((g) => (
          <Link
            key={g.id}
            to={`/game/${g.slug}`}
            onClick={onNavigate}
            className="relative aspect-[4/3] rounded-lg overflow-hidden border border-white/5 hover:border-lime/40 transition group"
          >
            <GameArt slug={g.slug} className="absolute inset-0 group-hover:scale-105 transition duration-300" />
            <span className="absolute inset-x-0 bottom-0 px-1.5 py-0.5 bg-gradient-to-t from-black/90 to-transparent text-[9px] font-bold text-white truncate">
              {g.name}
            </span>
          </Link>
        ))}
      </div>
      <Link
        to="/games/category/originals"
        onClick={onNavigate}
        className="mt-2 flex items-center justify-between h-9 px-2.5 rounded-lg bg-white/5 text-[11px] font-bold text-white/70 hover:text-lime hover:bg-lime/10 transition"
      >
        View All Originals <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}