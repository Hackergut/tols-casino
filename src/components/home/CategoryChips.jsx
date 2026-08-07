import React from "react";
import { Home, Sparkles, Gamepad2, Radio, Spade } from "lucide-react";

export const LOBBY_CHIPS = [
  { id: "home", label: "Home", icon: Home },
  { id: "originals", label: "Originals", icon: Sparkles },
  { id: "slots", label: "Slots", icon: Gamepad2 },
  { id: "live", label: "Live Casino", icon: Radio },
  { id: "table", label: "Table Games", icon: Spade },
];

export default function CategoryChips({ active, onSelect }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide p-1 rounded-xl border border-white/10 bg-card" data-no-swipe>
      {LOBBY_CHIPS.map((item) => {
        const Icon = item.icon;
        const selected = item.id === "home" ? !active : active === item.id;
        return <button key={item.id} onClick={() => onSelect(item.id)} className={`shrink-0 flex items-center gap-2 h-10 px-4 rounded-lg text-xs font-semibold transition ${selected ? "bg-white/10 text-white" : "text-white/50 hover:text-white"}`}><Icon className="w-4 h-4" />{item.label}</button>;
      })}
    </div>
  );
}