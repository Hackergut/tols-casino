import React, { useState } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";

export default function DepositCard({ chain }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(chain.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
          style={{ background: `${chain.color}1a`, color: chain.color }}
        >
          {chain.label[0]}
        </span>
        <div>
          <p className="font-bold text-white">{chain.label}</p>
          <p className="text-xs text-white/40">Free deposit · credited after 1 confirmation</p>
        </div>
      </div>
      <label className="text-xs font-semibold text-white/40 uppercase tracking-wide">
        {chain.label} deposit address
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#0d0d0d] border border-white/10 p-3">
        <code className="flex-1 text-xs sm:text-sm font-mono text-white/80 break-all">{chain.address}</code>
        <button
          onClick={copy}
          className="shrink-0 w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-lime hover:border-lime/30 transition"
        >
          {copied ? <Check className="w-4 h-4 text-lime" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex items-start gap-1.5 mt-3 text-xs text-white/30">
        <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p>Send only USDT on the {chain.label} network. Other tokens or networks may be lost.</p>
      </div>
    </div>
  );
}