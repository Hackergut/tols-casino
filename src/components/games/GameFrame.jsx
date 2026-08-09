import React from "react";
import { ShieldCheck, Settings, BarChart3, ExternalLink } from "lucide-react";

// TOLS Professional GameFrame: dark #080808 arena, minimal header, no grid, Shuffle stats bar
export default function GameFrame({ title, badge, children, stats, className = "", minH = "min-h-[300px] sm:min-h-[360px]" }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#121212] overflow-hidden">
      {(title || badge) && (
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06] bg-[#0a0a0a]">
          <span className="text-xs font-black tracking-widest uppercase text-white/60 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" /> {title}
          </span>
          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 grid place-items-center rounded-lg bg-white/[0.06] border border-white/10 text-white/40 hover:text-white"><Settings className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 grid place-items-center rounded-lg bg-white/[0.06] border border-white/10 text-white/40 hover:text-white"><ExternalLink className="w-3.5 h-3.5" /></button>
            <button className="w-7 h-7 grid place-items-center rounded-lg bg-white/[0.06] border border-white/10 text-white/40 hover:text-white"><BarChart3 className="w-3.5 h-3.5" /></button>
            {badge || (
              <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-white/30 ml-1">
                <ShieldCheck className="w-3 h-3" /> Provably Fair
              </span>
            )}
          </div>
        </div>
      )}
      <div
        className={`relative flex flex-col items-center justify-center p-4 sm:p-6 ${minH} ${className}`}
        style={{ background: "#080808" }}
      >
        <div className="relative w-full flex flex-col items-center">{children}</div>
      </div>
      {stats && stats.length > 0 && (
        <div className="grid divide-x divide-white/[0.06] border-t border-white/[0.06] bg-[#0a0a0a]" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
          {stats.map((s) => (
            <div key={s.label} className="px-3 py-2 text-center">
              <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{s.label}</p>
              <p className={`text-sm font-black tabular-nums mt-0.5 font-mono ${s.tone === "danger" ? "text-red-400" : s.tone === "muted" ? "text-white/60" : "text-white"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}