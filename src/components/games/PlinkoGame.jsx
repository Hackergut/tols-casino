import React, { useState, useRef, useEffect } from "react";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { PLINKO_ROW_COUNT, PLINKO_MULTIPLIERS } from "@/lib/gameEngine";

const ROWS = PLINKO_ROW_COUNT; // 12
const SP = 26; // peg spacing px
const RG = 24; // row gap px
const W = ROWS * SP; // 312
const H = ROWS * RG + 60;
const CX = W / 2;

function pegPos(row, i) {
  return { x: CX + (i - row / 2) * SP, y: 30 + row * RG };
}

export default function PlinkoGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [risk, setRisk] = useState("medium");
  const [lastBucket, setLastBucket] = useState(null);
  const [ball, setBall] = useState(null);
  const [dropping, setDropping] = useState(false);
  const timers = useRef([]);

  const muls = PLINKO_MULTIPLIERS[risk];
  const buckets = muls.length;

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  useEffect(() => () => clearTimers(), []);

  const play = async () => {
    if (dropping || !wallet || amount > wallet.balance || amount <= 0) return;
    clearTimers();

    // provably-fair result (logic unchanged)
    let pos = ROWS / 2;
    for (let i = 0; i < ROWS; i++) {
      const r = await pf.roll();
      pos += r < 0.5 ? -0.5 : 0.5;
    }
    const bucket = Math.max(0, Math.min(buckets - 1, Math.round(pos)));
    const mul = muls[bucket];
    const payout = amount * mul;

    // visual path: #right moves = bucket (visual-only shuffle)
    const rights = bucket;
    const dirs = [];
    for (let i = 0; i < ROWS; i++) dirs.push(i < rights ? 1 : -1);
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }

    setLastBucket(bucket);
    setDropping(true);
    setBall({ x: CX, y: 30 });

    let x = CX;
    const step = 95;
    dirs.forEach((d, idx) => {
      timers.current.push(setTimeout(() => {
        x = x + d * (SP / 2);
        setBall({ x, y: 30 + (idx + 1) * RG });
      }, (idx + 1) * step));
    });
    const bucketX = CX + (bucket - (buckets - 1) / 2) * SP;
    timers.current.push(setTimeout(() => {
      setBall({ x: bucketX, y: 30 + ROWS * RG + 8 });
      setDropping(false);
      updateBalance(payout - amount, amount);
      recordBet({
        game_id: "plinko", game_name: "Plinko", amount,
        multiplier: mul, payout,
        result: mul >= 1 ? "win" : "lose",
        client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
      });
    }, (ROWS + 1) * step + 200));
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-4 sm:p-6 flex flex-col items-center">
        <div className="relative" style={{ width: W, maxWidth: "100%", height: H }}>
          {/* drop chute */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-10 h-5 rounded-b-lg bg-white/5 border-x border-t border-white/10" />
          {/* pegs */}
          {Array.from({ length: ROWS }).map((_, row) =>
            Array.from({ length: row + 1 }).map((_, i) => {
              const p = pegPos(row, i);
              return <span key={`${row}-${i}`} className="absolute w-1.5 h-1.5 rounded-full bg-white/20" style={{ left: p.x - 3, top: p.y - 3 }} />;
            })
          )}
          {/* ball */}
          {ball && (
            <span
              className="absolute w-3 h-3 rounded-full bg-lime"
              style={{
                left: ball.x - 6,
                top: ball.y - 6,
                transition: "left 0.09s linear, top 0.09s linear",
                animation: dropping ? "flashGlow 0.4s infinite" : "none",
                boxShadow: "0 0 10px rgba(204,255,0,0.7)",
              }}
            />
          )}
        </div>
        {/* buckets */}
        <div className="grid gap-1 mt-2 w-full" style={{ gridTemplateColumns: `repeat(${buckets}, 1fr)` }}>
          {muls.map((m, i) => (
            <div
              key={i}
              className={`h-12 rounded-md flex items-center justify-center text-[10px] font-bold border transition ${
                lastBucket === i
                  ? "bg-lime text-black border-lime"
                  : m >= 1 ? "bg-lime/15 text-lime border-lime/20" : "bg-[#1a1a1a] text-white/40 border-white/5"
              }`}
              style={lastBucket === i ? { animation: "popIn 0.3s both", transform: "scale(1.08)" } : undefined}
            >
              {m.toFixed(2)}x
            </div>
          ))}
        </div>
        {lastBucket !== null && !dropping && (
          <p className="mt-4 text-sm font-bold text-white/60">
            Result: <span className="text-lime">{muls[lastBucket].toFixed(2)}x</span>
          </p>
        )}
      </div>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={dropping} betLabel={dropping ? "Dropping..." : "Drop ball"} />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Risk</label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                disabled={dropping}
                className={`flex-1 h-11 rounded-xl text-sm font-bold capitalize ${
                  risk === r ? "bg-lime text-black" : "bg-[#1a1a1a] text-white/60 border border-white/10"
                }`}
              >
                {r === "low" ? "Low" : r === "medium" ? "Medium" : "High"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}