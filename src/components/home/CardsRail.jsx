import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import SectionHeader from "@/components/home/SectionHeader";
import CardThumb from "@/components/cards/CardThumb";
import { COLLECTIONS, rollInsuredValue } from "@/lib/packs";

// Showcase rail of the top collectible cards, matching the lobby game rails.
const SHOWCASE = Object.entries(COLLECTIONS).flatMap(([collection, col]) =>
  ["mythic", "legendary"].flatMap((rarity) =>
    (col.cards[rarity] || []).slice(0, 2).map((card_name) => ({
      id: `${collection}-${card_name}`,
      collection,
      card_name,
      rarity,
      insured_value: rollInsuredValue(rarity),
    }))
  )
);

export default function CardsRail() {
  const scroller = useRef(null);
  const scroll = (dir) => scroller.current && scroller.current.scrollBy({ left: dir * 480, behavior: "smooth" });

  return (
    <section className="space-y-3">
      <SectionHeader icon={Layers} title="TOLS Cards" count={SHOWCASE.length}>
        <Link to="/packs" className="h-8 px-3 flex items-center rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/70 hover:text-lime hover:border-lime/30 transition">View All</Link>
        <button onClick={() => scroll(-1)} aria-label="Scroll left" className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 transition"><ChevronLeft className="w-4 h-4" /></button>
        <button onClick={() => scroll(1)} aria-label="Scroll right" className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-lime hover:border-lime/30 transition"><ChevronRight className="w-4 h-4" /></button>
      </SectionHeader>

      <div ref={scroller} data-no-swipe className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-1">
        {SHOWCASE.map((c) => (
          <Link key={c.id} to="/packs" className="snap-start shrink-0 w-[140px] sm:w-[160px]">
            <CardThumb card={c} />
          </Link>
        ))}
      </div>
    </section>
  );
}