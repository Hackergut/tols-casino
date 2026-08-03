import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";

const GRID = 40;

// payout table for k matches out of 10 picks (house edge ~5%)
const PAYOUTS = {
  0: 0, 1: 0, 2: 0, 3: 1, 4: 2, 5: 4, 6: 8, 7: 20, 8: 80, 9: 400, 10: 2000,
};

export default function KenoGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [picks, setPicks] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [matches, setMatches] = useState(0);

  const togglePick = (n) => {
    if (playing) return;
    setPicks((p) => p.includes(n) ? p.filter((x) => x !== n) : p.length < 10 ? [...p, n] : p);
  };

  const play = async () => {
    if (playing || !wallet || picks.length === 0 || amount > wallet.balance || amount <= 0) return;
    setPlaying(true);
    setDrawn([]);
    const drawnSet = new Set();
    while (drawnSet.size < 10) {
      const r = await pf.roll();
      drawnSet.add(Math.floor(r * GRID) + 1);
    }
    const drawnArr = Array.from(drawnSet);
    setDrawn(drawnArr);
    const m = drawnArr.filter((x) => picks.includes(x)).length;
    setMatches(m);
    const mul = PAYOUTS[m] || 0;
    const payout = amount * mul;
    setPlaying(false);
    updateBalance(payout - amount, amount);
    recordBet({ game_id: "keno", game_name: "Keno", amount, multiplier: mul, payout, result: mul >= 1 ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6">
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
          {Array.from({ length: GRID }).map((_, i) => {
            const n = i + 1;
            const isPicked = picks.includes(n);
            const isDrawn = drawn.includes(n);
            const isHit = isPicked && isDrawn;
            return (
              <button
                key={n}
                onClick={() => togglePick(n)}
                disabled={playing}
                className={`aspect-square rounded-lg text-xs font-bold transition ${
                  isHit ? "bg-lime text-black border-lime" :
                  isPicked ? "bg-lime/20 text-lime border-lime/40" :
                  isDrawn ? "bg-white/10 text-white/60 border-white/20" :
                  "bg-[#1a1a1a] text-white/50 border-white/5 hover:border-lime/30"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-white/50">Picked: <span className="text-lime font-bold">{picks.length}</span>/10</span>
          {drawn.length > 0 && <span className="text-white/50">Matches: <span className="text-lime font-bold">{matches}</span> · {PAYOUTS[matches] || 0}x</span>}
        </div>
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={playing || picks.length === 0} betLabel={playing ? "Drawing..." : "Draw"} />
        <div className="text-xs text-white/40">
          <p className="font-semibold text-white/60 mb-1">Paytable</p>
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(PAYOUTS).filter(([k, v]) => v > 0).map(([k, v]) => (
              <span key={k} className="px-2 py-1 rounded bg-[#1a1a1a] text-center">{k}→{v}x</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}