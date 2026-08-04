import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, ResultBadge, useProvablyFair } from "@/components/games/shared";

export default function LimboGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [target, setTarget] = useState(2.0);
  const [last, setLast] = useState(null);

  const winChance = (99 / target).toFixed(2);

  const play = async () => {
    if (!wallet || amount > wallet.balance || amount <= 0) return;
    const r = await pf.roll();
    const result = Math.max(1.0, Math.floor((99 / (1 - r)) * 100) / 100);
    const won = result >= target;
    const payout = won ? amount * target : 0;
    setLast({ result, won, multiplier: won ? target : 0, payout: won ? payout : amount });
    updateBalance(won ? payout - amount : -amount, amount);
    recordBet({ game_id: "limbo", game_name: "Limbo", amount, multiplier: won ? target : 0, payout, result: won ? "win" : "lose", client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-8 min-h-[220px] sm:min-h-[260px] flex flex-col items-center justify-center">
          <div className="text-xs font-semibold text-white/40 mb-2">RISULTATO</div>
          {last ? (
            <div className={`text-6xl sm:text-7xl font-black tabular-nums ${last.won ? "text-lime" : "text-white/60"}`}>
              {last.result.toFixed(2)}x
            </div>
          ) : (
            <div className="text-6xl sm:text-7xl font-black text-white/20">1.00x</div>
          )}
          <div className="mt-3 text-sm text-white/40">Target: {target.toFixed(2)}x</div>
        </div>
        {last && <ResultBadge result={last.won ? "win" : "lose"} multiplier={last.multiplier} payout={last.won ? last.payout - amount : -amount} />}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} betLabel="Roll" />
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