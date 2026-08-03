import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getGame } from "@/lib/games";
import { useWallet } from "@/components/WalletProvider";
import DiceGame from "@/components/games/DiceGame";
import CrashGame from "@/components/games/CrashGame";
import PlinkoGame from "@/components/games/PlinkoGame";
import MinesGame from "@/components/games/MinesGame";
import LimboGame from "@/components/games/LimboGame";
import WheelGame from "@/components/games/WheelGame";
import CoinflipGame from "@/components/games/CoinflipGame";
import KenoGame from "@/components/games/KenoGame";
import RouletteGame from "@/components/games/RouletteGame";
import RealSlotPlayer from "@/components/RealSlotPlayer";
import BaccaratGame from "@/components/games/BaccaratGame";

const GAMES_MAP = {
  dice: DiceGame,
  crash: CrashGame,
  plinko: PlinkoGame,
  mines: MinesGame,
  limbo: LimboGame,
  wheel: WheelGame,
  coinflip: CoinflipGame,
  keno: KenoGame,
  roulette: RouletteGame,
  baccarat: BaccaratGame,
};

export default function GamePlay({ slug }) {
  const game = getGame(slug);
  const { wallet } = useWallet();
  const Game = game && GAMES_MAP[game.slug];
  const isSlot = game && game.category === "slots";
  const [mode, setMode] = useState("demo");

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition">
            <ArrowLeft className="w-4 h-4" /> Lobby
          </Link>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck className="w-4 h-4 text-lime" /> Provably Fair
          </div>
        </div>

        {!game ? (
          <div className="text-center py-20 text-white/40">Gioco non trovato</div>
        ) : !game.playable ? (
          <div className="rounded-2xl border border-white/10 bg-[#111] p-16 text-center">
            <h2 className="text-2xl font-black text-white">{game.name}</h2>
            <p className="text-white/50 mt-2">Questo gioco arriverà presto nel catalogo TOLS.</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h1 className="text-2xl font-black tracking-tight text-white">
                <span className="text-lime">{game.name.split(" ")[0]}</span> {game.name.split(" ").slice(1).join(" ")}
              </h1>
              {isSlot && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1a1a1a] border border-white/10 w-fit">
                  <button
                    onClick={() => setMode("demo")}
                    className={`px-4 h-9 rounded-lg text-xs font-black transition ${
                      mode === "demo" ? "bg-blue-500 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    DEMO
                  </button>
                  <button
                    onClick={() => setMode("real")}
                    className={`px-4 h-9 rounded-lg text-xs font-black transition ${
                      mode === "real" ? "bg-lime text-black" : "text-white/50 hover:text-white"
                    }`}
                  >
                    REAL
                  </button>
                </div>
              )}
            </div>
            {isSlot ? (
              <RealSlotPlayer key={game.slug + mode} game={game} mode={mode} />
            ) : Game ? (
              <Game />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}