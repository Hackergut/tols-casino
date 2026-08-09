import React, { useState, useEffect } from "react";
import { Ticket, Check, X, Sparkles } from "lucide-react";
import { redeemCode, redeemCodeBackend, fetchRedeemCodesFromBackend, REDEEM_CODES } from "@/lib/bonus";
import { useWallet } from "@/components/WalletProvider";
import { base44 } from "@/api/client";

export default function RedeemPanel() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [available, setAvailable] = useState(REDEEM_CODES);
  const { updateBalance } = useWallet();

  useEffect(() => {
    fetchRedeemCodesFromBackend().then((map) => { if (map && Object.keys(map).length) setAvailable(map); });
  }, []);

  const submit = async () => {
    // try backend first if logged in
    try {
      const user = await base44.auth.me();
      const r = await redeemCodeBackend(code, user.id);
      if (r.ok) {
        if (r.currency === "USDT") updateBalance(r.reward, 0);
        setMsg({ ok: true, text: `✓ ${r.code} — +${r.reward} ${r.currency} — ${r.desc} (backend)` });
        setCode("");
      } else {
        setMsg({ ok: false, text: r.error });
      }
      setTimeout(() => setMsg(null), 3000);
      return;
    } catch {}
    const r = redeemCode(code);
    if (r.ok) {
      if (r.currency === "USDT") updateBalance(r.reward, 0);
      setMsg({ ok: true, text: `✓ ${r.code} — +${r.reward} ${r.currency} — ${r.desc}` });
      setCode("");
    } else {
      setMsg({ ok: false, text: r.error });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-lime/10 border border-lime/20 grid place-items-center text-lime">
          <Ticket className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-black text-white flex items-center gap-2">Redeem Code <Sparkles className="w-4 h-4 text-lime" /></h3>
          <p className="text-xs text-white/40">Enter promo code to claim bonus — TOLS style</p>
        </div>
        <span className="ml-auto hidden sm:inline text-[10px] font-black tracking-widest px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">TOLS</span>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code e.g. WELCOME100"
            className="w-full h-12 rounded-xl bg-[#080808] border border-white/10 px-4 pr-10 text-sm font-mono font-bold tracking-widest text-white placeholder-white/20 outline-none focus:border-lime/40 uppercase"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20">◈</span>
        </div>
        <button onClick={submit} disabled={!code.trim()} className="h-12 px-6 rounded-xl bg-lime text-black font-black text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition">
          Redeem
        </button>
      </div>

      {msg && (
        <div className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 rounded-xl border ${msg.ok ? "bg-lime/10 border-lime/20 text-lime" : "bg-red-500/10 border-red-500/20 text-red-300"}`}>
          {msg.ok ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />} {msg.text}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-white/[0.06]">
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Try these codes</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(available).map((c) => (
            <button key={c} onClick={() => setCode(c)} className="px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-white/60 hover:bg-lime hover:text-black hover:border-lime transition">
              {c}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-white/20 mt-2">Demo codes — in prod they are validated server-side via <code className="text-white/40">PlatformSetting</code></p>
      </div>
    </div>
  );
}
