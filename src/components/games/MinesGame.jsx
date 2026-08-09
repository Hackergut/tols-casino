import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { Bomb, Gem } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { minesMultiplier } from "@/lib/gameEngine";
import GameFrame from "@/components/games/GameFrame";

const GRID = 25;

// multiplier for revealing k gems with m mines (calibrated in the engine)
const multiplierForReveals = (k, mines) => minesMultiplier(k, mines);

export default function MinesGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [mines, setMines] = useState(3);
  const [active, setActive] = useState(false);
  const [revealed, setRevealed] = useState([]); // indices
  const [bombs, setBombs] = useState([]);
  const [busted, setBusted] = useState(false);
  const [currentMul, setCurrentMul] = useState(1);

  const start = async () => {
    if (!wallet || amount > wallet.balance || amount <= 0) return;
    // place mines via rng
    const indices = Array.from({ length: GRID }, (_, i) => i);
    const chosen = [];
    for (let i = 0; i < mines; i++) {
      const r = await pf.roll();
      const idx = Math.floor(r * indices.length);
      chosen.push(indices.splice(idx, 1)[0]);
    }
    setBombs(chosen);
    setRevealed([]);
    setBusted(false);
    setCurrentMul(1);
    setActive(true);
  };

  const reveal = async (idx) => {
    if (!active || revealed.includes(idx)) return;
    if (bombs.includes(idx)) {
      setBusted(true);
      setActive(false);
      updateBalance(-amount, amount);
      recordBet({ game_id: "mines", game_name: "Mines", amount, multiplier: 0, payout: 0, result: "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
      setRevealed((r) => [...r, idx]);
      return;
    }
    const next = [...revealed, idx];
    setRevealed(next);
    const mul = multiplierForReveals(next.length, mines);
    setCurrentMul(mul);
  };

  const cashout = () => {
    if (!active || revealed.length === 0) return;
    const payout = amount * currentMul;
    setActive(false);
    updateBalance(payout - amount, amount);
    recordBet({ game_id: "mines", game_name: "Mines", amount, multiplier: currentMul, payout, result: "win", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
  };

  const nextMul = active && revealed.length >= 0 ? multiplierForReveals(revealed.length + 1, mines) : 1;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame
        title="Mines"
        minH=""
        stats={[
          { label: "Mines", value: mines, tone: "muted" },
          { label: "Current", value: `${currentMul.toFixed(2)}x` },
          { label: "Next tile", value: active ? `${nextMul.toFixed(2)}x` : "—" },
        ]}
      >
        <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-md mx-auto w-full" style={busted ? { animation: "shake 0.4s" } : undefined}>
          {Array.from({ length: GRID }).map((_, i) => {
            const isRevealed = revealed.includes(i);
            const isBomb = bombs.includes(i);
            const showBomb = busted && isBomb;
            return (
              <motion.button
                key={i}
                onClick={() => reveal(i)}
                disabled={!active || isRevealed}
                whileHover={active && !isRevealed ? { scale: 1.04 } : {}}
                whileTap={active && !isRevealed ? { scale: 0.96 } : {}}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01, type: "spring", stiffness: 400, damping: 25 }}
                className={`aspect-square rounded-xl border flex items-center justify-center ${
                  isRevealed
                    ? showBomb
                      ? "bg-red-500/15 border-red-500/40"
                      : "bg-lime/10 border-lime/30"
                    : "bg-[#1a1a1a] border-white/10 hover:border-lime/30 hover:bg-white/5"
                }`}
              >
                <AnimatePresence>
                  {isRevealed && (showBomb
                    ? <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}><Bomb className="w-6 h-6 text-red-400" /></motion.div>
                    : <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}><Gem className="w-6 h-6 text-lime" /></motion.div>)}
                </AnimatePresence>
                {!isRevealed && active && <span className="w-2 h-2 rounded-full bg-white/10" />}
              </motion.button>
            );
          })}
        </div>
        {active && revealed.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-sm text-white/50">Current payout: <span className="text-lime font-bold">{(amount * currentMul).toFixed(2)} USDT</span> ({currentMul.toFixed(2)}x)</p>
            <button onClick={cashout} className="mt-3 px-8 py-3 rounded-xl bg-lime text-black font-black hover:opacity-90 transition">
              Cashout {(amount * currentMul).toFixed(2)}
            </button>
          </div>
        )}
        {!active && <div className="mt-6 text-center text-sm text-white/40">Set the mines and press "Start"</div>}
      </GameFrame>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={start} disabled={active} betLabel={active ? "IN PROGRESS" : "Start"} />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Number of mines ({mines})</label>
          <input
            type="range"
            min="1"
            max="24"
            value={mines}
            onChange={(e) => setMines(+e.target.value)}
            className="w-full accent-lime"
          />
          <div className="flex justify-between text-xs text-white/40 mt-1"><span>1</span><span>24</span></div>
        </div>
        {active && <div className="text-center text-xs text-white/50">Next tile: <span className="text-lime font-bold">{nextMul.toFixed(2)}x</span></div>}
      </div>
    </div>
  );
}