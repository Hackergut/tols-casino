import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/client";
import { Sparkles, Zap, Gem, Crown, Star } from "lucide-react";

const RARITY = {
  common: { label: "Common", color: "#9ca3af", Icon: Star, ring: "border-white/15", glow: "" },
  rare: { label: "Rare", color: "#60a5fa", Icon: Zap, ring: "border-blue-400/40", glow: "shadow-[0_0_18px_-4px_rgba(96,165,250,0.6)]" },
  epic: { label: "Epic", color: "#c084fc", Icon: Gem, ring: "border-purple-400/40", glow: "shadow-[0_0_18px_-4px_rgba(192,132,252,0.65)]" },
  legendary: { label: "Legendary", color: "#ccff00", Icon: Crown, ring: "border-lime/50", glow: "glow-lime" },
  mythic: { label: "Mythic", color: "#fb7185", Icon: Sparkles, ring: "border-rose-400/50", glow: "shadow-[0_0_22px_-3px_rgba(251,113,133,0.7)]" },
};

const shorten = (id) => {
  if (!id) return "anon";
  const s = String(id);
  return s.length > 8 ? `${s.slice(0, 3)}…${s.slice(-3)}` : s;
};
const collectionInitial = (c) => (String(c || "").trim().charAt(0) || "★").toUpperCase();

/**
 * "LIVE CARD PULLS" ticker — horizontal scroll of recent collectible-card
 * extractions across collections (sport, Pokémon, Yu-Gi-Oh!, etc.). New pulls
 * arrive in real time via the entity subscription.
 */
export default function LivePullsTicker() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    base44.entities.CardPull
      .list("-created_date", 24)
      .then((list) => active && list && setRows(list.slice(0, 18)))
      .catch(() => {})
      .finally(() => active && setLoading(false));

    const unsub = base44.entities.CardPull.subscribe((event) => {
      if (event.type === "create" && event.data) {
        setRows((prev) => {
          const next = [event.data, ...prev.filter((r) => r.id !== event.data.id)];
          return next.slice(0, 24);
        });
        // nudge scroll back to start so the fresh pull is visible
        if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    });

    return () => {
      active = false;
      if (typeof unsub === "function") unsub();
    };
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#121212] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
        <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
        <span className="text-[11px] font-black tracking-[0.18em] text-white/80 uppercase">Live card pulls</span>
      </div>
      <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto scrollbar-hide px-3 py-3 min-h-[88px] items-center">
        {loading ? (
          <span className="text-xs text-white/40 px-2">Loading live pulls…</span>
        ) : rows.length === 0 ? (
          <span className="text-xs text-white/40 px-2">Waiting for the first card pull — open a pack to be the first.</span>
        ) : (
          rows.map((r) => {
            const rar = RARITY[r.rarity] || RARITY.common;
            const Icon = rar.Icon;
            return (
              <div
                key={r.id}
                className={`shrink-0 w-40 rounded-xl bg-gradient-to-b from-[#161616] to-[#0a0a0a] border ${rar.ring} ${rar.glow} overflow-hidden`}
              >
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wide text-white/70 truncate">{r.collection}</span>
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase" style={{ color: rar.color }}>
                    <Icon className="w-3 h-3" /> {rar.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-2">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black border"
                    style={{ color: rar.color, borderColor: `${rar.color}40`, background: `radial-gradient(circle at 50% 30%, ${rar.color}22, transparent 70%)` }}
                  >
                    {collectionInitial(r.collection)}
                  </div>
                  <div className="leading-tight min-w-0">
                    <p className="text-xs font-black text-white truncate">{r.card_name}</p>
                    <p className="text-[10px] text-white/40 font-mono truncate">{shorten(r.puller || r.created_by_id)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}