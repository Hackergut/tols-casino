import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, LogIn, Wallet } from "lucide-react";
import { getGame } from "@/lib/games";
import { base44 } from "@/api/base44Client";
import { useWallet } from "@/components/WalletProvider";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import DemoSlotPlayer from "@/components/DemoSlotPlayer";
import RealSlotPlayer from "@/components/RealSlotPlayer";
import DiceGame from "@/components/games/DiceGame";
import CrashGame from "@/components/games/CrashGame";
import PlinkoGame from "@/components/games/PlinkoGame";
import MinesGame from "@/components/games/MinesGame";
import LimboGame from "@/components/games/LimboGame";
import WheelGame from "@/components/games/WheelGame";
import CoinflipGame from "@/components/games/CoinflipGame";
import KenoGame from "@/components/games/KenoGame";
import RouletteGame from "@/components/games/RouletteGame";
import BaccaratGame from "@/components/games/BaccaratGame";
import SlotMachine from "@/components/games/SlotMachine";
import { RTP_ORIGINALS } from "@/lib/gameEngine";

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
  "neon-vault": SlotMachine,
};

export default function GamePlay({ slug }) {
  const game = getGame(slug);
  const Game = game && GAMES_MAP[game.slug];
  const { wallet } = useWallet();
  const { openWallet } = useWalletModal();
  const isGuest = !wallet || wallet.id === "guest";

  const [mode, setMode] = useState("demo");
  const [dbSlot, setDbSlot] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);

  useEffect(() => {
    if (game) {
      setDbSlot(null);
      return;
    }
    let active = true;
    setDbLoading(true);
    setDbSlot(null);
    base44.entities.SlotGame.filter({ slug })
      .then((list) => {
        if (!active) return;
        setDbSlot(list && list.length ? list[0] : null);
      })
      .catch(() => {})
      .finally(() => active && setDbLoading(false));
    return () => {
      active = false;
    };
  }, [slug, game]);

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-white/60 hover:text-lime transition">
            <ArrowLeft className="w-4 h-4" /> Lobby
          </Link>
          <div className="flex items-center gap-3 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-lime" /> Provably Fair
            </span>
            {game && RTP_ORIGINALS[game.slug] && (
              <span className="px-2 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime font-bold">
                RTP {(RTP_ORIGINALS[game.slug] * 100).toFixed(1)}%
              </span>
            )}
            {dbSlot && dbSlot.rtp ? (
              <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold">
                RTP {dbSlot.rtp}%
              </span>
            ) : null}
          </div>
        </div>

        {game ? (
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-5">
              <span className="text-lime">{game.name.split(" ")[0]}</span>{" "}
              {game.name.split(" ").slice(1).join(" ")}
            </h1>
            {Game ? (
              <Game />
            ) : (
              <div className="rounded-2xl border border-white/10 bg-[#111] p-16 text-center">
                <h2 className="text-2xl font-black text-white">{game.name}</h2>
                <p className="text-white/50 mt-2">This game will be added to the TOLS catalog soon.</p>
              </div>
            )}
          </div>
        ) : dbLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-white/10 border-t-lime rounded-full animate-spin" />
          </div>
        ) : !dbSlot ? (
          <div className="text-center py-20">
            <p className="text-white/40 font-bold">Game not found</p>
            <p className="text-white/30 text-sm mt-1">This slot is not in the synced catalog.</p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h1 className="text-2xl font-black tracking-tight text-white">
                <span className="text-lime">{dbSlot.name.split(" ")[0]}</span>{" "}
                {dbSlot.name.split(" ").slice(1).join(" ")}
              </h1>
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
            </div>

            {mode === "demo" ? (
              dbSlot.demo_url ? (
                <DemoSlotPlayer slot={dbSlot} />
              ) : (
                <div className="rounded-2xl border border-white/10 bg-[#111] p-12 text-center text-white/50">
                  <p className="font-bold text-white">Demo not available</p>
                  <p className="text-sm mt-1">This provider hasn't supplied a demo URL. Try Real mode.</p>
                </div>
              )
            ) : isGuest ? (
              <div className="max-w-md mx-auto rounded-2xl border border-lime/30 bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-lime" />
                </div>
                <h2 className="text-2xl font-black text-white">Real money play</h2>
                <p className="text-sm text-white/55 mt-2 max-w-sm mx-auto">
                  Log in and deposit crypto to play {dbSlot.name} for real. Every session is launched through the secured aggregator backend.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-5">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition"
                  >
                    <LogIn className="w-4 h-4" /> Log in
                  </Link>
                  <button
                    onClick={() => openWallet({ tab: "deposit" })}
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-lime text-black font-black hover:opacity-90 transition glow-lime"
                  >
                    <Wallet className="w-4 h-4" /> Deposit
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-4">
                  Or switch to <span className="text-blue-400 font-bold">DEMO</span> to try it first.
                </p>
              </div>
            ) : (
              <RealSlotPlayer game={dbSlot} mode="real" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}