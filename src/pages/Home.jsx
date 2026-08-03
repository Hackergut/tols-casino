import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SubNav from "@/components/SubNav";
import HeroBanners from "@/components/HeroBanners";
import GameGrid from "@/components/GameGrid";
import TolsGamesSection from "@/components/TolsGamesSection";
import ProviderFilter from "@/components/ProviderFilter";
import GameCard from "@/components/GameCard";
import { GAMES, PROVIDERS } from "@/lib/games";

export default function Home() {
  const [params, setParams] = useSearchParams();
  const active = params.get("cat") || "home";
  const setActive = (c) => setParams(c === "home" ? {} : { cat: c });
  const [provider, setProvider] = useState("all");

  const slotGames = useMemo(() => GAMES.filter((g) => g.category === "slots"), []);
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
            <GameGrid title="Originali" filter="originals" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg sm:text-xl font-black text-white">Slot dei <span className="text-lime">Top Provider</span></h2>
              </div>
              <ProviderFilter providers={PROVIDERS} active={provider} onChange={setProvider} />
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3 mt-4">
                {filteredSlots.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            </div>
            <GameGrid title="Giochi da Tavolo" filter="table" />
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
        {active !== "home" && active !== "slots" && <GameGrid title="Categoria" filter={active} />}
      </main>
      <footer className="border-t border-white/5 mt-12 py-8 text-center text-xs text-white/30">
        <span className="text-lime font-black">TOLS</span> · Crypto Casino · Provably Fair
      </footer>
    </div>
  );
}