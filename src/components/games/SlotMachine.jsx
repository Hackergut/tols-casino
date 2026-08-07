import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import GameFrame from "@/components/games/GameFrame";
import { SLOT_SYMBOLS, SLOT_TIERS, slotTierFromFloat, boardForTier } from "@/lib/slotEngine";
import { Coins } from "lucide-react";

const REELS = 5;
const ROWS = 3;
const FILLER = 18; // blank symbols above the 3 result symbols in the strip

// responsive cell size, fixed at mount (no re-animation on resize)
const CELL_W = typeof window !== "undefined" && window.innerWidth < 420 ? 52 : 68;
const CELL_H = Math.round(CELL_W * 1.14);

function SlotIcon({ id, className = "" }) {
  const c = SLOT_SYMBOLS[id].color;
  const glow = { filter: `drop-shadow(0 0 5px ${c}cc)` };
  const svg = { viewBox: "0 0 48 48", className, style: glow, fill: "none", stroke: c, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (SLOT_SYMBOLS[id].key) {
    case "cherry":
      return (<svg {...svg}><path d="M24 11 C 22 17, 17 19, 14 23" /><path d="M24 11 C 26 17, 31 19, 34 25" /><circle cx="14" cy="33" r="7" fill={c} fillOpacity="0.25" /><circle cx="34" cy="35" r="7" fill={c} fillOpacity="0.25" /></svg>);
    case "lemon":
      return (<svg {...svg}><ellipse cx="24" cy="29" rx="11" ry="8.5" fill={c} fillOpacity="0.22" /><path d="M24 21 C 22 16, 27 14, 31 15" /></svg>);
    case "bell":
      return (<svg {...svg}><path d="M16 33 C 16 21, 32 21, 32 33 Z" fill={c} fillOpacity="0.22" /><rect x="17" y="33" width="14" height="3" rx="1.5" fill={c} fillOpacity="0.35" /><circle cx="24" cy="40" r="2.4" fill={c} /><path d="M21 18 v-3 h6 v3" /></svg>);
    case "star":
      return (<svg {...svg}><path d="M24 9 l4.2 9 9.8 1 -7.3 6.4 2.4 9.6 -9.1 -5 -9.1 5 2.4 -9.6 -7.3 -6.4 9.8 -1 z" fill={c} fillOpacity="0.25" /></svg>);
    case "diamond":
      return (<svg {...svg}><path d="M13 20 L24 11 L35 20 L24 39 Z" fill={c} fillOpacity="0.25" /><path d="M13 20 H35 M24 11 V39" /></svg>);
    case "seven":
      return (<svg {...svg} strokeWidth={3}><path d="M15 14 H33 L23 38" fill={c} fillOpacity="0.2" /></svg>);
    case "wild":
      return (<svg {...svg}><path d="M24 8 l3 7 7 -1 -5 5 3 7 -8 -4 -8 4 3 -7 -5 -5 7 1 z" fill={c} fillOpacity="0.3" /><text x="24" y="29" fontSize="9" fontWeight="900" fill={c} stroke="none" textAnchor="middle" fontFamily="Archivo Black, Inter, sans-serif">W</text></svg>);
    case "bonus":
      return (<svg {...svg}><circle cx="24" cy="24" r="11" fill={c} fillOpacity="0.25" /><text x="24" y="29" fontSize="13" fontWeight="900" fill={c} stroke="none" textAnchor="middle" fontFamily="Archivo Black, Inter, sans-serif">$</text></svg>);
    default:
      return null;
  }
}

function randBoard() {
  return Array.from({ length: REELS }, () =>
    Array.from({ length: ROWS }, () => Math.floor(Math.random() * SLOT_SYMBOLS.length))
  );
}

function fireConfetti() {
  try {
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.55 }, colors: ["#ccff00", "#b04fff", "#4fc3ff", "#ff4f6a", "#ffe14f"], scalar: 0.9 });
  } catch {}
}

function StaticReel({ col }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0c0c0c] border border-white/10" style={{ height: ROWS * CELL_H, width: CELL_W }}>
      {col.map((s, idx) => (
        <div key={idx} style={{ height: CELL_H, width: CELL_W }} className="flex items-center justify-center">
          <SlotIcon id={s} className="w-9 h-9 sm:w-10 sm:h-10" />
        </div>
      ))}
    </div>
  );
}

function Reel({ strip, delay, winning, showWin, onDone }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#0c0c0c] border border-white/10" style={{ height: ROWS * CELL_H, width: CELL_W }}>
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: -(FILLER * CELL_H) }}
        transition={{ duration: 0.85 + delay, ease: [0.12, 0.7, 0.2, 1] }}
        onAnimationComplete={onDone}
      >
        {strip.syms.map((s, idx) => (
          <div key={idx} style={{ height: CELL_H, width: CELL_W }} className="flex items-center justify-center">
            <SlotIcon id={s} className="w-9 h-9 sm:w-10 sm:h-10" />
          </div>
        ))}
      </motion.div>
      {showWin && winning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-x-1 rounded-lg border-2 border-lime pointer-events-none"
          style={{ top: CELL_H + 2, height: CELL_H - 4, background: "rgba(204,255,0,0.10)", boxShadow: "0 0 18px rgba(204,255,0,0.6)" }}
        />
      )}
    </div>
  );
}

