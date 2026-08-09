import React, { useState } from "react";
import { ArrowLeft, X, Sparkles, Check, Loader2, Eye, Minus, Plus, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import { openPack, RARITIES, RARITY_ORDER, COLLECTION_IMAGES } from "@/lib/packs";
import { Image } from "@/components/ui/image";
import TolsCard from "@/components/cards/TolsCard";
import CardDetailModal from "@/components/cards/CardDetailModal";

// Pack purchase + reveal flow. Confirms price → deducts wallet → generates &
// persists cards (collection + live pull feed) → animated reveal. Each
// revealed card can be opened in the detail modal.
export default function PackOpenModal({ pack, onClose }) {
  const { wallet, updateBalance } = useWallet();
  const [phase, setPhase] = useState("confirm"); // confirm | opening | reveal
  const [cards, setCards] = useState([]);
  const [revealed, setRevealed] = useState(0);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [turbo, setTurbo] = useState(false);

  if (!pack) return null;
  const unitCost = pack.price;
  const totalCost = unitCost * qty;
  const maxQty = wallet ? Math.max(1, Math.floor(wallet.balance / unitCost)) : 0;
  const canAfford = wallet && wallet.balance >= totalCost && qty > 0;
  // expected insured value per single card
  const evPerCard = RARITY_ORDER.reduce((s, r) => {
    const meta = RARITIES[r];
    return s + (meta.weight / 100) * ((meta.min + meta.max) / 2);
  }, 0);

  const confirm = async () => {
    if (!canAfford) { setError("Insufficient balance — deposit to open this pack."); return; }
    setError("");
    setPhase("opening");
    try {
      const pulled = [];
      for (let i = 0; i < qty; i++) pulled.push(...openPack(pack));
      // deduct + record wagered
      await updateBalance(-totalCost, totalCost);
      // persist owned cards
      const saved = await base44.entities.CollectibleCard.bulkCreate(pulled);
      const list = Array.isArray(saved) ? saved : (saved?.data || []);
      // broadcast to the live pulls ticker
      let user = null;
      try { user = await base44.auth.me(); } catch {}
      const puller = user ? (user.full_name || (user.email ? user.email.split("@")[0] : "player")) : "player";
      try {
        await base44.entities.CardPull.bulkCreate(
          list.map((c) => ({ collection: c.collection, card_name: c.card_name, rarity: c.rarity, pack_name: pack.name, puller }))
        );
      } catch {}
      setCards(list.length ? list : pulled);
      setRevealed(turbo ? (list.length || pulled.length) : 0);
      setPhase("reveal");
    } catch (e) {
      setError(e?.message || "Failed to open pack");
      setPhase("confirm");
    }
  };

  const revealAll = () => setRevealed(cards.length);

  const allRevealed = revealed >= cards.length;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 1rem)" }}>
        <button onClick={onClose} className="flex items-center gap-2 h-9 px-4 rounded-full border border-white/20 text-sm font-semibold text-white hover:bg-white/5"><ArrowLeft className="w-4 h-4" /> Back</button>
        <button onClick={onClose} className="grid place-items-center w-9 h-9 rounded-full border border-white/20 text-white/70 hover:bg-white/5"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 max-w-md w-full mx-auto">
        {phase === "confirm" && (
          <div className="flex flex-col items-center pt-4">
            {/* buyback badge */}
            <div className="self-end mb-2 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-full bg-lime/15 text-lime border border-lime/40">90% BUYBACK</div>

            <div className="w-40"><PackHero pack={pack} /></div>

            <div className="flex items-center gap-2 mt-4">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/55"><Check className="w-3.5 h-3.5 text-lime" /> Guaranteed Authenticity</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/8 text-white/55 border border-white/10">Limited time</span>
            </div>
            <h2 className="text-xl font-black text-white mt-2 text-center">{pack.name}</h2>
            <p className="text-xs text-white/45 text-center mt-1">{pack.description}</p>

            {/* rarity grid */}
            <div className="w-full mt-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Insured Value</div>
              <div className="grid grid-cols-2 gap-2">
                {RARITY_ORDER.map((r) => {
                  const meta = RARITIES[r];
                  const c = meta.color;
                  return (
                    <div key={r} className="rounded-xl border bg-[#111] p-2.5" style={{ borderColor: c + "66", boxShadow: `0 0 16px -8px ${c}` }}>
                      <div className="text-xs font-black" style={{ color: c }}>{meta.label}</div>
                      <div className="text-[11px] text-white/80 tabular-nums mt-0.5">${meta.min.toLocaleString()} – ${meta.max.toLocaleString()}</div>
                      <div className="text-[10px] text-white/40 mt-0.5">{meta.weight}% drop</div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-white/30 mt-1.5">Pricing data from ALT, eBay & major marketplaces. Subject to change.</p>
            </div>

            {/* expected value + balance */}
            <div className="w-full grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-[#1a1a1a] p-3">
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/40">Expected Value</div>
                <div className="text-lg font-black text-white tabular-nums">${evPerCard.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="rounded-xl bg-[#1a1a1a] p-3">
                <div className="text-[9px] font-bold uppercase tracking-wider text-white/40">Your balance</div>
                <div className="text-lg font-black text-white tabular-nums">{wallet ? Number(wallet.balance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</div>
              </div>
            </div>

            {/* quantity stepper */}
            <div className="w-full mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#1a1a1a] px-2 h-11">
              <div className="flex items-center gap-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/10 text-white/70"><Minus className="w-4 h-4" /></button>
                <span className="w-8 text-center text-base font-black text-white tabular-nums">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} className="w-8 h-8 grid place-items-center rounded-lg hover:bg-white/10 text-white/70"><Plus className="w-4 h-4" /></button>
              </div>
              <button onClick={() => setQty(maxQty)} className="text-[10px] font-black tracking-wider px-3 h-8 rounded-lg bg-white/8 text-white/70 hover:bg-white/12">MAX</button>
            </div>

            {error && <p className="text-sm text-rose-400 mt-3 text-center">{error}</p>}

            {/* open now */}
            <button onClick={confirm} disabled={!canAfford} className={`mt-3 w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 ${canAfford ? "bg-lime text-black hover:opacity-90" : "bg-white/8 text-white/40"}`}>
              <Zap className="w-4 h-4" /> Open now · {totalCost.toLocaleString()} USDT
            </button>

            {/* turbo toggle */}
            <div className="w-full mt-2 flex items-center justify-between px-1">
              <span className="text-xs font-bold text-white/60">Turbo</span>
              <button onClick={() => setTurbo((v) => !v)} className="relative w-10 h-6 rounded-full transition" style={{ background: turbo ? "#ccff00" : "rgba(255,255,255,0.15)" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: turbo ? "1.25rem" : "0.125rem" }} />
              </button>
            </div>
          </div>
        )}

        {phase === "opening" && (
          <div className="flex flex-col items-center justify-center pt-24">
            <Loader2 className="w-10 h-10 text-lime animate-spin mb-4" />
            <p className="text-sm font-black text-white tracking-widest uppercase">Opening pack…</p>
          </div>
        )}

        {phase === "reveal" && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-lime" />
              <h2 className="text-xl font-black text-white">Your pulls</h2>
              <span className="ml-auto text-xs text-white/40">{allRevealed ? "All revealed" : `${revealed}/${cards.length} revealed`}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cards.map((c, i) => {
                const isRevealed = i < revealed;
                return (
                  <button key={c.id || i} onClick={() => (isRevealed ? setDetail(c) : setRevealed(i + 1))} className="text-left">
                    {isRevealed ? (
                      <div className="relative">
                        <TolsCard card={c} className="w-full animate-[popIn_0.4s_ease-out]" />
                        <span className="absolute top-2 right-2 grid place-items-center w-6 h-6 rounded-full bg-black/70 border border-white/15"><Check className="w-3.5 h-3.5 text-lime" /></span>
                      </div>
                    ) : (
                      <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/15 bg-[#101010] flex flex-col items-center justify-center text-white/30 hover:border-lime/40 transition">
                        <span className="text-3xl font-black">?</span>
                        <span className="text-[10px] mt-2 uppercase tracking-widest">Tap to reveal</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {!allRevealed && (
              <button onClick={revealAll} className="mt-5 w-full h-11 rounded-xl border border-white/15 text-sm font-bold text-white/70 hover:bg-white/5">Reveal all</button>
            )}
            {allRevealed && (
              <div className="grid grid-cols-2 gap-3 mt-5">
                <button onClick={onClose} className="h-11 rounded-xl bg-lime text-black font-black text-sm flex items-center justify-center gap-2"><Eye className="w-4 h-4" /> View in collection</button>
                <button onClick={() => { setCards([]); setRevealed(0); setPhase("confirm"); }} className="h-11 rounded-xl border border-white/15 text-white/70 font-bold text-sm">Open another</button>
              </div>
            )}
          </div>
        )}
      </div>

      {detail && <CardDetailModal card={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function PackHero({ pack }) {
  const accent = "#ccff00";
  const initial = String(pack.collection || "★").trim().charAt(0).toUpperCase();
  const art = pack.image || COLLECTION_IMAGES[pack.collection] || "";
  return (
    <div className="relative rounded-2xl border-2 border-lime/40 bg-gradient-to-b from-[#1a1d10] to-[#0d0d0d] flex items-center justify-center h-56 overflow-hidden" style={{ boxShadow: "0 0 30px -8px rgba(204,255,0,0.6)" }}>
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-lime/10 blur-3xl" />
      <div className="relative w-20 h-28 rounded-xl overflow-hidden border-2 flex items-center justify-center text-4xl font-black" style={{ color: accent, borderColor: accent + "88", background: accent + "12" }}>
        {art ? <Image src={art} fittingType="fill" className="absolute inset-0 w-full h-full" /> : initial}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#1a1a1a] p-4">
      <div className="text-[10px] font-bold uppercase text-white/40 mb-1">{label}</div>
      <div className="text-lg font-black text-white">{value}</div>
    </div>
  );
}