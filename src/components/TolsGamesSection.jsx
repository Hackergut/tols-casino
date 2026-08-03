import React from "react";
import { Link } from "react-router-dom";
import { Gamepad2, ChevronLeft, ChevronRight } from "lucide-react";

const TOLS_GAMES = [
  { slug: "dice", name: "Dice", emoji: "🎲", row: 1 },
  { slug: "mines", name: "Mines", emoji: "💣", row: 1 },
  { slug: "keno", name: "Keno", emoji: "🔢", row: 1 },
  { slug: "plinko", name: "Plinko", emoji: "🟣", row: 1 },
  { slug: "coinflip", name: "Coinflip", emoji: "🪙", row: 1 },
  { slug: "crash", name: "Crash Tols", emoji: "🚀", row: 2 },
  { slug: "chicken-tols", name: "Chicken Tols", emoji: "🍗", row: 2 },
  { slug: "baccarat", name: "Baccarat Tols", emoji: "🃏", row: 2 },
  { slug: "roulette", name: "Roulette Tols", emoji: "🎡", row: 2 },
  { slug: "wheel", name: "Wheel Tols", emoji: "🎯", row: 2 },
];

export default function TolsGamesSection() {
  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Gamepad2 className="w-5 h-5 text-lime" />
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            TOLS <span className="text-lime">GAMES</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/?cat=originals"
            className="hidden sm:flex items-center h-9 px-4 rounded-full border border-white/10 text-xs font-bold text-white/60 hover:text-white hover:border-white/20 transition"
          >
            View all
          </Link>
          <div className="hidden sm:flex items-center gap-1.5">
            <button className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-lime hover:border-lime/30 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-white/50 hover:text-lime hover:border-lime/30 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid 2x5 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {TOLS_GAMES.map((g) => (
          <TolsCard key={g.slug} game={g} />
        ))}
      </div>
    </section>
  );
}

function TolsCard({ game }) {
  return (
    <Link
      to={`/game/${game.slug}`}
      className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] hover:border-lime/40 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* grid texture */}
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* 3D-style icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-5xl sm:text-6xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
          style={{ filter: "drop-shadow(0 0 16px rgba(204,255,0,0.15))" }}
        >
          {game.emoji}
        </span>
      </div>

      {/* bottom gradient + title */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <p className="text-white text-xs sm:text-sm font-black uppercase tracking-tight">
          {game.name}
        </p>
      </div>

      {/* play badge */}
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-lime text-black text-[10px] font-black opacity-0 group-hover:opacity-100 transition">
        ▶ PLAY
      </div>
    </Link>
  );
}