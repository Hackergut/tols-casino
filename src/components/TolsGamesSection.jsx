import React from "react";
import { Link } from "react-router-dom";
import { Gamepad2, ArrowRight, ShieldCheck } from "lucide-react";
import GameArt from "@/components/GameArt";

const TOLS_GAMES = [
  { slug: "dice", name: "Dice" },
  { slug: "mines", name: "Mines" },
  { slug: "keno", name: "Keno" },
  { slug: "plinko", name: "Plinko" },
  { slug: "coinflip", name: "Coinflip" },
  { slug: "crash", name: "Crash" },
  { slug: "limbo", name: "Limbo" },
  { slug: "wheel", name: "Wheel" },
  { slug: "roulette", name: "Roulette" },
  { slug: "baccarat", name: "Baccarat" },
];

export default function TolsGamesSection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-lime/10 border border-lime/20">
            <Gamepad2 className="w-5 h-5 text-lime" />
          </div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
            TOLS <span className="text-lime">GAMES</span>
          </h2>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/50">
            <ShieldCheck className="w-3 h-3 text-lime" /> PROVABLY FAIR
          </span>
        </div>
        <Link to="/?cat=originals" className="flex items-center gap-1 text-sm font-bold text-white/60 hover:text-lime transition">
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

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
      className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-[#111] hover:border-lime/40 hover:-translate-y-0.5 transition-all duration-300"
    >
      <GameArt slug={game.slug} className="group-hover:scale-105 transition duration-500" />
      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <p className="text-white text-xs sm:text-sm font-black uppercase tracking-tight">{game.name}</p>
      </div>
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-lime text-black text-[10px] font-black opacity-0 group-hover:opacity-100 transition">
        ▶ PLAY
      </div>
    </Link>
  );
}