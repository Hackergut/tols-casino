import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GameCard from "@/components/GameCard";
import ProviderFilter from "@/components/ProviderFilter";
import { GAMES } from "@/lib/games";
import { useSlotCatalog } from "@/hooks/useSlotCatalog";

const TITLES = {
  originals: "TOLS Originals",
  slots: "Slots",
  live: "Live Casino",
  table: "Table Games",
  "game-shows": "Game Shows",
  instant: "Instant Games",
};

// Category (/games/category/:cat) and provider (/games/provider/:provider) listings.
export default function GameCategory({ mode = "category" }) {
  const { cat, provider: providerParam } = useParams();
  const { slots, loading } = useSlotCatalog();
  const [provider, setProvider] = useState("all");

  const slotCards = useMemo(
    () => slots.map((s) => ({ ...s, category: "slots", playable: true, accent: s.accent || "#ccff00" })),
    [slots]
  );
  const providers = useMemo(
    () => Array.from(new Set(slots.map((s) => s.provider).filter(Boolean))).sort(),
    [slots]
  );

  const decoded = providerParam ? decodeURIComponent(providerParam) : "";
  const isProvider = mode === "provider";
  const title = isProvider ? decoded : TITLES[cat] || "Games";

  const games = isProvider
    ? slotCards.filter((s) => s.provider === decoded)
    : cat === "slots"
    ? provider === "all" ? slotCards : slotCards.filter((s) => s.provider === provider)
    : GAMES.filter((g) => g.category === cat);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/50 hover:text-lime transition">
          <ArrowLeft className="w-4 h-4" /> Lobby
        </Link>
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h1>
          <span className="text-sm font-bold text-white/30">{games.length} games</span>
        </div>

        {!isProvider && cat === "slots" && (
          <ProviderFilter providers={providers} active={provider} onChange={setProvider} />
        )}

        {loading && games.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" />
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#121212] py-16 text-center text-sm text-white/40">
            No games in this category yet
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {games.map((g) => <GameCard key={g.id} game={g} />)}
          </div>
        )}
      </div>
    </div>
  );
}