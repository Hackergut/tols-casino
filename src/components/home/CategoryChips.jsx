import React from "react";
import { Gamepad2, Home, Radio, Sparkles, Spade, Zap } from "lucide-react";

export const LOBBY_CHIPS = [
  { id: "home", label: "Lobby", icon: Home },
  { id: "originals", label: "Originals", icon: Sparkles },
  { id: "slots", label: "Slots", icon: Gamepad2 },
  { id: "live", label: "Live", icon: Radio },
  { id: "table", label: "Table", icon: Spade },
  { id: "featured", label: "New Releases", icon: Zap },
];

export default function CategoryChips({ active, onSelect }) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide p-1 rounded-xl border border-white/10 bg-card" data-no-swipe>
      {LOBBY_CHIPS.map((item) => {
        const Icon = item.icon;
        const selected = item.id === "home" ? !active : active === item.id;
        return (
          <button key={item.id} onClick={() => onSelect(item.id)} className={`shrink-0 flex items-center gap-2 h-10 px-4 rounded-lg text-xs font-black uppercase tracking-wide transition ${selected ? "bg-white/10 text-lime border border-white/10" : "text-white/45 border border-transparent hover:text-white"}`}>
            <Icon className="w-4 h-4" />{item.label}
          </button>
        );
      })}
    </div>
  );
}