import React from "react";
import { rarityColor, collectionAccent } from "@/lib/packs";

// Stylized "slabbed" PSA-graded collectible card visual. Renders front (art)
// or back (certified label) — mimics the graded-card reference aesthetic.
export default function CardVisual({ card, side = "front", className = "" }) {
  const color = rarityColor(card.rarity);
  const accent = collectionAccent(card.collection);
  const initial = String(card.collection || "★").trim().charAt(0).toUpperCase();

  if (side === "back") {
    return (
      <div className={`relative rounded-xl bg-[#0c0c0c] border-2 ${className}`} style={{ borderColor: color + "55" }}>
        <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
          <span className="text-[10px] font-black tracking-widest" style={{ color }}>TOLS CERTIFIED</span>
          <span className="text-[9px] font-mono text-white/40">PSA</span>
        </div>
        <div className="px-3 py-4 flex flex-col items-center gap-2">
          <div className="w-full h-24 rounded-md flex items-center justify-center text-5xl font-black" style={{ color: color + "33", background: `radial-gradient(circle at 50% 30%, ${color}18, transparent 70%)` }}>{initial}</div>
          <div className="w-full flex gap-0.5 h-6 items-end">{Array.from({ length: 22 }).map((_, i) => <span key={i} className="flex-1 bg-white/40" style={{ height: 6 + ((i * 7) % 16) }} />)}</div>
          <div className="w-full text-[9px] font-mono text-white/40 text-center truncate">SN {card.grading_id}</div>
        </div>
        <div className="px-3 py-1.5 border-t border-white/10 text-[8px] text-white/30 text-center font-mono truncate">{card.token_id}</div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border-2 ${className}`} style={{ borderColor: color + "66", boxShadow: `0 0 26px -8px ${color}66` }}>
      <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: color + "22" }}>
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>{card.collection}</span>
        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded" style={{ color: "#000", background: color }}>{card.rarity}</span>
      </div>
      <div className="relative aspect-[3/4] flex flex-col items-center justify-center p-4 text-center" style={{ background: `radial-gradient(circle at 50% 25%, ${color}26, #0a0a0a 75%)` }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black border-2 mb-3" style={{ color: accent, borderColor: accent + "55", background: accent + "14" }}>{initial}</div>
        <p className="text-sm font-black text-white leading-tight">{card.card_name}</p>
        <p className="text-[10px] text-white/40 mt-1">Insured ${card.insured_value?.toLocaleString()}</p>
      </div>
      <div className="px-3 py-1.5 border-t border-white/10 flex items-center justify-between bg-black/60">
        <span className="text-[9px] font-black text-white/60">{card.grading_company}</span>
        <span className="text-[9px] font-mono text-white/40">#{card.grading_id}</span>
      </div>
    </div>
  );
}