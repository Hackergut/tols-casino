import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Plus, Minus, Info, X, Check, ShieldCheck } from "lucide-react";
import { useWallet } from "@/components/WalletProvider";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import TolsCard from "@/components/cards/TolsCard";
import {
  RARITIES, RARITY_ORDER, COLLECTIONS, COLLECTION_NAMES,
  rollRarity, rollInsuredValue, generateTokenId, generateGradingId,
} from "@/lib/packs";

const SWAP_PRICE = 2500;
const CARDS_PER_PACK = 3;
const MAX_QTY = 10;

function rollSwapCard() {
  const collection = COLLECTION_NAMES[Math.floor(Math.random() * COLLECTION_NAMES.length)];
  const rarity = rollRarity();
  const col = COLLECTIONS[collection];
  const pool = col.cards[rarity] || [];
  const fallback = Object.values(col.cards).flat();
  const card_name = pool.length ? pool[Math.floor(Math.random() * pool.length)] : fallback[0] || "Mystery Card";
  return {
    collection, card_name, rarity,
    insured_value: rollInsuredValue(rarity),
    currency: "USDT",
    token_id: generateTokenId(),
    grading_company: "PSA",
    grading_id: generateGradingId(),
    image: "", image_back: "",
    pack_name: "TOLS Swap Pack",
    is_new: true,
  };
}

// chase cards (mythic) shown in the "Available cards" showcase grid.
const CHASE_CARDS = (() => {
  const out = [];
  COLLECTION_NAMES.forEach((c) => {
    (COLLECTIONS[c].cards.mythic || []).forEach((n) => out.push({
      collection: c, card_name: n, rarity: "mythic",
      insured_value: RARITIES.mythic.max, grading_company: "PSA",
      grading_id: "TOLS" + String(100000 + out.length), token_id: "CHASE" + out.length,
    }));
  });
  return out.slice(0, 8);
})();

