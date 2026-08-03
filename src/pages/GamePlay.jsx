import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import Header from "@/components/Header";
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

const GAMES_MAP = {
  dice: DiceGame,
  crash: CrashGame,
  plinko: PlinkoGame,
  mines: MinesGame,
  limbo: LimboGame,
  wheel: WheelGame,
  coinflip: CoinflipGame,
  keno: KenoGame,
};

export default function GamePlay({ slug }) {
  const game = getGame(slug);
  const { wallet } = useWallet();
  const Game = game && GAMES_MAP[game.slug];

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <Header />
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
        ) : !game.playable || !Game ? (
          <div className="rounded-2xl border border-white/10 bg-[#111] p-16 text-center">
            <Lock className="w-12 h-12 mx-auto text-white/20 mb-4" />
            <h2 className="text-2xl font-black text-white">{game.name}</h2>
            <p className="text-white/50 mt-2">Questo gioco arriverà presto nel catalogo TOLS.</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-5">
              <span className="text-lime">{game.name.split(" ")[0]}</span> {game.name.split(" ").slice(1).join(" ")}
            </h1>
            <Game />
          </div>
        )}
      </div>
    </div>
  );
}