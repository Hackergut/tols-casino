import React from "react";

// CASINO / SPORTS product switch. Sports is not launched yet, so it is
// explicitly marked as coming soon instead of linking to an empty product.
export default function ProductToggle({ collapsed }) {
  if (collapsed) return null;
  return (
    <div className="mx-3 flex items-center p-1 rounded-xl bg-[#161616] border border-white/5">
      <span className="flex-1 h-8 rounded-lg bg-lime text-black text-[11px] font-black tracking-wider flex items-center justify-center">
        CASINO
      </span>
      <span
        title="Sportsbook coming soon"
        className="flex-1 h-8 rounded-lg text-[11px] font-black tracking-wider flex items-center justify-center gap-1 text-white/30 cursor-not-allowed"
      >
        SPORTS
        <span className="px-1 rounded bg-white/10 text-[7px] font-black text-white/50">SOON</span>
      </span>
    </div>
  );
}