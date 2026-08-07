import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameCard from "@/components/GameCard";
import SectionHeader from "@/components/home/SectionHeader";

// Horizontal game rail with a unified section header, "View All" link and
// arrow controls.
export default function GameRail({ title, icon: Icon, games, viewAllTo, emptyText }) {
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current && scroller.current.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <section className="space-y-3">
      <SectionHeader icon={Icon} title={title} count={games.length}>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="h-8 px-3 flex items-center rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-lime hover:border-lime/30 transition"
          >
            View All
          </Link>
        )}
        <button
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </SectionHeader>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] py-12 text-center text-sm text-white/40">
          {emptyText || "Nothing here yet"}
        </div>
      ) : (
        <div ref={scroller} data-no-swipe className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-1">
          {games.map((g) => (
            <div key={g.id || g.slug} className="snap-start shrink-0 w-[144px] sm:w-[158px] lg:w-[172px]">
              <GameCard game={g} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}