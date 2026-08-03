import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SubNav from "@/components/SubNav";
import HeroBanners from "@/components/HeroBanners";
import GameGrid from "@/components/GameGrid";
import TolsGamesSection from "@/components/TolsGamesSection";
import ProviderFilter from "@/components/ProviderFilter";
import GameCard from "@/components/GameCard";
import { GAMES, PROVIDERS, CATEGORIES } from "@/lib/games";
import { useSwipe } from "@/hooks/useSwipe";

const CAT_ORDER = ["home", ...CATEGORIES.map((c) => c.id)];

export default function Home() {
  const [params, setParams] = useSearchParams();
  const active = params.get("cat") || "home";
  const setActive = (c) => setParams(c === "home" ? {} : { cat: c });
  const [provider, setProvider] = useState("all");

  const slotGames = useMemo(() => GAMES.filter((g) => g.category === "slots"), []);

  const goCat = (dir) => {
    const i = CAT_ORDER.indexOf(active);
    const ni = Math.max(0, Math.min(CAT_ORDER.length - 1, i + dir));
    setActive(CAT_ORDER[ni]);
  };
  useSwipe({ onSwipeLeft: () => goCat(1), onSwipeRight: () => goCat(-1), threshold: 70 });
  const filteredSlots = useMemo(
    () => (provider === "all" ? slotGames : slotGames.filter((g) => g.provider === provider)),
    [slotGames, provider]
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <SubNav active={active} onChange={setActive} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
        <HeroBanners />
        <TolsGamesSection />
        {active === "home" && (
          <>
            <GameGrid title="Originals" filter="originals" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg sm:text-xl font-black text-white">Top <span className="text-lime">Provider</span> Slots</h2>
              </div>
              <ProviderFilter providers={PROVIDERS} active={provider} onChange={setProvider} />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3 mt-4">
                {filteredSlots.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            </div>
            <GameGrid title="Table Games" filter="table" />
          </>
        )}
        {active === "slots" && (
          <div>
            <ProviderFilter providers={PROVIDERS} active={provider} onChange={setProvider} />
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3 mt-4">
              {filteredSlots.map((g) => (
                <GameCard key={g.id} game={g} />
              ))}
            </div>
          </div>
        )}
        {active !== "home" && active !== "slots" && <GameGrid title="Category" filter={active} />}
      </main>
      <footer className="border-t border-white/5 mt-12 py-8 text-center text-xs text-white/30">
        <span className="text-lime font-black">TOLS</span> · Crypto Casino · Provably Fair
      </footer>
    </div>
  );
}