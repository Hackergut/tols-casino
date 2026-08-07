import React from "react";
import { rarityColor, rarityLabel, collectionAccent, collectionCodes, ovrFor, nameParts, collectionAbbr } from "@/lib/packs";

// TOLS CASINO HUD-style collectible card. Neon geometric frame (rarity-tinted:
// legendary = lime brand, mythic = gold), OVR rating box, vertical collection
// rail, stacked rarity label, nameplate, and footer badge.

function HashMarks({ color = "#fff", className = "" }) {
  return (
    <span className={`inline-flex items-end gap-0.5 ${className}`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="block w-[2px] h-3 rotate-[25deg] rounded-sm" style={{ background: color, opacity: 0.85 }} />
      ))}
    </span>
  );
}

export default function CardVisual({ card, side = "front", className = "" }) {
  const frame = rarityColor(card.rarity);
  const accent = collectionAccent(card.collection);
  const ovr = ovrFor(card);
  const codes = collectionCodes(card.collection);
  const { first, last } = nameParts(card);
  const abbr = collectionAbbr(card.collection);
  const monogram = String(last || card.collection || "T").charAt(0).toUpperCase();
  const tail = String(card.grading_id || card.token_id || "").slice(-2);

  if (side === "back") {
    return (
      <div className={`relative rounded-lg bg-[#0a0a0a] border-2 ${className}`} style={{ borderColor: frame + "66" }}>
        <div className="px-3 py-1.5 border-b text-center" style={{ borderColor: frame + "44" }}>
          <span className="text-[11px] font-display tracking-[0.2em]" style={{ color: "#ccff00" }}>TOLS CASINO</span>
        </div>
        <div className="px-3 py-5 flex flex-col items-center gap-3 bg-grid">
          <div className="w-20 h-20 rounded-full grid place-items-center border-2" style={{ borderColor: frame, boxShadow: `0 0 22px -6px ${frame}` }}>
            <span className="text-3xl font-display" style={{ color: accent }}>T</span>
          </div>
          <p className="text-[10px] font-black tracking-widest text-white/50 uppercase">Certified Authenticity</p>
          <div className="w-full flex gap-0.5 h-7 items-end">{Array.from({ length: 26 }).map((_, i) => <span key={i} className="flex-1 bg-white/45" style={{ height: 5 + ((i * 7) % 18) }} />)}</div>
          <div className="w-full grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md border border-white/10 py-1">
              <div className="text-[8px] text-white/40">GRADING</div>
              <div className="text-[11px] font-black text-white">{card.grading_company || "PSA"}</div>
            </div>
            <div className="rounded-md border border-white/10 py-1">
              <div className="text-[8px] text-white/40">SERIAL</div>
              <div className="text-[11px] font-mono text-white">{card.grading_id}</div>
            </div>
          </div>
        </div>
        <div className="px-3 py-1.5 border-t text-[8px] font-mono text-white/35 text-center truncate" style={{ borderColor: frame + "44" }}>{card.token_id}</div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden border-2 bg-[#0a0a0a] ${className}`} style={{ borderColor: frame, boxShadow: `0 0 26px -8px ${frame}` }}>
      {/* circuit / grid texture */}
      <div className="absolute inset-0 bg-grid opacity-70 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 35%, ${accent}1f, transparent 70%)` }} />

      {/* Header */}
      <div className="relative flex items-center justify-center h-7 border-b" style={{ borderColor: frame + "55", background: "rgba(0,0,0,0.4)" }}>
        <span className="text-[11px] font-display tracking-[0.22em] text-lime">TOLS CASINO</span>
      </div>

      {/* Body */}
      <div className="relative px-2.5 pt-2.5 pb-2 flex-1">
        {/* top row: rating box + badge */}
        <div className="flex items-start justify-between">
          {/* OVR rating box */}
          <div className="w-14 rounded-md border-2 p-1 text-center" style={{ borderColor: frame, background: "rgba(0,0,0,0.5)" }}>
            <div className="text-2xl font-display leading-none text-white tabular-nums">{ovr}</div>
            <div className="mt-1 space-y-0.5">
              {codes.map((c) => <div key={c} className="text-[7px] font-bold tracking-wider text-white/55 leading-none">{c}</div>)}
            </div>
          </div>
          {/* badge */}
          <div className="w-12 rounded-md border-2 p-1 text-center" style={{ borderColor: frame, background: "rgba(0,0,0,0.5)" }}>
            <div className="grid place-items-center h-5 rounded-sm" style={{ background: frame + "1a" }}>
              <span className="text-[9px] font-display tracking-wider" style={{ color: frame }}>TOLS</span>
            </div>
            <div className="mt-1 text-[11px] font-display text-white tabular-nums">{tail}</div>
          </div>
        </div>

        {/* center portrait */}
        <div className="relative h-28 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full blur-2xl" style={{ background: `${frame}33` }} />
          <div className="relative w-20 h-20 rounded-full grid place-items-center border-2" style={{ borderColor: frame, background: `radial-gradient(circle at 50% 30%, ${accent}26, #0a0a0a 80%)` }}>
            <span className="text-4xl font-display" style={{ color: accent, textShadow: `0 0 14px ${accent}66` }}>{monogram}</span>
          </div>
          {/* right vertical rail */}
          <div className="absolute right-0 top-0 bottom-0 flex items-center">
            <div className="flex flex-col items-center gap-2">
              <HashMarks color={frame} />
              <span className="text-[9px] font-display tracking-[0.3em] text-white/70 [writing-mode:vertical-rl] rotate-180">{String(card.collection || "").toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* lower-left stacked rarity label */}
        <div className="absolute left-2.5 bottom-2 flex items-end gap-1.5">
          <HashMarks color={frame} />
          <span className="text-[10px] font-display tracking-[0.18em] text-white/75 leading-tight">
            {rarityLabel(card.rarity).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Nameplate */}
      <div className="relative mx-2.5 mb-2 rounded-md border-2 px-2.5 py-1.5" style={{ borderColor: frame, background: "rgba(0,0,0,0.55)" }}>
        <div className="flex items-center gap-1.5">
          {first && <span className="text-[9px] font-bold tracking-wider text-white/55">{first}</span>}
          <HashMarks color={frame} className="ml-auto" />
        </div>
        <div className="text-lg font-display tracking-tight text-white leading-none truncate" style={{ textShadow: `0 0 12px ${frame}55` }}>{last}</div>
      </div>

      {/* Footer */}
      <div className="relative flex items-center gap-2 px-2.5 pb-2">
        <div className="w-6 h-6 rounded-full grid place-items-center border-2" style={{ borderColor: frame }}>
          <span className="text-[10px] font-display" style={{ color: frame }}>T</span>
        </div>
        <span className="text-[9px] font-bold tracking-widest text-white/60 px-2 py-0.5 rounded-full border" style={{ borderColor: frame + "88" }}>{abbr}</span>
        <span className="ml-auto text-[9px] font-mono text-white/35">${Number(card.insured_value || 0).toLocaleString()}</span>
      </div>
    </div>
  );
}