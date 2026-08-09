import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { randomSeed, rngFloat, sha256Hex } from "@/lib/provablyFair";

// Shared bet panel styled like the TOLS reference: Manual/Auto tabs,
// Wager + Profit fields, quick amount chips, full-width lime PLAY button.
export function BetPanel({ amount, setAmount, onBet, disabled, betLabel = "Bet", extra = null, profit = null }) {
  const { wallet } = useWallet();
  const balance = wallet ? wallet.balance : 0;
  const [mode, setMode] = useState("manual"); // manual | auto (UI only — auto coming soon)

  const setHalf = () => setAmount(+(balance / 2).toFixed(2));
  const setMax = () => setAmount(+balance.toFixed(2));
  const tabCls = (active) =>
    `flex-1 h-9 rounded-lg text-sm font-bold uppercase tracking-wide transition ${
      active ? "bg-lime text-black" : "text-white/55 hover:text-white"
    }`;

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-[#161616] p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)]">
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#0e0e0e] border border-white/10">
        <button onClick={() => setMode("manual")} className={tabCls(mode === "manual")}>Manual</button>
        <button onClick={() => setMode("auto")} className={tabCls(mode === "auto")}>Auto</button>
      </div>
      {mode === "auto" && (
        <p className="text-[11px] text-white/40 -mt-2">Auto-bet coming soon — switch to Manual to play now.</p>
      )}

      {/* Wager + Profit */}
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-[11px] font-semibold text-white/45">Wager</label>
          <div className="flex items-center gap-1.5 h-11 mt-1 rounded-xl bg-[#0e0e0e] border border-white/10 px-2.5 focus-within:border-lime/40 transition">
            <span className="text-lime font-bold text-sm">$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, +e.target.value))}
              className="bg-transparent outline-none text-base font-bold text-white w-full tabular-nums"
            />
            <button onClick={setHalf} className="px-1.5 py-0.5 text-[11px] rounded-md bg-white/5 text-white/60 hover:text-lime font-bold">½</button>
            <button onClick={setMax} className="px-1.5 py-0.5 text-[11px] rounded-md bg-white/5 text-white/60 hover:text-lime font-bold">MAX</button>
          </div>
        </div>
        <div>
          <label className="text-[11px] font-semibold text-white/45">Profit</label>
          <div className="flex items-center gap-1.5 h-11 mt-1 rounded-xl bg-[#0e0e0e] border border-white/10 px-2.5">
            <span className="text-lime font-bold text-sm">$</span>
            <input
              readOnly
              value={profit != null ? Number(profit).toFixed(2) : "—"}
              className="bg-transparent outline-none text-base font-bold text-white/80 w-full tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* Quick chips */}
      <div className="flex gap-1.5">
        {[1, 5, 10, 50, 100].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(v)}
            className="flex-1 h-9 rounded-lg bg-[#0e0e0e] border border-white/10 text-sm font-bold text-white/70 hover:border-lime/40 hover:text-lime transition"
          >
            ${v}
          </button>
        ))}
      </div>

      {extra}

      <button
        onClick={onBet}
        disabled={disabled}
        className="w-full h-14 rounded-xl bg-lime text-black font-black text-lg uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 glow-lime"
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