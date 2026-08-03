import React, { useState, useCallback, useRef } from "react";
import { useWallet } from "@/components/WalletProvider";
import { randomSeed, rngFloat } from "@/lib/provablyFair";
import { RefreshCw, Zap } from "lucide-react";

const SYMBOLS = [
  { id: "cherry", icon: "🍒", weight: 28, pay: 2 },
  { id: "lemon", icon: "🍋", weight: 22, pay: 3 },
  { id: "grape", icon: "🍇", weight: 18, pay: 5 },
  { id: "bell", icon: "🔔", weight: 12, pay: 8 },
  { id: "star", icon: "⭐", weight: 8, pay: 15 },
  { id: "diamond", icon: "💎", weight: 4, pay: 30 },
  { id: "seven", icon: "7️⃣", weight: 1, pay: 100 },
];

const LINES = [
  { cells: [0, 1, 2], label: "Top" },
  { cells: [3, 4, 5], label: "Middle" },
  { cells: [6, 7, 8], label: "Bottom" },
  { cells: [0, 4, 8], label: "Diag ↘" },
  { cells: [2, 4, 6], label: "Diag ↙" },
];

const TOTAL_WEIGHT = SYMBOLS.reduce((s, x) => s + x.weight, 0);

function pickSymbol(r) {
  let acc = r * TOTAL_WEIGHT;
  for (const s of SYMBOLS) {
    acc -= s.weight;
    if (acc <= 0) return s;
  }
  return SYMBOLS[0];
}

function useSlotBalance(mode) {
  const { wallet, updateBalance } = useWallet();
  const [demoBalance, setDemoBalance] = useState(() =>
    +(localStorage.getItem("tols_demo_slot") || 5000)
  );

  const balance = mode === "real" ? wallet?.balance || 0 : demoBalance;

  const apply = useCallback(
    (delta, wagered = 0) => {
      if (mode === "real") {
        updateBalance(delta, wagered);
      } else {
        setDemoBalance((prev) => {
          const next = Math.max(0, +(prev + delta).toFixed(2));
          localStorage.setItem("tols_demo_slot", next);
          return next;
        });
      }
    },
    [mode, updateBalance]
  );

  const reloadDemo = () => {
    setDemoBalance(5000);
    localStorage.setItem("tols_demo_slot", 5000);
  };

  return { balance, apply, reloadDemo };
}

