import React from "react";
import { AlertTriangle, Gauge } from "lucide-react";
import { DEMO_MAX_DAILY_WAGER, DEMO_MAX_REFILLS_PER_DAY } from "@/lib/demoLimits";

// Shows the player how much fun-money allowance is left today.
export default function DemoLimitBanner({ limits, wallet }) {
  if (!limits) return null;
  const exhausted = limits.exhausted;

  return (
    <div className={`rounded-xl border px-4 py-2.5 mb-3 flex items-center justify-between gap-3 flex-wrap ${exhausted ? "border-red-500/40 bg-red-500/10" : "border-white/10 bg-[#111]"}`}>
      <div className="flex items-center gap-2 text-xs font-bold">
        {exhausted ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Gauge className="w-4 h-4 text-lime" />}
        <span className={exhausted ? "text-red-300" : "text-white/70"}>
          {exhausted
            ? "Daily demo allowance reached — resets tomorrow"
            : `Demo allowance · ${limits.wagerLeft.toLocaleString()} FUN left today`}
        </span>
      </div>
      <div className="flex items-center gap-4 text-[11px] text-white/40 tabular-nums">
        <span>Top-ups {DEMO_MAX_REFILLS_PER_DAY - limits.refillsLeft}/{DEMO_MAX_REFILLS_PER_DAY}</span>
        <span>Wagered {(wallet?.dayWagered || 0).toLocaleString()} / {DEMO_MAX_DAILY_WAGER.toLocaleString()}</span>
        <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className={`h-full ${exhausted ? "bg-red-400" : "bg-lime"}`} style={{ width: `${limits.wagerPct}%` }} />
        </div>
      </div>
    </div>
  );
}