import React from "react";
import { Image } from "@/components/ui/image";
import { rarityColor, rarityLabel, rarityVisual, collectionAccent, collectionCodes, ovrFor, nameParts, collectionAbbr, collectionImage } from "@/lib/packs";

// New TOLS CASINO neon-HUD collectible card. Thick glowing lime border with
// circuit corners, framed "TOLS CASINO" header, OVR rating box, real artwork
// portrait with neon streaks, slashed nameplate, footer branding. The rarity
// drives the border color + glow halo (visual rarity indicator).
export default function TolsCard({ card, className = "" }) {
  const frame = rarityColor(card.rarity);
  const visual = rarityVisual(card.rarity);
  const accent = collectionAccent(card.collection);
  const ovr = ovrFor(card);
  const codes = collectionCodes(card.collection);
  const { first, last } = nameParts(card);
  const abbr = collectionAbbr(card.collection);
  const monogram = String(last || card.collection || "T").charAt(0).toUpperCase();
  const tail = String(card.grading_id || card.token_id || "").slice(-2);
  const img = collectionImage(card);

  return (
    <div
      className={`relative rounded-xl bg-[#0a0a0a] ${visual.animate ? "rarity-pulse" : ""} ${className}`}
      style={{ border: `${visual.borderWidth}px solid ${visual.border}`, boxShadow: visual.glow }}
    >
      <Corner className="top-1 left-1" color={frame} />
      <Corner className="top-1 right-1 rotate-90" color={frame} />
      <Corner className="bottom-1 left-1 -rotate-90" color={frame} />
      <Corner className="bottom-1 right-1 rotate-180" color={frame} />

      {/* Rarity ribbon (top edge) */}
      <div className="absolute -top-px left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-b-md text-[8px] font-black tracking-widest" style={{ background: frame, color: "#0a0a0a" }}>
        {rarityLabel(card.rarity).toUpperCase()}
      </div>

      {/* Header frame */}
      <div className="relative mt-3 mx-2 rounded-md border px-2 py-1 text-center" style={{ borderColor: frame + "88", background: frame + "12" }}>
        <span className="text-[11px] font-display tracking-[0.22em] text-lime">TOLS CASINO</span>
      </div>

      {/* Body */}
      <div className="relative px-2.5 pt-2.5 pb-2">
        <div className="flex items-start justify-between">
          <div className="w-14 rounded-md border-2 p-1 text-center" style={{ borderColor: frame, background: "rgba(0,0,0,0.55)" }}>
            <div className="text-2xl font-display leading-none text-white tabular-nums">{ovr}</div>
            <div className="mt-1 space-y-0.5">
              {codes.map((c) => <div key={c} className="text-[7px] font-bold tracking-wider text-white/55 leading-none">{c}</div>)}
            </div>
          </div>
          <div className="w-12 rounded-md border-2 p-1 text-center" style={{ borderColor: frame, background: "rgba(0,0,0,0.55)" }}>
            <div className="grid place-items-center h-5 rounded-sm" style={{ background: frame + "1a" }}>
              <span className="text-[9px] font-display tracking-wider" style={{ color: frame }}>{abbr}</span>
            </div>
            <div className="mt-1 text-[11px] font-display text-white tabular-nums">{tail}</div>
          </div>
        </div>

        {/* Real artwork portrait with neon streaks */}
        <div className="relative h-32 overflow-hidden rounded-md mt-2 border-2" style={{ borderColor: frame, background: "#050505" }}>
          {img ? (
            <Image src={img} fittingType="fill" className="absolute inset-0 w-full h-full" />
          ) : (
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, ${accent}26, #0a0a0a 80%)` }} />
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.75) 100%)" }} />
          <div className="absolute inset-0 flex justify-around opacity-40 pointer-events-none">
            {[0, 1, 2, 3, 4].map((i) => <span key={i} className="w-px h-full" style={{ background: `linear-gradient(${accent}, transparent)`, opacity: 0.5 - i * 0.05 }} />)}
          </div>
          {!img && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-4xl font-display" style={{ color: accent, textShadow: `0 0 14px ${accent}66` }}>{monogram}</span>
            </div>
          )}
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-display tracking-[0.3em] text-white/80 [writing-mode:vertical-rl] rotate-180">{abbr}</span>
        </div>
      </div>

      {/* Nameplate */}
      <div className="relative mx-2.5 mb-2 rounded-md border-2 px-2.5 py-1.5" style={{ borderColor: frame, background: "rgba(0,0,0,0.6)" }}>
        <div className="flex items-center gap-1.5">
          {first && <span className="text-[9px] font-bold tracking-wider text-white/55">{first}</span>}
          <Slashes color={frame} className="ml-auto" />
        </div>
        <div className="text-lg font-display tracking-tight text-white leading-none truncate" style={{ textShadow: `0 0 12px ${frame}55` }}>{last}</div>
      </div>

      {/* Footer */}
      <div className="relative flex items-center gap-2 px-2.5 pb-2.5">
        <div className="w-6 h-6 rounded-full grid place-items-center border-2" style={{ borderColor: frame }}>
          <span className="text-[10px] font-display" style={{ color: frame }}>T</span>
        </div>
        <span className="text-[9px] font-bold tracking-widest text-white/60 px-2 py-0.5 rounded-full border" style={{ borderColor: frame + "88" }}>{abbr}</span>
        <span className="ml-auto text-[9px] font-mono text-white/40">${Number(card.insured_value || 0).toLocaleString()}</span>
      </div>
    </div>
  );
}

function Corner({ className = "", color }) {
  return <span className={`absolute w-3 h-3 ${className}`} style={{ borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />;
}

function Slashes({ color, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[0, 1, 2].map((i) => <span key={i} className="block w-[3px] h-3 rotate-[25deg] rounded-sm" style={{ background: color, opacity: 0.85 }} />)}
    </span>
  );
}