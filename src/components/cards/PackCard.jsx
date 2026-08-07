import React from "react";
import { Boxes, Coins } from "lucide-react";
import { collectionAccent } from "@/lib/packs";

// Buyable pack tile in the shop grid.
export default function PackCard({ pack, onOpen }) {
  const accent = collectionAccent(pack.collection);
  const initial = String(pack.collection || "★").trim().charAt(0).toUpperCase();
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#161616] to-[#0d0d0d] flex flex-col">
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl pointer-events-none" style={{ background: accent + "22" }} />
      <div className="relative h-36 flex items-center justify-center" style={{ background: `radial-gradient(circle at 50% 35%, ${accent}26, #0d0d0d 70%)` }}>
        <div className="w-16 h-20 rounded-lg border-2 flex items-center justify-center text-2xl font-black" style={{ color: accent, borderColor: accent + "66", background: accent + "12", boxShadow: `0 0 24px -6px ${accent}` }}>{initial}</div>
        <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/60 text-white/70">{pack.collection}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-white/40 mb-1"><Boxes className="w-3 h-3" /> {pack.cards_per_pack} cards per pack</div>
        <h3 className="text-base font-black text-white leading-tight">{pack.name}</h3>
        <p className="text-xs text-white/45 mt-1 line-clamp-2 min-h-[32px]">{pack.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1 text-lg font-black text-lime tabular-nums"><Coins className="w-4 h-4" /> {pack.price}</div>
          <button onClick={() => onOpen(pack)} className="h-9 px-4 rounded-xl bg-lime text-black text-sm font-black hover:opacity-90">Open Pack</button>
        </div>
      </div>
    </div>
  );
}