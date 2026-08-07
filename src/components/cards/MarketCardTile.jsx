import React from "react";
import { Image } from "@/components/ui/image";
import { ShieldCheck } from "lucide-react";
import { collectionImage, rarityColor, rarityLabel } from "@/lib/packs";

// Marketplace tile — graded-slab presentation: dark panel, floating card with
// mirror reflection, rarity-tinted frame, then a spec table (insured value /
// grade) and the primary action.
export default function MarketCardTile({ listing, badge, actionLabel, actionVariant = "solid", onAction, footer }) {
  const frame = rarityColor(listing.rarity);
  const img = collectionImage(listing);

  return (
    <div
      className="group relative rounded-2xl bg-[#16181c] border border-white/8 overflow-hidden transition hover:border-white/20"
      style={{ boxShadow: `inset 0 0 0 1px ${frame}14` }}
    >
      {badge && (
        <span className="absolute top-2.5 right-2.5 z-20 text-[10px] font-black px-2 py-0.5 rounded-md bg-lime text-black">{badge}</span>
      )}

      {/* Slab stage */}
      <div className="relative px-4 pt-4 pb-2" style={{ background: `radial-gradient(120% 80% at 50% 0%, ${frame}1f, transparent 70%)` }}>
        <div className="relative mx-auto w-[64%] aspect-[3/4] rounded-lg overflow-hidden border-2 bg-[#0a0a0a]" style={{ borderColor: frame, boxShadow: `0 10px 30px -12px ${frame}` }}>
          {img ? (
            <Image src={img} fittingType="fill" className="absolute inset-0 w-full h-full" />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-3xl font-display" style={{ color: frame }}>
              {String(listing.card_name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
        {/* reflection */}
        <div className="relative mx-auto w-[64%] h-8 mt-0.5 overflow-hidden opacity-25 [transform:scaleY(-1)]">
          {img && <Image src={img} fittingType="fill" className="absolute inset-x-0 bottom-0 w-full h-24" />}
          <div className="absolute inset-0 bg-gradient-to-t from-[#16181c] via-[#16181c]/70 to-transparent" />
        </div>
      </div>

      {/* Meta */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: frame }}>{rarityLabel(listing.rarity)}</span>
          <span className="text-[10px] text-white/30">·</span>
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider truncate">{listing.collection}</span>
        </div>
        <h4 className="mt-1 text-[15px] font-black text-white leading-snug line-clamp-2">{listing.card_name}</h4>

        <div className="mt-3 pt-3 border-t border-white/8 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-white/40">Insured value</div>
            <div className="text-sm font-black text-white tabular-nums">${Number(listing.insured_value || 0).toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/40">Grade</div>
            <div className="text-sm font-black text-white inline-flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-lime" />PSA 10</div>
          </div>
        </div>

        {footer}

        {actionLabel && (
          <button
            onClick={onAction}
            className={`mt-3 w-full h-10 rounded-xl text-sm font-black transition ${
              actionVariant === "solid" ? "bg-lime text-black hover:opacity-90" : "border-2 border-lime/40 text-lime hover:bg-lime/10"
            }`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}