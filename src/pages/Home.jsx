import React, { useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import SubNav from "@/components/SubNav";
import HeroBanners from "@/components/HeroBanners";
import GameGrid from "@/components/GameGrid";
import TolsGamesSection from "@/components/TolsGamesSection";
import ProviderFilter from "@/components/ProviderFilter";
import GameCard from "@/components/GameCard";
import { CATEGORIES } from "@/lib/games";
import { useSwipe } from "@/hooks/useSwipe";
import { useSlotCatalog } from "@/hooks/useSlotCatalog";

const CAT_ORDER = ["home", ...CATEGORIES.map((c) => c.id)];

function EmptySlots() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#111] py-14 text-center">
      <p className="font-bold text-white/60">No slots synced yet</p>
      <p className="text-xs text-white/40 mt-1">
        Slots are loaded from the synced catalog. An admin can sync it from the Admin panel (Aggregator settings).
      </p>
    </div>
  );
}

export default function Home() {
  const [params, setParams] = useSearchParams();
  const active = params.get("cat") || "home";
  const setActive = (c) => setParams(c === "home" ? {} : { cat: c });
  const [provider, setProvider] = useState("all");
  const { slots } = useSlotCatalog();

  const providers = useMemo(
    () => Array.from(new Set(slots.map((s) => s.provider).filter(Boolean))).sort(),
    [slots]
  );

  const goCat = (dir) => {
    const i = CAT_ORDER.indexOf(active);
    const ni = Math.max(0, Math.min(CAT_ORDER.length - 1, i + dir));
    setActive(CAT_ORDER[ni]);
  };
  useSwipe({ onSwipeLeft: () => goCat(1), onSwipeRight: () => goCat(-1), threshold: 70 });

  const slotCards = useMemo(
    () =>
      (provider === "all" ? slots : slots.filter((s) => s.provider === provider)).map((s) => ({
        ...s,
        category: "slots",
        playable: true,
        accent: s.accent || "#ccff00",
      })),
    [slots, provider]
  );

  const catLabel = CATEGORIES.find((c) => c.id === active)?.label || "Category";

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <SubNav active={active} onChange={setActive} slotCount={slots.length} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-8">
        <TolsGamesSection />
        <HeroBanners />
        {active === "home" && (
          <>
            <GameGrid title="Originals" filter="originals" />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Top <span className="text-lime">Provider</span> Slots
                </h2>
              </div>
              <ProviderFilter providers={providers} active={provider} onChange={setProvider} />
              {slotCards.length === 0 ? (
                <div className="mt-4">
                  <EmptySlots />
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3 mt-4">
                  {slotCards.map((g) => (
                    <GameCard key={g.id} game={g} />
                  ))}
                </div>
              )}
            </div>
            <GameGrid title="Table Games" filter="table" />
          </>
        )}
        {active === "slots" && (
          <div>
            <ProviderFilter providers={providers} active={provider} onChange={setProvider} />
            {slotCards.length === 0 ? (
              <div className="mt-4">
                <EmptySlots />
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3 mt-4">
                {slotCards.map((g) => (
                  <GameCard key={g.id} game={g} />
                ))}
              </div>
            )}
          </div>
        )}
        {active !== "home" && active !== "slots" && <GameGrid title={catLabel} filter={active} />}
      </main>
      <footer className="border-t border-white/5 mt-12 py-8 px-4 text-center text-xs text-white/30 space-y-3">
        <div className="flex items-center justify-center gap-5">
          <Link to="/about" className="hover:text-lime transition">About</Link>
          <Link to="/contact" className="hover:text-lime transition">Contact</Link>
        </div>
        <p><span className="text-lime font-black">TOLS</span> · Crypto Casino · Provably Fair</p>
      </footer>
    </div>
  );
}