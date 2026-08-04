import React from "react";
import { Link } from "react-router-dom";
import { Boxes } from "lucide-react";

export default function ProvidersRail({ providers }) {
  if (!providers.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-lime/10 border border-lime/20">
          <Boxes className="text-lime" style={{ width: 18, height: 18 }} />
        </span>
        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">Providers</h2>
        <span className="text-xs font-bold text-white/25">{providers.length}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1" data-no-swipe>
        {providers.map((p) => (
          <Link
            key={p}
            to={`/games/provider/${encodeURIComponent(p)}`}
            className="shrink-0 w-[150px] h-[70px] rounded-xl border border-white/8 bg-[#161616] flex items-center justify-center px-3 text-center text-xs font-black uppercase tracking-wide text-white/60 hover:text-lime hover:border-lime/40 transition"
          >
            {p}
          </Link>
        ))}
      </div>
    </section>
  );
}