import React from "react";
import { Shuffle } from "lucide-react";

export const LOBBY_CHIPS = [
  { id: "lucky", label: "Feeling Lucky", icon: Shuffle },
  { id: "originals", label: "TOLS Originals" },
  { id: "new", label: "New Releases" },
  { id: "slots", label: "Slots" },
  { id: "live", label: "Live Casino" },
  { id: "table", label: "Table Games" },
  { id: "game-shows", label: "Game Shows" },
  { id: "instant", label: "Instant Games" },
  { id: "featured", label: "Featured Games" },
];

export default function CategoryChips({ active, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide" data-no-swipe>
      {LOBBY_CHIPS.map((c) => {
        const Icon = c.icon;
        const on = active === c.id;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`shrink-0 flex items-center gap-1.5 h-9 px-4 rounded-lg text-xs font-bold border transition ${
              on ? "bg-lime/15 border-lime/40 text-lime" : "bg-card border-white/8 text-white/60 hover:text-white"
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}