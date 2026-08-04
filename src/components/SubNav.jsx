import React from "react";
import { Sparkles, Cherry, Spade, Search, House } from "lucide-react";
import { CATEGORIES, GAMES } from "@/lib/games";

const ICONS = { Sparkles, Cherry, Spade };

export default function SubNav({ active, onChange, slotCount = 0 }) {
  const countFor = (id) => (id === "slots" ? slotCount : GAMES.filter((g) => g.category === id).length);
  return (
    <nav className="sticky top-16 z-40 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-1.5 sm:gap-2 h-14 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onChange("home")}
          className={`flex items-center gap-2 px-3.5 sm:px-4 h-10 rounded-full text-sm font-bold whitespace-nowrap transition border ${
            active === "home"
              ? "bg-lime text-black border-lime shadow-lg glow-lime"
              : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <House className="w-[18px] h-[18px]" />
          Home
        </button>
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon] || Sparkles;
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 h-10 rounded-full text-sm font-bold whitespace-nowrap transition border ${
                isActive
                  ? "bg-lime text-black border-lime shadow-lg glow-lime"
                  : "border-white/10 text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {c.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-black/20 text-black" : "bg-white/10 text-white/50"}`}>
                {countFor(c.id)}
              </span>
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 px-3 h-10 rounded-full bg-[#1a1a1a] border border-white/5 shrink-0 focus-within:border-lime/30">
          <Search className="w-4 h-4 text-white/50" />
          <input placeholder="Search" className="bg-transparent outline-none text-sm text-white/80 placeholder-white/40 w-20 sm:w-32" />
        </div>
      </div>
    </nav>
  );
}