import React from "react";
import { Link } from "react-router-dom";
import { Boxes } from "lucide-react";
import SectionHeader from "@/components/home/SectionHeader";

export default function ProvidersRail({ providers }) {
  if (!providers.length) return null;
  return (
    <section className="space-y-3">
      <SectionHeader icon={Boxes} title="Providers" count={providers.length} />
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