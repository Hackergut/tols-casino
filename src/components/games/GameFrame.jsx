import React from "react";
import { ShieldCheck } from "lucide-react";

// Professional game arena: consistent depth, header and footer stat row
// shared by every TOLS original. Purely presentational.
export default function GameFrame({ title, badge, children, stats, className = "", minH = "min-h-[300px] sm:min-h-[360px]" }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1024] overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]">
      {(title || badge) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">{title}</span>
          {badge || (
            <span className="flex items-center gap-1 text-[10px] font-bold text-lime/70">
              <ShieldCheck className="w-3 h-3" /> PROVABLY FAIR
            </span>
          )}
        </div>
      )}
      <div
        className={`relative flex flex-col items-center justify-center p-4 sm:p-8 ${minH} ${className}`}
        style={{ background: "radial-gradient(120% 90% at 50% 0%, #11182e 0%, #0c1024 45%, #060814 100%)" }}
      >
        <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/30 to-transparent" />
        <div className="relative w-full flex flex-col items-center">{children}</div>
      </div>
      {stats && stats.length > 0 && (
        <div className="grid divide-x divide-white/5 border-t border-white/5 bg-black/40" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
          {stats.map((s) => (
            <div key={s.label} className="px-3 py-2.5 text-center">
              <p className="text-[9px] uppercase tracking-wider text-white/35 font-bold">{s.label}</p>
              <p className={`text-sm font-black tabular-nums mt-0.5 ${s.tone === "danger" ? "text-red-400" : s.tone === "muted" ? "text-white/70" : "text-lime"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}