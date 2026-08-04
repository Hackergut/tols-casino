import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { Bomb, Gem } from "lucide-react";

const GRID = 25;

// multiplier for revealing k gems with m mines
function multiplierForReveals(k, mines) {
  const safe = GRID - mines;
  let p = 1;
  for (let i = 0; i < k; i++) p *= (safe - i) / (GRID - i);
  return Math.floor((0.99 / p) * 100) / 100;
}

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
      <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
        <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-md mx-auto" style={busted ? { animation: "shake 0.4s" } : undefined}>
          {Array.from({ length: GRID }).map((_, i) => {
            const isRevealed = revealed.includes(i);
            const isBomb = bombs.includes(i);
            const showBomb = busted && isBomb;
            return (
              <button
                key={i}
                onClick={() => reveal(i)}
                disabled={!active || isRevealed}
                className={`aspect-square rounded-xl border flex items-center justify-center transition ${
                  isRevealed
                    ? showBomb
                      ? "bg-red-500/15 border-red-500/40"
                      : "bg-lime/10 border-lime/30"
                    : "bg-[#1a1a1a] border-white/10 hover:border-lime/30 hover:bg-white/5"
                }`}
              >
                {isRevealed && (showBomb
                  ? <Bomb className="w-6 h-6 text-red-400" style={{ animation: "popIn 0.35s both" }} />
                  : <Gem className="w-6 h-6 text-lime" style={{ animation: "gemPop 0.4s both" }} />)}
                {!isRevealed && active && <span className="w-2 h-2 rounded-full bg-white/10" />}
              </button>
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
      </div>

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