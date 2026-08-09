import React, { useEffect, useState } from "react";
import { Gift, RotateCcw, Shield, Calendar, Crown, Sparkles, Check, Lock } from "lucide-react";
import { BONUSES, fetchBonusConfig, isBonusClaimed, claimBonus, claimBonusBackend } from "@/lib/bonus";
import { useWallet } from "@/components/WalletProvider";
import { base44 } from "@/api/client";

const ICONS = { Gift, RotateCcw, Shield, Calendar, Crown, Sparkles };

export default function BonusGrid() {
  const { updateBalance } = useWallet();
  const [bonuses, setBonuses] = useState(BONUSES);
  const [claimed, setClaimed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tols_bonus_claimed") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    fetchBonusConfig().then((cfg) => { if (cfg && Array.isArray(cfg) && cfg.length) setBonuses(cfg); });
    // sync claimed from backend if logged in
    base44.auth.me().then((u) => {
      base44.entities.PlatformSetting.filter({ category: "bonus_claim" }).then((list) => {
        const ids = list.filter((s) => s.key.includes(u.id)).map((s) => s.key.split("_").pop());
        if (ids.length) setClaimed(ids);
      }).catch(()=>{});
    }).catch(()=>{});
  }, []);

  const claim = async (b) => {
    if (claimed.includes(b.id)) return;
    // try backend first
    try {
      const user = await base44.auth.me();
      const res = await claimBonusBackend(b.id, user.id);
      if (!res.ok) { if (res.error === "Already claimed") { setClaimed((p)=> [...p, b.id]); return; } throw new Error(res.error); }
      setClaimed((p)=> [...p, b.id]);
      if (b.reward > 0 && b.currency === "USDT") updateBalance(b.reward, 0);
      return;
    } catch {}
    // fallback local
    if (claimBonus(b.id)) {
      setClaimed((p)=> [...p, b.id]);
      if (b.reward > 0 && b.currency === "USDT") updateBalance(b.reward, 0);
    }
  };
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {bonuses.map((b) => {
        const Icon = ICONS[b.icon] || Gift;
        const isClaimed = claimed.includes(b.id);
        return (
          <div key={b.id} className="relative rounded-2xl border border-white/[0.06] bg-[#121212] p-5 overflow-hidden group hover:border-lime/20 transition">
            <div className="absolute inset-0 opacity-[0.04]" style={{ background: `radial-gradient(400px 200px at 80% 0%, ${b.color}, transparent)` }} />
            <div className="relative flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl grid place-items-center border" style={{ background: `${b.color}15`, borderColor: `${b.color}30`, color: b.color }}>
                <Icon className="w-5 h-5" />
              </div>
              {isClaimed ? (
                <span className="px-2.5 py-1 rounded-full bg-lime text-black text-xs font-black flex items-center gap-1"><Check className="w-3 h-3" /> Claimed</span>
              ) : b.type === "rakeback" || b.type === "cashback" ? (
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white/60">{b.percent}%</span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-lime/10 border border-lime/20 text-xs font-black text-lime">+{b.reward} {b.currency}</span>
              )}
            </div>
            <h3 className="relative mt-3 font-black text-white">{b.name}</h3>
            <p className="relative text-xs text-white/40 mt-1 leading-relaxed">{b.desc}</p>
            {b.wager_req && <p className="relative text-[11px] text-white/25 mt-1">Wager x{b.wager_req}</p>}
            <button
              onClick={() => claim(b)}
              disabled={isClaimed}
              className={`relative mt-4 w-full h-10 rounded-xl text-sm font-black transition ${isClaimed ? "bg-white/5 border border-white/10 text-white/30 cursor-not-allowed" : "bg-white text-black hover:bg-lime"}`}
            >
              {isClaimed ? <><Lock className="w-3 h-3 inline mr-1" /> Claimed</> : b.type === "daily" ? "Claim Daily" : "Claim Bonus"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
