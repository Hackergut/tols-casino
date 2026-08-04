import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameCard from "@/components/GameCard";

// Horizontal game rail with icon, title, "View All" and arrow controls.
export default function GameRail({ title, icon: Icon, games, viewAllTo, emptyText }) {
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current && scroller.current.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-lime/10 border border-lime/20">
              <Icon className="w-4.5 h-4.5 text-lime" style={{ width: 18, height: 18 }} />
            </span>
          )}
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">{title}</h2>
          <span className="text-xs font-bold text-white/25">{games.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {viewAllTo && (
            <Link to={viewAllTo} className="h-8 px-3 flex items-center rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-lime hover:border-lime/30 transition">
              View All
            </Link>
          )}
          <button onClick={() => scroll(-1)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] py-12 text-center text-sm text-white/40">
          {emptyText || "Nothing here yet"}
        </div>
      ) : (
        <div ref={scroller} data-no-swipe className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-1">
          {games.map((g) => (
            <div key={g.id} className="snap-start shrink-0 w-[132px] sm:w-[160px]">
              <GameCard game={g} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}