export default function SlotGame({ game, mode }) {
  const { balance, apply, reloadDemo } = useSlotBalance(mode);
  const [bet, setBet] = useState(mode === "real" ? 1 : 10);
  const [grid, setGrid] = useState(() =>
    Array.from({ length: 9 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
  );
  const [spinning, setSpinning] = useState(false);
  const [wins, setWins] = useState([]); // winning line indices
  const [lastWin, setLastWin] = useState(null);
  const [serverSeed, setServerSeed] = useState(() => randomSeed());
  const [clientSeed] = useState(() => randomSeed());
  const nonceRef = useRef(0);

  const accent = game?.accent || "#ccff00";

  const spin = useCallback(async () => {
    if (spinning) return;
    if (bet <= 0 || bet > balance) return;
    setSpinning(true);
    setWins([]);
    setLastWin(null);
    apply(-bet, bet);

    // animated reel fills
    let ticks = 0;
    const anim = setInterval(() => {
      setGrid(Array.from({ length: 9 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
      ticks++;
      if (ticks > 10) clearInterval(anim);
    }, 60);

    // provably-fair final grid
    const final = [];
    for (let i = 0; i < 9; i++) {
      const r = await rngFloat(serverSeed, clientSeed, nonceRef.current + i);
      final.push(pickSymbol(r));
    }
    nonceRef.current += 9;

    setTimeout(() => {
      clearInterval(anim);
      setGrid(final);

      // check lines
      const winning = [];
      let totalPayout = 0;
      LINES.forEach((line, idx) => {
        const [a, b, c] = line.cells;
        if (final[a].id === final[b].id && final[b].id === final[c].id) {
          winning.push(idx);
          totalPayout += bet * final[a].pay;
        }
      });

      if (totalPayout > 0) {
        apply(+totalPayout.toFixed(2), 0);
        setWins(winning);
        setLastWin({ payout: +totalPayout.toFixed(2), lines: winning.length });
      }
      setSpinning(false);
    }, 700);
  }, [spinning, bet, balance, apply, serverSeed, clientSeed]);

  const quick = (v) => setBet(v);
  const setHalf = () => setBet(+(balance / 2).toFixed(2));
  const setMax = () => setBet(+(balance).toFixed(2));

  const winCells = new Set();
  wins.forEach((li) => LINES[li].cells.forEach((c) => winCells.add(c)));

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Slot machine */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{
                color: accent,
                background: `${accent}1a`,
                border: `1px solid ${accent}40`,
              }}
            >
              {game?.provider || "TOLS"}
            </span>
            <span className="text-xs text-white/40">RTP {game?.rtp || 96}%</span>
            <span className="text-xs text-white/40">· {game?.volatility || "Alta"}</span>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
            style={
              mode === "real"
                ? { color: "#ccff00", background: "#ccff001a", border: "1px solid #ccff0040" }
                : { color: "#4f8aff", background: "#4f8aff1a", border: "1px solid #4f8aff40" }
            }
          >
            {mode === "real" ? "Real Money" : "Demo"}
          </span>
        </div>

        {/* Reels */}
        <div className="relative rounded-xl bg-black/60 p-3 sm:p-5 border border-white/5">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {grid.map((sym, i) => {
              const isWin = winCells.has(i);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-4xl sm:text-5xl transition-all duration-150 ${
                    spinning ? "blur-sm scale-95" : "blur-0 scale-100"
                  } ${isWin ? "ring-2" : ""}`}
                  style={{
                    background: isWin ? `${accent}1a` : "rgba(255,255,255,0.02)",
                    boxShadow: isWin ? `0 0 24px -2px ${accent}` : "none",
                    // ring color via boxShadow
                  }}
                >
                  {sym.icon}
                </div>
              );
            })}
          </div>
          {lastWin && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="px-6 py-3 rounded-2xl text-2xl sm:text-4xl font-black animate-pulse"
                style={{ color: accent, textShadow: `0 0 24px ${accent}` }}
              >
                +{lastWin.payout} {mode === "real" ? "USDT" : "DEMO"}
              </div>
            </div>
          )}
        </div>

        {/* Balance + last result */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-3">
            <div className="text-sm text-white/50">
              Balance:{" "}
              <span className="font-black text-white tabular-nums">
                {balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>{" "}
              <span className="text-white/30 text-xs">{mode === "real" ? "USDT" : "DEMO"}</span>
            </div>
            {mode === "demo" && (
              <button
                onClick={reloadDemo}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition"
              >
                ↻ Reload demo
              </button>
            )}
          </div>
          {wins.length > 0 && (
            <div className="text-sm font-bold" style={{ color: accent }}>
              {wins.length} winning line{wins.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-white/50 mb-1.5 block">Bet amount</label>
            <div className="flex items-center gap-2 h-12 rounded-xl bg-[#1a1a1a] border border-white/10 px-3">
              <span className="font-bold text-sm" style={{ color: accent }}>$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={bet}
                onChange={(e) => setBet(Math.max(0, +e.target.value))}
                className="bg-transparent outline-none text-lg font-bold text-white w-full tabular-nums"
              />
              <button onClick={setHalf} className="px-2 py-1 text-xs rounded-md bg-white/5 text-white/60 hover:text-white font-bold">½</button>
              <button onClick={setMax} className="px-2 py-1 text-xs rounded-md bg-white/5 text-white/60 hover:text-white font-bold">MAX</button>
            </div>
            <div className="flex gap-1.5 mt-2">
              {[1, 5, 10, 50, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => quick(v)}
                  className="flex-1 h-9 rounded-lg bg-[#1a1a1a] border border-white/10 text-sm font-bold text-white/70 hover:border-white/20 hover:text-white transition"
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={spin}
            disabled={spinning || bet <= 0 || bet > balance}
            className="w-full h-14 rounded-xl text-black font-black text-lg hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: accent, boxShadow: `0 0 24px -4px ${accent}80` }}
          >
            {spinning ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
            {spinning ? "SPINNING..." : "SPIN"}
          </button>

          <div className="text-center text-xs text-white/30">
            Max win: 100x · 5 paylines
          </div>
        </div>

        {/* Paytable */}
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Paytable</h3>
          <div className="grid grid-cols-2 gap-2">
            {SYMBOLS.map((s) => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                <span className="text-2xl">{s.icon}</span>
                <span className="text-sm font-bold text-white/70">x{s.pay}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}