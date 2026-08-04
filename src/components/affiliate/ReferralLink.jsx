import React, { useState } from "react";
import { Copy, Check, Link2, Share2 } from "lucide-react";

export default function ReferralLink({ code }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/?ref=${code}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#161616] to-[#0d0d0d] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-lime/10 border border-lime/20">
          <Link2 className="w-4.5 h-4.5 text-lime" />
        </div>
        <div>
          <h3 className="font-bold text-white">Your referral link</h3>
          <p className="text-xs text-white/40">Share it to invite new players</p>
        </div>
      </div>

      <div className="flex items-center gap-2 h-11 sm:h-12 rounded-xl bg-[#0d0d0d] border border-white/10 px-3 sm:px-4">
        <span className="text-xs sm:text-sm text-white/50 truncate flex-1 font-mono">{link}</span>
        <button onClick={copy} className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-lime text-black text-xs font-bold hover:opacity-90 transition shrink-0">
          {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-white/40">Code:</span>
        <span className="font-mono font-bold text-lime tracking-wider">{code}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {["Twitter", "Telegram", "Discord"].map((s) => (
          <button key={s} className="flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 text-xs font-semibold text-white/70 hover:border-lime/40 hover:text-lime transition">
            <Share2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}