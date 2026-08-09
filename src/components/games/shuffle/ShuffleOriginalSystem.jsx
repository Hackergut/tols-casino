import React from "react";

// TOLS Professional Design System for Originals
// Tokens: bg #080808, panel #121212, border #232323, input #1a1a1a, lime #ccff00, muted #888
export const ShuffleTokens = {
  bg: "#080808",
  panel: "#121212",
  panelRaised: "#1a1a1a",
  border: "#232323",
  borderStrong: "#2a2a2a",
  lime: "#ccff00",
  limeHover: "#d4ff33",
  textMuted: "#888",
  textFaint: "#555",
};

export function ShuffleCard({ children, className = "" }) {
  return <div className={`rounded-xl border border-white/[0.06] bg-[#121212] ${className}`}>{children}</div>;
}

export function ShuffleInput({ label, value, onChange, icon, rightSlot, placeholder }) {
  return (
    <div>
      <label className="text-[11px] font-bold tracking-wide uppercase text-white/40 flex items-center gap-1">
        {label} <span className="w-3 h-3 rounded-full border border-white/20 grid place-items-center text-[8px]">i</span>
      </label>
      <div className="mt-1.5 flex items-center h-11 rounded-xl bg-[#1a1a1a] border border-white/10 focus-within:border-white/20 transition">
        <input value={value} onChange={onChange} placeholder={placeholder} className="flex-1 bg-transparent outline-none px-3 text-sm font-bold text-white placeholder-white/30 tabular-nums" />
        {icon && <span className="pr-3 text-white/40">{icon}</span>}
        {rightSlot}
      </div>
    </div>
  );
}
