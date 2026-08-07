import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";
import { SLOT_SYMBOLS, SLOT_TIERS, slotTierFromFloat, boardForTier } from "@/lib/slotEngine";
import { Coins } from "lucide-react";

const REELS = 5;
const ROWS = 3;

function randBoard() {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, () => Math.floor(Math.random() * SLOT_SYMBOLS.length))
  );
}

function Sym({ id, highlight }) {
  const s = SLOT_SYMBOLS[id];
  return (
    <div
      className={`flex items-center justify-center rounded-lg border aspect-square w-full transition-all duration-300
        ${highlight ? "border-lime bg-lime/10 glow-lime scale-105" : "border-white/10 bg-[#141414]"}`}
      style={!highlight ? { boxShadow: `inset 0 0 24px ${s.color}12` } : undefined}
    >
      <span className={`text-2xl sm:text-3xl ${highlight ? "" : "opacity-90"}`}>{s.emoji}</span>
    </div>
  );
}

export default function SlotMachine() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [reels, setReels] = useState(randBoard);
  const [spinning, setSpinning] = useState(false);
  const [winTier, setWinTier] = useState(-1);
  const [winAmount, setWinAmount] = useState(0);
  const [winCells, setWinCells] = useState([]);
  const [history, setHistory] = useState([]);
  const [showPay, setShowPay] = useState(false);

  const intervalRef = useRef(null);
  const landedRef = useRef(0);
  const boardRef = useRef(null);
  const idxRef = useRef(0);
  const amountRef = useRef(amount);
  useEffect(() => { amountRef.current = amount; }, [amount]);

  const canSpin = !spinning && !!wallet && amount > 0 && amount <= (wallet?.balance || 0);

  const resolve = () => {
    const idx = idxRef.current;
    const tier = SLOT_TIERS[idx];
    const bet = amountRef.current;
    const payout = +(bet * tier.payout).toFixed(2);
    const common = {
      game_id: "neon-vault", game_name: "Neon Vault", amount: bet,
      client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
    };
    if (tier.payout > 0) {
      updateBalance(payout - bet, bet);
      recordBet({ ...common, multiplier: tier.payout, payout, result: "win" });
      setWinTier(idx);
      setWinAmount(payout);
      setWinCells(Array.from({ length: tier.count }, (_, i) => [i, 1]));
    } else {
      updateBalance(-bet, bet);
      recordBet({ ...common, multiplier: 0, payout: 0, result: "lose" });
      setWinTier(-1);
      setWinAmount(0);
      setWinCells([]);
    }
    setHistory((h) => [tier.payout, ...h].slice(0, 14));
  };

  const landReel = (i) => {
    setReels((prev) => prev.map((col, ci) => (ci === i ? [...boardRef.current[i]] : col)));
    landedRef.current = i + 1;
    if (i === REELS - 1) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      setSpinning(false);
      resolve();
    }
  };

  const spin = async () => {
    if (!canSpin) return;
    setSpinning(true);
    setWinTier(-1);
    setWinAmount(0);
    setWinCells([]);
    landedRef.current = 0;
    const r = await pf.roll();
    const idx = slotTierFromFloat(r);
    idxRef.current = idx;
    boardRef.current = boardForTier(idx);
    intervalRef.current = setInterval(() => {
      setReels((prev) =>
        prev.map((col, ci) =>
          ci < landedRef.current ? col : col.map(() => Math.floor(Math.random() * SLOT_SYMBOLS.length))
        )
      );
    }, 70);
    for (let i = 0; i < REELS; i++) setTimeout(() => landReel(i), 260 + i * 170);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const lastWin = history[0] || 0;
  const topTier = SLOT_TIERS[SLOT_TIERS.length - 1].payout;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-4">
        <GameFrame
          title="Neon Vault · 5×3"
          stats={[
            { label: "Last win", value: lastWin > 0 ? `${lastWin.toFixed(2)}x` : "—", tone: lastWin > 0 ? "default" : "muted" },
            { label: "Max win", value: `${topTier.toFixed(0)}x`, tone: "muted" },
            { label: "RTP", value: "96.50%" },
          ]}
        >
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="grid grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-black/60 border border-white/10">
              {reels.map((col, ci) => (
                <div key={ci} className="grid grid-rows-3 gap-2 sm:gap-3">
                  {col.map((symId, ri) => {
                    const highlight = winCells.some(([c, r]) => c === ci && r === ri);
                    return <Sym key={ri} id={symId} highlight={highlight && !spinning} />;
                  })}
                </div>
              ))}
            </div>
            {spinning && (
              <div className="absolute inset-x-0 -top-3 flex justify-center">
                <span className="px-3 py-1 rounded-full bg-lime text-black text-[10px] font-black animate-pulse">SPINNING…</span>
              </div>
            )}
          </div>

          {winTier >= 0 && (
            <div className="mt-4 text-center">
              <div className="inline-flex flex-col items-center px-6 py-3 rounded-2xl border border-lime/40 bg-lime/10 glow-lime">
                <span className="text-3xl font-black text-lime tabular-nums">+{winAmount.toFixed(2)}</span>
                <span className="text-xs font-bold text-white/60 mt-0.5">
                  {SLOT_TIERS[winTier].payout.toFixed(2)}x · {SLOT_SYMBOLS[SLOT_TIERS[winTier].sym].label} ×{SLOT_TIERS[winTier].count}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {history.map((m, i) => (
              <span key={i} className={`text-xs font-bold px-2 py-0.5 rounded-full ${m > 0 ? "text-lime bg-lime/10" : "text-white/40 bg-white/5"}`}>
                {m > 0 ? `${m.toFixed(2)}x` : "—"}
              </span>
            ))}
          </div>

          <button onClick={() => setShowPay((s) => !s)} className="mt-4 text-xs font-bold text-white/40 hover:text-lime transition">
            {showPay ? "Hide" : "Show"} paytable
          </button>
          {showPay && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-w-md mx-auto">
              {SLOT_TIERS.filter((t) => t.payout > 0).map((t, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-lg">{SLOT_SYMBOLS[t.sym].emoji}</span>
                  <span className="text-xs text-white/50">×{t.count}</span>
                  <span className="ml-auto text-sm font-black text-lime">{t.payout.toFixed(2)}x</span>
                </div>
              ))}
            </div>
          )}
        </GameFrame>
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={spin} disabled={!canSpin} betLabel={spinning ? "SPINNING…" : "SPIN"} />
        <div className="rounded-2xl border border-white/10 bg-[#101010] p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white/50 mb-2">
            <Coins className="w-4 h-4 text-lime" /> How to win
          </div>
          <p className="text-xs text-white/40 leading-relaxed">
            Match 3, 4 or 5 of the same symbol on the centre payline, left to right. Every spin is provably fair — the outcome derives from your client seed + the server seed hash shown below.
          </p>
          <div className="mt-2 text-[10px] text-white/30 font-mono break-all">hash: {pf.serverHash ? pf.serverHash.slice(0, 24) : "…"}…</div>
        </div>
      </div>
    </div>
  );
}