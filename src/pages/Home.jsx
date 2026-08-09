import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Spade, Flame, Star, Gamepad2, Radio } from "lucide-react";
import LiveWinsTicker from "@/components/LiveWinsTicker";
import LivePullsTicker from "@/components/LivePullsTicker";
import GameRail from "@/components/home/GameRail";
import LobbySearch from "@/components/home/LobbySearch";
import CategoryChips from "@/components/home/CategoryChips";
import ProvidersRail from "@/components/home/ProvidersRail";
import AllGamesGrid from "@/components/home/AllGamesGrid";
import MegaPromoCards from "@/components/home/MegaPromoCards";
import CollectionPromo from "@/components/home/CollectionPromo";
import CardsRail from "@/components/home/CardsRail";
import SetLeaders from "@/components/home/SetLeaders";
import LobbySkeleton from "@/components/home/LobbySkeleton";
import GameCard from "@/components/GameCard";
import TolsLogo from "@/components/TolsLogo";
import TolsHero from "@/components/home/TolsHero";
import SocialLinks from "@/components/SocialLinks";
import { GAMES } from "@/lib/games";
import { useHomeSync } from "@/hooks/useHomeSync";
import { motion } from "framer-motion";
import { useSlotCatalog } from "@/hooks/useSlotCatalog";

const SLOTS_EMPTY = "No slots synced yet — an admin can sync the catalog from the Admin panel.";

export default function Home() {
  const location = useLocation();
  const { slots, loading } = useSlotCatalog();
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") || "");
  const [chip, setChip] = useState(null);

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);

  const byPlayable = (a, b) =>
    Boolean(b.playable) - Boolean(a.playable) || String(a.name).localeCompare(String(b.name));
  const slotCards = useMemo(
    () =>
      slots
        .map((s) => ({ ...s, category: "slots", playable: !!(s.demo_url), accent: s.accent || "#ccff00" }))
        .sort(byPlayable),
    [slots]
  );
  const originals = useMemo(() => GAMES.filter((g) => g.category === "originals"), []);
  const table = useMemo(() => GAMES.filter((g) => g.category === "table"), []);
  const all = useMemo(() => [...originals, ...table, ...slotCards], [originals, table, slotCards]);

  const providers = useMemo(
    () => Array.from(new Set(slots.map((s) => s.provider).filter(Boolean))).sort(),
    [slots]
  );

  // Dedicated rail for the "bgames" provider — renders automatically once the
  // aggregator syncs those slots into the catalog.
  const bgamesGames = useMemo(
    () => slotCards.filter((s) => (s.provider || "").toLowerCase() === "bgames"),
    [slotCards]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return all.filter((g) => g.name.toLowerCase().includes(q) || (g.provider || "").toLowerCase().includes(q));
  }, [query, all]);

  const onChip = (id) => {
    if (id === "home") {
      setChip(null);
      return;
    }
    setChip((current) => (current === id ? null : id));
  };

  useHomeSync({ chip, query });

  const rails = [
    // Preview exact: Featured Originals with 6 as in image (LIMBO, PLINKO, MINES, DICE, KENO, WHEEL)
    { id: "featured", title: "Featured Originals", icon: Sparkles, games: originals.filter(g=> ["limbo","plinko","mines","dice","keno","wheel"].includes(g.slug)), to: "/games/category/originals", empty: SLOTS_EMPTY },
    { id: "slots", title: "Slots", icon: Flame, games: slotCards.slice(0, 7), to: "/games/category/slots", empty: SLOTS_EMPTY },
    { id: "originals", title: "TOLS Originals", icon: Gamepad2, games: originals, to: "/games/category/originals", moreTile: true },
    { id: "table", title: "Table Games", icon: Spade, games: table, to: "/games/category/table" },
    { id: "live", title: "Live Casino", icon: Radio, games: [], to: "/games/category/live", empty: "Live casino coming soon to TOLS.", lazy: true },
  ];
  const visibleRails = chip ? rails.filter((r) => r.id === chip) : rails.filter((r) => !r.lazy);

  const showSkeleton = loading && !slotCards.length && !query;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6 py-4 space-y-6 md:space-y-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}>
          <TolsHero />
        </motion.div>

        {/* Collection promo kept but compact */}
        <CollectionPromo />

        {/* Sticky lobby toolbar — exact responsive: mobile bleed, tablet/desktop centered */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="sticky top-[56px] z-30 -mx-3 sm:-mx-4 lg:mx-0 px-3 sm:px-4 lg:px-0 py-3 bg-[#080808]/90 backdrop-blur-xl border-y border-white/[0.06] space-y-2">
          <CategoryChips active={chip} onSelect={onChip} />
          <LobbySearch value={query} onChange={setQuery} />
        </motion.div>

        {results ? (
          <section className="space-y-3">
            <h2 className="text-lg font-black text-white">
              {results.length} result{results.length === 1 ? "" : "s"} for “{query}”
            </h2>
            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#121212] py-12 text-center text-sm text-white/40">
                No game matches your search
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                {results.map((g) => <GameCard key={g.id} game={g} />)}
              </div>
            )}
          </section>
        ) : showSkeleton ? (
          <LobbySkeleton />
        ) : (
          <>
            {visibleRails.map((r) => (
              <GameRail key={r.id} title={r.title} icon={r.icon} games={r.games} viewAllTo={r.to} emptyText={r.empty} moreTile={r.moreTile} />
            ))}
            {!chip && <CardsRail />}
            {!chip && <SetLeaders />}
            {!chip && bgamesGames.length > 0 && (
              <GameRail title="BGames" icon={Gamepad2} games={bgamesGames} viewAllTo="/games/provider/bgames" />
            )}
            <AllGamesGrid title="All Slots & Games" games={all} limit={48} viewAllTo="/games/category/slots" />
            <ProvidersRail providers={providers} />
          </>
        )}
        <LivePullsTicker />
        <LiveWinsTicker />
      </main>

      <footer className="border-t border-white/[0.06] mt-10 py-8 pb-24 lg:pb-8 px-3 sm:px-4">
        <div className="mx-auto max-w-[1600px] flex flex-col sm:flex-row items-center justify-between gap-5">
          <TolsLogo size="sm" />
          <div className="flex items-center justify-center gap-4 text-xs text-white/40 flex-wrap">
            <Link to="/about" className="hover:text-lime transition">About</Link>
            <Link to="/terms" className="hover:text-lime transition">Terms</Link>
            <Link to="/privacy" className="hover:text-lime transition">Privacy</Link>
            <Link to="/license" className="hover:text-lime transition">License</Link>
            <Link to="/responsible-gaming" className="hover:text-lime transition">Responsible</Link>
            <Link to="/affiliate" className="hover:text-lime transition">Affiliate</Link>
          </div>
          <SocialLinks />
        </div>
        <p className="text-center text-xs text-white/30 mt-5">© 2026 TOLS · Crypto Casino · Provably Fair</p>
      </footer>
    </div>
  );
}