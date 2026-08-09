import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { BetPanel, useProvablyFair } from "@/components/games/shared";
import { WHEEL_SEGMENTS } from "@/lib/gameEngine";
import GameFrame from "@/components/games/GameFrame";

function buildSegments(muls) {
  return muls.map((m, i) => ({
    label: m === 0 ? "0" : `${m}x`,
    mul: m,
    color: m === 0 ? "#242424" : i % 2 === 0 ? "#ccff00" : "#a8cc00",
  }));
}

export default function WheelGame() {
  const { wallet, updateBalance, recordBet } = useWallet();
  const pf = useProvablyFair();
  const [amount, setAmount] = useState(1);
  const [risk, setRisk] = useState("medium");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [last, setLast] = useState(null);

  const segments = buildSegments(WHEEL_SEGMENTS[risk]);
  const n = segments.length;

  const play = async () => {
    if (spinning || !wallet || amount > wallet.balance || amount <= 0) return;
    setSpinning(true);
    const r = await pf.roll();
    const idx = Math.min(n - 1, Math.floor(r * n));
    const seg = segments[idx];
    const spins = 5;
    const segAngle = 360 / n;
    const finalAngle = 360 * spins + segAngle * idx;
    setRotation((prev) => prev + finalAngle - (prev % 360));
    setTimeout(() => {
      const payout = amount * seg.mul;
      setLast(seg);
      setSpinning(false);
      updateBalance(payout - amount, amount);
      recordBet({
        game_id: "wheel", game_name: "Wheel Tols", amount,
        multiplier: seg.mul, payout,
        result: seg.mul >= 1 ? "win" : "lose",
        client_seed: pf.clientSeed, server_seed_hash: pf.serverHash, nonce: pf.nonce,
      });
    }, 3200);
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <GameFrame
        title="Wheel"
        stats={[
          { label: "Risk", value: risk.toUpperCase(), tone: "muted" },
          { label: "Last result", value: last && !spinning ? last.label : "—", tone: last && last.mul < 1 ? "danger" : "default" },
          { label: "Max win", value: `${Math.max(...WHEEL_SEGMENTS[risk]).toFixed(2)}x` },
        ]}
      >
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative aspect-square w-full max-w-[260px]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-0 h-0 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-lime animate-pulse" style={{ filter: "drop-shadow(0 0 6px rgba(204,255,0,0.8))" }} />
          <motion.div
            className="w-full h-full rounded-full border-4 border-white/10"
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.2, 0.8, 0.1, 1] }}
            style={{
              background: `conic-gradient(${segments
                .map((s, i) => `${s.color} ${(i / n) * 360}deg ${((i + 1) / n) * 360}deg`)
                .join(",")})`,
            }}
          >
            {segments.map((s, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 origin-left text-[10px] font-black"
                style={{
                  transform: `rotate(${(i + 0.5) * (360 / n)}deg) translateX(70px)`,
                  color: s.color === "#ccff00" ? "#000" : "#fff",
                }}
              >
                {s.label}
              </div>
            ))}
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#1a1a1a] border-2 border-lime" />
        </motion.div>
        {last && !spinning && (
          <p className="mt-6 text-lg font-bold" style={{ animation: "popIn 0.3s both" }}>
            Result: <span className={last.mul >= 1 ? "text-lime" : "text-red-400"}>{last.label}</span>
          </p>
        )}
      </GameFrame>

      <div className="space-y-4">
        <BetPanel amount={amount} setAmount={setAmount} onBet={play} disabled={spinning} betLabel={spinning ? "Spinning..." : "Spin"} />
        <div>
          <label className="text-xs font-semibold text-white/50 mb-1.5 block">Risk</label>
          <div className="flex gap-2">
            {["low", "medium", "high"].map((r) => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                disabled={spinning}
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