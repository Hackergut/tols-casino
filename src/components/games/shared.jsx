import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { randomSeed, rngFloat, sha256Hex } from "@/lib/provablyFair";

// Shared bet panel: amount, multiplier target, roll button
export function BetPanel({ amount, setAmount, onBet, disabled, betLabel = "Bet", extra }) {
  const { wallet } = useWallet();
  const balance = wallet ? wallet.balance : 0;

  const quick = (mult) => setAmount((a) => Math.max(0.01, +(a * mult).toFixed(2)));
  const setHalf = () => setAmount(+(balance / 2).toFixed(2));
  const setMax = () => setAmount(+(balance).toFixed(2));

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-white/50 mb-1.5 block">Bet amount</label>
        <div className="flex items-center gap-2 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 px-3">
          <span className="text-lime font-bold text-sm">$</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, +e.target.value))}
            className="bg-transparent outline-none text-lg font-bold text-white w-full tabular-nums"
          />
          <button onClick={setHalf} className="px-2 py-1 text-xs rounded-md bg-white/5 text-white/60 hover:text-lime font-bold">½</button>
          <button onClick={setMax} className="px-2 py-1 text-xs rounded-md bg-white/5 text-white/60 hover:text-lime font-bold">MAX</button>
        </div>
        <div className="flex gap-1.5 mt-2">
          {[1, 5, 10, 50, 100].map((v) => (
            <button
              key={v}
              onClick={() => setAmount(v)}
              className="flex-1 h-9 rounded-lg bg-[#1a1a1a] border border-white/10 text-sm font-bold text-white/70 hover:border-lime/40 hover:text-lime transition"
            >
              ${v}
            </button>
          ))}
        </div>
      </div>
      {extra}
      <button
        onClick={onBet}
        disabled={disabled}
        className="w-full h-14 rounded-xl bg-lime text-black font-black text-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed glow-lime"
      >
        {betLabel}
      </button>
    </div>
  );
}

// Result badge
export function ResultBadge({ result, multiplier, payout }) {
  if (!result) return null;
  const win = result === "win";
  return (
    <div
      className={`text-center py-3 rounded-xl border ${
        win ? "border-lime/40 bg-lime/10" : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <p className={`font-black text-2xl ${win ? "text-lime" : "text-red-400"}`}>
        {win ? `+${payout.toFixed(2)}` : `-${Math.abs(payout).toFixed(2)}`}
      </p>
      <p className="text-xs text-white/50 mt-0.5">
        {win ? "WIN" : "LOSE"} · {multiplier.toFixed(2)}x
      </p>
    </div>
  );
}

// hook to run a provably-fair bet round
export function useProvablyFair() {
  const [serverSeed, setServerSeed] = useState(() => randomSeed());
  const [clientSeed, setClientSeed] = useState(() => randomSeed());
  const [nonce, setNonce] = useState(0);
  const [serverHash, setServerHash] = useState("");

  React.useEffect(() => {
    sha256Hex(serverSeed).then(setServerHash);
  }, [serverSeed]);

  const roll = async () => {
    const r = await rngFloat(serverSeed, clientSeed, nonce);
    setNonce((n) => n + 1);
    return r;
  };

  const rotateSeeds = () => {
    setServerSeed(randomSeed());
    setClientSeed(randomSeed());
    setNonce(0);
  };

  return { serverSeed, clientSeed, nonce, serverHash, roll, rotateSeeds };
}