export default function Swap() {
  const navigate = useNavigate();
  const { wallet, updateBalance } = useWallet();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const [turbo, setTurbo] = useState(false);
  const [selected, setSelected] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [reveal, setReveal] = useState(null);

  // expected value per pack (weighted avg insured value × cards per pack)
  const evPerPack = useMemo(() => {
    const total = RARITY_ORDER.reduce((s, r) => s + RARITIES[r].weight, 0);
    let ev = 0;
    RARITY_ORDER.forEach((r) => { ev += (RARITIES[r].weight / total) * ((RARITIES[r].min + RARITIES[r].max) / 2); });
    return ev * CARDS_PER_PACK;
  }, []);
  const expectedValue = evPerPack * qty;
  const cost = SWAP_PRICE * qty;

  const tiers = [
    { key: "common", pct: 60 },
    { key: "rare", pct: 25 },
    { key: "epic", pct: 10 },
    { key: "legendary", pct: 4, extra: "mythic" },
  ];

  const maxQty = Math.min(MAX_QTY, Math.max(1, Math.floor((wallet?.balance || 0) / SWAP_PRICE)));

  const handleOpen = async () => {
    if (!wallet || wallet.balance < cost) {
      toast({ title: "Insufficient balance", description: `You need ${cost.toLocaleString()} USDT. Top up your wallet.`, variant: "destructive" });
      return;
    }
    setPulling(true);
    try {
      await updateBalance(-cost, 0);
      const pulled = Array.from({ length: qty * CARDS_PER_PACK }, rollSwapCard);
      try { await base44.entities.CollectibleCard.bulkCreate(pulled); } catch (e) { /* ignore persistence */ }
      setReveal(pulled);
    } catch (e) {
      toast({ title: "Error", description: "Open failed.", variant: "destructive" });
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="min-h-screen pb-32">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-5 space-y-5">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1 className="text-2xl sm:text-3xl font-display uppercase text-white tracking-tight">Swap Cards</h1>
        <p className="text-sm text-white/50 -mt-3">Gacha extraction — open the pack, chase the mythics, complete the sets.</p>

        {/* Pack hero */}
        <div className="relative rounded-2xl border border-lime/30 bg-gradient-to-b from-[#1a1c10] to-[#0a0a0a] p-4 sm:p-5 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-lime/10 blur-3xl" />
          <div className="absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full bg-black/55 border border-white/10 text-white">90% buyback</div>
          <div className="relative flex items-center gap-4">
            <div className="shrink-0 w-20 h-28 rounded-xl grid place-items-center border-2 border-lime bg-[#0a0a0a] glow-lime">
              <span className="text-3xl font-display text-lime">TOLS</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white/70 px-2 py-0.5 rounded-full border border-white/15"><ShieldCheck className="w-3 h-3 text-lime" /> GUARANTEED AUTHENTICITY</span>
                <span className="text-[10px] font-black text-black px-2 py-0.5 rounded-full bg-lime">Limited time</span>
              </div>
              <h2 className="text-lg font-black text-white leading-tight">TOLS Swap Pack</h2>
              <p className="text-xs text-white/50 mt-0.5">3 cards per pack · weighted rarities · mythic chases</p>
            </div>
          </div>
        </div>

        {/* Rarity tiers grid (drop probabilities) */}
        <div>
          <h3 className="text-sm font-black text-white mb-2">Drop rates</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {tiers.map((t) => {
              const r = RARITIES[t.key];
              const pct = t.extra ? t.pct + RARITIES[t.extra].weight : t.pct;
              return (
                <div key={t.key} className="rounded-xl bg-[#1e2023] border-2 p-3" style={{ borderColor: r.color + "55" }}>
                  <div className="text-sm font-black" style={{ color: r.color }}>{r.label}</div>
                  <div className="text-[11px] text-white/55 mt-0.5">${r.min.toLocaleString()} – ${r.max.toLocaleString()} · {pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-white">Available cards</h3>
            <span className="text-[11px] text-white/40">{CHASE_CARDS.length} mythic chases</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {CHASE_CARDS.map((c, i) => (
              <button key={i} onClick={() => setSelected(i)} className="relative text-left rounded-xl bg-[#1e2023] border-2 p-2 transition" style={{ borderColor: selected === i ? "#fcfc03" : "transparent" }}>
                {i === 0 && <span className="absolute top-1.5 right-1.5 text-[9px] font-black text-black px-1.5 py-0.5 rounded bg-[#fcfc03] z-10">NEW</span>}
                <div className="aspect-[3/4]"><TolsCard card={c} className="h-full" /></div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                  <div><div className="text-white/40">Insured value</div><div className="font-black text-white">${c.insured_value.toLocaleString()}</div></div>
                  <div><div className="text-white/40">Grade</div><div className="font-black text-white">{c.grading_company} 10</div></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky footer action bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0a0a0a] border-t border-white/10 safe-area-bottom">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <div>
            <div className="text-[10px] text-white/40 font-bold tracking-wider">EXPECTED VALUE</div>
            <div className="text-base font-black text-white tabular-nums">${expectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="flex items-center gap-1 h-10 rounded-xl bg-[#1a1d21] px-1">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 grid place-items-center text-white/60 hover:text-white"><Minus className="w-4 h-4" /></button>
            <span className="w-6 text-center text-sm font-black text-white tabular-nums">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="w-8 h-8 grid place-items-center text-white/60 hover:text-white"><Plus className="w-4 h-4" /></button>
            <button onClick={() => setQty(maxQty)} className="ml-1 text-[11px] font-black text-white/50 px-2">MAX</button>
          </div>
          <button onClick={handleOpen} disabled={pulling} className="flex-1 h-11 rounded-xl bg-[#fcfc03] text-black font-black text-sm flex items-center justify-center gap-2 disabled:opacity-60">
            {pulling ? <span className="animate-pulse">Opening…</span> : <><Zap className="w-4 h-4" /> Open now · {cost.toLocaleString()}</>}
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-white/60 font-bold flex items-center gap-0.5">Turbo <Info className="w-2.5 h-2.5 text-white/30" /></span>
            <button onClick={() => setTurbo((v) => !v)} className={`mt-0.5 w-10 h-5 rounded-full transition ${turbo ? "bg-lime" : "bg-white/20"}`}>
              <span className={`block w-4 h-4 rounded-full bg-white transition ${turbo ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Reveal modal */}
      {reveal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4">
            <h3 className="text-lg font-black text-white">You pulled {reveal.length} card{reveal.length > 1 ? "s" : ""}</h3>
            <button onClick={() => setReveal(null)} className="w-9 h-9 grid place-items-center rounded-full bg-white/10 text-white"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-8">
            <div className="mx-auto max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3">
              {reveal.map((c, i) => (
                <div key={i} className="animate-[popIn_0.5s_ease-out]" style={{ animationDelay: `${turbo ? 0 : i * 120}ms`, animationFillMode: "backwards" }}>
                  <TolsCard card={c} />
                </div>
              ))}
            </div>
            <div className="mx-auto max-w-2xl mt-5 flex items-center justify-center gap-2 text-xs text-white/50">
              <Check className="w-4 h-4 text-lime" /> Added to your collection · 90% buyback guaranteed
            </div>
            <div className="mx-auto max-w-2xl mt-4 flex gap-2">
              <button onClick={() => setReveal(null)} className="flex-1 h-11 rounded-xl bg-lime text-black font-black text-sm">Continue</button>
              <button onClick={handleOpen} disabled={pulling} className="flex-1 h-11 rounded-xl border border-lime/40 text-lime font-black text-sm disabled:opacity-60">Open another</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}