export default function SlotMachine() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [board, setBoard] = useState(randBoard);
  const [spinId, setSpinId] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winTier, setWinTier] = useState(-1);
  const [winAmount, setWinAmount] = useState(0);
  const [winCells, setWinCells] = useState([]);
  const [history, setHistory] = useState([]);
  const [showPay, setShowPay] = useState(false);
  const [flash, setFlash] = useState(false);

  const idxRef = useRef(0);
  const amountRef = useRef(amount);
  const doneRef = useRef(0);
  useEffect(() => { amountRef.current = amount; }, [amount]);

  const canSpin = !spinning && !!wallet && amount > 0 && amount <= (wallet?.balance || 0);

  const strips = useMemo(
    () => board.map((col, i) => ({
      id: `${spinId}-${i}`,
      syms: [
        ...Array.from({ length: FILLER }, () => Math.floor(Math.random() * SLOT_SYMBOLS.length)),
        col[0], col[1], col[2],
      ],
    })),
    [board, spinId]
  );

  const winReels = useMemo(() => winCells.map(([c]) => c), [winCells]);

  const resolve = () => {
    const idx = idxRef.current;
    const tier = SLOT_TIERS[idx];
    const bet = amountRef.current;
    const payout = +(bet * tier.payout).toFixed(2);
    const common = { game_id: "neon-vault", game_name: "Neon Vault", amount: bet, client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce };
    if (tier.payout > 0) {
      updateBalance(payout - bet, bet);
      recordBet({ ...common, multiplier: tier.payout, payout, result: "win" });
      setWinTier(idx);
      setWinAmount(payout);
      setWinCells(Array.from({ length: tier.count }, (_, i) => [i, 1]));
      if (tier.payout >= 5) { fireConfetti(); setFlash(true); setTimeout(() => setFlash(false), 600); }
    } else {
      updateBalance(-bet, bet);
      recordBet({ ...common, multiplier: 0, payout: 0, result: "lose" });
      setWinTier(-1); setWinAmount(0); setWinCells([]);
    }
    setHistory((h) => [tier.payout, ...h].slice(0, 14));
  };

  const onReelDone = () => {
    doneRef.current += 1;
    if (doneRef.current >= REELS) {
      doneRef.current = 0;
      setSpinning(false);
      resolve();
    }
  };

  const spin = async () => {
    if (!canSpin) return;
    setSpinning(true);
    setWinTier(-1); setWinAmount(0); setWinCells([]);
    doneRef.current = 0;
    const r = await pf.roll();
    const idx = slotTierFromFloat(r);
    idxRef.current = idx;
    setBoard(boardForTier(idx));
    setSpinId((n) => n + 1);
  };

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
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative rounded-2xl p-2 sm:p-3 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/10 shadow-[inset_0_0_40px_rgba(204,255,0,0.06)]">
              <div className="flex gap-1.5 justify-center">
                {spinId === 0
                  ? board.map((col, ci) => <StaticReel key={ci} col={col} />)
                  : strips.map((strip, i) => (
                      <Reel key={strip.id} strip={strip} delay={i * 0.12} winning={winReels.includes(i)} showWin={!spinning} onDone={onReelDone} />
                    ))}
              </div>
              {flash && <div className="absolute inset-0 rounded-2xl bg-lime/20 animate-pulse pointer-events-none" />}
            </div>
            {spinning && (
              <div className="absolute inset-x-0 -top-3 flex justify-center">
                <span className="px-3 py-1 rounded-full bg-lime text-black text-[10px] font-black animate-pulse">SPINNING…</span>
              </div>
            )}
          </div>

          <button
            onClick={spin}
            disabled={!canSpin}
            className="mt-4 mx-auto flex items-center justify-center gap-2 h-14 px-10 rounded-xl bg-lime text-black font-black text-lg uppercase tracking-wide hover:brightness-110 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 glow-lime"
          >
            {spinning ? "SPINNING…" : "SPIN"}
          </button>

          {winTier >= 0 && (
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 flex justify-center">
              <div className="inline-flex flex-col items-center px-6 py-3 rounded-2xl border border-lime/50 bg-lime/10 glow-lime">
                <span className="text-3xl font-black text-lime tabular-nums">+{winAmount.toFixed(2)}</span>
                <span className="text-xs font-bold text-white/60 mt-0.5">
                  {SLOT_TIERS[winTier].payout.toFixed(2)}x · {SLOT_SYMBOLS[SLOT_TIERS[winTier].sym].label} ×{SLOT_TIERS[winTier].count}
                </span>
              </div>
            </motion.div>
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
                  <SlotIcon id={t.sym} className="w-6 h-6" />
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