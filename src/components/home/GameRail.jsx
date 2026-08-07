import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import GameCard from "@/components/GameCard";
import SectionHeader from "@/components/home/SectionHeader";

// Horizontal game rail with a unified section header, "View All" link and
// arrow controls. Optionally renders a trailing "MORE ORIGINALS" tile.
export default function GameRail({ title, icon: Icon, games, viewAllTo, emptyText, moreTile }) {
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current && scroller.current.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <section className="space-y-3">
      <SectionHeader icon={Icon} title={title} count={games.length}>
        {viewAllTo && (
          <Link to={viewAllTo} className="h-8 px-3 flex items-center rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-lime hover:border-lime/30 transition">View All</Link>
        )}
        <button onClick={() => scroll(-1)} aria-label="Scroll left" className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 transition"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => scroll(1)} aria-label="Scroll right" className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 transition"><ChevronRight className="w-4 h-4" /></button>
      </SectionHeader>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] py-12 text-center text-sm text-white/40">{emptyText || "Nothing here yet"}</div>
      ) : (
        <div ref={scroller} data-no-swipe className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-1">
          {games.map((g) => (
            <div key={g.id || g.slug} className="snap-start shrink-0 w-[168px] sm:w-[190px] lg:w-[210px]">
              <GameCard game={g} />
            </div>
          ))}
          {moreTile && (
            <Link to={viewAllTo || "#"} className="snap-start shrink-0 w-[168px] sm:w-[190px] lg:w-[210px]">
              <div className="group relative aspect-[9/6] sm:aspect-[1.04/1] rounded-xl overflow-hidden bg-[#161616] border border-dashed border-lime/30 flex flex-col items-center justify-center gap-3 text-center p-4 hover:border-lime/60 transition">
                <span className="grid place-items-center w-12 h-12 rounded-full bg-lime/10 border border-lime/30"><Sparkles className="w-6 h-6 text-lime" /></span>
                <div>
                  <p className="font-display text-lg uppercase text-white leading-tight">More Originals</p>
                  <p className="text-[11px] text-white/45 mt-1">Coming Soon</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}