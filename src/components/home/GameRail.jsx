import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/client";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import GameCard from "@/components/GameCard";

export default function GameRail({ title, icon: Icon, games, viewAllTo, emptyText, moreTile }) {
  const scroller = useRef(null);
  const scroll = (dir) => {
    scroller.current && scroller.current.scrollBy({ left: dir * 480, behavior: "smooth" });
    // exact sync: save scroll position
    try { localStorage.setItem(`tols_rail_${title}`, String(scroller.current?.scrollLeft || 0)); } catch {}
  };
  useEffect(() => {
    // restore scroll from backend on mount
    (async () => {
      try {
        const user = await base44.auth.me().catch(()=> null);
        if (!user) return;
        const list = await base44.entities.PlatformSetting.filter({ category: "rail_sync", key: `rail_${title}_${user.id}` }).catch(()=>[]);
        if (list?.[0]?.value && scroller.current) scroller.current.scrollLeft = Number(list[0].value);
      } catch {}
    })();
  }, [title]);

  return (
    <motion.section initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }} className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-[13px] sm:text-sm font-black tracking-wide uppercase text-white">
          {Icon && <Icon className="w-4 h-4 text-white/60" />} {title}
        </h2>
        <div className="flex items-center gap-1.5">
          {viewAllTo && <Link to={viewAllTo} className="inline-flex h-7 px-3 items-center rounded-full bg-white/[0.06] border border-white/10 text-xs font-bold text-white/70 hover:bg-white hover:text-black transition">View all</Link>}
          <button onClick={() => scroll(-1)} aria-label="Scroll left" className="grid place-items-center w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 text-white/60 hover:bg-white hover:text-black transition"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => scroll(1)} aria-label="Scroll right" className="grid place-items-center w-7 h-7 rounded-full bg-white/[0.06] border border-white/10 text-white/60 hover:bg-white hover:text-black transition"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      {games.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#121212] py-10 text-center text-sm text-white/30">{emptyText || "Nothing here yet"}</div>
      ) : (
        <div ref={scroller} data-no-swipe className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-1">
          {games.map((g) => (
            <div key={g.id || g.slug} className="snap-start shrink-0 w-[160px] sm:w-[168px] lg:w-[186px]">
              <GameCard game={g} />
            </div>
          ))}
          {moreTile && (
            <Link to={viewAllTo || "#"} className="snap-start shrink-0 w-[160px] sm:w-[168px] lg:w-[186px]">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#121212] border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 p-4 hover:border-lime/40 transition">
                <span className="text-xs font-black text-white">More Originals</span>
                <span className="text-[10px] text-white/40">Shuffle style →</span>
              </div>
            </Link>
          )}
        </div>
      )}
    </motion.section>
  );
}