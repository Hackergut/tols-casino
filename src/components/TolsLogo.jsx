import React from "react";

// TOLS logo where the "O" is a stylized collectible card (neon slab) so the
// letterform doubles as the platform's card identity.
export default function TolsLogo({ className = "", size = "md" }) {
  const sizes = { sm: "text-3xl", md: "text-4xl", lg: "text-6xl" };
  const card = {
    sm: { w: "0.74em", h: "1em", rx: "3", bw: "2.5" },
    md: { w: "0.74em", h: "1em", rx: "4", bw: "3" },
    lg: { w: "0.74em", h: "1em", rx: "6", bw: "5" },
  }[size];

  return (
    <span className={`font-display uppercase leading-none tracking-[-0.06em] text-lime ${sizes[size]} inline-flex items-center ${className}`}>
      T
      <svg
        viewBox="0 0 100 130"
        width={card.w}
        height={card.h}
        className="inline-block mx-[0.02em] -translate-y-[0.04em] align-middle"
        style={{ filter: "drop-shadow(0 0 6px rgba(204,255,0,0.55))" }}
      >
        {/* slab frame */}
        <rect x="6" y="6" width="88" height="118" rx={card.rx} fill="#0a0a0a" stroke="#ccff00" strokeWidth={card.bw} />
        {/* inner art panel */}
        <rect x="20" y="24" width="60" height="52" rx="4" fill="none" stroke="#ccff00" strokeWidth="3" opacity="0.55" />
        <line x1="20" y1="42" x2="80" y2="42" stroke="#ccff00" strokeWidth="2" opacity="0.4" />
        {/* nameplate line */}
        <rect x="20" y="92" width="60" height="14" rx="3" fill="#ccff00" opacity="0.18" />
        <line x1="26" y1="99" x2="74" y2="99" stroke="#ccff00" strokeWidth="2.5" opacity="0.7" />
      </svg>
      LS
    </span>
  );
}