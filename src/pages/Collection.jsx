import React, { useEffect, useMemo, useState } from "react";
import { Layers, Check, Lock, ChevronDown, Search, Trophy } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CardDetailModal from "@/components/cards/CardDetailModal";
import {
  COLLECTIONS, COLLECTION_NAMES, collectionCardList, collectionAccent,
  rarityColor, rarityLabel, ovrFor, nameParts,
} from "@/lib/packs";

// "La mia collezione" — thematic set completion. Shows owned vs missing cards
// and progress per collection. Owned cards open the detail modal; missing
// cards render as locked placeholders to chase.
export default function Collection() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    base44.entities.CollectibleCard.list("-created_date", 500)
      .then((l) => setCards(l || []))
      .finally(() => setLoading(false));
  }, []);

  // unique owned card names per collection
  const ownedByCollection = useMemo(() => {
    const map = {};
    cards.forEach((c) => {
      if (!map[c.collection]) map[c.collection] = new Map();
      const m = map[c.collection];
      if (!m.has(c.card_name) || c.insured_value > (m.get(c.card_name).insured_value || 0)) {
        m.set(c.card_name, c);
      }
    });
    return map;
  }, [cards]);

  const sets = useMemo(() => {
    const names = query.trim() ? COLLECTION_NAMES.filter((n) => n.toLowerCase().includes(query.trim().toLowerCase())) : COLLECTION_NAMES;
    return names.map((name) => {
      const total = collectionCardList(name);
      const ownedMap = ownedByCollection[name] || new Map();
      const ownedNames = Array.from(ownedMap.keys());
      const ownedSet = new Set(ownedNames);
      const missing = total.filter((n) => !ownedSet.has(n));
      return {
        name,
        accent: collectionAccent(name),
        total: total.length,
        owned: ownedNames.length,
        missing,
        ownedCards: ownedNames.map((n) => ownedMap.get(n)),
        pct: total.length ? Math.round((ownedNames.length / total.length) * 100) : 0,
      };
    });
  }, [ownedByCollection, query]);

  const totalOwned = cards.length;
  const uniqueOwned = Object.values(ownedByCollection).reduce((s, m) => s + m.size, 0);
  const totalCards = useMemo(() => COLLECTION_NAMES.reduce((s, n) => s + collectionCardList(n).length, 0), []);
  const overallPct = totalCards ? Math.round((uniqueOwned / totalCards) * 100) : 0;
  const vaultValue = useMemo(() => cards.reduce((s, c) => s + (c.insured_value || 0), 0), [cards]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-5 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display uppercase text-white tracking-tight">La mia collezione</h1>
            <p className="text-sm text-white/50 mt-0.5">Completa i set tematici e sblocca il tuo vault.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-card border border-white/10 px-4 h-11">
            <Trophy className="w-4 h-4 text-lime" />
            <span className="text-sm font-black text-white tabular-nums">{overallPct}%</span>
          </div>
        </div>

        {/* Overall stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Carte possedute" value={totalOwned} />
          <Stat label="Carte uniche" value={uniqueOwned} />
          <Stat label="Valore vault" value={`$${vaultValue.toLocaleString()}`} />
          <Stat label="Completamento" value={`${overallPct}%`} />
        </div>

        {/* overall progress bar */}
        <div className="rounded-2xl bg-card border border-white/10 p-4">
          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
            <span>Progresso globale</span>
            <span className="font-black text-white">{uniqueOwned} / {totalCards}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full bg-lime rounded-full transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>

        {/* search */}
        <div className="flex items-center gap-2 px-3 h-11 rounded-xl bg-card border border-white/10">
          <Search className="w-4 h-4 text-white/30" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cerca una collezione" className="bg-transparent outline-none text-sm text-white/80 placeholder-white/30 w-full" />
        </div>

        {loading ? (
          <div className="space-y-4">{[0, 1, 2].map((i) => <div key={i} className="h-40 rounded-2xl border border-white/10 bg-[#111] animate-pulse" />)}</div>
        ) : (
          <div className="space-y-3">
            {sets.map((s) => <SetCard key={s.name} set={s} onOpen={setOpen} />)}
          </div>
        )}
      </main>

      {open && <CardDetailModal card={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-card border border-white/10 p-4">
      <div className="text-[10px] font-bold uppercase text-white/40">{label}</div>
      <div className="text-xl font-black text-white tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function SetCard({ set, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)} className="w-full flex items-center gap-4 p-4 text-left">
        <div className="w-12 h-12 rounded-xl grid place-items-center border-2 text-xl font-display" style={{ borderColor: set.accent, color: set.accent, background: set.accent + "12" }}>
          {String(set.name).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-white truncate">{set.name}</h3>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ color: set.accent, background: set.accent + "1a" }}>{set.owned}/{set.total}</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${set.pct}%`, background: set.accent }} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-white tabular-nums">{set.pct}%</span>
          <ChevronDown className={`w-5 h-5 text-white/40 transition ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-4 h-4 text-lime" />
            <span className="text-xs font-bold text-white/60">Possedute ({set.ownedCards.length})</span>
            <Lock className="w-4 h-4 text-white/30 ml-3" />
            <span className="text-xs font-bold text-white/60">Mancanti ({set.missing.length})</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {set.ownedCards.map((c) => <OwnedTile key={c.id + c.card_name} card={c} accent={set.accent} onClick={() => onOpen(c)} />)}
            {set.missing.map((name) => <MissingTile key={name} name={name} accent={set.accent} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function OwnedTile({ card, accent, onClick }) {
  const frame = rarityColor(card.rarity);
  const monogram = String(nameParts(card).last || card.card_name).charAt(0).toUpperCase();
  return (
    <button onClick={onClick} className="relative rounded-lg overflow-hidden border-2 bg-[#0a0a0a] bg-grid text-left" style={{ borderColor: frame, boxShadow: `0 0 16px -8px ${frame}` }}>
      <div className="flex items-center justify-center h-5 border-b" style={{ borderColor: frame + "55" }}>
        <span className="text-[8px] font-display tracking-[0.2em] text-lime">TOLS</span>
      </div>
      <div className="relative h-20 flex items-center justify-center">
        <div className="absolute w-14 h-14 rounded-full blur-xl" style={{ background: `${frame}33` }} />
        <div className="relative w-11 h-11 rounded-full grid place-items-center border-2" style={{ borderColor: frame }}>
          <span className="text-base font-display" style={{ color: accent }}>{monogram}</span>
        </div>
      </div>
      <div className="px-1.5 pb-1.5">
        <p className="text-[10px] font-display text-white leading-none truncate">{(card.card_name || "").toUpperCase()}</p>
        <p className="text-[9px] font-mono text-white/40 mt-0.5">${Number(card.insured_value || 0).toLocaleString()}</p>
      </div>
    </button>
  );
}

function MissingTile({ name, accent }) {
  return (
    <div className="relative rounded-lg overflow-hidden border-2 border-dashed border-white/10 bg-[#0c0c0c] flex flex-col items-center justify-center h-[112px]">
      <Lock className="w-5 h-5 text-white/25 mb-1" />
      <p className="text-[10px] font-bold text-white/30 text-center px-1 leading-tight line-clamp-2">{name}</p>
    </div>
  );
}