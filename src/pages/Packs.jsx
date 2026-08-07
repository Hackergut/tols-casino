import React, { useEffect, useMemo, useState } from "react";
import { Boxes, Layers, Search, Sparkles, Star, Zap, Gem, Crown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import PackCard from "@/components/cards/PackCard";
import PackOpenModal from "@/components/cards/PackOpenModal";
import CardDetailModal from "@/components/cards/CardDetailModal";
import { RARITY_ORDER, rarityColor, rarityLabel } from "@/lib/packs";

const RARITY_ICONS = { common: Star, rare: Zap, epic: Gem, legendary: Crown, mythic: Sparkles };

export default function Packs() {
  const { wallet } = useWallet();
  const [tab, setTab] = useState("shop"); // shop | collection
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(null);
  const [detail, setDetail] = useState(null);

  const [myCards, setMyCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [filter, setFilter] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    base44.entities.CardPack.list().then((l) => setPacks((l || []).filter((p) => p.enabled))).finally(() => setLoading(false));
  }, []);

  const loadCards = () => {
    setLoadingCards(true);
    base44.entities.CollectibleCard.list("-created_date", 200).then((l) => setMyCards(l || [])).finally(() => setLoadingCards(false));
  };
  useEffect(() => { loadCards(); }, []);

  const filteredCards = useMemo(() => {
    let out = myCards;
    if (filter) out = out.filter((c) => c.rarity === filter);
    const q = query.trim().toLowerCase();
    if (q) out = out.filter((c) => c.card_name.toLowerCase().includes(q) || c.collection.toLowerCase().includes(q));
    return out;
  }, [myCards, filter, query]);

  const collectionValue = useMemo(() => myCards.reduce((s, c) => s + (c.insured_value || 0), 0), [myCards]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display uppercase text-white tracking-tight">Card Packs</h1>
            <p className="text-sm text-white/50 mt-0.5">Open packs, pull certified collectibles, build your vault.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card border border-white/10 px-4 h-11">
            <Layers className="w-4 h-4 text-lime" />
            <span className="text-sm font-black text-white tabular-nums">{collectionValue.toLocaleString()}</span>
            <span className="text-xs text-white/40">USDT vault</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10">
          {[["shop", "Shop"], ["collection", `My Collection (${myCards.length})`]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2.5 text-sm font-black border-b-2 transition ${tab === id ? "border-lime text-lime" : "border-transparent text-white/50 hover:text-white/80"}`}>{label}</button>
          ))}
        </div>

        {tab === "shop" ? (
          loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl border border-white/10 bg-[#111] animate-pulse" />)}
            </div>
          ) : packs.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#111] p-16 text-center">
              <Boxes className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50">No packs available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {packs.map((p) => <PackCard key={p.id} pack={p} onOpen={setOpening} />)}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl bg-card border border-white/10">
                <Search className="w-4 h-4 text-white/30" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search your cards" className="bg-transparent outline-none text-sm text-white/80 placeholder-white/30 w-full" />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              <button onClick={() => setFilter(null)} className={`shrink-0 h-9 px-4 rounded-full text-xs font-black ${!filter ? "bg-lime text-black" : "bg-card border border-white/10 text-white/60"}`}>All</button>
              {RARITY_ORDER.map((r) => {
                const Icon = RARITY_ICONS[r];
                const on = filter === r;
                return (
                  <button key={r} onClick={() => setFilter(on ? null : r)} className={`shrink-0 flex items-center gap-1.5 h-9 px-3.5 rounded-full text-xs font-black ${on ? "text-black" : "bg-card border border-white/10 text-white/60"}`} style={on ? { background: rarityColor(r) } : {}}>
                    <Icon className="w-3.5 h-3.5" /> {rarityLabel(r)}
                  </button>
                );
              })}
            </div>

            {loadingCards ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => <div key={i} className="aspect-[3/4] rounded-xl border border-white/10 bg-[#111] animate-pulse" />)}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#111] p-16 text-center">
                <Boxes className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-white/50">{myCards.length ? "No cards match your filter." : "Your vault is empty — open a pack to start collecting."}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredCards.map((c) => (
                  <button key={c.id} onClick={() => setDetail(c)} className="text-left">
                    <MiniCard card={c} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {opening && <PackOpenModal pack={opening} onClose={() => { setOpening(null); loadCards(); }} />}
      {detail && <CardDetailModal card={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function MiniCard({ card }) {
  const frame = rarityColor(card.rarity);
  const accent = "#ccff00";
  const monogram = String(card.card_name || card.collection || "T").charAt(0).toUpperCase();
  return (
    <div className="relative rounded-lg overflow-hidden border-2 bg-[#0a0a0a] bg-grid" style={{ borderColor: frame, boxShadow: `0 0 18px -8px ${frame}` }}>
      <div className="flex items-center justify-center h-5 border-b" style={{ borderColor: frame + "55" }}>
        <span className="text-[8px] font-display tracking-[0.22em] text-lime">TOLS CASINO</span>
      </div>
      <div className="relative p-2">
        {card.is_new && <span className="absolute top-1.5 right-1.5 z-10 text-[7px] font-black px-1 rounded bg-lime text-black">NEW</span>}
        <div className="relative h-24 flex items-center justify-center">
          <div className="absolute w-16 h-16 rounded-full blur-xl" style={{ background: `${frame}33` }} />
          <div className="relative w-12 h-12 rounded-full grid place-items-center border-2" style={{ borderColor: frame }}>
            <span className="text-lg font-display" style={{ color: accent }}>{monogram}</span>
          </div>
        </div>
        <div className="mt-1 rounded border px-1.5 py-1" style={{ borderColor: frame + "88", background: "rgba(0,0,0,0.4)" }}>
          <p className="text-[11px] font-display text-white leading-none truncate">{(card.card_name || "").toUpperCase()}</p>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[8px] font-bold tracking-wider" style={{ color: frame }}>{rarityLabel(card.rarity).toUpperCase()}</span>
          <span className="text-[8px] font-mono text-white/40">${Number(card.insured_value || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}