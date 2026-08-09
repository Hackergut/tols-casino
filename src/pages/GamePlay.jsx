import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, LogIn, Wallet } from "lucide-react";
import { getGame } from "@/lib/games";
import { base44 } from "@/api/base44Client";
import { useWallet, DemoWalletProvider } from "@/components/WalletProvider";
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
import ShootGame from "@/components/games/ShootGame";
import { RTP_ORIGINALS } from "@/lib/gameEngine";
import { useIntegrationMode } from "@/hooks/useIntegrationMode";

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
  shoot: ShootGame,
};

export default function GamePlay({ slug }) {
  const game = getGame(slug);
  const Game = game && GAMES_MAP[game.slug];
  const { wallet } = useWallet();
  const { openWallet } = useWalletModal();
  const { mode: integrationMode } = useIntegrationMode();
  const isGuest = !wallet || wallet.id === "guest";
  const realReady = !isGuest && !!wallet && wallet.balance > 0;

  const [mode, setMode] = useState("demo");
  const [origMode, setOrigMode] = useState("demo");
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
    <div className="min-h-screen bg-background">
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h1 className="text-2xl font-black tracking-tight text-white">
                <span className="text-lime">{game.name.split(" ")[0]}</span>{" "}
                {game.name.split(" ").slice(1).join(" ")}
              </h1>
              {Game && (
                <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1a1a1a] border border-white/10 w-fit">
                  <button
                    onClick={() => setOrigMode("demo")}
                    className={`px-4 h-9 rounded-lg text-xs font-black transition ${origMode === "demo" ? "bg-blue-500 text-white" : "text-white/50 hover:text-white"}`}
                  >
                    DEMO
                  </button>
                  <button
                    onClick={() => setOrigMode("real")}
                    className={`px-4 h-9 rounded-lg text-xs font-black transition ${origMode === "real" ? "bg-lime text-black" : "text-white/50 hover:text-white"}`}
                  >
                    REAL
                  </button>
                </div>
              )}
            </div>

            {Game ? (
              origMode === "real" && !realReady ? (
                <RealPlayPrompt name={game.name} liveEnabled={integrationMode.liveSlotsEnabled && integrationMode.livePaymentsEnabled} openWallet={openWallet} />
              ) : (
                <>
                  {origMode === "demo" && (
                    <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[11px] font-bold text-blue-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> DEMO · fun money
                    </div>
                  )}
                  {origMode === "demo" ? (
                    <DemoWalletProvider><Game /></DemoWalletProvider>
                  ) : (
                    <Game />
                  )}
                </>
              )
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
            ) : !integrationMode.liveSlotsEnabled ? (
              <div className="max-w-md mx-auto rounded-2xl border border-blue-400/30 bg-blue-500/10 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-blue-300" />
                </div>
                <h2 className="text-2xl font-black text-white">Provider sessions paused</h2>
                <p className="text-sm text-white/55 mt-2 max-w-sm mx-auto">
                  {dbSlot.name} is connected through the launch backend, but live slot mode is disabled in sandbox. Demo remains available where the provider supplies it.
                </p>
              </div>
            ) : isGuest ? (
              <div className="max-w-md mx-auto rounded-2xl border border-lime/30 bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-7 h-7 text-lime" />
                </div>
                <h2 className="text-2xl font-black text-white">Real play is unavailable</h2>
                <p className="text-sm text-white/55 mt-2 max-w-sm mx-auto">
                  {dbSlot.name} is integrated for provider sessions, but live play is disabled in sandbox mode. Try demo mode or ask an administrator to enable live slots after production review.
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

function RealPlayPrompt({ name, liveEnabled, openWallet }) {
  return (
    <div className="max-w-md mx-auto rounded-2xl border border-lime/30 bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-7 h-7 text-lime" />
      </div>
      <h2 className="text-2xl font-black text-white">{liveEnabled ? "Log in to play" : "Sandbox mode enabled"}</h2>
      <p className="text-sm text-white/55 mt-2 max-w-sm mx-auto">
        {liveEnabled
          ? `Log in and open your wallet to play ${name} for real. Every original uses the provably-fair seed panel and settles against your wallet.`
          : `${name} supports real play at the integration layer, but live payments and provider sessions are disabled until an administrator completes production review.`}
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center mt-5">
        <Link to="/login" className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition">
          <LogIn className="w-4 h-4" /> Log in
        </Link>
        {liveEnabled && (
          <button onClick={() => openWallet({ tab: "deposit" })} className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-lime text-black font-black hover:opacity-90 transition glow-lime">
            <Wallet className="w-4 h-4" /> Deposit
          </button>
        )}
      </div>
      <p className="text-xs text-white/30 mt-4">Switch to <span className="text-blue-400 font-bold">DEMO</span> to play with fun money.</p>
    </div>
  );
}