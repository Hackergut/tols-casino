import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "@/components/WalletProvider";
import { useWalletModal } from "@/components/wallet/useWalletModal";
import { randomSeed, rngFloat, sha256Hex } from "@/lib/provablyFair";
import { RefreshCw, Zap, Lock, LogIn, Wallet } from "lucide-react";

// ── Math: 3x3 slot, 5 paylines, weights sum = 93.
// EV/spin = 5 · Σ (w/93)³ · pay  ≈ 0.9646  →  RTP 96.5% (calibrated)
const SYMBOLS = [
  { id: "cherry", icon: "🍒", weight: 28, pay: 2 },
  { id: "lemon", icon: "🍋", weight: 22, pay: 4 },
  { id: "grape", icon: "🍇", weight: 18, pay: 6 },
  { id: "bell", icon: "🔔", weight: 12, pay: 12 },
  { id: "star", icon: "⭐", weight: 8, pay: 20 },
  { id: "diamond", icon: "💎", weight: 4, pay: 40 },
  { id: "seven", icon: "7️⃣", weight: 1, pay: 130 },
];
const LINES = [
  { cells: [0, 1, 2], label: "Top" },
  { cells: [3, 4, 5], label: "Middle" },
  { cells: [6, 7, 8], label: "Bottom" },
  { cells: [0, 4, 8], label: "Diag ↘" },
  { cells: [2, 4, 6], label: "Diag ↙" },
];
const TOTAL_WEIGHT = SYMBOLS.reduce((s, x) => s + x.weight, 0);
const SLOT_RTP = 0.965;

function pickSymbol(r) {
  let acc = r * TOTAL_WEIGHT;
  for (const s of SYMBOLS) {
    acc -= s.weight;
    if (acc <= 0) return s;
  }
  return SYMBOLS[0];
}

