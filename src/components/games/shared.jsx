import React, { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { randomSeed, rngFloat, sha256Hex } from "@/lib/provablyFair";

// Shared bet panel styled like the TOLS reference: Manual/Auto tabs,
// Wager + Profit fields, quick amount chips, full-width lime PLAY button.
// Shared bet panel — TOLS Professional: Manual/Auto/Advanced tabs, Bet Amount with ½/2x, Profit, lime Bet
export function BetPanel({ amount, setAmount, onBet, disabled, betLabel = "Bet", extra, profit }) {
  const { wallet } = useWallet();
  const balance = wallet ? wallet.balance : 0;
  const [mode, setMode] = useState("manual"); // manual | auto | advanced

  const onHalf = () => setAmount(+(amount / 2).toFixed(2));
  const onDouble = () => setAmount(+(Math.min(balance, amount * 2)).toFixed(2));
  const tabCls = (active) =>
    `flex-1 h-8 rounded-lg text-xs font-bold uppercase tracking-wide transition ${
      active ? "bg-white text-black" : "text-white/45 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-[#121212] p-3">
      {/* Shuffle tabs: Manual / Auto / Advanced */}
      <div className="flex gap-1 p-1 rounded-xl bg-[#080808] border border-white/[0.06]">
        <button onClick={() => setMode("manual")} className={tabCls(mode === "manual")}>Manual</button>
        <button onClick={() => setMode("auto")} className={tabCls(mode === "auto")}>Auto</button>
        <button disabled className="flex-1 h-8 rounded-lg text-xs font-bold uppercase tracking-wide text-white/20 cursor-not-allowed">Advanced</button>
      </div>

      {/* Bet Amount — Shuffle style with ETH icon and ½/2x */}
      <div>
        <label className="text-[11px] font-bold text-white/40 flex items-center gap-1">Bet Amount <span className="w-3 h-3 rounded-full border border-white/20 grid place-items-center text-[8px]">i</span></label>
        <div className="mt-1.5 flex items-center gap-1.5 h-11 rounded-xl bg-[#1a1a1a] border border-white/10 px-2 focus-within:border-white/20 transition">
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, +e.target.value))}
            className="flex-1 bg-transparent outline-none text-sm font-bold text-white tabular-nums"
          />
          <span className="text-xs font-bold text-white/30">USD</span>
          <span className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-[10px]">◈</span>
          <div className="flex gap-1 ml-1">
            <button onClick={onHalf} className="w-8 h-7 rounded-md bg-white/[0.06] border border-white/10 text-xs font-bold text-white/70 hover:bg-white hover:text-black transition">½</button>
            <button onClick={onDouble} className="w-8 h-7 rounded-md bg-white/[0.06] border border-white/10 text-xs font-bold text-white/70 hover:bg-white hover:text-black transition">2x</button>
          </div>
        </div>
      </div>

      {/* Profit — Shuffle style */}
      <div>
        <label className="text-[11px] font-bold text-white/40">Profit</label>
        <div className="mt-1.5 flex items-center h-11 rounded-xl bg-[#1a1a1a] border border-white/10 px-3">
          <span className="flex-1 text-sm font-bold text-white/60 tabular-nums">{profit != null ? Number(profit).toFixed(2) : "0.00"} USD</span>
          <span className="w-6 h-6 rounded-full bg-white/10 grid place-items-center text-[10px]">◈</span>
        </div>
      </div>

      {extra}

      <button
        onClick={onBet}
        disabled={disabled}
        className="w-full h-12 rounded-xl bg-lime text-black font-black text-sm uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ boxShadow: "0 0 20px rgba(204,255,0,0.2)" }}
      >
        {betLabel}
      </button>
      {mode === "auto" && (
        <p className="text-[11px] text-center text-white/30">Auto — runs continuously with stop conditions</p>
      )}
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