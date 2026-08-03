import React from "react";
import { Sparkles, Cherry, Video, Spade, Search } from "lucide-react";
import { CATEGORIES } from "@/lib/games";

const ICONS = { Sparkles, Cherry, Video, Spade };

export default function SubNav({ active, onChange }) {
  return (
    <nav className="sticky top-16 z-40 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center gap-1 sm:gap-2 h-12 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onChange("home")}
          className={`flex items-center gap-2 px-3 sm:px-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition ${
            active === "home" ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
          }`}
        >
          Sala Principal
        </button>
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon] || Sparkles;
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onChange(c.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                isActive ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {c.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-2 px-3 h-9 rounded-full bg-[#1a1a1a] border border-white/5 shrink-0">
          <Search className="w-4 h-4 text-white/40" />
          <input placeholder="Cerca" className="bg-transparent outline-none text-sm text-white/70 placeholder-white/40 w-20 sm:w-32" />
        </div>
      </div>
    </nav>
  );
}