export default function SlotGame({ game, mode }) {
  const { wallet, updateBalance, recordBet } = useWallet();
  const { openWallet } = useWalletModal();
  const isReal = mode === "real";
  const isGuest = !wallet || wallet.id === "guest";

  const [demoBalance, setDemoBalance] = useState(() => +(localStorage.getItem("tols_demo_slot") || 5000));
  const realBalance = wallet?.balance || 0;
  const balance = isReal ? realBalance : demoBalance;
  const currency = isReal ? wallet?.currency || "USDT" : "DEMO";

  const [bet, setBet] = useState(isReal ? 1 : 10);
  const [grid, setGrid] = useState(() =>
    Array.from({ length: 9 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
  );
  const [spinning, setSpinning] = useState(false);
  const [wins, setWins] = useState([]);
  const [lastWin, setLastWin] = useState(null);
  const [serverSeed, setServerSeed] = useState(() => randomSeed());
  const [clientSeed] = useState(() => randomSeed());
  const [serverHash, setServerHash] = useState("");
  const nonceRef = useRef(0);

  useEffect(() => { sha256Hex(serverSeed).then(setServerHash); }, [serverSeed]);

  const accent = game?.accent || "#ccff00";

  const apply = useCallback((delta, wagered = 0) => {
    if (isReal) updateBalance(delta, wagered);
    else setDemoBalance((prev) => {
      const n = Math.max(0, +(prev + delta).toFixed(2));
      localStorage.setItem("tols_demo_slot", n);
      return n;
    });
  }, [isReal, updateBalance]);

  const reloadDemo = () => {
    setDemoBalance(5000);
    localStorage.setItem("tols_demo_slot", 5000);
  };

  const spin = useCallback(async () => {
    if (spinning) return;
    if (isReal && isGuest) return;
    if (bet <= 0 || bet > balance) return;
    setSpinning(true);
    setWins([]);
    setLastWin(null);
    apply(-bet, bet);

    let ticks = 0;
    const anim = setInterval(() => {
      setGrid(Array.from({ length: 9 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
      ticks++;
      if (ticks > 10) clearInterval(anim);
    }, 60);

    const spinNonce = nonceRef.current;
    const final = [];
    for (let i = 0; i < 9; i++) {
      const r = await rngFloat(serverSeed, clientSeed, spinNonce + i);
      final.push(pickSymbol(r));
    }
    nonceRef.current += 9;

    setTimeout(() => {
      clearInterval(anim);
      setGrid(final);

      const winning = [];
      let totalPayout = 0;
      LINES.forEach((line, idx) => {
        const [a, b, c] = line.cells;
        if (final[a].id === final[b].id && final[b].id === final[c].id) {
          winning.push(idx);
          totalPayout += bet * final[a].pay;
        }
      });
      const payout = +totalPayout.toFixed(2);
      if (payout > 0) {
        apply(payout, 0);
        setWins(winning);
        setLastWin({ payout, lines: winning.length });
      }
      setSpinning(false);

      // Systematic backend ledger: record every real-money spin (Bet + HouseEarning)
      if (isReal && !isGuest) {
        recordBet({
          game_id: game?.slug || "slot",
          game_name: game?.name || "Slot",
          amount: bet,
          multiplier: payout > 0 ? +(payout / bet).toFixed(2) : 0,
          payout,
          result: payout > 0 ? "win" : "lose",
          client_seed: clientSeed,
          server_seed_hash: serverHash,
          nonce: spinNonce,
        });
      }
    }, 700);
  }, [spinning, bet, balance, apply, isReal, isGuest, recordBet, serverSeed, clientSeed, serverHash, game]);

  const quick = (v) => setBet(v);
  const setHalf = () => setBet(+(balance / 2).toFixed(2));
  const setMax = () => setBet(+(balance).toFixed(2));

  const winCells = new Set();
  wins.forEach((li) => LINES[li].cells.forEach((c) => winCells.add(c)));

  // ── Real mode requires an authenticated wallet (backend + payments connected) ──
  if (isReal && isGuest) {
    return (
      <div className="max-w-md mx-auto rounded-2xl border border-lime/30 bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-lime/10 border border-lime/30 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-lime" />
        </div>
        <h2 className="text-2xl font-black text-white">Real money play</h2>
        <p className="text-sm text-white/55 mt-2 max-w-sm mx-auto">
          {game?.name} in real mode requires a funded wallet. Log in and deposit crypto to play for real — every spin is settled on-chain and recorded in your ledger.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center mt-5">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition"
          >
            <LogIn className="w-4 h-4" /> Log in
          </Link>
          <button
            onClick={() => openWallet({ tab: "deposit" })}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-lime text-black font-black hover:opacity-90 transition glow-lime"
          >
            <Wallet className="w-4 h-4" /> Deposit
          </button>
        </div>
        <p className="text-xs text-white/30 mt-4">
          Or switch to <span className="text-blue-400 font-bold">DEMO</span> to play with a fake balance.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      {/* Slot machine */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#161616] to-[#0d0d0d] p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ color: accent, background: `${accent}1a`, border: `1px solid ${accent}40` }}
            >
              {game?.provider || "TOLS"}
            </span>
            <span className="text-xs text-white/40">RTP {(SLOT_RTP * 100).toFixed(1)}%</span>
            <span className="text-xs text-white/40">· 5 paylines</span>
            <span className="text-xs text-white/40">· max 130x</span>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
            style={
              isReal
                ? { color: "#ccff00", background: "#ccff001a", border: "1px solid #ccff0040" }
                : { color: "#4f8aff", background: "#4f8aff1a", border: "1px solid #4f8aff40" }
            }
          >
            {isReal ? "Real Money" : "Demo"}
          </span>
        </div>

        {/* Reels cabinet */}
        <div
          className="relative rounded-xl bg-black/70 p-3 sm:p-5 border"
          style={{ borderColor: `${accent}30`, boxShadow: `inset 0 0 40px ${accent}10` }}
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {grid.map((sym, i) => {
              const isWin = winCells.has(i);
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-4xl sm:text-5xl transition-all duration-150 ${
                    spinning ? "blur-sm scale-95" : "blur-0 scale-100"
                  }`}
                  style={{
                    background: isWin ? `${accent}1f` : "rgba(255,255,255,0.02)",
                    boxShadow: isWin ? `0 0 0 2px ${accent}, 0 0 28px -2px ${accent}` : "none",
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
                +{lastWin.payout} {currency}
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
              <span className="text-white/30 text-xs">{currency}</span>
            </div>
            {!isReal && (
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

          {isReal && balance < bet && (
            <button
              onClick={() => openWallet({ tab: "deposit" })}
              className="w-full h-11 rounded-xl bg-lime/10 border border-lime/30 text-lime font-bold text-sm hover:bg-lime/20 transition flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" /> Insufficient balance — Deposit
            </button>
          )}

          <div className="text-center text-xs text-white/30">
            Provably fair · RTP {(SLOT_RTP * 100).toFixed(1)}% · max 130x/line
          </div>
        </div>

        {/* Paytable */}
        <div className="rounded-2xl border border-white/10 bg-[#111] p-5">
          <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Paytable (per line)</h3>
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