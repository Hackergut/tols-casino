import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { COINS } from "@/components/wallet/coins";

// Custom currency dropdown: coin avatar + name (SYMBOL) on the left,
// optional USD balance on the right, chevron. Matches the reference "Valuta" field.
export default function CoinSelect({ value, onChange, balance }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = COINS.find((c) => c.id === value) || COINS[0];

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-14 flex items-center gap-3 px-3.5 rounded-xl bg-[#1a1a1a] border border-white/10 hover:border-lime/30 transition"
      >
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-black shrink-0"
          style={{ background: active.color }}
        >
          {active.symbol}
        </span>
        <span className="text-sm font-bold text-white">
          {active.name} ({active.symbol})
        </span>
        {balance != null && (
          <span className="ml-auto text-sm text-white/45 tabular-nums">${balance.toFixed(2)}</span>
        )}
        <ChevronDown className="w-4 h-4 text-white/40 ml-2 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-full rounded-xl bg-[#1a1a1a] border border-white/10 overflow-hidden shadow-2xl">
          {COINS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 h-12 hover:bg-white/5 transition ${
                c.id === value ? "bg-white/[0.04]" : ""
              }`}
            >
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-black shrink-0"
                style={{ background: c.color }}
              >
                {c.symbol}
              </span>
              <span className="text-sm font-bold text-white">
                {c.name} ({c.symbol})
              </span>
              {balance != null && (
                <span className="ml-auto text-sm text-white/45 tabular-nums">${balance.toFixed(2)}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}