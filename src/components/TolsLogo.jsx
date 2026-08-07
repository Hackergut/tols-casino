import React from "react";

// TOLS wordmark with a collectible-card slab icon placed laterally (left of
// the text) so the logo stays consistent with the rest of the app typography.
export default function TolsLogo({ className = "", size = "md", withCard = true }) {
  const sizes = { sm: "text-3xl", md: "text-4xl", lg: "text-6xl" };
  const card = {
    sm: { w: "0.72em", h: "1em" },
    md: { w: "0.72em", h: "1em" },
    lg: { w: "0.72em", h: "1em" },
  }[size];

  const CardIcon = (
    <svg
      viewBox="0 0 100 130"
      width={card.w}
      height={card.h}
      className="inline-block align-middle shrink-0"
      style={{ filter: "drop-shadow(0 0 5px rgba(204,255,0,0.5))" }}
    >
      <rect x="6" y="6" width="88" height="118" rx="6" fill="#0a0a0a" stroke="#ccff00" strokeWidth="6" />
      <rect x="22" y="26" width="56" height="50" rx="4" fill="none" stroke="#ccff00" strokeWidth="3" opacity="0.5" />
      <line x1="22" y1="44" x2="78" y2="44" stroke="#ccff00" strokeWidth="2" opacity="0.4" />
      <rect x="22" y="94" width="56" height="12" rx="3" fill="#ccff00" opacity="0.18" />
      <line x1="28" y1="100" x2="72" y2="100" stroke="#ccff00" strokeWidth="2.5" opacity="0.7" />
    </svg>
  );

  return (
    <span className={`font-display uppercase leading-none tracking-[-0.08em] text-lime ${sizes[size]} inline-flex items-center gap-[0.12em] ${className}`}>
      {withCard && CardIcon}
      TOLS
    </span>
  );
}