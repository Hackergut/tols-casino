import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, ResultBadge, useProvablyFair } from "@/components/games/shared";
import { limboWinChance, limboResultFromFloat } from "@/lib/gameEngine";
import GameFrame from "@/components/games/GameFrame";

export default function LimboGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [target, setTarget] = useState(2.0);
  const [last, setLast] = useState(null);
  const [display, setDisplay] = useState(null);
  const [busy, setBusy] = useState(false);
  const timers = useRef([]);

  const winChance = limboWinChance(target).toFixed(2);

  const animate = (to, done) => {
    timers.current.forEach(clearTimeout);
    const steps = 30;
    let i = 0;
    const run = () => {
      i++;
      const e = 1 - Math.pow(1 - i / steps, 3);
      setDisplay(1 + (to - 1) * e);
      if (i < steps) timers.current.push(setTimeout(run, 22));
      else { setDisplay(to); done(); }
    };
    timers.current.push(setTimeout(run, 22));
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const play = async () => {
    if (busy || !wallet || amount > wallet.balance || amount <= 0) return;
    setBusy(true);
    setDisplay(1);
    const r = await pf.roll();
    const result = limboResultFromFloat(r);
    const won = result >= target;
    const payout = won ? amount * target : 0;
    setLast({ result, won, multiplier: won ? target : 0, payout: won ? payout : amount });
    updateBalance(won ? payout - amount : -amount, amount);
    recordBet({ game_id: "limbo", game_name: "Limbo", amount, multiplier: won ? target : 0, payout, result: won ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
    animate(result, () => setBusy(false));
  };

  const shown = busy && display != null ? display : last ? last.result : null;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <GameFrame
          title="Limbo"
          stats={[
            { label: "Target", value: `${target.toFixed(2)}x` },
            { label: "Win chance", value: `${winChance}%` },
            { label: "Payout", value: `$${(amount * target).toFixed(2)}` },
          ]}
        >
          <div className="text-xs font-semibold text-white/40 mb-2">RESULT</div>
          <div
            className={`text-6xl sm:text-7xl font-black tabular-nums ${shown == null ? "text-white/20" : last && last.won ? "text-lime" : "text-white/70"}`}
            style={shown != null && last && last.won ? { textShadow: "0 0 28px rgba(204,255,0,0.55)" } : undefined}
          >
            {shown != null ? `${shown.toFixed(2)}x` : "1.00x"}
          </div>
          <div className="mt-3 text-sm text-white/40">Target: {target.toFixed(2)}x</div>
        </GameFrame>
        {last && <ResultBadge result={last.won ? "win" : "lose"} multiplier={last.multiplier} payout={last.won ? last.payout - amount : -amount} />}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={busy} betLabel={busy ? "..." : "Roll"} />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Target multiplier (x)</label>
          <input
            type="number"
            min="1.01"
            step="0.01"
            value={target}
            onChange={(e) => setTarget(Math.max(1.01, +e.target.value))}
            className="w-full h-12 rounded-xl bg-[#1a1a1a] border border-white/10 px-4 text-lg font-bold text-white outline-none focus:border-lime/40"
          />
          <p className="text-xs text-white/40 mt-2">Win chance: <span className="text-lime font-bold">{winChance}%</span> · Payout: <span className="text-lime font-bold">{(amount * target).toFixed(2)}</span></p>
        </div>
      </div>
    </div>
  );
}