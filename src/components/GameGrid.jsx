import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Gamepad2, ArrowRight } from "lucide-react";
import GameCard from "@/components/GameCard";
import { GAMES } from "@/lib/games";

export default function GameGrid({ title = "TOLS GAMES", filter }) {
  const scroller = useRef(null);

  const games = filter ? GAMES.filter((g) => g.category === filter) : GAMES;

  const scroll = (dir) => {
    if (!scroller.current) return;
    scroller.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-lime/10 border border-lime/20">
            <Gamepad2 className="w-5 h-5 text-lime" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex items-center gap-1 text-sm font-semibold text-white/60 hover:text-lime transition">
            Visualizza tutto <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(-1)} className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 hover:border-lime/40 text-white/70 transition">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 hover:border-lime/40 text-white/70 transition">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        data-no-swipe
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide snap-x"
      >
        {games.map((g) => (
          <div key={g.id} className="snap-start shrink-0 w-[150px] sm:w-[180px]">
            <GameCard game={g} />
          </div>
        ))}
      </div>
    </section>
  );
}