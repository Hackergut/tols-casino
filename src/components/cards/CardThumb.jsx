import React from "react";
import { Image } from "@/components/ui/image";
import { collectionImage, rarityColor, rarityLabel, rarityVisual } from "@/lib/packs";

// Compact collectible thumbnail shared by the vault grids (Packs collection
// tab, My Collection sets). Rarity drives the frame color + glow.
export default function CardThumb({ card, onClick }) {
  const frame = rarityColor(card.rarity);
  const visual = rarityVisual(card.rarity);
  const img = collectionImage(card);
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`relative block w-full text-left rounded-lg overflow-hidden bg-[#0a0a0a] transition hover:-translate-y-0.5 ${visual.animate ? "rarity-pulse" : ""}`}
      style={{ border: `${visual.borderWidth}px solid ${visual.border}`, boxShadow: visual.glow }}
    >
      <div className="flex items-center justify-center h-5 border-b" style={{ borderColor: frame + "55" }}>
        <span className="text-[8px] font-display tracking-[0.22em] text-lime">TOLS CASINO</span>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden">
        {img ? (
          <Image src={img} fittingType="fill" className="absolute inset-0 w-full h-full" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-3xl font-display" style={{ color: frame }}>
            {String(card.card_name || card.collection || "T").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.8) 100%)" }} />
        {card.is_new && <span className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 rounded bg-lime text-black">NEW</span>}
        <span className="absolute bottom-1 left-1 text-[8px] font-black px-1.5 rounded" style={{ background: frame, color: "#0a0a0a" }}>
          {rarityLabel(card.rarity).toUpperCase()}
        </span>
      </div>
      <div className="px-1.5 py-1.5">
        <p className="text-[11px] font-display text-white leading-none truncate">{(card.card_name || "").toUpperCase()}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[8px] font-bold tracking-wider text-white/40 truncate">{card.collection}</span>
          <span className="text-[9px] font-mono text-white/50">${Number(card.insured_value || 0).toLocaleString()}</span>
        </div>
      </div>
    </Tag>
  );
}