import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Spade, Flame, Star } from "lucide-react";
import HeroBanners from "@/components/HeroBanners";
import JackpotTicker from "@/components/JackpotTicker";
import GameRail from "@/components/home/GameRail";
import LobbySearch from "@/components/home/LobbySearch";
import CategoryChips from "@/components/home/CategoryChips";
import ProvidersRail from "@/components/home/ProvidersRail";
import AllGamesGrid from "@/components/home/AllGamesGrid";
import LobbySkeleton from "@/components/home/LobbySkeleton";
import GameCard from "@/components/GameCard";
import { GAMES } from "@/lib/games";
import { useSlotCatalog } from "@/hooks/useSlotCatalog";

const SLOTS_EMPTY = "No slots synced yet — an admin can sync the catalog from the Admin panel.";

export default function Home() {
  const navigate = useNavigate();
  const { slots, loading } = useSlotCatalog();
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState(null);

  const slotCards = useMemo(
    () => slots.map((s) => ({ ...s, category: "slots", playable: true, accent: s.accent || "#ccff00" })),
    [slots]
  );
  const originals = useMemo(() => GAMES.filter((g) => g.category === "originals"), []);
  const table = useMemo(() => GAMES.filter((g) => g.category === "table"), []);
  const all = useMemo(() => [...originals, ...table, ...slotCards], [originals, table, slotCards]);

  const providers = useMemo(
    () => Array.from(new Set(slots.map((s) => s.provider).filter(Boolean))).sort(),
    [slots]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return all.filter((g) => g.name.toLowerCase().includes(q) || (g.provider || "").toLowerCase().includes(q));
  }, [query, all]);

  const onChip = (id) => {
    if (id === "lucky") {
      const pool = all.length ? all : [...originals, ...table];
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) navigate(`/game/${pick.slug}`);
      return;
    }
    setChip((c) => (c === id ? null : id));
  };

  const rails = [
    { id: "featured", title: "Featured Games", icon: Star, games: [...slotCards.slice(0, 6), ...originals.slice(0, 6)], to: "/games/category/slots", empty: SLOTS_EMPTY },
    { id: "originals", title: "TOLS Originals", icon: Sparkles, games: originals, to: "/games/category/originals" },
    { id: "new", title: "New Games", icon: Flame, games: slotCards.slice(0, 12), to: "/games/category/slots", empty: SLOTS_EMPTY },
    { id: "table", title: "Table Games", icon: Spade, games: table, to: "/games/category/table" },
  ];
  const visibleRails = chip ? rails.filter((r) => r.id === chip) : rails;

  const showSkeleton = loading && !slotCards.length && !query;

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-5 space-y-7">
        {/* Hero: global pot + promo banners */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide" data-no-swipe>
          <JackpotTicker variant="card" />
          <div className="flex-1 min-w-[280px]">
            <HeroBanners />
          </div>
        </div>

        {/* Sticky lobby toolbar: search + category filter, stays under the header */}
        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-[#0d0d0d]/85 backdrop-blur-md border-y border-white/5 space-y-3">
          <LobbySearch value={query} onChange={setQuery} />
          <CategoryChips active={chip} onSelect={onChip} />
        </div>

        {results ? (
          <section className="space-y-3">
            <h2 className="text-lg font-black text-white">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
            </h2>
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] py-12 text-center text-sm text-white/40">
                No game matches your search
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3">
                {results.map((g) => <GameCard key={g.id} game={g} />)}
              </div>
            )}
          </section>
        ) : showSkeleton ? (
          <LobbySkeleton />
        ) : (
          <>
            {visibleRails.map((r) => (
              <GameRail key={r.id} title={r.title} icon={r.icon} games={r.games} viewAllTo={r.to} emptyText={r.empty} />
            ))}
            <AllGamesGrid title="All Slots & Games" games={all} limit={48} viewAllTo="/games/category/slots" />
            <ProvidersRail providers={providers} />
          </>
        )}
      </main>

      <footer className="border-t border-white/5 mt-12 py-8 px-4 text-center text-xs text-white/30 space-y-3">
        <div className="flex items-center justify-center gap-5">
          <Link to="/about" className="hover:text-lime transition">About</Link>
          <Link to="/contact" className="hover:text-lime transition">Contact</Link>
          <Link to="/affiliate" className="hover:text-lime transition">Refer and Earn</Link>
        </div>
        <p><span className="text-lime font-black">TOLS</span> · Crypto Casino · Provably Fair</p>
      </footer>
    </div>
  );
}